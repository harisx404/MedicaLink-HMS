import { useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { useGetNotificationsQuery, useMarkAsReadMutation } from '../api/notificationApi';
import type { SharedNotification } from '@medicalink/shared';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
// Need a Socket context to listen to new notifications. For now we will rely on polling or RTK query invalidation, 
// but we can listen to socket here if we have a global socket context.

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading } = useGetNotificationsQuery({ limit: 5 });
  const [markAsRead] = useMarkAsReadMutation();

  const notifications = data?.data || [];
  const unreadCount = data?.meta?.unreadCount || 0;

  const handleMarkAllRead = async () => {
    try {
      await markAsRead({});
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      try {
        await markAsRead({ notificationIds: [id] });
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center border-2 border-card">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border/50 rounded-xl shadow-lg z-50 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
              >
                <Check className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mb-2"></div>
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                <Bell className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {notifications.map((notification: SharedNotification) => (
                  <div 
                    key={notification._id} 
                    onClick={() => handleNotificationClick(notification._id, notification.isRead)}
                    className={`p-4 hover:bg-muted/30 cursor-pointer transition-colors flex gap-3 ${!notification.isRead ? 'bg-primary/5' : ''}`}
                  >
                    <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${!notification.isRead ? 'bg-primary' : 'bg-transparent'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.isRead ? 'font-semibold text-foreground' : 'text-foreground/80'} truncate`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.body}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1.5 font-medium uppercase tracking-wider">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-border/50 bg-muted/20 text-center">
            <Link 
              to="/notifications" 
              onClick={() => setIsOpen(false)}
              className="text-sm text-primary font-medium hover:underline flex items-center justify-center gap-1.5"
            >
              View All Notifications
            </Link>
          </div>
        </div>
      )}
      
      {/* Backdrop for closing when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
