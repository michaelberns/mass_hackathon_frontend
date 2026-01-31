import type { Notification } from '../types';

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onClick: (notification: Notification) => void;
  isMarkingRead: boolean;
}

export function NotificationItem({
  notification,
  onMarkRead,
  onClick,
  isMarkingRead,
}: NotificationItemProps) {
  const handleClick = () => {
    onClick(notification);
  };

  const handleMarkRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.read) {
      onMarkRead(notification.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`p-4 rounded-lg border cursor-pointer transition-colors text-left ${
        notification.read
          ? 'bg-white border-gray-200 hover:border-gray-300'
          : 'bg-amber-50/80 border-amber-200 hover:border-amber-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={`text-gray-900 ${notification.read ? 'font-medium' : 'font-semibold'}`}>
            {notification.message}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </div>
        {!notification.read && (
          <button
            type="button"
            onClick={handleMarkRead}
            disabled={isMarkingRead}
            className="shrink-0 px-3 py-1.5 text-sm font-medium text-amber-800 hover:text-amber-900 hover:bg-amber-100 rounded-lg disabled:opacity-50"
          >
            {isMarkingRead ? 'Marking...' : 'Mark read'}
          </button>
        )}
      </div>
    </div>
  );
}
