import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '@/services/api';
import { saveTokens, saveUser } from '@/utils/storage';

const AuthScreen = () => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  // Requirement: name, email, password, gender
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('MALE'); 

  const handleAuthentication = async () => {
    // Validate
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập Email và Password');
      return;
    }
    if (!isLogin && (!name || !gender)) {
        Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin (Name, Gender)');
        return;
    }

    try {
      if (isLogin) {
        console.log('Logging in with:', email);
        const data = await authService.login(email, password);
        console.log('Login response:', data);
        
        if (data.success) {
          const { token, user } = data.data;
          await saveTokens(token.accessToken, token.refreshToken);
          await saveUser(user);
          Alert.alert('Thành công', 'Đăng nhập thành công');
          router.replace('/(tabs)');
        } else {
          if (data.message === 'User email is not verified') {
            Alert.alert('Thông báo', 'Email chưa được xác thực. Vui lòng xác thực OTP.');
            router.push({ pathname: '/verify-otp', params: { email } });
          } else {
            Alert.alert('Đăng nhập thất bại', data.message || 'Lỗi không xác định');
          }
        }
      } else {
        const data = await authService.register(name, email, password, gender);
        if (data.success) {
          Alert.alert('Đăng ký thành công', 'Vui lòng nhập OTP gửi về email');
          router.push({ pathname: '/verify-otp', params: { email } });
        } else {
          Alert.alert('Đăng ký thất bại', data.message || 'Lỗi không xác định');
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi mạng', 'Không kết nối được tới server');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FFF0F6]">
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerClassName="flex-grow justify-center p-5">
      <View className="bg-white rounded-[22px] p-[26px] shadow-sm elevation-[6]">
        <Text className="text-[26px] font-bold text-center text-[#B5838D] mb-[25px]">
          {isLogin ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ'}
        </Text>

        {!isLogin && (
          <>
            <TextInput
              className="bg-[#FFF5F8] py-[14px] px-[16px] rounded-[14px] border border-[#F2C6CF] mb-[14px] text-[15px] text-[#333]"
              placeholder="Name"
              placeholderTextColor="#B5838D"
              value={name}
              onChangeText={setName}
            />
             <TextInput
              className="bg-[#FFF5F8] py-[14px] px-[16px] rounded-[14px] border border-[#F2C6CF] mb-[14px] text-[15px] text-[#333]"
              placeholder="Gender (MALE/FEMALE)"
              placeholderTextColor="#B5838D"
              value={gender}
              onChangeText={setGender}
            />
          </>
        )}

        <TextInput
          className="bg-[#FFF5F8] py-[14px] px-[16px] rounded-[14px] border border-[#F2C6CF] mb-[14px] text-[15px] text-[#333]"
          placeholder="Email"
          placeholderTextColor="#B5838D"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          className="bg-[#FFF5F8] py-[14px] px-[16px] rounded-[14px] border border-[#F2C6CF] mb-[14px] text-[15px] text-[#333]"
          placeholder="Password"
          placeholderTextColor="#B5838D"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {isLogin && (
          <TouchableOpacity onPress={() => router.push('/forgot-password')} className="self-end mb-[15px]">
            <Text className="text-[#E56B6F] text-[14px]">Forgot Password?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity className="bg-[#F28482] py-[15px] rounded-[16px] items-center mt-[10px]" onPress={handleAuthentication}>
          <Text className="text-white text-[16px] font-bold tracking-[1px]">
            {isLogin ? 'LOGIN' : 'REGISTER'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsLogin(!isLogin)}
          className="mt-[18px]"
        >
          <Text className="text-center text-[#E56B6F] text-[14px] font-medium">
            {isLogin
              ? 'Chưa có tài khoản? Đăng ký ngay'
              : 'Đã có tài khoản? Đăng nhập'}
          </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AuthScreen;
