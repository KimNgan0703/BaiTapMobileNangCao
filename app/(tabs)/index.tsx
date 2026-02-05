import React, { useEffect, useState, useCallback } from 'react';
import { 
  StyleSheet, 
  ActivityIndicator, 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  FlatList, 
  RefreshControl,
  Dimensions,
  ListRenderItem
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HelloWave } from '@/components/hello-wave';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUserProfile } from '@/store/slices/authSlice';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { courseService, Course, Category } from '@/services/courseService';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 60) / 2;

const COLORS = {
  background: '#FFF0F6',
  card: '#FFFFFF',
  text: '#B5838D', // Title/Accent
  textDark: '#333333',
  inputBg: '#FFF5F8',
  inputBorder: '#F2C6CF',
  button: '#F28482',
  secondaryText: '#E56B6F',
  white: '#FFFFFF',
  shadow: '#000',
  tagBg: '#FFD1DC',
};

export default function HomeScreen() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestSellers, setBestSellers] = useState<Course[]>([]);
  const [discountedCourses, setDiscountedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchUserProfile());
    loadData();
  }, [dispatch]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch Categories
      const categoriesData = await courseService.getCategories();
      setCategories(categoriesData.data || []);

      // Fetch Best Sellers (Top 10 by enrolmentCount)
      const bestSellersData = await courseService.getCourses({
        size: 10,
        sort: '{"enrolmentCount":"desc"}'
      });
      setBestSellers(bestSellersData.data || []);

      // Fetch Discounted Products (20 sorted by discountedPrice or similar)
      const discountedData = await courseService.getCourses({
        size: 20,
        sort: '{"discountedPrice":"asc"}'
      });
      setDiscountedCourses(discountedData.data || []);

    } catch (error) {
      console.error("Failed to load home data", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity style={styles.categoryCard}>
      <Text style={styles.categoryCardText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderBestSellerItem = ({ item }: { item: Course }) => (
    <View style={styles.bestSellerCard}>
      <View style={styles.bestSellerImageContainer}>
        {/* Placeholder image since API doesn't seem to return image URL yet */}
        <Image 
          source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }} 
          style={styles.courseImage} 
        />
      </View>
      <View style={styles.bestSellerInfo}>
          <Text style={styles.bestSellerTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.bestSellerCategory}>{item.category || 'General'}</Text>
          <View style={styles.bestSellerFooter}>
            <Text style={styles.enrolmentText}>{item.enrolmentCount} students</Text>
            <Text style={styles.price}>${item.price}</Text>
          </View>
      </View>
    </View>
  );

  const renderDiscountedItem: ListRenderItem<Course> = ({ item }) => (
    <View style={styles.gridCard}>
      <View style={styles.gridImageContainer}>
        <Image 
          source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }} 
          style={styles.courseImage} 
        />
        {item.discountedPrice && (
            <View style={styles.discountBadge}>
                <Text style={styles.discountText}>Sale</Text>
            </View>
        )}
      </View>
      <View style={styles.gridInfo}>
          <Text style={styles.categoryText}>{item.category || 'General'}</Text>
          <Text style={styles.gridTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.priceRow}>
              {item.discountedPrice ? (
                  <>
                      <Text style={styles.discountedPrice}>${item.discountedPrice}</Text>
                      <Text style={styles.originalPrice}>${item.price}</Text>
                  </>
              ) : (
                  <Text style={styles.price}>${item.price}</Text>
              )}
          </View>
          <TouchableOpacity style={styles.enrollButton}>
              <Text style={styles.enrollText}>Enroll</Text>
          </TouchableOpacity>
      </View>
    </View>
  );

  const ListHeader = () => (
    <>
      <View style={styles.header}>
        <View>
            <Text style={styles.greeting}>Hello,</Text>
            <View style={styles.nameContainer}>
                <Text style={styles.userName}>{user?.firstName || user?.name || 'Learner'}!</Text>
                <HelloWave />
            </View>
        </View>
        <TouchableOpacity style={styles.profileButton}>
            <IconSymbol name="person.circle.fill" size={40} color={COLORS.button} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color={COLORS.secondaryText} style={styles.searchIcon} />
          <TextInput 
              style={styles.searchInput}
              placeholder="Search courses..."
              placeholderTextColor={COLORS.secondaryText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => {/* Implement Search Action */}}
          />
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
          <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Level Up Your Skills</Text>
              <Text style={styles.heroSubtitle}>Join millions of learners worldwide.</Text>
              <TouchableOpacity style={styles.heroButton}>
                  <Text style={styles.heroButtonText}>Get Started</Text>
              </TouchableOpacity>
          </View>
          <Image 
              source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }} 
              style={styles.heroImage}
          />
      </View>

      {/* Categories Carousel */}
      <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
          />
      </View>

      {/* Best Sellers */}
      <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Best Sellers</Text>
          <FlatList
              data={bestSellers}
              renderItem={renderBestSellerItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
          />
      </View>

      {/* Discounted Section Title */}
      <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Great Deals</Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={discountedCourses}
        renderItem={renderDiscountedItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.mainListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.button]} />
        }
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No courses found.</Text>
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.button} />
            </View>
          )
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
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
      fontSize: 16,
      color: COLORS.secondaryText,
      fontWeight: '500',
  },
  nameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  userName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: COLORS.text,
      marginRight: 8,
  },
  profileButton: {},
  searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.card,
      marginHorizontal: 20,
      paddingHorizontal: 15,
      borderRadius: 16,
      height: 50,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: COLORS.inputBorder,
  },
  searchIcon: {
      marginRight: 10,
  },
  searchInput: {
      flex: 1,
      fontSize: 16,
      color: COLORS.textDark,
  },
  heroSection: {
      marginHorizontal: 20,
      marginBottom: 25,
      backgroundColor: COLORS.button,
      borderRadius: 20,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      overflow: 'hidden',
  },
  heroContent: {
      flex: 1,
      paddingRight: 10,
  },
  heroTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 5,
  },
  heroSubtitle: {
      fontSize: 12,
      color: '#FFF0F6',
      marginBottom: 15,
  },
  heroButton: {
      backgroundColor: 'white',
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
      alignSelf: 'flex-start',
  },
  heroButtonText: {
      color: COLORS.button,
      fontWeight: 'bold',
      fontSize: 12,
  },
  heroImage: {
      width: 80,
      height: 80,
      borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.2)',
  },
  sectionContainer: {
      marginBottom: 20,
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.text,
      marginLeft: 20,
      marginBottom: 15,
  },
  horizontalList: {
      paddingHorizontal: 20,
      gap: 15,
  },
  categoryCard: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: COLORS.inputBg,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: COLORS.inputBorder,
      marginRight: 10,
  },
  categoryCardText: {
      color: COLORS.text,
      fontWeight: '600',
  },
  bestSellerCard: {
      width: 200,
      backgroundColor: COLORS.card,
      borderRadius: 16,
      padding: 10,
      marginRight: 15,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
  },
  bestSellerImageContainer: {
      width: '100%',
      height: 100,
      borderRadius: 12,
      backgroundColor: '#f0f0f0',
      marginBottom: 10,
      overflow: 'hidden',
  },
  bestSellerInfo: {
      justifyContent: 'center',
  },
  bestSellerTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: COLORS.textDark,
      marginBottom: 4,
      height: 40,
  },
  bestSellerCategory: {
      fontSize: 10,
      color: COLORS.secondaryText,
      marginBottom: 6,
  },
  bestSellerFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  enrolmentText: {
      fontSize: 10,
      color: '#888',
  },
  // Grid Styles
  mainListContent: {
      paddingBottom: 20,
  },
  columnWrapper: {
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginBottom: 20,
  },
  gridCard: {
      width: COLUMN_WIDTH,
      backgroundColor: COLORS.card,
      borderRadius: 16,
      padding: 10,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
  },
  gridImageContainer: {
      width: '100%',
      height: 100, // Adjusted height for grid
      borderRadius: 12,
      backgroundColor: '#f0f0f0',
      marginBottom: 10,
      overflow: 'hidden',
      position: 'relative',
  },
  discountBadge: {
      position: 'absolute',
      top: 8,
      left: 8,
      backgroundColor: '#FF4D4D', // Red for sale
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
  },
  discountText: {
      color: 'white',
      fontSize: 10,
      fontWeight: 'bold',
  },
  gridInfo: {
      flex: 1,
  },
  gridTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: COLORS.textDark,
      marginBottom: 8,
      height: 40, 
  },
  priceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: 10,
      gap: 5,
  },
  discountedPrice: {
      fontSize: 16,
      fontWeight: 'bold',
      color: COLORS.button,
  },
  originalPrice: {
      fontSize: 12,
      color: '#999',
      textDecorationLine: 'line-through',
  },
  price: {
      fontSize: 16,
      fontWeight: 'bold',
      color: COLORS.button,
  },
  enrollButton: {
      backgroundColor: COLORS.button,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: 'center',
  },
  enrollText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
  },
  courseImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
  },
  categoryText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: COLORS.secondaryText,
      marginBottom: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: COLORS.secondaryText,
  },
});
