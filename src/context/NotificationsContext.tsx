import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { getUserNotifications, markNotificationRead as apiMarkNotificationRead } from '../services/api';
import type { Notification } from '../types';
import { useUser } from './UserContext';

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async (userId: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { unreadCount: count, notifications: list } = await getUserNotifications(userId);
      setNotifications(list);
      setUnreadCount(count);
    } catch {
      if (!silent) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentUser?.id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    fetchNotifications(currentUser.id);
    const interval = setInterval(() => {
      fetchNotifications(currentUser.id, true);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUser?.id, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!currentUser?.id) return;
    try {
      await apiMarkNotificationRead(notificationId, currentUser.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Keep UI state unchanged on error
    }
  }, [currentUser?.id]);

  const value: NotificationsContextValue = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return ctx;
}
