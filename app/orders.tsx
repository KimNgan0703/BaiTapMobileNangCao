import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
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

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders(true);
  }, []);

  const loadOrders = async (reset = false) => {
    if (!reset && (loadingMore || !hasMore)) return;
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const pageToFetch = reset ? 1 : page;
      const res = await orderService.getOrders(pageToFetch, 10);
      const newOrders = res.data || [];
      const meta = res.meta;

      if (reset) {
        setOrders(newOrders);
        setPage(2);
      } else {
        setOrders((prev) => [...prev, ...newOrders]);
        setPage((prev) => prev + 1);
      }

      if (meta) {
        setHasMore(pageToFetch < meta.totalPages);
      } else {
        setHasMore(newOrders.length >= 10);
      }
    } catch (error) {
      console.error('Failed to load orders', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders(true);
  }, []);

  const handlePayNow = async (order: Order) => {
    try {
      setPayingOrderId(order.id);
      const res = await paymentService.getPaymentUrl({
        paymentMethod: 'MOMO',
        orderId: order.id,
      });
      if (res.success && res.data) {
        await WebBrowser.openBrowserAsync(res.data);
        // Refresh orders after returning
        loadOrders(true);
      } else {
        Alert.alert('Lỗi', 'Không thể lấy link thanh toán');
      }
    } catch (error: any) {
      Alert.alert('Lỗi', typeof error === 'string' ? error : 'Đã xảy ra lỗi');
    } finally {
      setPayingOrderId(null);
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const status = item.payment?.status || 'PROCESSING';
    const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.PROCESSING;
    const finalAmount = item.totalPrice - item.discounted;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => router.push({ pathname: '/order-detail' as any, params: { id: item.id } })}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderId} numberOfLines={1}>
            Đơn #{item.id.substring(0, 8)}...
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View style={styles.orderItems}>
          {item.items.map((orderItem) => (
            <View key={orderItem.id} style={styles.orderItemRow}>
              <Text style={styles.orderItemTitle} numberOfLines={1}>
                {orderItem.title}
              </Text>
              <Text style={styles.orderItemPrice}>
                {(orderItem.discountedPrice ?? orderItem.price).toLocaleString('vi-VN')}đ
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.orderFooter}>
          <View>
            <Text style={styles.orderDateLabel}>
              {new Date(item.orderDate).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            <Text style={styles.orderTotal}>
              Tổng: {finalAmount.toLocaleString('vi-VN')}đ
            </Text>
          </View>

          {status === 'PROCESSING' && (
            <TouchableOpacity
              style={styles.payNowButton}
              onPress={() => handlePayNow(item)}
              disabled={payingOrderId === item.id}
            >
              {payingOrderId === item.id ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.payNowText}>Thanh toán ngay</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.button]} />
        }
        onEndReached={() => {
          if (hasMore && !loadingMore && !loading) loadOrders(false);
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator size="small" color={COLORS.button} style={{ padding: 16 }} /> : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="doc.text" size={60} color="#ccc" />
              <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.button} />
            </View>
          )
        }
      />
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
  listContent: { paddingHorizontal: 16, paddingBottom: 16 },
  orderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: { fontSize: 14, fontWeight: '600', color: COLORS.textDark, flex: 1, marginRight: 8 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 12, fontWeight: '600' },
  orderItems: { marginBottom: 12 },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  orderItemTitle: { flex: 1, fontSize: 13, color: '#555', marginRight: 8 },
  orderItemPrice: { fontSize: 13, fontWeight: '600', color: COLORS.textDark },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    paddingTop: 12,
  },
  orderDateLabel: { fontSize: 11, color: '#999', marginBottom: 4 },
  orderTotal: { fontSize: 16, fontWeight: 'bold', color: COLORS.button },
  payNowButton: {
    backgroundColor: COLORS.button,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  payNowText: { color: COLORS.white, fontSize: 13, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 12 },
  loadingContainer: { padding: 40, alignItems: 'center' },
});
