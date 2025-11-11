import React, { useEffect, useState } from 'react';
import { getCurrentUserFromToken } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function TrainerProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [trainer, setTrainer] = useState<any>(null);
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
  const [uploadingImage, setUploadingImage] = useState(false);

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

      // Fetch user profile
      const res = await fetch(`https://atara-dajy.onrender.com/users/${userId}`, {
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

      const userData = await res.json();
      setProfile(userData);

      // Fetch trainer profile associated with this user
      try {
        const trainerRes = await fetch('https://atara-dajy.onrender.com/trainers', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (trainerRes.ok) {
          const trainersData = await trainerRes.json();
          // Find this trainer in the list
          const myTrainer = trainersData.data?.find(
            (t: any) => t.user_id === userId || t.user?.user_id === userId,
          );
          if (myTrainer) {
            setTrainer(myTrainer);
            setFormData({
              name: myTrainer.name || '',
              specialty: myTrainer.specialty || '',
              phone: myTrainer.phone || '',
              email: myTrainer.email || '',
              bio: myTrainer.bio || '',
            });
          } else {
            // Trainer profile not created yet
            setFormData({
              name: '',
              specialty: '',
              phone: '',
              email: '',
              bio: '',
            });
          }
        }
      } catch (e) {
        console.error('Failed to fetch trainer profile:', e);
        setFormData({
          name: '',
          specialty: '',
          phone: '',
          email: '',
          bio: '',
        });
      }
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
        name: trainer?.name || '',
        specialty: trainer?.specialty || '',
        phone: trainer?.phone || '',
        email: trainer?.email || '',
        bio: trainer?.bio || '',
      });
    }
    setEditMode(!editMode);
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const trainerId = trainer?.trainer_id;

      if (!trainerId) {
        setMessage('Trainer profile not found. Please contact support.');
        setMessageType('error');
        return;
      }

      const res = await fetch(`https://atara-dajy.onrender.com/trainers/${trainerId}`, {
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
      setTrainer(updated);
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
      const res = await fetch('https://atara-dajy.onrender.com/auth/change-password', {
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file');
      setMessageType('error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size must be less than 5MB');
      setMessageType('error');
      return;
    }

    try {
      setUploadingImage(true);
      const token = localStorage.getItem('token');
      const trainerId = trainer?.trainer_id;

      if (!trainerId) {
        setMessage('Trainer profile not found');
        setMessageType('error');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`https://atara-dajy.onrender.com/trainers/${trainerId}/upload-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to upload image');
      }

      const updated = await res.json();
      setTrainer(updated);
      setMessage('Profile picture updated successfully');
      setMessageType('success');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage(err.message);
      setMessageType('error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        'https://atara-dajy.onrender.com/auth/send-verification-email',
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
          <div className="logo">🏋️</div>
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
        <div className="logo">🏋️</div>
        <div>
          <div className="title">My Profile</div>
          <div className="muted">Manage your trainer account</div>
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
        {/* User Account Card */}
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
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
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
                  backgroundColor: '#FF9800',
                  color: 'white',
                  borderRadius: 4,
                  fontSize: 14,
                  fontWeight: 'bold',
                }}
              >
                trainer
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
                    profile?.status === 'active' ? '#4CAF50' : '#F44336',
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
          </div>
        </div>

        {/* Trainer Profile Card */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <h3 style={{ margin: 0 }}>Trainer Information</h3>
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

          {/* Profile Picture Section */}
          <div style={{ marginBottom: 20, textAlign: 'center' }}>
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                overflow: 'hidden',
                border: '3px solid #ddd',
              }}
            >
              {trainer?.profile_image ? (
                <img
                  src={trainer.profile_image}
                  alt="Profile"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <span style={{ fontSize: 48, color: '#999' }}>👤</span>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id="profile-image-upload"
              />
              <label
                htmlFor="profile-image-upload"
                style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  backgroundColor: uploadingImage ? '#ccc' : '#2196F3',
                  color: 'white',
                  borderRadius: 4,
                  cursor: uploadingImage ? 'not-allowed' : 'pointer',
                  fontSize: 12,
                  fontWeight: 'bold',
                }}
              >
                {uploadingImage ? 'Uploading...' : '📷 Upload Photo'}
              </label>
            </div>
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
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Jane Doe"
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
                    Specialty
                  </label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) =>
                      setFormData({ ...formData, specialty: e.target.value })
                    }
                    placeholder="e.g., Yoga, Pilates, Fitness"
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
                    placeholder="e.g., +1234567890"
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
                    placeholder="e.g., trainer@example.com"
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
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder="Tell clients about yourself..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      fontSize: 14,
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
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
                    Full Name
                  </label>
                  <div style={{ fontSize: 16 }}>
                    {trainer?.name || 'Not set'}
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
                    Specialty
                  </label>
                  <div style={{ fontSize: 16 }}>
                    {trainer?.specialty || 'Not set'}
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
                    {trainer?.phone || 'Not set'}
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
                  <div style={{ fontSize: 16 }}>
                    {trainer?.email || 'Not set'}
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
                    Bio
                  </label>
                  <div style={{ fontSize: 16, whiteSpace: 'pre-wrap' }}>
                    {trainer?.bio || 'Not set'}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Settings Card */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3>Settings & Security</h3>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}
          >
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
            <div>
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
      </div>
    </div>
  );
}
