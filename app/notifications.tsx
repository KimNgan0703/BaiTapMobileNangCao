import React, { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchNotifications,
  fetchUnreadCount,
  removeNotification,
  toggleNotificationRead,
} from '@/store/slices/notificationSlice';
import { NotificationItem } from '@/services/notificationService';

const COLORS = {
  background: '#FFF0F6',
  card: '#FFFFFF',
  text: '#B5838D',
  textDark: '#333333',
  button: '#F28482',
  secondaryText: '#E56B6F',
  white: '#FFFFFF',
};

export default function NotificationsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, loading, refreshing, page, hasMore, unreadCount } = useAppSelector(
    (state) => state.notifications
  );

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 10 }));
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  const onRefresh = useCallback(() => {
    dispatch(fetchNotifications({ page: 1, limit: 10 }));
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    dispatch(fetchNotifications({ page: page + 1, limit: 10 }));
  }, [dispatch, hasMore, loading, page]);

  const handleToggleRead = useCallback(
    (item: NotificationItem) => {
      dispatch(toggleNotificationRead(item.id));
    },
    [dispatch]
  );

  const handleDelete = useCallback(
    (item: NotificationItem) => {
      Alert.alert('Xóa thông báo', 'Bạn có chắc muốn xóa thông báo này?', [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            dispatch(removeNotification(item.id));
          },
        },
      ]);
    },
    [dispatch]
  );

  const renderNotification = ({ item }: { item: NotificationItem }) => (
    <View style={[styles.card, !item.isRead && styles.unreadCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <IconSymbol
            name={!item.isRead ? 'bell.badge.fill' : 'bell.fill'}
            size={18}
            color={!item.isRead ? COLORS.button : COLORS.secondaryText}
          />
          <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>{item.title}</Text>
        </View>

        <TouchableOpacity onPress={() => handleDelete(item)}>
          <IconSymbol name="trash" size={20} color={COLORS.secondaryText} />
        </TouchableOpacity>
      </View>

      <Text style={styles.message}>{item.message}</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleToggleRead(item)}>
          <Text style={styles.actionText}>{item.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={COLORS.textDark} />
        </TouchableOpacity>

        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Thông báo</Text>
          <Text style={styles.headerSubTitle}>{unreadCount} chưa đọc</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.button]} />
        }
        ListFooterComponent={
          loading && items.length > 0 ? (
            <ActivityIndicator size="small" color={COLORS.button} style={{ marginTop: 12 }} />
          ) : null
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.button} />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <IconSymbol name="bell.fill" size={52} color="#D9A3AF" />
              <Text style={styles.emptyText}>Chưa có thông báo</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  headerSubTitle: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.secondaryText,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F7D9E0',
  },
  unreadCard: {
    borderColor: '#F28482',
    backgroundColor: '#FFF8FA',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
    flex: 1,
  },
  unreadTitle: {
    color: COLORS.text,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4D4D4D',
  },
  actions: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  actionButton: {
    backgroundColor: '#FFE6EA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondaryText,
  },
  loadingContainer: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 15,
    color: '#A57E87',
    fontWeight: '600',
  },
});
