import React, { useEffect, useState } from 'react';
import { getCurrentUserFromToken, getJson } from '../api';

export default function TrainerDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = getCurrentUserFromToken();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await getJson('/dashboard/trainer');
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
    trainer,
    sessions,
    upcomingSchedules,
    bookings,
    cancellations,
    stats,
  } = dashboardData;

  return (
    <div className="app">
      <header className="header">
        <div className="logo">🏋️</div>
        <div>
          <div className="title">Trainer Dashboard</div>
          <div className="muted">Manage your sessions and bookings</div>
        </div>
      </header>

      <div style={{ marginTop: 20 }}>
        {/* Statistics Cards */}
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
              Total Sessions
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold' }}>
              {stats.totalSessions}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
              Total Bookings
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#2196F3' }}>
              {stats.totalBookings}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
              Upcoming Sessions
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#4CAF50' }}>
              {stats.upcomingCount}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
              Cancellations
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#F44336' }}>
              {stats.cancelledBookings}
            </div>
          </div>
        </div>

        {/* Trainer Info */}
        <div className="card">
          <h3>Profile Information</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <span style={{ color: '#666' }}>Name:</span>
              <span style={{ marginLeft: 12, fontWeight: 'bold' }}>
                {trainer?.name || 'N/A'}
              </span>
            </div>
            <div>
              <span style={{ color: '#666' }}>Specialty:</span>
              <span style={{ marginLeft: 12, fontWeight: 'bold' }}>
                {trainer?.specialty || 'N/A'}
              </span>
            </div>
            <div>
              <span style={{ color: '#666' }}>Email:</span>
              <span style={{ marginLeft: 12, fontWeight: 'bold' }}>
                {trainer?.email || 'N/A'}
              </span>
            </div>
            <div>
              <span style={{ color: '#666' }}>Phone:</span>
              <span style={{ marginLeft: 12, fontWeight: 'bold' }}>
                {trainer?.phone || 'N/A'}
              </span>
            </div>
            <div>
              <span style={{ color: '#666' }}>Status:</span>
              <span
                style={{
                  marginLeft: 12,
                  padding: '4px 8px',
                  backgroundColor:
                    trainer?.status === 'active' ? '#4CAF50' : '#F44336',
                  color: 'white',
                  borderRadius: 2,
                  fontWeight: 'bold',
                }}
              >
                {trainer?.status}
              </span>
            </div>
          </div>
        </div>

        {/* Upcoming Schedules */}
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Upcoming Sessions ({upcomingSchedules.length})</h3>
          {upcomingSchedules.length === 0 ? (
            <p style={{ color: '#999' }}>No upcoming sessions</p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {upcomingSchedules.map((schedule: any) => (
                <div
                  key={schedule.schedule_id}
                  style={{
                    padding: 12,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 4,
                    borderLeft: '4px solid #2196F3',
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                    {schedule.session?.title || 'Session'}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    Date:{' '}
                    {schedule.date
                      ? new Date(schedule.date).toLocaleDateString()
                      : 'N/A'}{' '}
                    at {schedule.start_time || 'N/A'}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    Category: {schedule.session?.category || 'N/A'}
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    Duration: {schedule.session?.duration_minutes || 'N/A'} min
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Recent Bookings ({bookings.length})</h3>
          {bookings.length === 0 ? (
            <p style={{ color: '#999' }}>No bookings yet</p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {bookings.slice(0, 10).map((booking: any) => (
                <div
                  key={booking.booking_id}
                  style={{
                    padding: 12,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 4,
                    borderLeft:
                      booking.status === 'booked'
                        ? '4px solid #4CAF50'
                        : '4px solid #F44336',
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                    {booking.user?.username || booking.guest_name || 'Guest'}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    Session: {booking.schedule?.session?.title || 'N/A'}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    Date:{' '}
                    {booking.schedule?.date
                      ? new Date(booking.schedule.date).toLocaleDateString()
                      : 'N/A'}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      padding: '4px 8px',
                      backgroundColor:
                        booking.status === 'booked'
                          ? '#4CAF50'
                          : booking.status === 'cancelled'
                            ? '#F44336'
                            : '#FF9800',
                      color: 'white',
                      borderRadius: 2,
                      display: 'inline-block',
                    }}
                  >
                    {booking.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cancellation Requests */}
        {cancellations.length > 0 && (
          <div className="card" style={{ marginTop: 16 }}>
            <h3>Cancellation Requests ({cancellations.length})</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              {cancellations.map((cr: any) => (
                <div
                  key={cr.id}
                  style={{
                    padding: 12,
                    backgroundColor: '#fff3cd',
                    borderRadius: 4,
                    borderLeft: '4px solid #FF9800',
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                    Booking #{cr.booking_id}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    Message: {cr.message || 'N/A'}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      padding: '4px 8px',
                      backgroundColor:
                        cr.status === 'pending' ? '#FF9800' : '#4CAF50',
                      color: 'white',
                      borderRadius: 2,
                      display: 'inline-block',
                    }}
                  >
                    {cr.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
