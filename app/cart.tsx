import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { cartService, CartItem } from '@/services/cartService';
import { normalizeImageUrl } from '@/services/api';

const COURSE_PLACEHOLDER = require('@/assets/images/react-logo.png');

const COLORS = {
  background: '#FFF0F6',
  card: '#FFFFFF',
  text: '#B5838D',
  textDark: '#333333',
  button: '#F28482',
  secondaryText: '#E56B6F',
  white: '#FFFFFF',
  inputBorder: '#F2C6CF',
  danger: '#FF4D4D',
  green: '#4CAF50',
};

export default function CartScreen() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Reload cart every time this screen is focused (e.g. returning from checkout)
  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [])
  );

  const loadCart = async () => {
    try {
      setLoading(true);
      const res = await cartService.getCart();
      const items = res.data || [];
      setCartItems(items);
      // Select all by default
      setSelectedIds(new Set(items.map((i) => i.id)));
    } catch (error) {
      console.error('Failed to load cart', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCart();
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === cartItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cartItems.map((i) => i.id)));
    }
  };

  const handleRemove = async (id: string) => {
    try {
      setRemovingId(id);
      await cartService.removeFromCart(id);
      setCartItems((prev) => prev.filter((i) => i.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (error: any) {
      Alert.alert('Lỗi', typeof error === 'string' ? error : 'Không thể xóa');
    } finally {
      setRemovingId(null);
    }
  };

  const handleClearCart = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa tất cả?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await cartService.clearCart();
            setCartItems([]);
            setSelectedIds(new Set());
          } catch (error: any) {
            Alert.alert('Lỗi', typeof error === 'string' ? error : 'Không thể xóa');
          }
        },
      },
    ]);
  };

  const handleCheckout = () => {
    const selectedItems = cartItems.filter((i) => selectedIds.has(i.id));
    if (selectedItems.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một khóa học');
      return;
    }
    router.push({
      pathname: '/checkout' as any,
      params: { items: JSON.stringify(selectedItems) },
    });
  };

  const selectedItems = cartItems.filter((i) => selectedIds.has(i.id));
  const totalPrice = selectedItems.reduce((sum, i) => sum + i.course.price, 0);
  const totalDiscounted = selectedItems.reduce(
    (sum, i) => sum + (i.course.discountedPrice ?? i.course.price),
    0
  );

  const renderItem = ({ item }: { item: CartItem }) => {
    const isSelected = selectedIds.has(item.id);
    const hasDiscount = item.course.discountedPrice != null && item.course.discountedPrice < item.course.price;

    return (
      <View style={styles.cartItem}>
        <TouchableOpacity onPress={() => toggleSelect(item.id)} style={styles.checkbox}>
          <IconSymbol
            name={isSelected ? 'checkmark.circle.fill' : 'circle'}
            size={24}
            color={isSelected ? COLORS.button : '#ccc'}
          />
        </TouchableOpacity>

        <Image
          source={item.course.thumbnailUrl ? { uri: normalizeImageUrl(item.course.thumbnailUrl)! } : COURSE_PLACEHOLDER}
          style={styles.itemImage}
        />

        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={2}>{item.course.title}</Text>
          <Text style={styles.itemCategory}>{item.course.category}</Text>
          <View style={styles.itemPriceRow}>
            {hasDiscount ? (
              <>
                <Text style={styles.itemPrice}>
                  {item.course.discountedPrice!.toLocaleString('vi-VN')}đ
                </Text>
                <Text style={styles.itemOriginalPrice}>
                  {item.course.price.toLocaleString('vi-VN')}đ
                </Text>
              </>
            ) : (
              <Text style={styles.itemPrice}>
                {item.course.price.toLocaleString('vi-VN')}đ
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => handleRemove(item.id)}
          disabled={removingId === item.id}
          style={styles.removeButton}
        >
          {removingId === item.id ? (
            <ActivityIndicator size="small" color={COLORS.danger} />
          ) : (
            <IconSymbol name="trash.fill" size={20} color={COLORS.danger} />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng ({cartItems.length})</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearText}>Xóa tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Select All */}
      {cartItems.length > 0 && (
        <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAllRow}>
          <IconSymbol
            name={selectedIds.size === cartItems.length ? 'checkmark.circle.fill' : 'circle'}
            size={22}
            color={selectedIds.size === cartItems.length ? COLORS.button : '#ccc'}
          />
          <Text style={styles.selectAllText}>
            {selectedIds.size === cartItems.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Cart List */}
      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.button]} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="cart" size={60} color="#ccc" />
              <Text style={styles.emptyText}>Giỏ hàng trống</Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => router.push('/(tabs)/explore')}
              >
                <Text style={styles.browseButtonText}>Khám phá khóa học</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.button} />
            </View>
          )
        }
      />

      {/* Bottom Checkout Bar */}
      {cartItems.length > 0 && (
        <View style={styles.bottomBar}>
          <View style={styles.priceInfo}>
            <Text style={styles.totalLabel}>Tổng ({selectedIds.size} khóa học)</Text>
            {totalPrice !== totalDiscounted ? (
              <>
                <Text style={styles.totalPrice}>
                  {totalDiscounted.toLocaleString('vi-VN')}đ
                </Text>
                <Text style={styles.totalOriginal}>
                  {totalPrice.toLocaleString('vi-VN')}đ
                </Text>
              </>
            ) : (
              <Text style={styles.totalPrice}>
                {totalPrice.toLocaleString('vi-VN')}đ
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.checkoutButton, selectedIds.size === 0 && styles.disabledButton]}
            onPress={handleCheckout}
            disabled={selectedIds.size === 0}
          >
            <Text style={styles.checkoutButtonText}>Thanh toán</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark },
  clearText: { color: COLORS.danger, fontSize: 14, fontWeight: '600' },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  selectAllText: { fontSize: 14, color: COLORS.textDark },
  listContent: { paddingHorizontal: 16, paddingBottom: 16 },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  checkbox: { marginRight: 10 },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 4 },
  itemCategory: { fontSize: 11, color: COLORS.secondaryText, marginBottom: 4 },
  itemPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  itemPrice: { fontSize: 15, fontWeight: 'bold', color: COLORS.button },
  itemOriginalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  removeButton: { padding: 8 },
  emptyContainer: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 12, marginBottom: 20 },
  browseButton: {
    backgroundColor: COLORS.button,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: { color: COLORS.white, fontWeight: 'bold' },
  loadingContainer: { padding: 40, alignItems: 'center' },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  priceInfo: { flex: 1 },
  totalLabel: { fontSize: 12, color: '#999' },
  totalPrice: { fontSize: 18, fontWeight: 'bold', color: COLORS.button },
  totalOriginal: { fontSize: 12, color: '#999', textDecorationLine: 'line-through' },
  checkoutButton: {
    backgroundColor: COLORS.button,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  disabledButton: { opacity: 0.5 },
  checkoutButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});
