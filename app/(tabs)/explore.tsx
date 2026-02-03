import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TextInput, View, ActivityIndicator, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { courseService, Course } from '@/services/courseService';

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
      const data = await courseService.getCourses(query, pageToFetch, 10);
      
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

  const renderItem = ({ item }: { item: Course }) => (
    <View style={styles.card}>
          <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
          <ThemedText numberOfLines={2}>{item.description}</ThemedText>
          <View style={styles.row}>
            <ThemedText style={{ color: '#4CAF50' }}>{item.price.toLocaleString()} VND</ThemedText>
            <ThemedText style={{ fontSize: 12, color: '#888' }}>{item.duration} mins</ThemedText>
          </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
       <View style={styles.header}>
            <ThemedText type="title">Explore Courses</ThemedText>
       </View>
       <View style={styles.searchContainer}>
           <TextInput 
              style={[styles.input, { color: 'black' }]} 
              placeholder="Search courses..." 
              placeholderTextColor="#999"
              value={query} 
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
           />
           <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
               <ThemedText>Search</ThemedText>
           </TouchableOpacity>
       </View>
       
       <FlatList
          data={courses}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          onEndReached={() => {
              if (hasMore && !loading) {
                  fetchCourses(false);
              }
          }}
          onEndReachedThreshold={0.5}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListFooterComponent={loading ? <ActivityIndicator size="large" color="#0000ff" /> : null}
          contentContainerStyle={{ padding: 16 }}
       />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  searchContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingBottom: 10,
      gap: 10,
      alignItems: 'center'
  },
  input: {
      flex: 1,
      backgroundColor: '#f0f0f0',
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 10,
      height: 44,
  },
  searchButton: {
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 15,
      backgroundColor: '#007AFF', // Blue
      borderRadius: 10,
  },
  card: {
      padding: 16,
      backgroundColor: 'rgba(255,255,255,0.05)', 
      marginBottom: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(128,128,128,0.2)'
  },
  row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8
  }
});
