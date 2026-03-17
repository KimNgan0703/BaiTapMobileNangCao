import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { courseService, Course } from '@/services/courseService';
import { enrollmentService } from '@/services/enrollmentService';
import { cartService } from '@/services/cartService';
import { normalizeImageUrl } from '@/services/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToWishlist, removeFromWishlist } from '@/store/slices/wishlistSlice';
import { reviewService, Review } from '@/services/reviewService';

const COURSE_PLACEHOLDER = require('@/assets/images/react-logo.png');

const COLORS = {
  background: '#FFF0F6',
  card: '#FFFFFF',
  text: '#B5838D',
  textDark: '#333333',
  button: '#F28482',
  secondaryText: '#E56B6F',
  white: '#FFFFFF',
  green: '#4CAF50',
};

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const wishlistCourseIds = useAppSelector((state) => state.wishlist.courseIds);

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const [courseRes, enrollRes] = await Promise.all([
        courseService.getCourseById(id!),
        enrollmentService.checkEnrollment([id!]),
      ]);
      setCourse(courseRes.data);
      const check = enrollRes.data?.find((e) => e.courseId === id);
      setIsEnrolled(check?.isEnrolled ?? false);
      loadReviews();
    } catch (error) {
      console.error('Failed to load course', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin khóa học');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    if (!id) return;
    try {
      setReviewsLoading(true);
      const res = await reviewService.getReviews(id);
      setReviews(res.data || []);
    } catch {
      // silent fail
    } finally {
      setReviewsLoading(false);
    }
  };

  const isInWishlist = course ? wishlistCourseIds.includes(course.id) : false;

  const handleWishlistToggle = () => {
    if (!course) return;
    if (isInWishlist) {
      dispatch(removeFromWishlist(course.id));
    } else {
      dispatch(addToWishlist(course.id));
    }
  };

  const handleSubmitReview = async () => {
    if (!id || !reviewContent.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung đánh giá');
      return;
    }
    try {
      setSubmittingReview(true);
      if (editingReviewId) {
        await reviewService.updateReview(editingReviewId, { content: reviewContent, rating: reviewRating });
      } else {
        await reviewService.createReview({ courseId: id, content: reviewContent, rating: reviewRating });
      }
      setShowReviewForm(false);
      setEditingReviewId(null);
      setReviewContent('');
      setReviewRating(5);
      loadReviews();
    } catch {
      Alert.alert('Lỗi', 'Không thể gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    Alert.alert('Xóa đánh giá', 'Bạn có chắc muốn xóa đánh giá này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await reviewService.deleteReview(reviewId);
            loadReviews();
          } catch {
            Alert.alert('Lỗi', 'Không thể xóa đánh giá');
          }
        },
      },
    ]);
  };

  const handleReportReview = (reviewId: string) => {
    Alert.alert('Báo cáo đánh giá', 'Chọn lý do báo cáo:', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Spam', onPress: async () => { try { await reviewService.reportReview(reviewId, 'spam'); Alert.alert('Thành công', 'Đã báo cáo đánh giá'); } catch {} } },
      { text: 'Không phù hợp', onPress: async () => { try { await reviewService.reportReview(reviewId, 'inappropriate'); Alert.alert('Thành công', 'Đã báo cáo đánh giá'); } catch {} } },
    ]);
  };

  const handleReactToReview = async (reviewId: string) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review || !user) return;
    const myReaction = review.reactions.find(r => r.userId === user.userId);
    try {
      await reviewService.reactToReview(reviewId, !myReaction?.liked);
      loadReviews();
    } catch {}
  };

  const handleAddToCart = async () => {
    if (!course) return;
    try {
      setAddingToCart(true);
      await cartService.addToCart(course.id);
      Alert.alert('Thành công', 'Đã thêm vào giỏ hàng', [
        { text: 'Tiếp tục', style: 'cancel' },
        { text: 'Xem giỏ hàng', onPress: () => router.push('/cart' as any) },
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', typeof error === 'string' ? error : 'Không thể thêm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.button} />
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Không tìm thấy khóa học</Text>
        </View>
      </SafeAreaView>
    );
  }

  const finalPrice = course.discountedPrice ?? course.price;
  const hasDiscount = course.discountedPrice != null && course.discountedPrice < course.price;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Chi tiết khóa học</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleWishlistToggle} style={styles.backButton}>
              <IconSymbol name={isInWishlist ? 'heart.fill' : 'heart'} size={22} color={isInWishlist ? '#E56B6F' : COLORS.textDark} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/cart' as any)} style={styles.backButton}>
              <IconSymbol name="cart.fill" size={22} color={COLORS.button} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Course Image */}
        <View style={styles.imageContainer}>
          <Image
            source={course.thumbnailUrl ? { uri: normalizeImageUrl(course.thumbnailUrl)! } : COURSE_PLACEHOLDER}
            style={styles.courseImage}
          />
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>
                -{Math.round(((course.price - course.discountedPrice!) / course.price) * 100)}%
              </Text>
            </View>
          )}
        </View>

        {/* Course Info */}
        <View style={styles.content}>
          <View style={styles.categoryRow}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{course.category}</Text>
            </View>
            <View style={styles.ratingRow}>
              <IconSymbol name="star.fill" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{course.rating}</Text>
            </View>
          </View>

          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.description}>{course.description}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <IconSymbol name="clock.fill" size={18} color={COLORS.secondaryText} />
              <Text style={styles.statText}>{course.duration} phút</Text>
            </View>
            <View style={styles.statItem}>
              <IconSymbol name="person.2.fill" size={18} color={COLORS.secondaryText} />
              <Text style={styles.statText}>{course.enrolmentCount} học viên</Text>
            </View>
          </View>

          {/* Enrolled Status */}
          {isEnrolled && (
            <View style={styles.enrolledBanner}>
              <IconSymbol name="checkmark.circle.fill" size={24} color={COLORS.green} />
              <Text style={styles.enrolledText}>Bạn đã đăng ký khóa học này</Text>
            </View>
          )}

          {/* Price Section */}
          {!isEnrolled && (
            <View style={styles.priceSection}>
              <View>
                {hasDiscount ? (
                  <>
                    <Text style={styles.finalPrice}>
                      {finalPrice.toLocaleString('vi-VN')} VNĐ
                    </Text>
                    <Text style={styles.originalPrice}>
                      {course.price.toLocaleString('vi-VN')} VNĐ
                    </Text>
                  </>
                ) : (
                  <Text style={styles.finalPrice}>
                    {course.price.toLocaleString('vi-VN')} VNĐ
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Reviews Section */}
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.reviewsTitle}>Đánh giá ({reviews.length})</Text>
            {reviewsLoading && <ActivityIndicator size="small" color={COLORS.button} />}
          </View>

          {/* Write Review button for enrolled users */}
          {isEnrolled && !reviews.find(r => r.userId === user?.userId) && !showReviewForm && (
            <TouchableOpacity
              style={styles.writeReviewButton}
              onPress={() => { setShowReviewForm(true); setEditingReviewId(null); setReviewContent(''); setReviewRating(5); }}
            >
              <IconSymbol name="pencil" size={16} color={COLORS.white} />
              <Text style={styles.writeReviewText}>Viết đánh giá</Text>
            </TouchableOpacity>
          )}

          {/* Review Form */}
          {showReviewForm && (
            <View style={styles.reviewForm}>
              <Text style={styles.reviewFormTitle}>{editingReviewId ? 'Chỉnh sửa đánh giá' : 'Đánh giá khóa học'}</Text>
              <View style={styles.starSelector}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                    <IconSymbol name={star <= reviewRating ? 'star.fill' : 'star'} size={28} color="#FFD700" />
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.reviewInput}
                placeholder="Chia sẻ trải nghiệm của bạn..."
                placeholderTextColor="#999"
                value={reviewContent}
                onChangeText={setReviewContent}
                multiline
                numberOfLines={3}
              />
              <View style={styles.reviewFormActions}>
                <TouchableOpacity
                  style={styles.cancelReviewButton}
                  onPress={() => { setShowReviewForm(false); setEditingReviewId(null); }}
                >
                  <Text style={styles.cancelReviewText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitReviewButton, submittingReview && { opacity: 0.6 }]}
                  onPress={handleSubmitReview}
                  disabled={submittingReview}
                >
                  {submittingReview
                    ? <ActivityIndicator size="small" color={COLORS.white} />
                    : <Text style={styles.submitReviewText}>Gửi</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Reviews List */}
          {reviews.map(review => {
            const isMyReview = review.userId === user?.userId;
            const likeCount = review.reactions.filter(r => r.liked).length;
            const myReaction = review.reactions.find(r => r.userId === user?.userId);
            return (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewCardHeader}>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <IconSymbol key={star} name={star <= review.rating ? 'star.fill' : 'star'} size={12} color="#FFD700" />
                    ))}
                  </View>
                  <View style={styles.reviewCardActions}>
                    {isMyReview ? (
                      <>
                        <TouchableOpacity
                          onPress={() => { setEditingReviewId(review.id); setReviewContent(review.content); setReviewRating(review.rating); setShowReviewForm(true); }}
                          style={{ marginRight: 8 }}
                        >
                          <IconSymbol name="pencil" size={16} color={COLORS.button} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteReview(review.id)}>
                          <IconSymbol name="trash" size={16} color="#FF4D4D" />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity onPress={() => handleReportReview(review.id)}>
                        <IconSymbol name="flag" size={16} color="#999" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <Text style={styles.reviewContent}>{review.content}</Text>
                <TouchableOpacity style={styles.likeRow} onPress={() => handleReactToReview(review.id)}>
                  <IconSymbol
                    name={myReaction?.liked ? 'hand.thumbsup.fill' : 'hand.thumbsup'}
                    size={14}
                    color={myReaction?.liked ? COLORS.button : '#999'}
                  />
                  {likeCount > 0 && <Text style={styles.likeCount}>{likeCount}</Text>}
                </TouchableOpacity>
              </View>
            );
          })}

          {reviews.length === 0 && !reviewsLoading && (
            <Text style={styles.noReviewsText}>Chưa có đánh giá nào</Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      {!isEnrolled && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
            disabled={addingToCart}
          >
            {addingToCart ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <IconSymbol name="cart.badge.plus" size={20} color={COLORS.white} />
                <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {isEnrolled && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={[styles.addToCartButton, { backgroundColor: COLORS.green }]}>
            <IconSymbol name="play.fill" size={20} color={COLORS.white} />
            <Text style={styles.addToCartText}>Vào học ngay</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: COLORS.secondaryText, fontSize: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textDark, flex: 1, textAlign: 'center' },
  imageContainer: {
    marginHorizontal: 16,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  courseImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF4D4D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountBadgeText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  content: { padding: 20 },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTag: {
    backgroundColor: '#FFD1DC',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: { color: COLORS.text, fontWeight: '600', fontSize: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, fontWeight: '600', color: COLORS.textDark },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 10 },
  description: { fontSize: 14, color: '#666', lineHeight: 22, marginBottom: 16 },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 20,
  },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 14, color: COLORS.secondaryText },
  enrolledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  enrolledText: { fontSize: 15, fontWeight: '600', color: COLORS.green },
  priceSection: { marginBottom: 16 },
  finalPrice: { fontSize: 24, fontWeight: 'bold', color: COLORS.button },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  bottomBar: {
    padding: 16,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  addToCartButton: {
    backgroundColor: COLORS.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  addToCartText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  // Reviews
  reviewsSection: { padding: 20, paddingTop: 0 },
  reviewsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  reviewsTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  writeReviewButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.button,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
    alignSelf: 'flex-start', gap: 6, marginBottom: 12,
  },
  writeReviewText: { color: COLORS.white, fontWeight: '600' },
  reviewForm: { backgroundColor: '#FFF5F8', borderRadius: 12, padding: 14, marginBottom: 16 },
  reviewFormTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textDark, marginBottom: 10 },
  starSelector: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  reviewInput: {
    borderWidth: 1, borderColor: '#F2C6CF', borderRadius: 10, padding: 10,
    minHeight: 80, textAlignVertical: 'top', color: COLORS.textDark, fontSize: 14, marginBottom: 10,
  },
  reviewFormActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelReviewButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.button },
  cancelReviewText: { color: COLORS.button, fontWeight: '600' },
  submitReviewButton: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, backgroundColor: COLORS.button },
  submitReviewText: { color: COLORS.white, fontWeight: '600' },
  reviewCard: {
    backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
  },
  reviewCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewCardActions: { flexDirection: 'row', alignItems: 'center' },
  reviewContent: { fontSize: 14, color: '#444', lineHeight: 20 },
  likeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  likeCount: { fontSize: 12, color: '#777' },
  noReviewsText: { color: '#999', fontSize: 14, textAlign: 'center', paddingVertical: 16 },
});
