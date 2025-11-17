import React, { useEffect, useState } from 'react';
import { getCurrentUserFromToken, getJson } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Video, AlertTriangle, Calendar, Target } from 'lucide-react';

export default function TrainerSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = getCurrentUserFromToken();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getJson('/dashboard/trainer');
      setSessions(data.sessions || []);
      setUpcomingSchedules(data.upcomingSchedules || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingSpinner
        message="Loading your sessions"
        subtitle="Fetching your session data..."
        fullPage={true}
      />
    );
  }

  if (error) {
    return (
      <div className="app">
        <header className="header">
          <div className="logo"><Video size={24} /></div>
          <div>
            <div className="title">My Sessions</div>
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
          <h3 style={{ color: '#c62828', marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={20} />
            Error Loading Sessions
          </h3>
          <p style={{ color: '#d32f2f' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo"><Video size={24} /></div>
        <div>
          <div className="title">My Sessions</div>
          <div className="muted">
            Manage your training sessions and schedules
          </div>
        </div>
      </header>

      <div style={{ marginTop: 20 }}>
        {/* Upcoming Schedules Section */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ marginBottom: 16, fontSize: 20, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={20} />
            Upcoming Sessions ({upcomingSchedules.length})
          </h2>

          {upcomingSchedules.length === 0 ? (
            <div className="card">
              <p
                style={{ color: '#999', textAlign: 'center', padding: '20px' }}
              >
                No upcoming sessions scheduled.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {upcomingSchedules.map((schedule) => (
                <div key={schedule.session_id} className="card">
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(200px, 1fr))',
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
                        Session Title
                      </label>
                      <div style={{ fontSize: 16, fontWeight: 'bold' }}>
                        {schedule.session?.title || 'N/A'}
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
                        Start Time
                      </label>
                      <div style={{ fontSize: 16 }}>
                        {schedule.start_time
                          ? new Date(schedule.start_time).toLocaleString()
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
                        End Time
                      </label>
                      <div style={{ fontSize: 16 }}>
                        {schedule.end_time
                          ? new Date(schedule.end_time).toLocaleString()
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
                        Location
                      </label>
                      <div style={{ fontSize: 16 }}>
                        {schedule.location || 'Not specified'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Sessions Section */}
        <div>
          <h2 style={{ marginBottom: 16, fontSize: 20, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={20} />
            All Your Sessions ({sessions.length})
          </h2>

          {sessions.length === 0 ? (
            <div className="card">
              <p
                style={{ color: '#999', textAlign: 'center', padding: '20px' }}
              >
                You don't have any sessions yet. Create one to start accepting
                bookings.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {sessions.map((session) => (
                <div key={session.session_id} className="card">
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr',
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
                        Session Title
                      </label>
                      <div style={{ fontSize: 16, fontWeight: 'bold' }}>
                        {session.title || 'N/A'}
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
                        Type
                      </label>
                      <div style={{ fontSize: 16 }}>
                        {session.session_type || 'Standard'}
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
                            session.status === 'active' ? '#4CAF50' : '#F44336',
                          color: 'white',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 'bold',
                        }}
                      >
                        {session.status || 'active'}
                      </div>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label
                        style={{
                          color: 'var(--muted)',
                          fontSize: 12,
                          display: 'block',
                          marginBottom: 4,
                        }}
                      >
                        Description
                      </label>
                      <div style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>
                        {session.description || 'No description provided'}
                      </div>
                    </div>
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
