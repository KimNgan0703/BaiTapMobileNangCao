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
import { useRouter } from 'expo-router';
import { authService } from '@/services/api';

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert('Lỗi', 'Vui lòng nhập Email');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.sendOtp(email);
      // Assuming sendOtp (formerly resendOtp) works for initiating reset too 
      // or at least checking if valid email to send otp.
      // Based on user request, we use this api.
      if (data.success || data.message === 'OTP sent successfully') { // Check success criteria
         Alert.alert('Thành công', 'Mã OTP đã được gửi đến email của bạn');
         router.push({ pathname: '/reset-password', params: { email } });
      } else {
         Alert.alert('Thất bại', data.message || 'Không thể gửi OTP');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi gửi OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>QUÊN MẬT KHẨU</Text>
        <Text style={styles.subtitle}>Nhập email để nhận mã OTP đặt lại mật khẩu</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSendOtp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Đang gửi...' : 'Gửi mã OTP'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={{marginTop: 20}}>
          <Text style={styles.linkText}>Quay lại Đăng nhập</Text>
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

export default ForgotPasswordScreen;
