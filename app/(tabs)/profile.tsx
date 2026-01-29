import React from 'react';
import { StyleSheet, TouchableOpacity, Image, View, Alert, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { RootState } from '@/store/store';
import { logoutUser } from '@/store/slices/authSlice';

// Color Palette from Auth Screen
const COLORS = {
  background: '#FFF0F6',
  card: '#FFFFFF',
  text: '#B5838D', // Title/Accent
  textDark: '#333333',
  inputBg: '#FFF5F8',
  inputBorder: '#F2C6CF',
  button: '#F28482',
  secondaryText: '#E56B6F',
  white: '#FFFFFF',
};

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await dispatch(logoutUser() as any); 
          router.replace('/');
        },
      },
    ]);
  };

  const menuItems = [
    {
      title: 'Edit Personal Info',
      icon: 'pencil',
      route: '/profile/edit-info',
    },
    {
      title: 'Change Password',
      icon: 'lock.fill',
      route: '/profile/change-password',
    },
    {
      title: 'Change Email',
      icon: 'envelope.fill',
      route: '/profile/change-email',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header / Avatar */}
        <View style={styles.header}>
            <View style={styles.avatarContainer}>
                {user?.avatar ? (
                    <Image source={{ uri: user.avatar }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: COLORS.button }]}>
                        <Text style={styles.avatarText}>
                            {user?.firstName?.[0] || user?.email?.[0] || '?'}
                        </Text>
                    </View>
                )}
                <TouchableOpacity style={styles.editAvatarButton} onPress={() => router.push('/profile/edit-info')}>
                    <IconSymbol name="pencil" size={16} color="white" />
                </TouchableOpacity>
            </View>
            <Text style={styles.name}>
                {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.email}>{user?.email}</Text>
            <Text style={styles.phone}>{user?.phoneNumber}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem]}
              onPress={() => router.push(item.route as any)}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                     <IconSymbol name={item.icon as any} size={22} color={COLORS.text} />
                </View>
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={COLORS.secondaryText} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Auth background
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.background,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: COLORS.secondaryText,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: COLORS.text, // Auth Text Color
  },
  email: {
    fontSize: 16,
    color: COLORS.textDark,
    opacity: 0.7,
    marginBottom: 2,
  },
  phone: {
    fontSize: 16,
    color: COLORS.textDark,
    opacity: 0.7,
  },
  menuContainer: {
    marginTop: 0,
    paddingHorizontal: 20,
    backgroundColor: COLORS.card,
    marginHorizontal: 20,
    borderRadius: 22,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomColor: '#F2F2F2',
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 30,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: COLORS.button, // Auth Button Color
    alignItems: 'center',
    shadowColor: COLORS.button,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
