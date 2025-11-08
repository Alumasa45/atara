import React, { useEffect, useState } from 'react';
import { getCurrentUserFromToken } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? 'https://atara-dajy.onrender.com';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<any>(null);
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
  const [stats, setStats] = useState<any>({
    totalSessions: 0,
    totalSchedules: 0,
    totalUsers: 0,
  });

  // Get the current user from JWT token
  const currentUserFromToken = getCurrentUserFromToken();

  useEffect(() => {
    fetchProfile();
    fetchStats();
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

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Fetch admin stats
      const adminRes = await fetch(`${BASE}/admin/stats`, {
        headers,
      });
      if (adminRes.ok) {
        const statsData = await adminRes.json();
        setStats({
          totalSessions: statsData.totalSessions || 0,
          totalSchedules: statsData.totalSchedules || 0,
          totalUsers: statsData.totalUsers || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setMessage(null);
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
      setMessage('Profile updated successfully!');
      setMessageType('success');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('Save error:', err);
      setMessage(err.message);
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (!passwordForm.newPassword) {
        setMessage('New password is required');
        setMessageType('error');
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setMessage('Passwords do not match');
        setMessageType('error');
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        setMessage('Password must be at least 6 characters');
        setMessageType('error');
        return;
      }

      const token = localStorage.getItem('token');
      const userId = profile.user_id;

      const res = await fetch(
        `${BASE}/users/${userId}/password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          }),
        },
      );

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || 'Failed to update password');
      }

      setMessage('Password updated successfully!');
      setMessageType('success');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordForm(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('Password change error:', err);
      setMessage(err.message);
      setMessageType('error');
    }
  };

  if (loading) return <LoadingSpinner />;

  const containerStyle: React.CSSProperties = {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '20px',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    borderBottom: '2px solid #007bff',
    paddingBottom: 10,
  };

  const formGroupStyle: React.CSSProperties = {
    marginBottom: 15,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#333',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: 4,
    fontSize: 14,
    boxSizing: 'border-box',
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: 10,
    marginTop: 20,
  };

  const buttonStyle = (bg: string): React.CSSProperties => ({
    padding: '10px 20px',
    border: 'none',
    borderRadius: 4,
    fontSize: 14,
    fontWeight: 'bold',
    cursor: 'pointer',
    backgroundColor: bg,
    color: '#fff',
    transition: 'opacity 0.2s',
  });

  const statsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 15,
    marginTop: 15,
  };

  const statBoxStyle: React.CSSProperties = {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 8,
    textAlign: 'center',
    border: '1px solid #dee2e6',
  };

  const statNumberStyle: React.CSSProperties = {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 5,
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  };

  const messageStyle = (type: 'success' | 'error'): React.CSSProperties => ({
    padding: '12px 16px',
    borderRadius: 4,
    marginBottom: 15,
    backgroundColor: type === 'success' ? '#d4edda' : '#f8d7da',
    color: type === 'success' ? '#155724' : '#721c24',
    border: `1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
  });

  return (
    <div style={containerStyle}>
      <h1 style={{ marginBottom: 30, color: '#333' }}>Admin Profile</h1>

      {message && <div style={messageStyle(messageType)}>{message}</div>}
      {error && <div style={messageStyle('error')}>Error: {error}</div>}

      {/* Profile Information Card */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>Personal Information</h2>

        {profile && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 15,
                marginBottom: 20,
              }}
            >
              <div>
                <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: 14 }}>
                  <strong>Name:</strong>
                </p>
                <p style={{ margin: 0, fontSize: 16, color: '#333' }}>
                  {profile.username || 'N/A'}
                </p>
              </div>
              <div>
                <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: 14 }}>
                  <strong>Role:</strong>
                </p>
                <p style={{ margin: 0, fontSize: 16, color: '#333' }}>
                  <span
                    style={{
                      backgroundColor: '#007bff',
                      color: '#fff',
                      padding: '4px 12px',
                      borderRadius: 4,
                      display: 'inline-block',
                      textTransform: 'capitalize',
                    }}
                  >
                    {profile.role || 'N/A'}
                  </span>
                </p>
              </div>
              <div>
                <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: 14 }}>
                  <strong>Email:</strong>
                </p>
                <p style={{ margin: 0, fontSize: 16, color: '#333' }}>
                  {profile.email || 'N/A'}
                </p>
              </div>
              <div>
                <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: 14 }}>
                  <strong>Phone:</strong>
                </p>
                <p style={{ margin: 0, fontSize: 16, color: '#333' }}>
                  {profile.phone || 'N/A'}
                </p>
              </div>
            </div>

            {!editMode ? (
              <button
                onClick={handleEditToggle}
                style={{
                  ...buttonStyle('#28a745'),
                  marginTop: 15,
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = '0.8')}
                onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
              >
                ✎ Edit Profile
              </button>
            ) : (
              <div
                style={{
                  marginTop: 20,
                  paddingTop: 20,
                  borderTop: '1px solid #eee',
                }}
              >
                <h3 style={{ marginBottom: 15, color: '#333' }}>
                  Edit Profile
                </h3>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleFormChange}
                    style={inputStyle}
                    disabled={saving}
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    style={inputStyle}
                    disabled={saving}
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    style={inputStyle}
                    disabled={saving}
                  />
                </div>

                <div style={buttonGroupStyle}>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    style={{
                      ...buttonStyle('#007bff'),
                      opacity: saving ? 0.6 : 1,
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : '💾 Save Changes'}
                  </button>
                  <button
                    onClick={handleEditToggle}
                    disabled={saving}
                    style={{
                      ...buttonStyle('#6c757d'),
                      opacity: saving ? 0.6 : 1,
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Password Change Card */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>Security</h2>

        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            style={{
              ...buttonStyle('#ffc107'),
              color: '#333',
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = '0.8')}
            onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
          >
            🔒 Change Password
          </button>
        ) : (
          <div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                style={inputStyle}
              />
            </div>

            <div style={buttonGroupStyle}>
              <button
                onClick={handlePasswordChange}
                style={{
                  ...buttonStyle('#28a745'),
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = '0.8')}
                onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
              >
                ✓ Update Password
              </button>
              <button
                onClick={() => setShowPasswordForm(false)}
                style={{
                  ...buttonStyle('#6c757d'),
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = '0.8')}
                onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Admin Statistics Card */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>📊 Admin Dashboard Statistics</h2>

        <div style={statsGridStyle}>
          <div style={statBoxStyle}>
            <div style={statNumberStyle}>{stats.totalSessions}</div>
            <div style={statLabelStyle}>Total Sessions Created</div>
          </div>

          <div style={statBoxStyle}>
            <div style={statNumberStyle}>{stats.totalSchedules}</div>
            <div style={statLabelStyle}>Total Schedules</div>
          </div>

          <div style={statBoxStyle}>
            <div style={statNumberStyle}>{stats.totalUsers}</div>
            <div style={statLabelStyle}>Total Users</div>
          </div>
        </div>
      </div>

      {/* Account Information Card */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>Account Information</h2>

        {profile && (
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}
          >
            <div>
              <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: 14 }}>
                <strong>Account Created:</strong>
              </p>
              <p style={{ margin: 0, fontSize: 14, color: '#333' }}>
                {profile.created_at
                  ? new Date(profile.created_at).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: 14 }}>
                <strong>Last Updated:</strong>
              </p>
              <p style={{ margin: 0, fontSize: 14, color: '#333' }}>
                {profile.updated_at
                  ? new Date(profile.updated_at).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
