import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css';
import toast from 'react-hot-toast';

interface UserProfile {
  user_id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  loyalty_points: number;
  created_at: string;
}

export default function UserProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:3000/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch profile');

        const data = await response.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="app">
        <div className="card">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="card" style={{ color: 'red' }}>
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="app">
        <div className="card">
          <p>No profile data available</p>
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
          <div className="muted">
            View your account information and loyalty points
          </div>
        </div>
      </header>

      <div style={{ marginTop: 20 }}>
        {/* Profile Card */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3>Account Information</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 20,
              marginTop: 16,
            }}
          >
            <div>
              <label
                style={{ fontSize: 12, color: '#666', fontWeight: 'bold' }}
              >
                Username
              </label>
              <div style={{ fontSize: 16, marginTop: 4 }}>
                {profile.username}
              </div>
            </div>
            <div>
              <label
                style={{ fontSize: 12, color: '#666', fontWeight: 'bold' }}
              >
                Email
              </label>
              <div style={{ fontSize: 16, marginTop: 4 }}>{profile.email}</div>
            </div>
            <div>
              <label
                style={{ fontSize: 12, color: '#666', fontWeight: 'bold' }}
              >
                Role
              </label>
              <div
                style={{
                  fontSize: 16,
                  marginTop: 4,
                  textTransform: 'capitalize',
                }}
              >
                {profile.role}
              </div>
            </div>
            <div>
              <label
                style={{ fontSize: 12, color: '#666', fontWeight: 'bold' }}
              >
                Status
              </label>
              <div
                style={{
                  fontSize: 16,
                  marginTop: 4,
                  textTransform: 'capitalize',
                  color: profile.status === 'active' ? '#4CAF50' : '#F44336',
                }}
              >
                {profile.status}
              </div>
            </div>
            <div>
              <label
                style={{ fontSize: 12, color: '#666', fontWeight: 'bold' }}
              >
                Member Since
              </label>
              <div style={{ fontSize: 16, marginTop: 4 }}>
                {new Date(profile.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Loyalty Points Card */}
        <div
          className="card"
          style={{
            marginBottom: 20,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <h3 style={{ color: 'white', margin: 0 }}>🏆 Loyalty Points</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 20,
              marginTop: 20,
            }}
          >
            <div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>Current Balance</div>
              <div style={{ fontSize: 48, fontWeight: 'bold', marginTop: 8 }}>
                {profile.loyalty_points}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>
                How to Earn Points
              </div>
              <ul
                style={{
                  fontSize: 12,
                  marginTop: 8,
                  paddingLeft: 16,
                  marginBottom: 0,
                }}
              >
                <li>✅ 5 points for registration</li>
                <li>✅ 10 points per completed session</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="card">
          <h3>💡 About Loyalty Points</h3>
          <p style={{ lineHeight: 1.6, color: '#666' }}>
            Loyalty points are rewards for your engagement with Atara Fitness.
            You earn points when you:
          </p>
          <ul style={{ color: '#666', lineHeight: 1.8 }}>
            <li>
              <strong>Register an account:</strong> Earn 5 points instantly when
              you sign up
            </li>
            <li>
              <strong>Complete sessions:</strong> Earn 10 points for each
              completed training session
            </li>
          </ul>
          <p style={{ color: '#999', fontSize: 13 }}>
            Keep accumulating points to unlock exclusive rewards and benefits!
            🎉
          </p>
        </div>
      </div>
    </div>
  );
}
