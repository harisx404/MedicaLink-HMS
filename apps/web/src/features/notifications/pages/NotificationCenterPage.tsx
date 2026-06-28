import { useState } from 'react';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { useGetNotificationsQuery, useMarkAsReadMutation, useDeleteNotificationMutation } from '../api/notificationApi';
import type { SharedNotification } from '@medicalink/shared';
import { NotificationCategory } from '@medicalink/shared';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, Trash2, Filter } from 'lucide-react';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

export function NotificationCenterPage() {
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | NotificationCategory>('ALL');
  
  // Real implementation would pass filter to query, for now we just fetch and filter client side
  const { data, isLoading } = useGetNotificationsQuery({ limit: 50 });
  const [markAsRead] = useMarkAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const allNotifications = data?.data || [];
  
  const filteredNotifications = allNotifications.filter(n => {
    if (filter === 'ALL') return true;
    if (filter === 'UNREAD') return !n.isRead;
    return n.category === filter;
  });

  const handleMarkAllRead = async () => {
    try {
      await markAsRead({});
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead({ notificationIds: [id] });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <PageWrapper title="Notification Center">
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 border-r border-border bg-muted/10 p-4">
          <div className="flex items-center gap-2 mb-6 text-foreground font-semibold">
            <Filter className="h-5 w-5 text-primary" />
            Filters
          </div>
          
          <div className="space-y-1">
            <button 
              onClick={() => setFilter('ALL')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'ALL' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
            >
              All Notifications
            </button>
            <button 
              onClick={() => setFilter('UNREAD')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'UNREAD' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
            >
              Unread
            </button>
            
            <div className="pt-4 pb-2 text-xs font-semibold uppercase text-muted-foreground/70 tracking-wider">Categories</div>
            {Object.values(NotificationCategory).map(cat => (
              <button 
                key={cat}
                onClick={() => setFilter(cat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === cat ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-lg">Your Notifications</h2>
            <button 
              onClick={handleMarkAllRead}
              className="text-sm font-medium text-primary hover:bg-primary/10 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              Mark all as read
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <LoadingSpinner size="lg" className="text-primary" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Bell className="h-8 w-8 opacity-40" />
                </div>
                <p className="text-lg font-medium text-foreground">All caught up!</p>
                <p className="text-sm">You have no new notifications to review.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification: SharedNotification) => (
                  <div 
                    key={notification._id}
                    className={`p-4 rounded-xl border ${notification.isRead ? 'bg-card border-border/50' : 'bg-primary/5 border-primary/20'} flex gap-4 transition-all hover:shadow-md group`}
                  >
                    <div className="pt-1">
                      <div className={`h-2.5 w-2.5 rounded-full ${notification.isRead ? 'bg-transparent' : 'bg-primary'}`}></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`font-medium ${notification.isRead ? 'text-foreground/80' : 'text-foreground'}`}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {notification.body}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                          {notification.category}
                        </span>
                        
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.isRead && (
                            <button 
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors"
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(notification._id)}
                            className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
