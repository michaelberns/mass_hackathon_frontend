import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '../types';
import { NotificationItem } from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  onMarkRead: (id: string) => Promise<void>;
  onRefresh?: () => void;
}

export function NotificationList({
  notifications,
  loading,
  onMarkRead,
  onRefresh: _onRefresh,
}: NotificationListProps) {
  const navigate = useNavigate();
  const [markingId, setMarkingId] = useState<string | null>(null);

  const handleMarkRead = async (id: string) => {
    setMarkingId(id);
    try {
      await onMarkRead(id);
    } finally {
      setMarkingId(null);
    }
  };

  const handleClick = (notification: Notification) => {
    if (notification.jobId) {
      navigate(`/jobs/${notification.jobId}`);
    }
    if (!notification.read && notification.id) {
      onMarkRead(notification.id).catch(() => {});
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
      </div>
      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No notifications.</p>
        ) : (
          notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkRead={handleMarkRead}
              onClick={handleClick}
              isMarkingRead={markingId === n.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
