import React, { useEffect, useState } from 'react';
import { getCurrentUserFromToken, getJson } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function TrainerBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = getCurrentUserFromToken();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getJson('/dashboard/trainer');
      setBookings(data.bookings || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingSpinner
        message="Loading student bookings"
        subtitle="Fetching your session bookings..."
        fullPage={true}
      />
    );
  }

  if (error) {
    return (
      <div className="app">
        <header className="header">
          <div className="logo">📋</div>
          <div>
            <div className="title">Bookings</div>
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
            ⚠️ Error Loading Bookings
          </h3>
          <p style={{ color: '#d32f2f' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">📋</div>
        <div>
          <div className="title">Student Bookings</div>
          <div className="muted">View bookings from your students</div>
        </div>
      </header>

      <div style={{ marginTop: 20 }}>
        {bookings.length === 0 ? (
          <div className="card">
            <p
              style={{
                color: '#999',
                textAlign: 'center',
                padding: '40px 20px',
              }}
            >
              📭 No bookings yet. Your students will appear here when they book
              your sessions.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {bookings.map((booking) => (
              <div key={booking.booking_id} className="card">
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 16,
                  }}
                >
                  <div>
                    <label
                      style={{
                        color: 'var(--muted)',
                        fontSize: 12,
                        display: 'block',
                        marginBottom: 4,
                      }}
                    >
                      Student
                    </label>
                    <div style={{ fontSize: 16, fontWeight: 'bold' }}>
                      {booking.user?.username || booking.guest_name || 'Guest'}
                    </div>
                    {(booking.user?.email || booking.guest_email) && (
                      <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                        {booking.user?.email || booking.guest_email}
                      </div>
                    )}
                    {booking.guest_phone && (
                      <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                        {booking.guest_phone}
                      </div>
                    )}
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
                      Session
                    </label>
                    <div style={{ fontSize: 16 }}>
                      {booking.timeSlot?.session?.category || 'N/A'}
                    </div>
                    {booking.timeSlot?.session?.description && (
                      <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                        {booking.timeSlot.session.description}
                      </div>
                    )}
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
                      Date & Time
                    </label>
                    <div style={{ fontSize: 16 }}>
                      {booking.timeSlot?.start_time
                        ? new Date(booking.timeSlot.start_time).toLocaleString()
                        : 'N/A'}
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
                      Payment Reference
                    </label>
                    <div style={{ fontSize: 14 }}>
                      {booking.payment_reference ? (
                        <span
                          style={{
                            padding: '2px 6px',
                            backgroundColor: '#e3f2fd',
                            borderRadius: 3,
                            fontSize: 12,
                            fontFamily: 'monospace',
                            color: '#1976d2',
                          }}
                        >
                          {booking.payment_reference}
                        </span>
                      ) : (
                        <span style={{ color: '#999', fontSize: 12 }}>No reference</span>
                      )}
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
                        padding: '4px 12px',
                        backgroundColor:
                          booking.status === 'booked'
                            ? '#4CAF50'
                            : booking.status === 'cancelled'
                              ? '#F44336'
                              : booking.status === 'completed'
                                ? '#2196F3'
                                : '#FF9800',
                        color: 'white',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 'bold',
                      }}
                    >
                      {booking.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
