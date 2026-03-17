import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeFromWishlist } from '@/store/slices/wishlistSlice';
import { courseService, Course } from '@/services/courseService';
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
};

export default function WishlistScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { courseIds } = useAppSelector((state) => state.wishlist);

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCourses();
  }, [courseIds]);

  const loadCourses = async () => {
    if (courseIds.length === 0) {
      setCourses([]);
      return;
    }
    try {
      setLoading(true);
      const results = await Promise.all(
        courseIds.map((id) => courseService.getCourseById(id).then((r) => r.data).catch(() => null))
      );
      setCourses(results.filter(Boolean) as Course[]);
    } catch {
      Alert.alert('Lỗi', 'Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (courseId: string) => {
    Alert.alert('Xóa khỏi yêu thích', 'Bạn có muốn xóa khóa học này khỏi danh sách yêu thích?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => dispatch(removeFromWishlist(courseId)),
      },
    ]);
  };

  const renderItem = ({ item }: { item: Course }) => {
    const hasDiscount = item.discountedPrice != null && item.discountedPrice < item.price;
    const finalPrice = item.discountedPrice ?? item.price;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({ pathname: '/course-detail' as any, params: { id: item.id } })}
      >
        <Image
          source={item.thumbnailUrl ? { uri: normalizeImageUrl(item.thumbnailUrl)! } : COURSE_PLACEHOLDER}
          style={styles.cardImage}
        />
        <View style={styles.cardInfo}>
          <Text style={styles.cardCategory}>{item.category}</Text>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.cardPrice}>{finalPrice.toLocaleString('vi-VN')}đ</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>{item.price.toLocaleString('vi-VN')}đ</Text>
            )}
          </View>
          <View style={styles.cardFooter}>
            <View style={styles.ratingRow}>
              <IconSymbol name="star.fill" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <Text style={styles.durationText}>{item.duration} phút</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item.id)}>
          <IconSymbol name="heart.fill" size={20} color={COLORS.secondaryText} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh sách yêu thích</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.button} />
        </View>
      ) : (
        <FlatList
          data={courses}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          ListEmptyComponent={
            <View style={styles.centered}>
              <IconSymbol name="heart" size={48} color={COLORS.text} />
              <Text style={styles.emptyText}>Chưa có khóa học yêu thích</Text>
              <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/(tabs)/explore' as any)}>
                <Text style={styles.exploreButtonText}>Khám phá khóa học</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { color: COLORS.text, fontSize: 16, fontWeight: '500' },
  exploreButton: {
    backgroundColor: COLORS.button,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  exploreButtonText: { color: COLORS.white, fontWeight: '600', fontSize: 15 },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  cardImage: { width: 90, height: 90, resizeMode: 'cover' },
  cardInfo: { flex: 1, padding: 10 },
  cardCategory: { fontSize: 10, fontWeight: 'bold', color: COLORS.secondaryText, marginBottom: 3 },
  cardTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textDark, marginBottom: 5 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 5 },
  cardPrice: { fontSize: 14, fontWeight: 'bold', color: COLORS.button },
  originalPrice: { fontSize: 11, color: '#999', textDecorationLine: 'line-through' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 12, color: COLORS.textDark },
  durationText: { fontSize: 11, color: '#999' },
  removeBtn: { padding: 14 },
});
