import React, { useState } from 'react';
import { StyleSheet, TextInput, Alert, TouchableOpacity, View, Text } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { changeUserEmail } from '@/store/slices/authSlice';
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

export default function ChangeEmailScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify & Change
  const [currentEmail] = useState(user?.email || '');
  
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      // Sending OTP to the CURRENT email to authorize change
      await userService.sendChangeEmailOtp(currentEmail);
      Alert.alert('OTP Sent', `We sent a verification code to ${currentEmail}`);
      setStep(2);
    } catch (error: any) {
      Alert.alert('Error', typeof error === 'string' ? error : error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail) {
      Alert.alert('Error', 'Please enter new email');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      Alert.alert('Error', 'Invalid email format');
      return;
    }
    if (newEmail === currentEmail) {
        Alert.alert('Error', 'New email must be different from current email');
        return;
    }
    if (!otp) {
        Alert.alert('Error', 'Please enter OTP');
        return;
    }

    setLoading(true);
    try {
      await dispatch(changeUserEmail({ 
          oldEmail: currentEmail,
          otp,
          newEmail 
      })).unwrap();
      
      Alert.alert('Success', 'Email changed successfully. Please login with your new email.');
      // Since email changed, maybe force logout or just go back?
      // Usually changing email might invalidate the token if email is in key.
      // But based on authSlice, it just updates the email in store or returns.
      // authSlice's updateUserInfo uses updateProfile. 
      // changeUserEmail updates via changeEmail API.
      // Assuming session stays valid or backend handles it.
      
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to change email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
        <Stack.Screen options={{ 
            title: 'Change Email',
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.text,
            headerShadowVisible: false,
        }} />
        <View style={styles.card}>
            <Text style={styles.title}>Change Email</Text>
            
            {step === 1 ? (
                <>
                    <Text style={styles.description}>
                        Current Email: <Text style={{fontWeight: 'bold'}}>{currentEmail}</Text>
                    </Text>
                    <Text style={styles.description}>
                        To change your email address, we need to verify your identity. We will send an OTP to your current email.
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
                    <Text style={styles.label}>OTP Code (sent to {currentEmail})</Text>
                    <TextInput
                        style={styles.input}
                        value={otp}
                        onChangeText={setOtp}
                        placeholder="Enter OTP"
                        placeholderTextColor={COLORS.placeholder}
                        keyboardType="number-pad"
                    />

                    <Text style={styles.label}>New Email Address</Text>
                    <TextInput
                        style={styles.input}
                        value={newEmail}
                        onChangeText={setNewEmail}
                        placeholder="Enter new email address"
                        placeholderTextColor={COLORS.placeholder}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={handleChangeEmail}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>{loading ? 'Updating...' : 'Update Email'}</Text>
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
  description: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
      color: COLORS.textDark,
      opacity: 0.8,
      lineHeight: 22,
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
