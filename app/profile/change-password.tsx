import React, { useState } from 'react';
import { StyleSheet, TextInput, Alert, TouchableOpacity, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { changeUserPassword } from '@/store/slices/authSlice';
import { userService } from '@/services/userService';

// Color Palette from Auth Screen
const COLORS = {
  background: '#FFF0F6',
  card: '#FFFFFF',
  text: '#B5838D', 
  textDark: '#333333',
  inputBg: '#FFF5F8',
  inputBorder: '#F2C6CF',
  button: '#F28482',
  secondaryText: '#E56B6F',
  white: '#FFFFFF',
  placeholder: '#B5838D',
  error: '#FF4D4F',
};

export default function ChangePasswordScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [step, setStep] = useState(1); // 1: Send OTP, 2: Change Password
  const [email] = useState(user?.email || '');
  
  const [otp, setOtp] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSendOtp = async () => {
      setErrorMsg('');
      setLoading(true);
      try {
        await userService.sendChangePasswordOtp(email);
        Alert.alert('OTP Sent', `We sent a verification code to ${email}`);
        setStep(2);
      } catch (error: any) {
        const msg = typeof error === 'string' ? error : (error.message || 'Failed to send OTP');
        setErrorMsg(msg);
        Alert.alert('Error', msg);
      } finally {
        setLoading(false);
      }
  };

  const handleChangePassword = async () => {
    setErrorMsg('');
    if (newPassword !== confirmPassword) {
      const msg = 'New passwords do not match';
      setErrorMsg(msg);
      Alert.alert('Error', msg);
      return;
    }
    if (newPassword.length < 6) {
      const msg = 'Password must be at least 6 characters';
      setErrorMsg(msg);
      Alert.alert('Error', msg);
      return;
    }
    if (!otp) {
        const msg = 'Please enter OTP';
        setErrorMsg(msg);
        Alert.alert('Error', msg);
        return;
    }

    setLoading(true);
    try {
      await dispatch(changeUserPassword({ 
          email, 
          otp,
          oldPassword, 
          newPassword 
      })).unwrap();
      
      Alert.alert('Success', 'Password changed successfully');
      router.back();
    } catch (error: any) {
      const msg = typeof error === 'string' ? error : (error.message || 'Failed to change password');
      setErrorMsg(msg);
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
        <Stack.Screen options={{ 
            title: 'Change Password',
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.text,
            headerShadowVisible: false,
        }} />
        <View style={styles.card}>
            <Text style={styles.title}>Change Password</Text>
            
            {errorMsg ? (
                <Text style={styles.errorText}>{errorMsg}</Text>
            ) : null}

            {step === 1 ? (
                <>
                    <Text style={styles.description}>
                        To secure your account, please verify your identity by sending an OTP to your email: {email}
                    </Text>
                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={handleSendOtp}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>{loading ? 'Sending OTP...' : 'Send OTP'}</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <Text style={styles.label}>OTP Code</Text>
                    <TextInput
                        style={styles.input}
                        value={otp}
                        onChangeText={setOtp}
                        placeholder="Enter OTP"
                        placeholderTextColor={COLORS.placeholder}
                        keyboardType="number-pad"
                    />

                    <Text style={styles.label}>Old Password</Text>
                    <TextInput
                        style={styles.input}
                        value={oldPassword}
                        onChangeText={setOldPassword}
                        placeholder="Enter old password"
                        placeholderTextColor={COLORS.placeholder}
                        secureTextEntry
                    />

                    <Text style={styles.label}>New Password</Text>
                    <TextInput
                        style={styles.input}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="Enter new password"
                        placeholderTextColor={COLORS.placeholder}
                        secureTextEntry
                    />

                    <Text style={styles.label}>Confirm New Password</Text>
                    <TextInput
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirm new password"
                        placeholderTextColor={COLORS.placeholder}
                        secureTextEntry
                    />

                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={handleChangePassword}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>{loading ? 'Updating...' : 'Update Password'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={() => setStep(1)}
                        disabled={loading}
                    >
                        <Text style={styles.cancelText}>Resend OTP</Text>
                    </TouchableOpacity>
                </>
            )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 26,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: COLORS.text,
  },
  errorText: {
      color: COLORS.error,
      textAlign: 'center',
      marginBottom: 15,
      fontSize: 14,
      fontWeight: '600',
  },
  description: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
      color: COLORS.textDark,
      opacity: 0.8,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    marginBottom: 16,
    color: COLORS.textDark,
  },
  button: {
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: COLORS.button,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cancelButton: {
      marginTop: 20,
      alignItems: 'center',
  },
  cancelText: {
      textDecorationLine: 'underline',
      color: COLORS.secondaryText,
      fontWeight: '500', 
  },
});
