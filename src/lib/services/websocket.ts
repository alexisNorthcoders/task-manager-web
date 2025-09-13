import { writable } from 'svelte/store';
import { PUBLIC_API_URL } from '$env/static/public';
import type { WebSocketNotification } from '../types';

// WebSocket connection state
export const wsConnected = writable(false);
export const wsError = writable<string | null>(null);

// Notification events
export const notifications = writable<WebSocketNotification[]>([]);

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimeout: number | null = null;
  private shouldConnect = false;
  private reconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 30000; // Max 30 seconds
  private reconnectAttempts = 0;

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    this.shouldConnect = true;
    
    try {
      // Get the WebSocket URL from environment or use default
      const apiUrl = PUBLIC_API_URL || 'http://localhost:8080';
      const wsUrl = apiUrl.replace('http', 'ws') + '/ws';

      console.log('Connecting to WebSocket:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        wsConnected.set(true);
        wsError.set(null);
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000; // Reset delay
      };

      this.ws.onmessage = (event) => {
        try {
          const notification: WebSocketNotification = JSON.parse(event.data);
          console.log('WebSocket notification received:', notification);
          
          // Add to notifications store
          notifications.update(items => [notification, ...items].slice(0, 100)); // Keep last 100
          
          // Handle specific notification types
          this.handleNotification(notification);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        wsConnected.set(false);
        
        if (this.shouldConnect && !event.wasClean) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        wsError.set('Connection error occurred');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      wsError.set('Failed to connect to server');
      this.scheduleReconnect();
    }
  }

  disconnect() {
    this.shouldConnect = false;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    wsConnected.set(false);
    wsError.set(null);
  }

  private scheduleReconnect() {
    if (!this.shouldConnect) return;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), this.maxReconnectDelay);
    
    console.log(`Scheduling WebSocket reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimeout = window.setTimeout(() => {
      console.log('Attempting WebSocket reconnect...');
      this.connect();
    }, delay);
  }

  private handleNotification(notification: WebSocketNotification) {
    // Import dynamically to avoid circular dependencies
    import('../stores/tasks').then(({ tasksStore }) => {
      switch (notification.type) {
        case 'TASK_CREATED':
        case 'TASK_UPDATED':
        case 'TASK_DELETED':
        case 'BULK_OPERATION':
          // Refresh tasks when task-related notifications are received
          console.log('Refreshing tasks due to notification:', notification.type);
          tasksStore.load();
          break;
        
        case 'USER_PRESENCE':
          console.log('User presence update:', notification.username, notification.isOnline);
          break;
        
        default:
          console.log('Unhandled notification type:', notification.type);
      }
    });
  }

  // Send a message (if needed for future features)
  send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  }

  // Get connection status
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Create a singleton instance
export const webSocketService = new WebSocketService();

// Auto-connect when the service is imported
if (typeof window !== 'undefined') {
  // Connect after a short delay to ensure stores are initialized
  setTimeout(() => {
    webSocketService.connect();
  }, 100);
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    webSocketService.disconnect();
  });
}

// Helper to clear old notifications
export function clearNotifications() {
  notifications.set([]);
}

// Helper to show toast notifications (to be integrated with a toast library)
export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  console.log(`Toast [${type}]: ${message}`);
  // This could be replaced with a proper toast notification library
}