import { Image } from 'expo-image';
import { StyleSheet, ActivityIndicator, View, Platform, Button } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { fetchWithAuth } from '@/services/api';
import { clearAuth } from '@/utils/storage';

export default function HomeScreen() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile...');
      const response = await fetchWithAuth('/user/me', {
          method: 'GET',
      });
      console.log('Profile Response Status:', response.status);
      
      const data = await response.json();
      console.log('Profile Data:', data);

      if (response.ok) {
        setUserInfo(data);
      } else {
        setUserInfo({ error: data.message || 'Error fetching profile' });
      }
    } catch (error) {
      console.error(error);
      setUserInfo({ error: 'Network Error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
      await clearAuth();
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
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome {userInfo?.name || 'User'}!</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">User Profile</ThemedText>
        
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <View>
             {userInfo ? (
                 <View style={styles.infoContainer}>
                     {userInfo.error ? (
                        <ThemedText style={{color: 'red'}}>{userInfo.error}</ThemedText>
                     ) : (
                        <>
                            <ThemedText>ID: {userInfo.id}</ThemedText>
                            <ThemedText>Name: {userInfo.name}</ThemedText>
                            <ThemedText>Email: {userInfo.email}</ThemedText>
                            <ThemedText>Gender: {userInfo.gender}</ThemedText>
                        </>
                     )}
                 </View>
             ) : (
                 <ThemedText>No user info available</ThemedText>
             )}
          </View>
        )}
      </ThemedView>
    
      <Button title="Logout" onPress={handleLogout} />
  
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  infoContainer: {
      padding: 10,
      gap: 5
  }
});
