import React, { useState } from 'react';
import { StyleSheet, TextInput, Alert, TouchableOpacity, View, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUserInfo } from '@/store/slices/authSlice';
import { IconSymbol } from '@/components/ui/icon-symbol';

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
  avatarPlaceholder: '#FFD1DC',
};

export default function EditInfoScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [name, setName] = useState(user?.name || user?.firstName || '');
  const [gender, setGender] = useState(user?.gender || 'MALE');
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
        Alert.alert('Error', 'User ID not found');
        return;
    }
    setLoading(true);
    try {
      const apiData: any = { name, gender };
      if (newAvatarUri) {
          apiData.avatarUri = newAvatarUri;
      }
      
      await dispatch(updateUserInfo({ id: user.id, data: apiData })).unwrap();
      
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getAvatarSource = () => {
      if (newAvatarUri) return { uri: newAvatarUri };
      if (user?.avatar) return { uri: user.avatar }; 
      return null;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Edit Info',
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.text,
        headerShadowVisible: false,
      }} />
      <View style={styles.card}>
        <Text style={styles.title}>Edit Profile</Text>
        
        <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
                {getAvatarSource() ? (
                    <Image source={getAvatarSource()} style={styles.avatarImage} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                         <IconSymbol name="camera.fill" size={30} color={COLORS.white} />
                    </View>
                )}
                <View style={styles.editIconBadge}>
                    <IconSymbol name="pencil" size={12} color={COLORS.white} />
                </View>
            </TouchableOpacity>
            <Text style={styles.changePhotoText}>Tap to change photo</Text>
        </View>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Full Name"
          placeholderTextColor={COLORS.placeholder}
        />

        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderContainer}>
            <TouchableOpacity 
                style={[styles.genderButton, gender === 'MALE' && styles.genderButtonActive]}
                onPress={() => setGender('MALE')}
            >
                <Text style={[styles.genderText, gender === 'MALE' && styles.genderTextActive]}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.genderButton, gender === 'FEMALE' && styles.genderButtonActive]}
                onPress={() => setGender('FEMALE')}
            >
                <Text style={[styles.genderText, gender === 'FEMALE' && styles.genderTextActive]}>Female</Text>
            </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
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
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: COLORS.text,
      marginBottom: 20,
      textAlign: 'center',
  },
  avatarContainer: {
      alignItems: 'center',
      marginBottom: 20,
  },
  avatarWrapper: {
      position: 'relative',
      marginBottom: 10,
  },
  avatarImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
  },
  avatarPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: COLORS.avatarPlaceholder,
      justifyContent: 'center',
      alignItems: 'center',
  },
  editIconBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: COLORS.button,
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: COLORS.white,
  },
  changePhotoText: {
      color: COLORS.secondaryText,
      fontSize: 14,
  },
  label: {
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 8,
    fontWeight: '500',
    marginLeft: 4,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    color: COLORS.textDark,
  },
  genderContainer: {
      flexDirection: 'row',
      gap: 15,
      marginBottom: 25,
  },
  genderButton: {
      flex: 1,
      padding: 15,
      borderRadius: 12,
      backgroundColor: COLORS.inputBg,
      borderWidth: 1,
      borderColor: COLORS.inputBorder,
      alignItems: 'center',
  },
  genderButtonActive: {
      backgroundColor: COLORS.button,
      borderColor: COLORS.button,
  },
  genderText: {
      color: COLORS.textDark,
      fontWeight: '500',
  },
  genderTextActive: {
      color: COLORS.white,
      fontWeight: 'bold',
  },
  button: {
    backgroundColor: COLORS.button,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.button,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
