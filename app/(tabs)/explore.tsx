import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TextInput, View, ActivityIndicator, TouchableOpacity, RefreshControl, Platform, Image, Text, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { courseService, Course } from '@/services/courseService';
import { normalizeImageUrl } from '@/services/api';

const COURSE_PLACEHOLDER = require('@/assets/images/react-logo.png');

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2;

const COLORS = {
  background: '#FFF0F6',
  card: '#FFFFFF',
  text: '#B5838D',
  textDark: '#333333',
  button: '#F28482',
  secondaryText: '#E56B6F',
  white: '#FFFFFF',
  inputBg: '#FFF5F8',
  inputBorder: '#F2C6CF',
};

export default function ExploreScreen() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchCourses = async (reset = false) => {
    if (loading && !reset) return;
    setLoading(true);
    try {
      const pageToFetch = reset ? 1 : page;
      const data = await courseService.getCourses({ query: query || undefined, page: pageToFetch, size: 10 });
      
      const newCourses = data.data || [];
      const meta = data.meta;
      
      if (reset) {
          setCourses(newCourses);
          setPage(2);
      } else {
          setCourses(prev => [...prev, ...newCourses]);
          setPage(prev => prev + 1);
      }

      if (meta) {
          if (pageToFetch >= meta.totalPages) {
              setHasMore(false);
          } else {
              setHasMore(true);
          }
      } else {
          if (newCourses.length < 10) setHasMore(false);
      }

    } catch (error) {
      console.error('Fetch courses error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourses(true);
  }, []); 

  const handleSearch = () => {
    fetchCourses(true);
  };

  const onRefresh = () => {
      setRefreshing(true);
      fetchCourses(true);
  }

  const renderItem = ({ item }: { item: Course }) => {
    const hasDiscount = item.discountedPrice != null && item.discountedPrice < item.price;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({ pathname: '/course-detail' as any, params: { id: item.id } })}
      >
        <View style={styles.cardImageContainer}>
          <Image
            source={item.thumbnailUrl ? { uri: normalizeImageUrl(item.thumbnailUrl)! } : COURSE_PLACEHOLDER}
            style={styles.cardImage}
          />
          {hasDiscount && (
            <View style={styles.saleBadge}>
              <Text style={styles.saleBadgeText}>Sale</Text>
            </View>
          )}
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardCategory}>{item.category || 'General'}</Text>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.row}>
            {hasDiscount ? (
              <>
                <Text style={styles.cardPrice}>{item.discountedPrice!.toLocaleString('vi-VN')}đ</Text>
                <Text style={styles.cardOriginalPrice}>{item.price.toLocaleString('vi-VN')}đ</Text>
              </>
            ) : (
              <Text style={styles.cardPrice}>{item.price.toLocaleString('vi-VN')}đ</Text>
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
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
       <View style={styles.header}>
            <Text style={styles.headerTitle}>Khám phá</Text>
            <TouchableOpacity onPress={() => router.push('/cart' as any)}>
              <IconSymbol name="cart.fill" size={26} color={COLORS.button} />
            </TouchableOpacity>
       </View>
       <View style={styles.searchContainer}>
           <IconSymbol name="magnifyingglass" size={18} color={COLORS.secondaryText} style={{ marginRight: 8 }} />
           <TextInput 
              style={styles.input} 
              placeholder="Tìm kiếm khóa học..." 
              placeholderTextColor="#999"
              value={query} 
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
           />
           <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
               <Text style={styles.searchButtonText}>Tìm</Text>
           </TouchableOpacity>
       </View>
       
       <FlatList
          data={courses}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          onEndReached={() => {
              if (hasMore && !loading) {
                  fetchCourses(false);
              }
          }}
          onEndReachedThreshold={0.5}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.button]} />}
          ListFooterComponent={loading ? <ActivityIndicator size="small" color={COLORS.button} style={{ padding: 16 }} /> : null}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Không tìm thấy khóa học</Text>
              </View>
            ) : null
          }
       />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  searchContainer: {
      flexDirection: 'row',
      marginHorizontal: 16,
      marginBottom: 12,
      alignItems: 'center',
      backgroundColor: COLORS.card,
      borderRadius: 14,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: COLORS.inputBorder,
  },
  input: {
      flex: 1,
      fontSize: 15,
      color: COLORS.textDark,
      height: 44,
  },
  searchButton: {
      backgroundColor: COLORS.button,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 10,
      marginLeft: 8,
  },
  searchButtonText: {
      color: COLORS.white,
      fontWeight: '600',
      fontSize: 14,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
      width: COLUMN_WIDTH,
      backgroundColor: COLORS.card,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
  },
  cardImageContainer: {
      width: '100%',
      height: 100,
      backgroundColor: '#f0f0f0',
      position: 'relative',
  },
  cardImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
  },
  saleBadge: {
      position: 'absolute',
      top: 8,
      left: 8,
      backgroundColor: '#FF4D4D',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
  },
  saleBadgeText: {
      color: 'white',
      fontSize: 10,
      fontWeight: 'bold',
  },
  cardInfo: {
      padding: 10,
  },
  cardCategory: {
      fontSize: 10,
      fontWeight: 'bold',
      color: COLORS.secondaryText,
      marginBottom: 4,
  },
  cardTitle: {
      fontSize: 13,
      fontWeight: 'bold',
      color: COLORS.textDark,
      marginBottom: 6,
      height: 36,
  },
  row: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 5,
      marginBottom: 6,
  },
  cardPrice: {
      fontSize: 14,
      fontWeight: 'bold',
      color: COLORS.button,
  },
  cardOriginalPrice: {
      fontSize: 11,
      color: '#999',
      textDecorationLine: 'line-through',
  },
  cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
  },
  ratingText: {
      fontSize: 11,
      color: COLORS.textDark,
  },
  durationText: {
      fontSize: 11,
      color: '#999',
  },
  emptyContainer: {
      alignItems: 'center',
      paddingTop: 40,
  },
  emptyText: {
      color: '#999',
      fontSize: 14,
  },
});
