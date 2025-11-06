import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminMembershipsManager from '../components/AdminMembershipsManager';
import '../styles.css';

export default function AdminMembershipsPage() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = React.useState<string | null>(null);

  // Check user role and permissions
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserRole(userData.role);

      // Verify user is admin
      if (userData.role !== 'admin') {
        navigate('/');
        return;
      }
    }
  }, [navigate]);

  if (userRole !== 'admin') {
    return (
      <div className="app">
        <header className="header">
          <div className="logo">🔐</div>
          <div>
            <div className="title">Access Denied</div>
            <div className="muted">
              You do not have permission to view this page
            </div>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">💳</div>
        <div>
          <div className="title">Membership Plans Management</div>
          <div className="muted">
            Create and manage membership plans for your studio
          </div>
        </div>
      </header>

      <div style={{ marginTop: 20 }}>
        {/* Navigation */}
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => navigate('/dashboard/admin')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f5f5f5',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 'bold',
            }}
          >
            ← Back to Admin Dashboard
          </button>
        </div>

        {/* Memberships Manager Component */}
        <AdminMembershipsManager />

        {/* Info Card */}
        <div
          className="card"
          style={{
            marginTop: 24,
            backgroundColor: '#E3F2FD',
            borderLeft: '4px solid #2196F3',
          }}
        >
          <h3 style={{ marginTop: 0, color: '#1565C0' }}>
            💡 Membership Plans Info
          </h3>
          <p style={{ color: '#1565C0', marginBottom: 8 }}>
            Membership plans are packages that users can purchase to gain access
            to studio facilities and services. Each plan can have different
            features, pricing, and duration.
          </p>
          <ul style={{ color: '#1565C0', marginBottom: 0 }}>
            <li>Create new membership plans with custom pricing</li>
            <li>Define plan features and benefits</li>
            <li>Set plan duration (monthly, yearly, etc.)</li>
            <li>View and edit existing membership plans</li>
            <li>Track membership usage and revenue</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
