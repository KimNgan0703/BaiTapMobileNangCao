import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {isLogin ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ'}
        </Text>

        {!isLogin && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#B5838D"
              value={name}
              onChangeText={setName}
            />
             <TextInput
              style={styles.input}
              placeholder="Gender (MALE/FEMALE)"
              placeholderTextColor="#B5838D"
              value={gender}
              onChangeText={setGender}
            />
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#B5838D"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#B5838D"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {isLogin && (
          <TouchableOpacity onPress={() => router.push('/forgot-password')} style={{alignSelf: 'flex-end', marginBottom: 15 }}>
            <Text style={{ color: '#E56B6F', fontSize: 14 }}>Forgot Password?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.button} onPress={handleAuthentication}>
          <Text style={styles.buttonText}>
            {isLogin ? 'LOGIN' : 'REGISTER'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsLogin(!isLogin)}
          style={{ marginTop: 18 }}
        >
          <Text style={styles.linkText}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F6',
    // justifyContent: 'center', // Moved to scrollContent
    // padding: 20, // Moved to scrollContent
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 26,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    color: '#B5838D',
    marginBottom: 25,
  },

  input: {
    backgroundColor: '#FFF5F8',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F2C6CF',
    marginBottom: 14,
    fontSize: 15,
    color: '#333',
  },

  button: {
    backgroundColor: '#F28482',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  linkText: {
    textAlign: 'center',
    color: '#E56B6F',
    fontSize: 14,
    fontWeight: '500',
  },
});
