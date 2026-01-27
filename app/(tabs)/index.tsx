import { Image } from 'expo-image';
import { StyleSheet, ActivityIndicator, View, Button } from 'react-native';
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUserProfile, logoutUser } from '@/store/slices/authSlice';

export default function HomeScreen() {
  const { user, loading, error } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.replace('/');
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView className="flex-row items-center gap-2">
        <ThemedText type="title">Welcome {user?.name || 'User'}!</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView className="gap-2 mb-2">
        <ThemedText type="subtitle">User Profile</ThemedText>
        
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <View>
             {error ? (
                 <ThemedText className="text-red-500">{error}</ThemedText>
             ) : user ? (
                 <View className="p-2 gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black/10">
                    <ThemedText>ID: {user.id}</ThemedText>
                    <ThemedText>Name: {user.name}</ThemedText>
                    <ThemedText>Email: {user.email}</ThemedText>
                    <ThemedText>Gender: {user.gender}</ThemedText>
                 </View>
             ) : (
                 <ThemedText>No user info available</ThemedText>
             )}
          </View>
        )}
      </ThemedView>
    
      <View className="mt-4">
        <Button title="Logout" onPress={handleLogout} />
      </View>
  
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
