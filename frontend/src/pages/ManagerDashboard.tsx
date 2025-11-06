import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ManagerUserManagement } from '../components/ManagerUserManagement';
import { ManagerBookings } from '../components/ManagerBookings';
import {
  ManagerSchedules,
  ManagerSessions,
  ManagerTrainers,
} from '../components/ManagerSchedulesSessionsTrainers';
import {
  SystemAnalysisChart,
  UserIntakeChart,
  MonthlyAnalysisCard,
  generateSampleChartData,
} from '../components/AnalyticsCharts';
import '../styles.css';

type DashboardTab =
  | 'overview'
  | 'users'
  | 'bookings'
  | 'schedules'
  | 'sessions'
  | 'trainers'
  | 'analytics';

interface DashboardStats {
  users: { total: number; active: number };
  trainers: { total: number; active: number };
  bookings: { total: number; confirmed: number };
  sessions: { total: number; active: number };
  schedules: { total: number };
}

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(
    null,
  );
  const [analyticsData, setAnalyticsData] = useState<{
    trendData: any[];
    intakeData: any[];
    monthlyAnalysis: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check user role and permissions
  // Check user role and permissions
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);

      // Verify user is manager or admin
      if (userData.role !== 'manager' && userData.role !== 'admin') {
        navigate('/');
        return;
      }
    }
  }, [navigate]);
  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const res = await fetch(`http://localhost:3000/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        if (!res.ok) throw new Error('Failed to fetch dashboard');
        const data = await res.json();
        setDashboardData(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found for analytics');
          return;
        }

        console.log(
          'Fetching analytics from:',
          `http://localhost:3000/admin/analytics`,
        );
        const res = await fetch(`http://localhost:3000/admin/analytics`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        console.log('Analytics response status:', res.status);

        if (res.ok) {
          const data = await res.json();
          console.log('Analytics data received:', data);
          setAnalyticsData(data);
        } else {
          const errorText = await res.text();
          console.error('Analytics fetch failed:', res.status, errorText);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="app">
        <header className="header">
          <div className="logo">📊</div>
          <div>
            <div className="title">Manager Dashboard</div>
            <div className="muted">Loading...</div>
          </div>
        </header>
      </div>
    );
  }

  const { users, trainers, bookings, sessions, schedules } = dashboardData ?? {
    users: { total: 0, active: 0 },
    trainers: { total: 0, active: 0 },
    bookings: { total: 0, confirmed: 0 },
    sessions: { total: 0, active: 0 },
    schedules: { total: 0 },
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">📊</div>
        <div>
          <div className="title">Manager Dashboard</div>
          <div className="muted">
            Manage users, bookings, schedules, and view analytics
          </div>
        </div>
      </header>

      <div style={{ marginTop: 20 }}>
        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 24,
            flexWrap: 'wrap',
            borderBottom: '2px solid #eee',
            paddingBottom: 12,
          }}
        >
          {[
            { id: 'overview', label: '📋 Overview', icon: '📋' },
            { id: 'users', label: '👥 Users', icon: '👥' },
            { id: 'bookings', label: '📅 Bookings', icon: '📅' },
            { id: 'schedules', label: '⏰ Schedules', icon: '⏰' },
            { id: 'sessions', label: '🎯 Sessions', icon: '🎯' },
            { id: 'trainers', label: '⚡ Trainers', icon: '⚡' },
            { id: 'analytics', label: '📊 Analytics', icon: '📊' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DashboardTab)}
              style={{
                padding: '10px 16px',
                border: 'none',
                borderBottom:
                  activeTab === tab.id ? '3px solid #2196F3' : 'none',
                backgroundColor:
                  activeTab === tab.id ? '#E3F2FD' : 'transparent',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                color: activeTab === tab.id ? '#1565C0' : '#666',
                borderRadius: '4px 4px 0 0',
                transition: 'all 0.3s ease',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#FFEBEE',
              color: '#C62828',
              padding: 16,
              borderRadius: 4,
              marginBottom: 20,
            }}
          >
            ⚠️ Error: {error}
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Summary Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
                marginBottom: 24,
              }}
            >
              <div className="card">
                <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                  Total Users
                </div>
                <div
                  style={{ fontSize: 32, fontWeight: 'bold', color: '#2196F3' }}
                >
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
                <div
                  style={{ fontSize: 32, fontWeight: 'bold', color: '#4CAF50' }}
                >
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
                <div
                  style={{ fontSize: 32, fontWeight: 'bold', color: '#FF9800' }}
                >
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
                <div
                  style={{ fontSize: 32, fontWeight: 'bold', color: '#9C27B0' }}
                >
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
                <div
                  style={{ fontSize: 32, fontWeight: 'bold', color: '#E91E63' }}
                >
                  {schedules.total || 0}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16 }}>🚀 Quick Actions</h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: 12,
                }}
              >
                <button
                  onClick={() => setActiveTab('users')}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 'bold',
                  }}
                >
                  👥 Manage Users
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
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
                  📅 View Bookings
                </button>
                <button
                  onClick={() => setActiveTab('schedules')}
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
                  ⏰ View Schedules
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
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
                  📊 View Analytics
                </button>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="card">
              <h3>👋 Welcome to Manager Dashboard</h3>
              <p style={{ color: '#666', lineHeight: 1.6, marginBottom: 0 }}>
                This dashboard provides comprehensive management tools for your
                fitness studio. Use the tabs above to navigate between different
                sections:
              </p>
              <ul style={{ color: '#666', marginTop: 12, marginBottom: 0 }}>
                <li>
                  <strong>Overview:</strong> Quick stats and summary
                </li>
                <li>
                  <strong>Users:</strong> Manage user accounts and view loyalty
                  points
                </li>
                <li>
                  <strong>Bookings:</strong> Track and manage all session
                  bookings
                </li>
                <li>
                  <strong>Schedules:</strong> View training schedules
                </li>
                <li>
                  <strong>Sessions:</strong> Monitor all sessions
                </li>
                <li>
                  <strong>Trainers:</strong> View trainer information
                </li>
                <li>
                  <strong>Analytics:</strong> View trends and monthly analysis
                </li>
              </ul>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <ManagerUserManagement onClose={() => setActiveTab('overview')} />
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && <ManagerBookings />}

        {/* Schedules Tab */}
        {activeTab === 'schedules' && <ManagerSchedules />}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && <ManagerSessions />}

        {/* Trainers Tab */}
        {activeTab === 'trainers' && <ManagerTrainers />}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <>
            {analyticsData ? (
              <>
                <MonthlyAnalysisCard data={analyticsData.monthlyAnalysis} />
                <SystemAnalysisChart data={analyticsData.trendData} />
                <UserIntakeChart data={analyticsData.intakeData} />
              </>
            ) : (
              <div className="card">
                <p>Loading analytics data...</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
