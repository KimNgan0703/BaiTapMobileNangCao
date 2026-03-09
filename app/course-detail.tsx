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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { courseService, Course } from '@/services/courseService';
import { enrollmentService } from '@/services/enrollmentService';
import { cartService } from '@/services/cartService';
import { normalizeImageUrl } from '@/services/api';

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
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

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
    } catch (error) {
      console.error('Failed to load course', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin khóa học');
    } finally {
      setLoading(false);
    }
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
          <TouchableOpacity onPress={() => router.push('/cart' as any)} style={styles.backButton}>
            <IconSymbol name="cart.fill" size={22} color={COLORS.button} />
          </TouchableOpacity>
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
});
