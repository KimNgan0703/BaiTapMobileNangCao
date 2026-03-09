import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CartItem } from '@/services/cartService';
import { orderService } from '@/services/orderService';
import { paymentService } from '@/services/paymentService';
import { normalizeImageUrl } from '@/services/api';
import { paymentState } from '@/utils/paymentState';
import * as WebBrowser from 'expo-web-browser';

const COURSE_PLACEHOLDER = require('@/assets/images/react-logo.png');

const COLORS = {
  background: '#FFF0F6',
  card: '#FFFFFF',
  text: '#B5838D',
  textDark: '#333333',
  button: '#F28482',
  secondaryText: '#E56B6F',
  white: '#FFFFFF',
};

type PaymentMethod = 'MOMO' | 'VNPAY';

export default function CheckoutScreen() {
  const { items } = useLocalSearchParams<{ items: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MOMO');
  const [processing, setProcessing] = useState(false);

  const cartItems: CartItem[] = items ? JSON.parse(items) : [];

  const totalPrice = cartItems.reduce((sum, i) => sum + i.course.price, 0);
  const totalDiscounted = cartItems.reduce(
    (sum, i) => sum + (i.course.discountedPrice ?? i.course.price),
    0
  );
  const savedAmount = totalPrice - totalDiscounted;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    try {
      setProcessing(true);

      // 1. Create order
      const orderRes = await orderService.createOrder({
        paymentMethod,
        cartItems,
      });

      if (!orderRes.success || !orderRes.data) {
        Alert.alert('Lỗi', orderRes.message || 'Không thể tạo đơn hàng');
        return;
      }

      // 2. Get payment URL using the order id from create response
      const paymentRes = await paymentService.getPaymentUrl({
        paymentMethod,
        orderId: orderRes.data.id,
      });

      const goToOrders = () => {
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              { name: '(tabs)' },
              { name: 'orders' },
            ],
          })
        );
      };

      if (paymentRes.success && paymentRes.data) {
        // Open payment URL in browser
        await WebBrowser.openBrowserAsync(paymentRes.data);
        // Wait for deep link event to fire before checking —
        // on Android the Linking event can arrive slightly after the browser Promise resolves
        await new Promise(resolve => setTimeout(resolve, 400));
        if (paymentState.deepLinkFired) {
          // Deep link already navigated to payment-success, nothing to do
          paymentState.setDeepLinkFired(false);
        } else {
          // No deep link received — user closed browser or redirect didn't arrive
          goToOrders();
        }
      } else {
        Alert.alert('Thành công', 'Đơn hàng đã được tạo! Vui lòng thanh toán sau.', [
          { text: 'Xem đơn hàng', onPress: goToOrders },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Lỗi', typeof error === 'string' ? error : 'Đã xảy ra lỗi');
    } finally {
      setProcessing(false);
    }
  };

  const paymentMethods: { key: PaymentMethod; label: string; icon: string }[] = [
    { key: 'MOMO', label: 'MoMo', icon: '💳' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => { if (!processing) router.back(); }}
          style={[styles.backButton, processing && { opacity: 0.3 }]}
          disabled={processing}
        >
          <IconSymbol name="chevron.left" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đơn hàng ({cartItems.length} khóa học)</Text>
          {cartItems.map((item) => {
            const hasDiscount =
              item.course.discountedPrice != null && item.course.discountedPrice < item.course.price;
            return (
              <View key={item.id} style={styles.orderItem}>
                <Image
                  source={item.course.thumbnailUrl ? { uri: normalizeImageUrl(item.course.thumbnailUrl)! } : COURSE_PLACEHOLDER}
                  style={styles.itemImage}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={2}>{item.course.title}</Text>
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
              </View>
            );
          })}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.key}
              style={[
                styles.paymentOption,
                paymentMethod === method.key && styles.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod(method.key)}
            >
              <Text style={styles.paymentIcon}>{method.icon}</Text>
              <Text style={styles.paymentLabel}>{method.label}</Text>
              <IconSymbol
                name={paymentMethod === method.key ? 'checkmark.circle.fill' : 'circle'}
                size={22}
                color={paymentMethod === method.key ? COLORS.button : '#ccc'}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Price Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tổng giá gốc</Text>
            <Text style={styles.priceValue}>{totalPrice.toLocaleString('vi-VN')}đ</Text>
          </View>
          {savedAmount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Giảm giá</Text>
              <Text style={[styles.priceValue, { color: '#4CAF50' }]}>
                -{savedAmount.toLocaleString('vi-VN')}đ
              </Text>
            </View>
          )}
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Thành tiền</Text>
            <Text style={styles.totalValue}>{totalDiscounted.toLocaleString('vi-VN')}đ</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Place Order */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceInfo}>
          <Text style={styles.bottomTotalLabel}>Tổng thanh toán</Text>
          <Text style={styles.bottomTotalPrice}>
            {totalDiscounted.toLocaleString('vi-VN')}đ
          </Text>
        </View>
        <TouchableOpacity
          style={styles.placeOrderButton}
          onPress={handlePlaceOrder}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.placeOrderText}>Đặt hàng</Text>
          )}
        </TouchableOpacity>
      </View>
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
  scrollContent: { paddingBottom: 16 },
  section: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textDark, marginBottom: 4 },
  itemPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  itemPrice: { fontSize: 15, fontWeight: 'bold', color: COLORS.button },
  itemOriginalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#eee',
    marginBottom: 10,
    gap: 12,
  },
  paymentOptionSelected: {
    borderColor: COLORS.button,
    backgroundColor: '#FFF5F7',
  },
  paymentIcon: { fontSize: 24 },
  paymentLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: COLORS.textDark },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  priceLabel: { fontSize: 14, color: '#777' },
  priceValue: { fontSize: 14, color: COLORS.textDark },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: COLORS.textDark },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.button },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  bottomPriceInfo: { flex: 1 },
  bottomTotalLabel: { fontSize: 12, color: '#999' },
  bottomTotalPrice: { fontSize: 20, fontWeight: 'bold', color: COLORS.button },
  placeOrderButton: {
    backgroundColor: COLORS.button,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  placeOrderText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});
