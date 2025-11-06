import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUserFromToken } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import MembershipCard from '../components/MembershipCard';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = getCurrentUserFromToken();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        console.log('Token found:', token.substring(0, 20) + '...');

        const res = await fetch(`http://localhost:3000/dashboard/client`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        console.log('Dashboard response status:', res.status);

        if (!res.ok) {
          const errorData = await res.text();
          console.error('Dashboard error response:', errorData);
          throw new Error(`Failed to fetch dashboard: ${res.status}`);
        }

        const data = await res.json();
        setDashboardData(data);
      } catch (err: any) {
        console.error('Dashboard fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <LoadingSpinner
        message="Loading your dashboard"
        subtitle="Fetching your bookings and statistics..."
        fullPage={true}
      />
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

  const { profile, upcomingBookings, pastBookings, upcomingSchedules, stats } =
    dashboardData;

  return (
    <div className="app">
      <header className="header">
        <div className="logo">👤</div>
        <div>
          <div className="title">My Dashboard</div>
          <div className="muted">Your bookings and activity</div>
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
              Total Bookings
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold' }}>
              {stats.totalBookings}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
              Confirmed
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#4CAF50' }}>
              {stats.confirmedBookings}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
              Pending
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#FF9800' }}>
              {stats.pendingBookings}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
              Cancelled
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#F44336' }}>
              {stats.cancelledBookings}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="card">
          <h3>Profile Information</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <span style={{ color: '#666' }}>Username:</span>
              <span style={{ marginLeft: 12, fontWeight: 'bold' }}>
                {currentUser?.username || 'N/A'}
              </span>
            </div>
            <div>
              <span style={{ color: '#666' }}>Email:</span>
              <span style={{ marginLeft: 12, fontWeight: 'bold' }}>
                {currentUser?.email || 'N/A'}
              </span>
            </div>
            <div>
              <span style={{ color: '#666' }}>Member Since:</span>
              <span style={{ marginLeft: 12, fontWeight: 'bold' }}>
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Upcoming Schedules (All Available) */}
        <div className="card" style={{ marginTop: 16 }}>
          <h3>
            📅 All Upcoming Sessions (
            {upcomingSchedules?.reduce(
              (total: number, s: any) => total + (s.timeSlots?.length || 0),
              0,
            ) || 0}
            )
          </h3>
          {!upcomingSchedules || upcomingSchedules.length === 0 ? (
            <p style={{ color: '#999' }}>No upcoming sessions available</p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {upcomingSchedules.map((schedule: any) => (
                <div key={schedule.schedule_id}>
                  {schedule.timeSlots && schedule.timeSlots.length > 0 ? (
                    schedule.timeSlots.map((timeSlot: any) => (
                      <div
                        key={`${schedule.schedule_id}-${timeSlot.slot_id}`}
                        style={{
                          padding: 12,
                          backgroundColor: '#fff3e0',
                          borderRadius: 4,
                          borderLeft: '4px solid #FF9800',
                          marginBottom: 8,
                        }}
                      >
                        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                          {timeSlot.session?.title || 'Session'}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: '#666',
                            marginBottom: 4,
                          }}
                        >
                          Category: {timeSlot.session?.category || 'N/A'}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: '#666',
                            marginBottom: 4,
                          }}
                        >
                          Duration:{' '}
                          {timeSlot.session?.duration_minutes || 'N/A'} minutes
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: '#666',
                            marginBottom: 4,
                          }}
                        >
                          Trainer: {timeSlot.session?.trainer?.name || 'N/A'}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: '#666',
                            marginBottom: 4,
                          }}
                        >
                          Date:{' '}
                          {schedule.date
                            ? new Date(schedule.date).toLocaleDateString()
                            : 'N/A'}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: '#666',
                            marginBottom: 8,
                          }}
                        >
                          Time:{' '}
                          {timeSlot.start_time
                            ? timeSlot.start_time.substring(0, 5)
                            : 'N/A'}{' '}
                          -{' '}
                          {timeSlot.end_time
                            ? timeSlot.end_time.substring(0, 5)
                            : 'N/A'}
                        </div>
                        <button
                          className="button"
                          onClick={() => {
                            navigate(`/time-slot/${timeSlot.slot_id}/book`);
                          }}
                          style={{
                            fontSize: 12,
                            padding: '6px 12px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                          }}
                        >
                          Book Now
                        </button>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#999', fontSize: 12 }}>
                      No time slots available for this schedule
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Membership Plans */}
        <MembershipCard />

        {/* Upcoming Bookings */}
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Upcoming Sessions ({upcomingBookings.length})</h3>
          {upcomingBookings.length === 0 ? (
            <p style={{ color: '#999' }}>No upcoming bookings</p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {upcomingBookings.map((booking: any) => (
                <div
                  key={booking.booking_id}
                  style={{
                    padding: 12,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 4,
                    borderLeft: '4px solid #2196F3',
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                    {booking.schedule?.session?.title || 'Session'}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    Trainer: {booking.schedule?.session?.trainer?.name || 'N/A'}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    Date:{' '}
                    {booking.schedule?.start_time
                      ? new Date(
                          booking.schedule.start_time,
                        ).toLocaleDateString()
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

        {/* Past Bookings */}
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Past Sessions ({pastBookings.length})</h3>
          {pastBookings.length === 0 ? (
            <p style={{ color: '#999' }}>No past bookings</p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {pastBookings.slice(0, 5).map((booking: any) => (
                <div
                  key={booking.booking_id}
                  style={{
                    padding: 12,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 4,
                    borderLeft: '4px solid #999',
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                    {booking.schedule?.session?.title || 'Session'}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    Trainer: {booking.schedule?.session?.trainer?.name || 'N/A'}
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    Date:{' '}
                    {booking.schedule?.date
                      ? new Date(booking.schedule.date).toLocaleDateString()
                      : 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
