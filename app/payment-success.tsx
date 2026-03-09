import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';

const COLORS = {
  background: '#FFF0F6',
  card: '#FFFFFF',
  textDark: '#333333',
  button: '#F28482',
  white: '#FFFFFF',
  green: '#4CAF50',
};

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  const goHome = () => {
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: '(tabs)' }] })
    );
  };

  const goOrders = () => {
    // Reset stack to [(tabs at home tab), orders] so back from orders goes to home, not profile
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          {
            name: '(tabs)',
            state: { index: 0, routes: [{ name: 'index' }] },
          },
          { name: 'orders' },
        ],
      })
    );
  };

  // Block Android hardware back button on this screen
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <IconSymbol name="checkmark.circle.fill" size={80} color={COLORS.green} />
        </View>
        <Text style={styles.title}>Thanh toán thành công!</Text>
        <Text style={styles.subtitle}>
          Đơn hàng của bạn đã được thanh toán thành công. Bạn có thể bắt đầu học ngay bây giờ.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={goHome}
        >
          <Text style={styles.primaryButtonText}>Về trang chủ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={goOrders}
        >
          <Text style={styles.secondaryButtonText}>Xem đơn hàng</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: { marginBottom: 24 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: COLORS.button,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 14,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: COLORS.button,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.button,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
