import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { authService } from '@/services/api';

const VerifyOtpScreen = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!email || !otp) {
      Alert.alert('Lỗi', 'Vui lòng nhập OTP');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.verifyOtp(email, otp);
      if (data.success) {
        Alert.alert('Thành công', 'Xác thực tài khoản thành công!');
        router.replace('/'); // Navigate back to login or straight to home if we auto-login
      } else {
        Alert.alert('Thất bại', data.message || 'Xác thực thất bại');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi xác thực');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const data = await authService.sendOtp(email);
      if (data.success) {
        Alert.alert('Thông báo', 'Đã gửi lại mã OTP');
      } else {
        Alert.alert('Thất bại', data.message || 'Không thể gửi lại OTP');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi gửi lại OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>XÁC THỰC OTP</Text>
        <Text style={styles.subtitle}>Mã OTP đã được gửi đến: {email}</Text>

        <TextInput
          style={styles.input}
          placeholder="Nhập mã OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          autoCapitalize="none"
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleVerify}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Đang xử lý...' : 'Xác thực'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResendOtp} disabled={loading}>
          <Text style={styles.linkText}>Gửi lại mã OTP</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.back()} style={{marginTop: 20}}>
          <Text style={styles.linkText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FF5A5F',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#FF5A5F',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default VerifyOtpScreen;
