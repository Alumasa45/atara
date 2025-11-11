import React, { useState, useEffect } from 'react';

interface Booking {
  booking_id: number;
  user_id: number;
  session_id: number;
  status: string;
  created_at: string;
  user?: {
    username: string;
    email: string;
  };
  session?: {
    session_id: number;
  };
}

interface BookingsResponse {
  data: Booking[];
  total: number;
  page: number;
  pages: number;
}

export const ManagerBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const fetchBookings = async (page: number = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filterStatus !== 'all' && { filter: filterStatus }),
      });

      const res = await fetch(
        `https://atara-dajy.onrender.com/admin/bookings?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data: BookingsResponse = await res.json();
      setBookings(data.data || []);
      setTotalPages(data.pages || 1);
      setCurrentPage(page);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(1);
  }, [filterStatus]);

  const handleStatusChange = async () => {
    if (!selectedBooking) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const res = await fetch(
        `https://atara-dajy.onrender.com/admin/bookings/${selectedBooking.booking_id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!res.ok) throw new Error('Failed to update booking status');

      await fetchBookings(currentPage);
      setShowStatusModal(false);
      setSelectedBooking(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setShowStatusModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return { bg: '#E3F2FD', text: '#1565C0' };
      case 'completed':
        return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'cancelled':
        return { bg: '#FFEBEE', text: '#C62828' };
      case 'pending':
        return { bg: '#FFF3E0', text: '#E65100' };
      default:
        return { bg: '#F5F5F5', text: '#333' };
    }
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div className="card">
        <div style={{ marginBottom: 16 }}>
          <h3>📋 Bookings Management</h3>
        </div>

        {/* Filter */}
        <div style={{ marginBottom: 20 }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: 13,
            }}
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#FFEBEE',
              color: '#C62828',
              padding: 12,
              borderRadius: 4,
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', color: '#999' }}>
            Loading bookings...
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999' }}>
            No bookings found
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 12,
                }}
              >
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th
                      style={{
                        padding: 12,
                        textAlign: 'left',
                        fontWeight: 'bold',
                      }}
                    >
                      Booking ID
                    </th>
                    <th
                      style={{
                        padding: 12,
                        textAlign: 'left',
                        fontWeight: 'bold',
                      }}
                    >
                      User
                    </th>
                    <th
                      style={{
                        padding: 12,
                        textAlign: 'left',
                        fontWeight: 'bold',
                      }}
                    >
                      Session
                    </th>
                    <th
                      style={{
                        padding: 12,
                        textAlign: 'left',
                        fontWeight: 'bold',
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        padding: 12,
                        textAlign: 'left',
                        fontWeight: 'bold',
                      }}
                    >
                      Date
                    </th>
                    <th
                      style={{
                        padding: 12,
                        textAlign: 'center',
                        fontWeight: 'bold',
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking, index) => {
                    const statusColor = getStatusColor(booking.status);
                    return (
                      <tr
                        key={booking.booking_id}
                        style={{
                          borderBottom: '1px solid #eee',
                          backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9',
                        }}
                      >
                        <td style={{ padding: 12 }}>
                          <strong>#{booking.booking_id}</strong>
                        </td>
                        <td style={{ padding: 12 }}>
                          {booking.user?.username || 'Unknown'}
                        </td>
                        <td style={{ padding: 12 }}>
                          Session #
                          {booking.session?.session_id || booking.session_id}
                        </td>
                        <td style={{ padding: 12 }}>
                          <span
                            style={{
                              backgroundColor: statusColor.bg,
                              color: statusColor.text,
                              padding: '4px 8px',
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 'bold',
                            }}
                          >
                            {booking.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: 12 }}>
                          {new Date(booking.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <button
                            onClick={() => openStatusModal(booking)}
                            style={{
                              backgroundColor: '#2196F3',
                              color: 'white',
                              border: 'none',
                              borderRadius: 4,
                              padding: '6px 12px',
                              cursor: 'pointer',
                              fontSize: 11,
                              fontWeight: 'bold',
                            }}
                          >
                            📝 Change Status
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div
              style={{
                marginTop: 16,
                display: 'flex',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <button
                onClick={() => fetchBookings(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  backgroundColor: currentPage === 1 ? '#f5f5f5' : 'white',
                }}
              >
                ← Previous
              </button>
              <span
                style={{ alignSelf: 'center', color: '#666', fontSize: 12 }}
              >
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => fetchBookings(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  cursor:
                    currentPage === totalPages ? 'not-allowed' : 'pointer',
                  backgroundColor:
                    currentPage === totalPages ? '#f5f5f5' : 'white',
                }}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>

      {/* Status Change Modal */}
      {showStatusModal && selectedBooking && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            className="card"
            style={{
              width: '90%',
              maxWidth: 400,
              padding: 24,
            }}
          >
            <h3 style={{ marginBottom: 16 }}>Change Booking Status</h3>
            <p style={{ color: '#666', marginBottom: 16, fontSize: 13 }}>
              Booking #{selectedBooking.booking_id} -{' '}
              {selectedBooking.user?.username}
            </p>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: 4,
                  fontWeight: 'bold',
                  fontSize: 12,
                }}
              >
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 13,
                }}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleStatusChange}
                disabled={loading}
                style={{
                  flex: 1,
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  padding: '10px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                }}
              >
                {loading ? 'Updating...' : '✓ Update'}
              </button>
              <button
                onClick={() => setShowStatusModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  padding: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
