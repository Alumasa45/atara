import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUserFromToken } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, AlertTriangle, LogOut } from 'lucide-react';

const BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? 'https://atara-dajy.onrender.com/api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>(
    'success',
  );

  // Get the current user from JWT token (has correct role)
  const currentUserFromToken = getCurrentUserFromToken();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const currentUser = getCurrentUserFromToken();
      if (!currentUser) throw new Error('User not authenticated');

      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const userId = currentUser?.userId || currentUser?.sub;
      if (!userId) throw new Error('User ID not found in token');

      const res = await fetch(`${BASE}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Profile API error response:', errorText);
        throw new Error(`Failed to fetch profile: ${res.status}`);
      }

      const data = await res.json();
      setProfile(data);
      setFormData({
        username: data.username || '',
        email: data.email || '',
        phone: data.phone || '',
      });
    } catch (err: any) {
      console.error('Profile fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (editMode) {
      setFormData({
        username: profile.username || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
    }
    setEditMode(!editMode);
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const userId = profile.user_id;

      const res = await fetch(`${BASE}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error(`Failed to update profile: ${res.status}`);
      }

      const updated = await res.json();
      setProfile(updated);
      setEditMode(false);
      setMessage('Profile updated successfully');
      setMessageType('success');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage(err.message);
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setMessage('Please fill in all password fields');
      setMessageType('error');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('New passwords do not match');
      setMessageType('error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || `Failed to change password: ${res.status}`,
        );
      }

      setMessage('Password changed successfully');
      setMessageType('success');
      setShowPasswordForm(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage(err.message);
      setMessageType('error');
    }
  };

  const handleSendVerificationEmail = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${BASE}/auth/send-verification-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message ||
            `Failed to send verification email: ${res.status}`,
        );
      }

      const data = await res.json();
      setMessage(data.message);
      setMessageType('success');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage(err.message);
      setMessageType('error');
    }
  };

  if (loading) {
    return (
      <LoadingSpinner
        message="Loading your profile"
        subtitle="Fetching your account details..."
        fullPage={true}
      />
    );
  }

  if (error) {
    const is401 = error.includes('401');
    return (
      <div className="app">
        <header className="header">
          <div className="logo">👤</div>
          <div>
            <div className="title">Profile</div>
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
            ⚠️ {is401 ? 'Session Expired' : 'Error Loading Profile'}
          </h3>
          <p style={{ color: '#d32f2f', marginBottom: '16px' }}>{error}</p>
          {is401 && (
            <div
              style={{
                backgroundColor: '#fff3e0',
                border: '1px solid #ffb74d',
                borderRadius: '4px',
                padding: '12px',
                marginTop: '16px',
              }}
            >
              <p
                style={{
                  color: '#e65100',
                  margin: '0 0 8px 0',
                  fontWeight: 'bold',
                }}
              >
                💡 How to fix:
              </p>
              <ol
                style={{ color: '#e65100', margin: '0', paddingLeft: '20px' }}
              >
                <li>
                  Click <strong>Logout</strong> in the sidebar
                </li>
                <li>Log back in with your credentials</li>
                <li>Your session will be refreshed</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">👤</div>
        <div>
          <div className="title">My Profile</div>
          <div className="muted">Manage your account information</div>
        </div>
      </header>

      {message && (
        <div
          className="card"
          style={{
            backgroundColor: messageType === 'success' ? '#e8f5e9' : '#ffebee',
            borderLeft: `4px solid ${messageType === 'success' ? '#4CAF50' : '#f44336'}`,
            marginBottom: 16,
          }}
        >
          <p
            style={{
              color: messageType === 'success' ? '#2e7d32' : '#c62828',
              margin: 0,
            }}
          >
            {message}
          </p>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginTop: 20,
        }}
      >
        {/* Profile Card */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <h3 style={{ margin: 0 }}>Account Information</h3>
            <button
              onClick={handleEditToggle}
              style={{
                padding: '6px 12px',
                backgroundColor: editMode ? '#f44336' : 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 'bold',
              }}
            >
              {editMode ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            {editMode ? (
              <>
                <div>
                  <label
                    style={{
                      color: 'var(--muted)',
                      fontSize: 12,
                      display: 'block',
                      marginBottom: 4,
                    }}
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      fontSize: 14,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--muted)',
                      fontSize: 12,
                      display: 'block',
                      marginBottom: 4,
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      fontSize: 14,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--muted)',
                      fontSize: 12,
                      display: 'block',
                      marginBottom: 4,
                    }}
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      fontSize: 14,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: 14,
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <>
                <div>
                  <label
                    style={{
                      color: 'var(--muted)',
                      fontSize: 12,
                      display: 'block',
                      marginBottom: 4,
                    }}
                  >
                    Username
                  </label>
                  <div style={{ fontSize: 16, fontWeight: 'bold' }}>
                    {profile?.username || 'N/A'}
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--muted)',
                      fontSize: 12,
                      display: 'block',
                      marginBottom: 4,
                    }}
                  >
                    Email
                  </label>
                  <div style={{ fontSize: 16, fontWeight: 'bold' }}>
                    {profile?.email || 'N/A'}
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--muted)',
                      fontSize: 12,
                      display: 'block',
                      marginBottom: 4,
                    }}
                  >
                    Role
                  </label>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      backgroundColor:
                        currentUserFromToken?.role === 'admin'
                          ? '#9C27B0'
                          : currentUserFromToken?.role === 'manager'
                            ? '#4CAF50'
                            : currentUserFromToken?.role === 'trainer'
                              ? '#FF9800'
                              : '#2196F3',
                      color: 'white',
                      borderRadius: 4,
                      fontSize: 14,
                      fontWeight: 'bold',
                    }}
                  >
                    {currentUserFromToken?.role || 'client'}
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--muted)',
                      fontSize: 12,
                      display: 'block',
                      marginBottom: 4,
                    }}
                  >
                    Phone
                  </label>
                  <div style={{ fontSize: 16 }}>
                    {profile?.phone || 'Not provided'}
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--muted)',
                      fontSize: 12,
                      display: 'block',
                      marginBottom: 4,
                    }}
                  >
                    Status
                  </label>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      backgroundColor:
                        profile?.status === 'active'
                          ? '#4CAF50'
                          : profile?.status === 'inactive'
                            ? '#FF9800'
                            : '#F44336',
                      color: 'white',
                      borderRadius: 4,
                      fontSize: 14,
                      fontWeight: 'bold',
                    }}
                  >
                    {profile?.status || 'active'}
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--muted)',
                      fontSize: 12,
                      display: 'block',
                      marginBottom: 4,
                    }}
                  >
                    Member Since
                  </label>
                  <div style={{ fontSize: 16 }}>
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString()
                      : 'N/A'}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Settings Card */}
        <div className="card">
          <h3>Settings & Security</h3>
          <div style={{ display: 'grid', gap: 16 }}>
            {/* Email Verification */}
            <div>
              <label
                style={{
                  color: 'var(--muted)',
                  fontSize: 12,
                  display: 'block',
                  marginBottom: 8,
                }}
              >
                Email Verification
              </label>
              <div
                style={{
                  padding: '12px',
                  backgroundColor: profile?.email_verified
                    ? 'rgba(76, 175, 80, 0.1)'
                    : 'rgba(244, 67, 54, 0.1)',
                  border: `2px solid ${profile?.email_verified ? '#4CAF50' : '#F44336'}`,
                  borderRadius: 4,
                  color: profile?.email_verified ? '#2E7D32' : '#C62828',
                  fontWeight: 'bold',
                  marginBottom: 12,
                }}
              >
                {profile?.email_verified ? '✓ Verified' : '✗ Not Verified'}
              </div>

              {!profile?.email_verified && (
                <button
                  onClick={handleSendVerificationEmail}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: 14,
                  }}
                >
                  Send Verification Email
                </button>
              )}
            </div>

            {/* Password Change */}
            <div style={{ borderTop: '1px solid #eee', paddingTop: 16 }}>
              <h4 style={{ marginTop: 0 }}>Security</h4>

              {!showPasswordForm ? (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: 'var(--accent-2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: 14,
                  }}
                >
                  Change Password
                </button>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  <div>
                    <label
                      style={{
                        color: 'var(--muted)',
                        fontSize: 12,
                        display: 'block',
                        marginBottom: 4,
                      }}
                    >
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: 4,
                        fontSize: 14,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        color: 'var(--muted)',
                        fontSize: 12,
                        display: 'block',
                        marginBottom: 4,
                      }}
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: 4,
                        fontSize: 14,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        color: 'var(--muted)',
                        fontSize: 12,
                        display: 'block',
                        marginBottom: 4,
                      }}
                    >
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: 4,
                        fontSize: 14,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 8,
                    }}
                  >
                    <button
                      onClick={handleChangePassword}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: 14,
                      }}
                    >
                      Update Password
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordForm({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        });
                      }}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: '#999',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: 14,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="card" style={{ gridColumn: '1 / -1', marginTop: 16 }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#d32f2f';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f44336';
            }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
