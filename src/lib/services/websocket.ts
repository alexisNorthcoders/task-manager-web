import { writable } from 'svelte/store';
import { PUBLIC_API_URL } from '$env/static/public';
import type { WebSocketNotification } from '../types';
import { Client } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';

// Connection state stores
export const wsConnected = writable(false);
export const wsError = writable<string | null>(null);

// Notification events
export const notifications = writable<WebSocketNotification[]>([]);

class WebSocketService {
  private client: Client | null = null;

  connect() {
    if (this.client?.connected || this.client?.active) {
      return;
    }

    const apiUrl = PUBLIC_API_URL || 'http://localhost:8080';
    const wsUrl = `${apiUrl.replace(/^http/, 'ws')}/ws/websocket`;

    this.client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 1000,
      maxReconnectDelay: 30000,
      onConnect: () => {
        wsConnected.set(true);
        wsError.set(null);

        this.client?.subscribe('/topic/tasks', this.onMessage);
        this.client?.subscribe('/topic/presence', this.onMessage);
      },
      onStompError: (frame) => {
        wsError.set(frame.headers['message'] || 'STOMP error');
      },
      onWebSocketError: () => {
        wsError.set('Connection error occurred');
      },
      onDisconnect: () => {
        wsConnected.set(false);
      },
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client?.active) {
      this.client.deactivate();
    }
    wsConnected.set(false);
    wsError.set(null);
  }

  private onMessage = (message: IMessage) => {
    try {
      const notification: WebSocketNotification = JSON.parse(message.body);
      notifications.update((items) => [notification, ...items].slice(0, 100));
      this.handleNotification(notification);
    } catch (error) {
      // ignore parse errors
    }
  };

  private handleNotification(notification: WebSocketNotification) {
    import('../stores/tasks').then(({ tasksStore }) => {
      switch (notification.type) {
        case 'TASK_CREATED':
        case 'TASK_UPDATED':
        case 'TASK_DELETED':
        case 'BULK_OPERATION':
          tasksStore.load();
          break;
        default:
          break;
      }
    });
  }

  // Get connection status
  isConnected(): boolean {
    return Boolean(this.client?.connected);
  }
}

export const webSocketService = new WebSocketService();

if (typeof window !== 'undefined') {
  setTimeout(() => {
    webSocketService.connect();
  }, 100);

  window.addEventListener('beforeunload', () => {
    webSocketService.disconnect();
  });
}

export function clearNotifications() {
  notifications.set([]);
}

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  console.log(`Toast [${type}]: ${message}`);
}