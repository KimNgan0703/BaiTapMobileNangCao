import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { Platform } from 'react-native';
import { getAccessToken } from '@/utils/storage';
import { NotificationItem } from './notificationService';

const WS_URL = Platform.OS === 'android'
  ? 'ws://10.0.2.2:9090/ws/notifications'
  : 'ws://localhost:9090/ws/notifications';

let stompClient: Client | null = null;
let notificationSubscription: StompSubscription | null = null;

const parseNotificationPayload = (message: IMessage): NotificationItem | null => {
  try {
    const parsed = JSON.parse(message.body);

    // Support both direct object and wrapped payloads.
    if (parsed?.data?.id) {
      return parsed.data as NotificationItem;
    }
    if (parsed?.id) {
      return parsed as NotificationItem;
    }
    return null;
  } catch {
    return null;
  }
};

interface ConnectOptions {
  onNotification: (notification: NotificationItem) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: string) => void;
}

export const connectNotificationSocket = async ({
  onNotification,
  onConnected,
  onDisconnected,
  onError,
}: ConnectOptions) => {
  if (stompClient?.active) {
    return;
  }

  const token = await getAccessToken();

  stompClient = new Client({
    brokerURL: WS_URL,
    reconnectDelay: 5000,
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    debug: () => {},
    onConnect: () => {
        console.log('Connected to notification socket, subscribing to topic...');
      notificationSubscription = stompClient?.subscribe('/user/topic', (message) => {
        const notification = parseNotificationPayload(message);
        if (notification) {
          onNotification(notification);
        }
      }) || null;
      console.log('Notification socket connected');
      onConnected?.();
    },
    onStompError: (frame) => {
      console.error('STOMP error:', frame.headers['message'] || 'Notification socket error');
      onError?.(frame.headers['message'] || 'Notification socket error');
    },
    onWebSocketClose: () => {
      console.log('Notification websocket closed');
      onDisconnected?.();
    },
    onWebSocketError: () => {
        console.error('Notification websocket error');
      onError?.('Notification websocket error');
    },
  });

  stompClient.activate();
};

export const disconnectNotificationSocket = () => {
  if (notificationSubscription) {
    notificationSubscription.unsubscribe();
    notificationSubscription = null;
  }

  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
};
