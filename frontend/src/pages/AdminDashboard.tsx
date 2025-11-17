import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserManagement from '../components/UserManagement';
import AdminMembershipsManager from '../components/AdminMembershipsManager';
import { Settings, Users, Zap, ClipboardList, Calendar, CreditCard, Lightbulb, BarChart3, Lock } from 'lucide-react';

const BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? 'https://atara-dajy.onrender.com';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMemberships, setShowMemberships] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const res = await fetch(`${BASE}/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        if (!res.ok) throw new Error('Failed to fetch dashboard');
        const data = await res.json();
        setDashboardData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="card">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ color: 'red' }}>
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="card">
        <p>No data available</p>
      </div>
    );
  }

  const {
    users = {},
    trainers = {},
    bookings = {},
    sessions = {},
    schedules = {},
  } = dashboardData;

  return (
    <div className="app">
      <header className="header">
        <div className="logo"><Settings size={24} /></div>
        <div>
          <div className="title">Admin Dashboard</div>
          <div className="muted">Full system administration and overview</div>
        </div>
      </header>

      <div style={{ marginTop: 20 }}>
        {/* Quick Action Buttons */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12,
            marginBottom: 24,
          }}
        >
          <button
            onClick={() => navigate('/admin/users')}
            style={{
              padding: '12px 16px',
              backgroundColor: '#1976D2',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 'bold',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={16} />
              Manage Users
            </div>
          </button>
          <button
            onClick={() => navigate('/admin/trainers')}
            style={{
              padding: '12px 16px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 'bold',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={16} />
              Register Trainer
            </div>
          </button>
          <button
            onClick={() => navigate('/admin/bookings')}
            style={{
              padding: '12px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 'bold',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ClipboardList size={16} />
              View Bookings
            </div>
          </button>
          <button
            onClick={() => navigate('/admin/sessions')}
            style={{
              padding: '12px 16px',
              backgroundColor: '#9C27B0',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 'bold',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={16} />
              Manage Sessions
            </div>
          </button>
          <button
            onClick={() => navigate('/admin/memberships')}
            style={{
              padding: '12px 16px',
              backgroundColor: '#E91E63',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 'bold',
            }}
            title={
              userRole === 'admin' ? 'Manage membership plans' : 'Admin only'
            }
            disabled={userRole !== 'admin'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CreditCard size={16} />
              Memberships
            </div>
          </button>
        </div>

        {/* Summary Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div className="card">
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
              Total Users
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold' }}>
              {users.total || 0}
            </div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              Active: {users.active || 0}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
              Total Bookings
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#2196F3' }}>
              {bookings.total || 0}
            </div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              Confirmed: {bookings.confirmed || 0}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
              Total Sessions
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#4CAF50' }}>
              {sessions.total || 0}
            </div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              Active: {sessions.active || 0}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
              Total Trainers
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#FF9800' }}>
              {trainers.total || 0}
            </div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              Active: {trainers.active || 0}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
              Total Schedules
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#9C27B0' }}>
              {schedules.total || 0}
            </div>
          </div>
        </div>

        {/* Users by Role - Now just showing totals */}
        <div className="card" style={{ marginTop: 16 }}>
          <h3>System Overview</h3>
          <p style={{ color: '#666', fontSize: 13 }}>
            This dashboard provides a quick overview of your system. Use the
            quick action buttons above to manage specific resources.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 16,
              marginTop: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                Active Users
              </div>
              <div
                style={{ fontSize: 28, fontWeight: 'bold', color: '#2196F3' }}
              >
                {users.active || 0}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                Active Trainers
              </div>
              <div
                style={{ fontSize: 28, fontWeight: 'bold', color: '#FF9800' }}
              >
                {trainers.active || 0}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                Confirmed Bookings
              </div>
              <div
                style={{ fontSize: 28, fontWeight: 'bold', color: '#4CAF50' }}
              >
                {bookings.confirmed || 0}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                Active Sessions
              </div>
              <div
                style={{ fontSize: 28, fontWeight: 'bold', color: '#9C27B0' }}
              >
                {sessions.active || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="card" style={{ marginTop: 16 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lightbulb size={20} />
            Quick Tips
          </h3>
          <ul style={{ marginTop: 12, marginBottom: 0 }}>
            <li>
              Use the quick action buttons above to navigate to specific admin
              functions
            </li>
            <li>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <BarChart3 size={16} style={{ marginTop: 2 }} />
                <span><strong>Manage Users:</strong> View, search, and update user</span>
              </div>
              roles and status
            </li>
            <li>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <Zap size={16} style={{ marginTop: 2 }} />
                <span><strong>Register Trainer:</strong> Create new trainer accounts</span>
              </div>
              and profiles
            </li>
            <li>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <ClipboardList size={16} style={{ marginTop: 2 }} />
                <span><strong>View Bookings:</strong> Oversee all session bookings</span>
              </div>
              and their status
            </li>
            <li>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <Calendar size={16} style={{ marginTop: 2 }} />
                <span><strong>Manage Sessions:</strong> View and manage all sessions</span>
              </div>
              and schedules
            </li>
            <li>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <CreditCard size={16} style={{ marginTop: 2 }} />
                <span><strong>Memberships:</strong> Create and manage membership</span>
              </div>
              plans
            </li>
          </ul>
        </div>

        {/* Memberships Manager - Admin Only */}
        {userRole === 'admin' && showMemberships && (
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                padding: 12,
                backgroundColor: '#E3F2FD',
                borderLeft: '4px solid #2196F3',
                marginBottom: 16,
                borderRadius: 4,
              }}
            >
              <strong style={{ color: '#1565C0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock size={16} />
                  Admin Only Section
                </div>
              </strong>
              <p
                style={{ color: '#1565C0', fontSize: 12, margin: '4px 0 0 0' }}
              >
                You are viewing the membership management interface. Only
                administrators can create and modify membership plans.
              </p>
            </div>
            <AdminMembershipsManager />
          </div>
        )}

        {/* Non-admin users trying to access */}
        {userRole !== 'admin' && showMemberships && (
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                padding: 16,
                backgroundColor: '#FFF3E0',
                border: '1px solid #FF9800',
                borderRadius: 4,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>
                <Lock size={24} />
              </div>
              <div
                style={{ fontSize: 14, fontWeight: 'bold', color: '#E65100' }}
              >
                Access Denied
              </div>
              <p
                style={{ color: '#BF360C', fontSize: 12, margin: '8px 0 0 0' }}
              >
                Membership management is restricted to administrators only.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
