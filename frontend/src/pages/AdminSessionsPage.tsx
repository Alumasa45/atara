import React, { useEffect, useState } from 'react';
import { getJson, postJson } from '../api';
import '../styles.css';

interface Session {
  session_id: number;
  trainer_id: number;
  title: string;
  description: string;
  type: string;
  capacity: number;
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  trainer?: {
    trainer_id: number;
    name: string;
  };
}

interface Schedule {
  schedule_id: number;
  session_id: number;
  start_time: string;
  end_time: string;
  location?: string;
  capacity?: number;
  created_at: string;
  session?: Session;
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sessions' | 'schedules'>(
    'sessions',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form state for creating new session
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    category: 'yoga',
    description: '',
    duration_minutes: 60,
    capacity: 15,
    price: 2000,
    trainer_id: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams();
        if (searchQuery) query.append('search', searchQuery);
        if (statusFilter !== 'all') query.append('filter', statusFilter);
        query.append('page', '1');
        query.append('limit', '50');

        const [sessionsData, schedulesData] = await Promise.all([
          getJson(`/admin/sessions?${query.toString()}`),
          getJson(`/admin/schedules?${query.toString()}`),
        ]);
        setSessions(sessionsData?.data || []);
        setSchedules(schedulesData?.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    let filtered = [...sessions];

    // Status filter is now handled server-side through /admin/sessions endpoint
    setFilteredSessions(filtered);
  }, [sessions, searchQuery, statusFilter]);

  useEffect(() => {
    let filtered = [...schedules];

    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.session?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.session?.trainer?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredSchedules(filtered);
  }, [schedules, searchQuery]);

  // Fetch trainers for form dropdown
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const params = new URLSearchParams({
          page: '1',
          limit: '100',
        });
        const data = await getJson(`/admin/trainers?${params.toString()}`);
        console.log('Sessions page - Trainers response:', data);
        const trainersList = Array.isArray(data) ? data : data?.data || [];
        setTrainers(trainersList);
      } catch (err) {
        console.error('Failed to fetch trainers:', err);
      }
    };
    fetchTrainers();
  }, []);

  // Handle form input changes
  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'trainer_id' ? (value ? Number(value) : '') : value,
    }));
  };

  // Handle form submission
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    try {
      if (!formData.description.trim()) {
        throw new Error('Session description is required');
      }
      if (!formData.category) {
        throw new Error('Category is required');
      }
      if (formData.duration_minutes < 15) {
        throw new Error('Duration must be at least 15 minutes');
      }
      if (formData.capacity < 1) {
        throw new Error('Capacity must be at least 1');
      }
      if (formData.price < 0) {
        throw new Error('Price cannot be negative');
      }

      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const BASE =
        (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:3000';

      const response = await fetch(`${BASE}/sessions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          category: formData.category,
          description: formData.description,
          duration_minutes: Number(formData.duration_minutes),
          capacity: Number(formData.capacity),
          price: Number(formData.price),
          trainer_id: formData.trainer_id
            ? Number(formData.trainer_id)
            : undefined,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.message || `Failed to create session: ${response.status}`,
        );
      }

      const newSession = await response.json();
      setSessions((prev) => [newSession, ...prev]);
      setFilteredSessions((prev) => [newSession, ...prev]);
      setFormSuccess('Session created successfully! ✨');

      // Reset form
      setFormData({
        category: 'yoga',
        description: '',
        duration_minutes: 60,
        capacity: 15,
        price: 2000,
        trainer_id: '',
      });

      setTimeout(() => {
        setShowCreateForm(false);
        setFormSuccess(null);
      }, 2000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'inactive':
        return '#FF9800';
      case 'archived':
        return '#999';
      default:
        return '#666';
    }
  };

  const stats = {
    totalSessions: sessions.length,
    activeSessions: sessions.filter((s) => s.status === 'active').length,
    totalSchedules: schedules.length,
    upcomingSchedules: schedules.filter(
      (s) => new Date(s.start_time) > new Date(),
    ).length,
  };

  if (loading) {
    return (
      <div className="card">
        <p>Loading sessions and schedules...</p>
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
        <div className="logo">📅</div>
        <div>
          <div className="title">Sessions & Schedules Management</div>
          <div className="muted">Manage sessions and their schedules</div>
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
              Total Sessions
            </div>
            <div style={{ fontSize: 28, fontWeight: 'bold' }}>
              {stats.totalSessions}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
              Active Sessions
            </div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#4CAF50' }}>
              {stats.activeSessions}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
              Total Schedules
            </div>
            <div style={{ fontSize: 28, fontWeight: 'bold' }}>
              {stats.totalSchedules}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
              Upcoming Schedules
            </div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#2196F3' }}>
              {stats.upcomingSchedules}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 20,
            borderBottom: '2px solid #e0e0e0',
          }}
        >
          <button
            onClick={() => setActiveTab('sessions')}
            style={{
              padding: '12px 24px',
              backgroundColor:
                activeTab === 'sessions' ? '#1976D2' : 'transparent',
              color: activeTab === 'sessions' ? 'white' : '#666',
              border: 'none',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: activeTab === 'sessions' ? 'bold' : 'normal',
            }}
          >
            Sessions
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            style={{
              padding: '12px 24px',
              backgroundColor:
                activeTab === 'schedules' ? '#1976D2' : 'transparent',
              color: activeTab === 'schedules' ? 'white' : '#666',
              border: 'none',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: activeTab === 'schedules' ? 'bold' : 'normal',
            }}
          >
            Schedules
          </button>
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
                placeholder={
                  activeTab === 'sessions'
                    ? 'Search by title or trainer'
                    : 'Search by session title'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
              />
            </div>
            {activeTab === 'sessions' && (
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div>
            {/* Add New Session Button */}
            <div className="card" style={{ marginBottom: 20 }}>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: showCreateForm ? '#f44336' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 'bold',
                }}
              >
                {showCreateForm ? '✕ Close Form' : '+ Add New Session'}
              </button>
            </div>

            {/* Create Session Form */}
            {showCreateForm && (
              <div
                className="card"
                style={{ marginBottom: 20, backgroundColor: '#f9f9f9' }}
              >
                <h3 style={{ marginTop: 0 }}>📝 Create New Session</h3>

                {formError && (
                  <div
                    style={{
                      padding: 12,
                      backgroundColor: '#ffebee',
                      color: '#c62828',
                      borderRadius: 4,
                      marginBottom: 12,
                      fontSize: 14,
                    }}
                  >
                    ⚠️ {formError}
                  </div>
                )}

                {formSuccess && (
                  <div
                    style={{
                      padding: 12,
                      backgroundColor: '#e8f5e9',
                      color: '#2e7d32',
                      borderRadius: 4,
                      marginBottom: 12,
                      fontSize: 14,
                    }}
                  >
                    ✓ {formSuccess}
                  </div>
                )}

                <form
                  onSubmit={handleCreateSession}
                  style={{ display: 'grid', gap: 15 }}
                >
                  {/* Category */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: 5,
                        fontWeight: 'bold',
                      }}
                    >
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: 4,
                        fontSize: 14,
                      }}
                      required
                    >
                      <option value="yoga">Yoga</option>
                      <option value="pilates">Pilates</option>
                      <option value="strength_training">
                        Strength Training
                      </option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: 5,
                        fontWeight: 'bold',
                      }}
                    >
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      placeholder="e.g., Morning Yoga Flow for beginners"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: 4,
                        fontSize: 14,
                        minHeight: 80,
                        fontFamily: 'inherit',
                      }}
                      required
                    />
                  </div>

                  {/* Duration & Capacity Row */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 15,
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: 5,
                          fontWeight: 'bold',
                        }}
                      >
                        Duration (minutes) *
                      </label>
                      <input
                        type="number"
                        name="duration_minutes"
                        value={formData.duration_minutes}
                        onChange={handleFormChange}
                        min="15"
                        step="15"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          borderRadius: 4,
                          fontSize: 14,
                        }}
                        required
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: 5,
                          fontWeight: 'bold',
                        }}
                      >
                        Capacity *
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleFormChange}
                        min="1"
                        step="1"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          borderRadius: 4,
                          fontSize: 14,
                        }}
                        required
                      />
                    </div>
                  </div>

                  {/* Price & Trainer Row */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 15,
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: 5,
                          fontWeight: 'bold',
                        }}
                      >
                        Price (KES) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleFormChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          borderRadius: 4,
                          fontSize: 14,
                        }}
                        required
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: 5,
                          fontWeight: 'bold',
                        }}
                      >
                        Trainer (Optional)
                      </label>
                      <select
                        name="trainer_id"
                        value={formData.trainer_id}
                        onChange={handleFormChange}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          borderRadius: 4,
                          fontSize: 14,
                        }}
                      >
                        <option value="">Select a trainer...</option>
                        {trainers.map((trainer) => (
                          <option
                            key={trainer.trainer_id}
                            value={trainer.trainer_id}
                          >
                            {trainer.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: isSubmitting ? '#ccc' : '#1976D2',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        fontSize: 14,
                        fontWeight: 'bold',
                      }}
                    >
                      {isSubmitting ? '⏳ Creating...' : '✓ Create Session'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setFormError(null);
                        setFormSuccess(null);
                      }}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#999',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 14,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Sessions Table */}
            <div className="card">
              <h3>Sessions ({filteredSessions.length})</h3>
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
                        Title
                      </th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>
                        Trainer
                      </th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>
                        Type
                      </th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>
                        Capacity
                      </th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>
                        Status
                      </th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>
                        Created
                      </th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.map((session) => (
                      <tr
                        key={session.session_id}
                        style={{ borderBottom: '1px solid #e0e0e0' }}
                      >
                        <td style={{ padding: '12px' }}>{session.title}</td>
                        <td style={{ padding: '12px', fontSize: 12 }}>
                          {session.trainer?.name || 'N/A'}
                        </td>
                        <td style={{ padding: '12px', fontSize: 12 }}>
                          {session.type || 'N/A'}
                        </td>
                        <td style={{ padding: '12px', fontSize: 12 }}>
                          {session.capacity || 'N/A'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span
                            style={{
                              padding: '4px 8px',
                              borderRadius: 4,
                              backgroundColor: getStatusColor(session.status),
                              color: 'white',
                              fontSize: 11,
                              textTransform: 'uppercase',
                            }}
                          >
                            {session.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: 11 }}>
                          {new Date(session.created_at).toLocaleDateString()}
                        </td>
                        <td
                          style={{
                            padding: '12px',
                            fontSize: 11,
                            maxWidth: 200,
                          }}
                        >
                          <span title={session.description}>
                            {session.description?.substring(0, 30)}
                            {session.description &&
                            session.description.length > 30
                              ? '...'
                              : ''}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredSessions.length === 0 && (
                  <p
                    style={{
                      padding: '20px',
                      textAlign: 'center',
                      color: '#999',
                    }}
                  >
                    No sessions found.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Schedules Tab */}
        {activeTab === 'schedules' && (
          <div className="card">
            <h3>Schedules ({filteredSchedules.length})</h3>
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
                      Session
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>
                      Trainer
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>
                      Start Date
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>
                      Start Time
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>
                      End Time
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>
                      Location
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedules.map((schedule) => {
                    const isPast = new Date(schedule.start_time) < new Date();
                    return (
                      <tr
                        key={schedule.schedule_id}
                        style={{
                          borderBottom: '1px solid #e0e0e0',
                          backgroundColor: isPast ? '#f9f9f9' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '12px', fontSize: 12 }}>
                          {schedule.session?.title || 'N/A'}
                        </td>
                        <td style={{ padding: '12px', fontSize: 12 }}>
                          {schedule.session?.trainer?.name || 'N/A'}
                        </td>
                        <td style={{ padding: '12px', fontSize: 12 }}>
                          {new Date(schedule.start_time).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px', fontSize: 12 }}>
                          {new Date(schedule.start_time).toLocaleTimeString(
                            [],
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          )}
                        </td>
                        <td style={{ padding: '12px', fontSize: 12 }}>
                          {new Date(schedule.end_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td style={{ padding: '12px', fontSize: 12 }}>
                          {schedule.location || 'N/A'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span
                            style={{
                              padding: '4px 8px',
                              borderRadius: 4,
                              backgroundColor: isPast ? '#999' : '#4CAF50',
                              color: 'white',
                              fontSize: 11,
                            }}
                          >
                            {isPast ? 'PAST' : 'UPCOMING'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredSchedules.length === 0 && (
                <p
                  style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#999',
                  }}
                >
                  No schedules found.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
