import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Dumbbell, Star, User, LogOut, Bell } from 'lucide-react';
import { api } from '../api';

export default function NavigationHeader() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchUnreadCount();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications?limit=10');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      fetchUnreadCount();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setUnreadCount(0);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      fetchNotifications();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <nav
      style={{
        background:
          'linear-gradient(135deg, #7F5539 0%, #9C6644 50%, #B08968 100%)',
        color: '#FFFFFF',
        padding: '0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderBottom: '2px solid #DDB892',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          height: '72px',
          padding: '0 32px',
        }}
      >
        {/* Logo/Brand */}
        <Link
          to="/"
          style={{
            color: '#FFFFFF',
            textDecoration: 'none',
            fontSize: '22px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#DDB892';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <span
            style={{
              fontSize: '28px',
              background: 'linear-gradient(135deg, #DDB892, #E6CCB2)',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <Dumbbell size={20} color="#3b2f2a" />
          </span>
          <span style={{ fontSize: '18px', fontWeight: 600 }}>
            Atara Movement Studio
          </span>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link
            to="/"
            style={{
              color: '#FFFFFF',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: 600,
              padding: '10px 18px',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              border: '1px solid transparent',
              letterSpacing: '0.3px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#DDB892';
              e.currentTarget.style.color = '#3b2f2a';
              e.currentTarget.style.borderColor = '#DDB892';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Home
          </Link>

          {/* Admin-only Membership Management Link - HIGHLIGHTED */}
          {isAdmin && (
            <Link
              to="/admin/memberships"
              style={{
                color: '#3b2f2a',
                backgroundColor: '#DDB892',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: 700,
                padding: '10px 20px',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: '2px solid #DDB892',
                boxShadow: '0 3px 8px rgba(221, 184, 146, 0.4)',
                letterSpacing: '0.3px',
                textTransform: 'uppercase',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E6CCB2';
                e.currentTarget.style.borderColor = '#E6CCB2';
                e.currentTarget.style.transform =
                  'translateY(-3px) scale(1.05)';
                e.currentTarget.style.boxShadow =
                  '0 6px 16px rgba(221, 184, 146, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#DDB892';
                e.currentTarget.style.borderColor = '#DDB892';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow =
                  '0 3px 8px rgba(221, 184, 146, 0.4)';
              }}
            >
              <Star size={16} />
              <span>Membership</span>
            </Link>
          )}

          <Link
            to="/about"
            style={{
              color: '#FFFFFF',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: 600,
              padding: '10px 18px',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              border: '1px solid transparent',
              letterSpacing: '0.3px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#DDB892';
              e.currentTarget.style.color = '#3b2f2a';
              e.currentTarget.style.borderColor = '#DDB892';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
             About Us
          </Link>

          <Link
            to="/contact"
            style={{
              color: '#FFFFFF',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: 600,
              padding: '10px 18px',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              border: '1px solid transparent',
              letterSpacing: '0.3px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#DDB892';
              e.currentTarget.style.color = '#3b2f2a';
              e.currentTarget.style.borderColor = '#DDB892';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
             Contact
          </Link>

          {/* Notifications Bell */}
          {user && (
            <div ref={notificationRef} style={{ position: 'relative', marginLeft: '16px' }}>
              <button
                onClick={toggleNotifications}
                style={{
                  backgroundColor: 'rgba(221, 184, 146, 0.2)',
                  color: '#FFFFFF',
                  border: '2px solid #DDB892',
                  padding: '10px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#DDB892';
                  e.currentTarget.style.color = '#3b2f2a';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(221, 184, 146, 0.2)';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      backgroundColor: '#ff4444',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    width: '350px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    zIndex: 1001,
                  }}
                >
                  <div
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #eee',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#f8f9fa',
                    }}
                  >
                    <h3 style={{ margin: 0, color: '#333', fontSize: '16px' }}>Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#7F5539',
                          cursor: 'pointer',
                          fontSize: '12px',
                          textDecoration: 'underline',
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.notification_id}
                        onClick={() => !notification.is_read && markAsRead(notification.notification_id)}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #eee',
                          cursor: notification.is_read ? 'default' : 'pointer',
                          backgroundColor: notification.is_read ? 'white' : '#f0f8ff',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          if (!notification.is_read) {
                            e.currentTarget.style.backgroundColor = '#e6f3ff';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = notification.is_read ? 'white' : '#f0f8ff';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#333' }}>
                              {notification.title}
                            </h4>
                            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#666', lineHeight: '1.4' }}>
                              {notification.message}
                            </p>
                            <span style={{ fontSize: '11px', color: '#999' }}>
                              {new Date(notification.created_at).toLocaleString()}
                            </span>
                          </div>
                          {!notification.is_read && (
                            <div
                              style={{
                                width: '8px',
                                height: '8px',
                                backgroundColor: '#007bff',
                                borderRadius: '50%',
                                marginLeft: '8px',
                                marginTop: '4px',
                              }}
                            />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* User Info & Logout */}
          {user && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginLeft: '16px',
              }}
            >
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#E6CCB2',
                  borderLeft: '2px solid #DDB892',
                  paddingLeft: '16px',
                  letterSpacing: '0.3px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={16} />
                  {user.username}
                </div>
                <span
                  style={{
                    marginLeft: '6px',
                    fontSize: '12px',
                    background: '#DDB892',
                    color: '#3b2f2a',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  {user.role}
                </span>
              </span>
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: 'rgba(221, 184, 146, 0.2)',
                  color: '#FFFFFF',
                  border: '2px solid #DDB892',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  letterSpacing: '0.3px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#DDB892';
                  e.currentTarget.style.color = '#3b2f2a';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'rgba(221, 184, 146, 0.2)';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LogOut size={16} />
                  Logout
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
