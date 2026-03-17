import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';
import { ActivityIndicator, View } from 'react-native';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import '../global.css';
import * as Linking from 'expo-linking';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { initializeAuth } from '@/store/slices/authSlice';
import { paymentState } from '@/utils/paymentState';

export const unstable_settings = {
  initialRouteName: 'index',
};

function RootNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const dispatch = useAppDispatch();
  const { isLoggedIn, isInitialized } = useAppSelector((state) => state.auth);

  // Initialize auth from stored tokens on startup
  useEffect(() => {
    dispatch(initializeAuth());
  }, []);

  // Auth guard: redirect based on login state
  useEffect(() => {
    if (!isInitialized) return;
    const publicRoutes = [undefined, 'index', 'verify-otp', 'forgot-password', 'reset-password'];
    const isOnPublicRoute = publicRoutes.includes(segments[0] as any);
    console.log('Auth guard check:', { isLoggedIn, segments, isOnPublicRoute });

    if (!isLoggedIn && !isOnPublicRoute) {
      console.log('Not logged in and trying to access a protected route. Redirecting to login.');
      router.replace('/');
    } else if (isLoggedIn && isOnPublicRoute) {
      console.log('Already logged in but on a public route. Redirecting to home.');
      // Already logged in but sitting on a public route → go to home
      router.replace('/(tabs)');
    }
  }, [isLoggedIn, isInitialized, segments]);

  // Prevent double navigation when both getInitialURL and addEventListener fire
  const deepLinkHandled = useRef(false);

  useEffect(() => {
    // Handle deep link for payment callback (app is already open)
    const handleDeepLink = (event: { url: string }) => {
      const { url } = event;
      if (url.includes('payment-success') || url.includes('resultCode=0')) {
        if (deepLinkHandled.current) return;
        deepLinkHandled.current = true;
        // Signal checkout's WebBrowser callback to skip its own navigation
        paymentState.setDeepLinkFired(true);
        router.replace('/payment-success');
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check initial URL (app launched cold via deep link — no WebBrowser session active)
    Linking.getInitialURL().then((url) => {
      if (url && (url.includes('payment-success') || url.includes('resultCode=0'))) {
        if (deepLinkHandled.current) return;
        deepLinkHandled.current = true;
        router.replace('/payment-success');
      }
    });

    return () => subscription.remove();
  }, []);

  // Show loading while restoring auth session
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF0F6' }}>
        <ActivityIndicator size="large" color="#B5838D" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="course-detail" options={{ headerShown: false }} />
        <Stack.Screen name="cart" options={{ headerShown: false }} />
        <Stack.Screen name="checkout" options={{ headerShown: false }} />
        <Stack.Screen name="payment-success" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="orders" options={{ headerShown: false }} />
        <Stack.Screen name="order-detail" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootNav />
    </Provider>
  );
}

