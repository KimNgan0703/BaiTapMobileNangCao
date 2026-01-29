import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, View, Text, ScrollView, TextInput, TouchableOpacity, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HelloWave } from '@/components/hello-wave';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUserProfile } from '@/store/slices/authSlice';
import { IconSymbol } from '@/components/ui/icon-symbol';

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

// Mock Data for Courses
const MOCK_COURSES = [
    { id: '1', title: 'React Native Masterclass', instructor: 'John Doe', price: '$19.99', category: 'Programming', image: 'https://reactnative.dev/img/tiny_logo.png' },
    { id: '2', title: 'UI/UX Design Fundamentals', instructor: 'Jane Smith', price: '$24.99', category: 'Design', image: 'https://reactnative.dev/img/tiny_logo.png' },
    { id: '3', title: 'Python for Beginners', instructor: 'Alice Johnson', price: '$14.99', category: 'Programming', image: 'https://reactnative.dev/img/tiny_logo.png' },
    { id: '4', title: 'Digital Marketing 101', instructor: 'Bob Brown', price: '$29.99', category: 'Marketing', image: 'https://reactnative.dev/img/tiny_logo.png' },
    { id: '5', title: 'Advanced JavaScript', instructor: 'John Doe', price: '$22.99', category: 'Programming', image: 'https://reactnative.dev/img/tiny_logo.png' },
];

const CATEGORIES = ['All', 'Programming', 'Design', 'Marketing', 'Business'];

export default function HomeScreen() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  const filteredCourses = MOCK_COURSES.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
  });

  const renderCourseItem = ({ item }: { item: any }) => (
      <View style={styles.courseCard}>
          <View style={styles.courseImageContainer}>
              <Image source={{ uri: item.image }} style={styles.courseImage} />
          </View>
          <View style={styles.courseInfo}>
              <View style={styles.categoryTag}>
                  <Text style={styles.categoryText}>{item.category}</Text>
              </View>
              <Text style={styles.courseTitle}>{item.title}</Text>
              <Text style={styles.instructor}>by {item.instructor}</Text>
              <View style={styles.priceRow}>
                  <Text style={styles.price}>{item.price}</Text>
                  <TouchableOpacity style={styles.enrollButton}>
                      <Text style={styles.enrollText}>Enroll</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </View>
  );

  return (
    <SafeAreaView style={styles.container}>
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
          />
      </View>

      <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {CATEGORIES.map((cat, index) => (
                  <TouchableOpacity 
                      key={index} 
                      style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
                      onPress={() => setSelectedCategory(cat)}
                  >
                        <Text style={[styles.filterText, selectedCategory === cat && styles.filterTextActive]}>{cat}</Text>
                  </TouchableOpacity>
              ))}
          </ScrollView>
      </View>

      <FlatList
          data={filteredCourses}
          renderItem={renderCourseItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.courseList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
              <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No courses found.</Text>
              </View>
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
  profileButton: {
      // Styles for profile icon if needed
  },
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
  filterContainer: {
      marginBottom: 0,
  },
  filterScroll: {
      paddingHorizontal: 20,
      paddingBottom: 15,
      gap: 10,
  },
  filterChip: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: COLORS.inputBg,
      borderWidth: 1,
      borderColor: COLORS.inputBorder,
  },
  filterChipActive: {
      backgroundColor: COLORS.button,
      borderColor: COLORS.button,
  },
  filterText: {
      color: COLORS.textDark,
      fontWeight: '500',
  },
  filterTextActive: {
      color: 'white',
      fontWeight: 'bold',
  },
  courseList: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      gap: 20,
  },
  courseCard: {
      backgroundColor: COLORS.card,
      borderRadius: 20,
      padding: 15,
      flexDirection: 'row',
      gap: 15,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
  },
  courseImageContainer: {
      width: 100,
      height: 100,
      borderRadius: 12,
      backgroundColor: '#f0f0f0', // Placeholder
      overflow: 'hidden',
  },
  courseImage: {
      width: '100%',
      height: '100%',
  },
  courseInfo: {
      flex: 1,
      justifyContent: 'space-between',
  },
  categoryTag: {
      backgroundColor: COLORS.tagBg,
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      marginBottom: 4,
  },
  categoryText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: COLORS.button,
  },
  courseTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: COLORS.textDark,
      marginBottom: 4,
  },
  instructor: {
      fontSize: 12,
      color: COLORS.secondaryText,
      marginBottom: 8,
  },
  priceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  price: {
      fontSize: 16,
      fontWeight: 'bold',
      color: COLORS.button,
  },
  enrollButton: {
      backgroundColor: COLORS.button,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
  },
  enrollText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
  },
  emptyContainer: {
      alignItems: 'center',
      marginTop: 50,
  },
  emptyText: {
      color: COLORS.secondaryText,
      fontSize: 16,
  },
});
