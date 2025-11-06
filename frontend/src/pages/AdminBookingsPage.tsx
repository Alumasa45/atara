import React, { useEffect, useState } from 'react';
import { getJson } from '../api';
import toast from 'react-hot-toast';
import '../styles.css';

interface Booking {
  booking_id: number;
  user_id: number;
  schedule_id: number;
  status: 'booked' | 'cancelled' | 'missed' | 'completed';
  created_at: string;
  user?: {
    username: string;
    email: string;
  };
  schedule?: {
    schedule_id: number;
    start_time: string;
    end_time: string;
    session?: {
      session_id: number;
      title: string;
      trainer?: {
        trainer_id: number;
        name: string;
      };
    };
  };
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all'); // all, today, week, month
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (searchQuery) query.append('search', searchQuery);
      if (statusFilter !== 'all') query.append('filter', statusFilter);
      query.append('page', '1');
      query.append('limit', '50');

      const data = await getJson(`/admin/bookings?${query.toString()}`);
      setBookings(data?.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchBookings, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    let filtered = [...bookings];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    // Apply date filter
    const now = new Date();
    if (dateFilter !== 'all') {
      filtered = filtered.filter((b) => {
        const bookingDate = new Date(b.schedule?.start_time || b.created_at);
        switch (dateFilter) {
          case 'today':
            return bookingDate.toDateString() === now.toDateString();
          case 'week':
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            return bookingDate >= weekStart && bookingDate <= weekEnd;
          case 'month':
            return (
              bookingDate.getMonth() === now.getMonth() &&
              bookingDate.getFullYear() === now.getFullYear()
            );
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (b) =>
          b.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.schedule?.session?.title
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          b.schedule?.session?.trainer?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, searchQuery, statusFilter, dateFilter]);

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    try {
      setUpdatingId(bookingId);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3000/admin/bookings/${bookingId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      const message =
        newStatus === 'completed'
          ? '✅ Session marked as completed! User awarded 10 loyalty points.'
          : `✅ Booking status changed to ${newStatus}`;

      toast.success(message);
      await fetchBookings();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update booking');
      console.error('Error updating booking:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked':
        return '#4CAF50';
      case 'completed':
        return '#2196F3';
      case 'cancelled':
        return '#F44336';
      case 'missed':
        return '#FF9800';
      default:
        return '#666';
    }
  };

  const stats = {
    total: bookings.length,
    booked: bookings.filter((b) => b.status === 'booked').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    missed: bookings.filter((b) => b.status === 'missed').length,
  };

  if (loading) {
    return (
      <div className="card">
        <p>Loading bookings...</p>
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

  return (
    <div className="app">
      <header className="header">
        <div className="logo">📋</div>
        <div>
          <div className="title">Bookings Management</div>
          <div className="muted">View and manage all bookings</div>
        </div>
      </header>

      <div style={{ marginTop: 20 }}>
        {/* Summary Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div className="card">
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
              Total Bookings
            </div>
            <div style={{ fontSize: 28, fontWeight: 'bold' }}>
              {stats.total}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
              Confirmed
            </div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#4CAF50' }}>
              {stats.booked}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
              Completed
            </div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#2196F3' }}>
              {stats.completed}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
              Missed
            </div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#FF9800' }}>
              {stats.missed}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
              Cancelled
            </div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#F44336' }}>
              {stats.cancelled}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3>Filters</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
            }}
          >
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>
                Search
              </label>
              <input
                type="text"
                placeholder="Search by client, session, or trainer"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Statuses</option>
                <option value="booked">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="missed">Missed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>
                Date Range
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="card">
          <h3>Bookings ({filteredBookings.length})</h3>
          <div style={{ marginTop: 16, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '2px solid #e0e0e0',
                    backgroundColor: '#f5f5f5',
                  }}
                >
                  <th style={{ padding: '12px', textAlign: 'left' }}>
                    Booking ID
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Client</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>
                    Session
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>
                    Trainer
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Time</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>
                    Booked On
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking.booking_id}
                    style={{ borderBottom: '1px solid #e0e0e0' }}
                  >
                    <td style={{ padding: '12px', fontSize: 12 }}>
                      #{booking.booking_id}
                    </td>
                    <td style={{ padding: '12px', fontSize: 12 }}>
                      {booking.user?.username || 'Guest'}
                    </td>
                    <td style={{ padding: '12px', fontSize: 12 }}>
                      {booking.schedule?.session?.title || 'N/A'}
                    </td>
                    <td style={{ padding: '12px', fontSize: 12 }}>
                      {booking.schedule?.session?.trainer?.name || 'N/A'}
                    </td>
                    <td style={{ padding: '12px', fontSize: 12 }}>
                      {booking.schedule?.start_time
                        ? new Date(
                            booking.schedule.start_time,
                          ).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td style={{ padding: '12px', fontSize: 12 }}>
                      {booking.schedule?.start_time
                        ? new Date(
                            booking.schedule.start_time,
                          ).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'N/A'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          backgroundColor: getStatusColor(booking.status),
                          color: 'white',
                          fontSize: 11,
                          textTransform: 'uppercase',
                        }}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: 11 }}>
                      {new Date(booking.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {booking.status === 'booked' && (
                        <div
                          style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}
                        >
                          <button
                            onClick={() =>
                              handleStatusChange(
                                booking.booking_id,
                                'completed',
                              )
                            }
                            disabled={updatingId === booking.booking_id}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#2196F3',
                              color: 'white',
                              border: 'none',
                              borderRadius: 3,
                              fontSize: 11,
                              cursor: 'pointer',
                              opacity:
                                updatingId === booking.booking_id ? 0.6 : 1,
                            }}
                          >
                            ✅ Complete
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(booking.booking_id, 'missed')
                            }
                            disabled={updatingId === booking.booking_id}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#FF9800',
                              color: 'white',
                              border: 'none',
                              borderRadius: 3,
                              fontSize: 11,
                              cursor: 'pointer',
                              opacity:
                                updatingId === booking.booking_id ? 0.6 : 1,
                            }}
                          >
                            ⏭️ Missed
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(
                                booking.booking_id,
                                'cancelled',
                              )
                            }
                            disabled={updatingId === booking.booking_id}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#F44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: 3,
                              fontSize: 11,
                              cursor: 'pointer',
                              opacity:
                                updatingId === booking.booking_id ? 0.6 : 1,
                            }}
                          >
                            ❌ Cancel
                          </button>
                        </div>
                      )}
                      {booking.status !== 'booked' && (
                        <span style={{ fontSize: 11, color: '#999' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredBookings.length === 0 && (
              <p
                style={{ padding: '20px', textAlign: 'center', color: '#999' }}
              >
                No bookings found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
