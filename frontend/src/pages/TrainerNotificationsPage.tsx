import React, { useEffect, useState } from 'react';
import { getJson, postJson } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

interface Notification {
  notification_id: number;
  type: 'new_booking' | 'booking_cancelled' | 'payment_received';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  booking?: {
    booking_id: number;
    user?: {
      username: string;
      email: string;
    };
    guest_name?: string;
    guest_email?: string;
    timeSlot?: {
      start_time: string;
      session?: {
        category: string;
        description: string;
      };
    };
  };
}

export default function TrainerNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getJson('/notifications?limit=50');
      setNotifications(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await getJson('/notifications/unread-count');
      setUnreadCount(data?.count || 0);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await postJson(`/notifications/${notificationId}/read`, {});
      setNotifications(prev =>
        prev.map(n =>
          n.notification_id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await postJson('/notifications/mark-all-read', {});
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_booking':
        return '📅';
      case 'booking_cancelled':
        return '❌';
      case 'payment_received':
        return '💰';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_booking':
        return '#4CAF50';
      case 'booking_cancelled':
        return '#F44336';
      case 'payment_received':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  if (loading) {
    return (
      <LoadingSpinner
        message="Loading notifications"
        subtitle="Fetching your latest updates..."
        fullPage={true}
      />
    );
  }

  if (error) {
    return (
      <div className="app">
        <header className="header">
          <div className="logo">🔔</div>
          <div>
            <div className="title">Notifications</div>
          </div>
        </header>
        <div
          className="card"
          style={{
            borderLeft: '4px solid #f44336',
            padding: '20px',
            backgroundColor: '#ffebee',
          }}
        >
          <h3 style={{ color: '#c62828', marginTop: 0 }}>
            ⚠️ Error Loading Notifications
          </h3>
          <p style={{ color: '#d32f2f' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">🔔</div>
        <div>
          <div className="title">
            Notifications
            {unreadCount > 0 && (
              <span
                style={{
                  marginLeft: 8,
                  padding: '2px 8px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 'bold',
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          <div className="muted">Stay updated with your bookings</div>
        </div>
      </header>

      <div style={{ marginTop: 20 }}>
        {unreadCount > 0 && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <strong>{unreadCount}</strong> unread notification{unreadCount !== 1 ? 's' : ''}
              </div>
              <button
                onClick={markAllAsRead}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                Mark All as Read
              </button>
            </div>
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="card">
            <p
              style={{
                color: '#999',
                textAlign: 'center',
                padding: '40px 20px',
              }}
            >
              🔔 No notifications yet. You'll receive updates when clients book your sessions.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {notifications.map((notification) => (
              <div
                key={notification.notification_id}
                className="card"
                style={{
                  borderLeft: `4px solid ${getNotificationColor(notification.type)}`,
                  backgroundColor: notification.is_read ? '#fff' : '#f8f9fa',
                  cursor: notification.is_read ? 'default' : 'pointer',
                }}
                onClick={() => !notification.is_read && markAsRead(notification.notification_id)}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}
                >
                  <div style={{ fontSize: 24 }}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 8,
                      }}
                    >
                      <h4
                        style={{
                          margin: 0,
                          fontSize: 16,
                          fontWeight: notification.is_read ? 'normal' : 'bold',
                        }}
                      >
                        {notification.title}
                      </h4>
                      <div
                        style={{
                          fontSize: 11,
                          color: '#666',
                          whiteSpace: 'nowrap',
                          marginLeft: 12,
                        }}
                      >
                        {new Date(notification.created_at).toLocaleString()}
                      </div>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        color: '#555',
                        fontSize: 14,
                        lineHeight: 1.4,
                      }}
                    >
                      {notification.message}
                    </p>
                    {notification.booking && (
                      <div
                        style={{
                          marginTop: 12,
                          padding: 12,
                          backgroundColor: '#f5f5f5',
                          borderRadius: 4,
                          fontSize: 12,
                        }}
                      >
                        <div style={{ marginBottom: 4 }}>
                          <strong>Client:</strong>{' '}
                          {notification.booking.user?.username ||
                            notification.booking.guest_name ||
                            'Guest'}
                        </div>
                        {(notification.booking.user?.email ||
                          notification.booking.guest_email) && (
                          <div style={{ marginBottom: 4 }}>
                            <strong>Email:</strong>{' '}
                            {notification.booking.user?.email ||
                              notification.booking.guest_email}
                          </div>
                        )}
                        {notification.booking.timeSlot && (
                          <div style={{ marginBottom: 4 }}>
                            <strong>Session:</strong>{' '}
                            {notification.booking.timeSlot.session?.category || 'N/A'}
                          </div>
                        )}
                        {notification.booking.timeSlot?.start_time && (
                          <div>
                            <strong>Time:</strong>{' '}
                            {new Date(
                              notification.booking.timeSlot.start_time
                            ).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                    {!notification.is_read && (
                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 11,
                          color: '#2196F3',
                          fontWeight: 'bold',
                        }}
                      >
                        Click to mark as read
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}