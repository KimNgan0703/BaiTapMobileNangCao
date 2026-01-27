import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
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
    <SafeAreaView className="flex-1 bg-white justify-center p-5">
      <View className="w-full max-w-[400px] self-center">
        <Text className="text-2xl font-bold mb-2.5 text-center text-black">QUÊN MẬT KHẨU</Text>
        <Text className="text-sm text-[#666] mb-5 text-center">Nhập email để nhận mã OTP đặt lại mật khẩu</Text>

        <TextInput
          className="h-[50px] border border-[#ddd] rounded-lg px-[15px] mb-[15px] text-base"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TouchableOpacity 
          className={`bg-[#FF5A5F] h-[50px] rounded-lg justify-center items-center mt-2.5 mb-[15px] ${loading ? 'opacity-70' : ''}`}
          onPress={handleSendOtp}
          disabled={loading}
        >
          <Text className="text-white text-base font-bold">{loading ? 'Đang gửi...' : 'Gửi mã OTP'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} className="mt-5">
          <Text className="text-[#FF5A5F] text-center text-[14px]">Quay lại Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
