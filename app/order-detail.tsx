import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { orderService, Order } from '@/services/orderService';
import { paymentService } from '@/services/paymentService';
import * as WebBrowser from 'expo-web-browser';

const COLORS = {
  background: '#FFF0F6',
  card: '#FFFFFF',
  text: '#B5838D',
  textDark: '#333333',
  button: '#F28482',
  secondaryText: '#E56B6F',
  white: '#FFFFFF',
  green: '#4CAF50',
  orange: '#FF9800',
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PROCESSING: { label: 'Chờ thanh toán', color: COLORS.orange },
  PAID: { label: 'Đã thanh toán', color: COLORS.green },
  CANCELLED: { label: 'Đã hủy', color: '#999' },
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (id) loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrderById(id!);
      setOrder(res.data);
    } catch (error) {
      console.error('Failed to load order', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!order) return;
    try {
      setPaying(true);
      const res = await paymentService.getPaymentUrl({
        paymentMethod: 'MOMO',
        orderId: order.id,
      });
      if (res.success && res.data) {
        await WebBrowser.openBrowserAsync(res.data);
        // Refresh order after returning
        loadOrder();
      } else {
        Alert.alert('Lỗi', 'Không thể lấy link thanh toán');
      }
    } catch (error: any) {
      Alert.alert('Lỗi', typeof error === 'string' ? error : 'Đã xảy ra lỗi');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.button} />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: COLORS.secondaryText }}>Không tìm thấy đơn hàng</Text>
        </View>
      </SafeAreaView>
    );
  }

  const status = order.payment?.status || 'PROCESSING';
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.PROCESSING;
  const finalAmount = order.totalPrice - order.discounted;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Status Section */}
        <View style={styles.section}>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
          <Text style={styles.orderIdText}>Mã đơn: {order.id}</Text>
          <Text style={styles.orderDate}>
            Ngày đặt:{' '}
            {new Date(order.orderDate).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Các khóa học</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
              </View>
              <View style={styles.itemPrices}>
                {item.discountedPrice != null && item.discountedPrice < item.price ? (
                  <>
                    <Text style={styles.itemPrice}>
                      {item.discountedPrice.toLocaleString('vi-VN')}đ
                    </Text>
                    <Text style={styles.itemOriginalPrice}>
                      {item.price.toLocaleString('vi-VN')}đ
                    </Text>
                  </>
                ) : (
                  <Text style={styles.itemPrice}>
                    {item.price.toLocaleString('vi-VN')}đ
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thanh toán</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tổng giá</Text>
            <Text style={styles.summaryValue}>
              {order.totalPrice.toLocaleString('vi-VN')}đ
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Giảm giá</Text>
            <Text style={[styles.summaryValue, { color: COLORS.green }]}>
              -{order.discounted.toLocaleString('vi-VN')}đ
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Thành tiền</Text>
            <Text style={styles.totalValue}>{finalAmount.toLocaleString('vi-VN')}đ</Text>
          </View>

          {order.payment && (
            <View style={styles.paymentInfo}>
              {order.payment.paymentMessage && (
                <Text style={styles.paymentMessage}>{order.payment.paymentMessage}</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom: Pay Now if PROCESSING */}
      {status === 'PROCESSING' && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.payNowButton}
            onPress={handlePayNow}
            disabled={paying}
          >
            {paying ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.payNowButtonText}>Thanh toán ngay</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  statusRow: { marginBottom: 10 },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: { fontSize: 13, fontWeight: '700' },
  orderIdText: { fontSize: 12, color: '#999', marginBottom: 4 },
  orderDate: { fontSize: 12, color: '#999' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  itemInfo: { flex: 1, marginRight: 12 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textDark },
  itemPrices: { alignItems: 'flex-end' },
  itemPrice: { fontSize: 14, fontWeight: 'bold', color: COLORS.button },
  itemOriginalPrice: {
    fontSize: 11,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: { fontSize: 14, color: '#777' },
  summaryValue: { fontSize: 14, color: COLORS.textDark },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: COLORS.textDark },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.button },
  paymentInfo: { marginTop: 12 },
  paymentMessage: { fontSize: 13, color: '#777', fontStyle: 'italic' },
  bottomBar: {
    padding: 16,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  payNowButton: {
    backgroundColor: COLORS.button,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  payNowButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});
