import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
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
    <SafeAreaView className="flex-1 bg-white justify-center p-5">
      <View className="w-full max-w-[400px] self-center">
        <Text className="text-2xl font-bold mb-2.5 text-center text-black">XÁC THỰC OTP</Text>
        <Text className="text-sm text-[#666] mb-5 text-center">Mã OTP đã được gửi đến: {email}</Text>

        <TextInput
          className="h-[50px] border border-[#ddd] rounded-lg px-[15px] mb-[15px] text-base"
          placeholder="Nhập mã OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          autoCapitalize="none"
        />

        <TouchableOpacity 
          className={`bg-[#FF5A5F] h-[50px] rounded-lg justify-center items-center mt-2.5 mb-[15px] ${loading ? 'opacity-70' : ''}`}
          onPress={handleVerify}
          disabled={loading}
        >
          <Text className="text-white text-base font-bold">{loading ? 'Đang xử lý...' : 'Xác thực'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResendOtp} disabled={loading} className="mt-4">
          <Text className="text-[#FF5A5F] text-center text-[14px]">Gửi lại mã OTP</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.back()} className="mt-5">
          <Text className="text-[#FF5A5F] text-center text-[14px]">Quay lại</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default VerifyOtpScreen;
