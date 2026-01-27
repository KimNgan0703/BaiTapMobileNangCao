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

const ResetPasswordScreen = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email || !otp || !newPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.resetPassword(email, otp, newPassword);
      if (data.success) {
        Alert.alert('Thành công', 'Mật khẩu đã được đặt lại thành công!');
        router.replace('/'); // Back to login
      } else {
        Alert.alert('Thất bại', data.message || 'Đặt lại mật khẩu thất bại');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white justify-center p-5">
      <View className="w-full max-w-[400px] self-center">
        <Text className="text-2xl font-bold mb-2.5 text-center text-black">ĐẶT LẠI MẬT KHẨU</Text>
        <Text className="text-sm text-[#666] mb-5 text-center">Email: {email}</Text>

        <TextInput
          className="h-[50px] border border-[#ddd] rounded-lg px-[15px] mb-[15px] text-base"
          placeholder="Mã OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
        />

        <TextInput
          className="h-[50px] border border-[#ddd] rounded-lg px-[15px] mb-[15px] text-base"
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />

        <TouchableOpacity 
           className={`bg-[#FF5A5F] h-[50px] rounded-lg justify-center items-center mt-2.5 mb-[15px] ${loading ? 'opacity-70' : ''}`}
          onPress={handleResetPassword}
          disabled={loading}
        >
          <Text className="text-white text-base font-bold">{loading ? 'Đang xử lý...' : 'Xác nhận'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} className="mt-5">
          <Text className="text-[#FF5A5F] text-center text-[14px]">Quay lại</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;
