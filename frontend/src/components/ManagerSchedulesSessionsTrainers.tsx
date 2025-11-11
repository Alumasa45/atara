import React, { useState, useEffect } from 'react';

interface Schedule {
  schedule_id: number;
  trainer_id: number;
  name: string;
  description: string;
  status: string;
  created_at: string;
}

interface SchedulesResponse {
  data: Schedule[];
  total: number;
  page: number;
  pages: number;
}

export const ManagerSchedules: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSchedules = async (page: number = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });

      const res = await fetch(
        `https://atara-dajy.onrender.com/admin/schedules?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      if (!res.ok) throw new Error('Failed to fetch schedules');
      const data: SchedulesResponse = await res.json();
      setSchedules(data.data || []);
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
    fetchSchedules(1);
  }, []);

  return (
    <div style={{ marginBottom: 24 }}>
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>📅 Schedules</h3>

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
            Loading schedules...
          </div>
        )}

        {!loading && schedules.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999' }}>
            No schedules found
          </div>
        )}

        {!loading && schedules.length > 0 && (
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
                      Schedule ID
                    </th>
                    <th
                      style={{
                        padding: 12,
                        textAlign: 'left',
                        fontWeight: 'bold',
                      }}
                    >
                      Name
                    </th>
                    <th
                      style={{
                        padding: 12,
                        textAlign: 'left',
                        fontWeight: 'bold',
                      }}
                    >
                      Description
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
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule, index) => (
                    <tr
                      key={schedule.schedule_id}
                      style={{
                        borderBottom: '1px solid #eee',
                        backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9',
                      }}
                    >
                      <td style={{ padding: 12 }}>
                        <strong>#{schedule.schedule_id}</strong>
                      </td>
                      <td style={{ padding: 12 }}>{schedule.name}</td>
                      <td style={{ padding: 12, color: '#666' }}>
                        {schedule.description || 'N/A'}
                      </td>
                      <td style={{ padding: 12 }}>
                        <span
                          style={{
                            backgroundColor: '#E8F5E9',
                            color: '#2E7D32',
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 'bold',
                          }}
                        >
                          {schedule.status?.toUpperCase() || 'ACTIVE'}
                        </span>
                      </td>
                      <td style={{ padding: 12 }}>
                        {new Date(schedule.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div
                style={{
                  marginTop: 16,
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <button
                  onClick={() => fetchSchedules(currentPage - 1)}
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
                  onClick={() => fetchSchedules(currentPage + 1)}
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
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ===== SESSIONS COMPONENT =====

interface Session {
  session_id: number;
  trainer_id: number;
  schedule_id: number;
  status: string;
  created_at: string;
}

interface SessionsResponse {
  data: Session[];
  total: number;
  page: number;
  pages: number;
}

export const ManagerSessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSessions = async (page: number = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });

      const res = await fetch(
        `https://atara-dajy.onrender.com/admin/sessions?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      if (!res.ok) throw new Error('Failed to fetch sessions');
      const data: SessionsResponse = await res.json();
      setSessions(data.data || []);
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
    fetchSessions(1);
  }, []);

  return (
    <div style={{ marginBottom: 24 }}>
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>🎯 Sessions</h3>

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
            Loading sessions...
          </div>
        )}

        {!loading && sessions.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999' }}>
            No sessions found
          </div>
        )}

        {!loading && sessions.length > 0 && (
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
                      Session ID
                    </th>
                    <th
                      style={{
                        padding: 12,
                        textAlign: 'left',
                        fontWeight: 'bold',
                      }}
                    >
                      Trainer ID
                    </th>
                    <th
                      style={{
                        padding: 12,
                        textAlign: 'left',
                        fontWeight: 'bold',
                      }}
                    >
                      Schedule ID
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
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session, index) => (
                    <tr
                      key={session.session_id}
                      style={{
                        borderBottom: '1px solid #eee',
                        backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9',
                      }}
                    >
                      <td style={{ padding: 12 }}>
                        <strong>#{session.session_id}</strong>
                      </td>
                      <td style={{ padding: 12 }}>{session.trainer_id}</td>
                      <td style={{ padding: 12 }}>{session.schedule_id}</td>
                      <td style={{ padding: 12 }}>
                        <span
                          style={{
                            backgroundColor: '#E8F5E9',
                            color: '#2E7D32',
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 'bold',
                          }}
                        >
                          {session.status?.toUpperCase() || 'ACTIVE'}
                        </span>
                      </td>
                      <td style={{ padding: 12 }}>
                        {new Date(session.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div
                style={{
                  marginTop: 16,
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <button
                  onClick={() => fetchSessions(currentPage - 1)}
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
                  onClick={() => fetchSessions(currentPage + 1)}
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
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ===== TRAINERS COMPONENT =====

interface Trainer {
  trainer_id: number;
  user_id: number;
  status: string;
  created_at: string;
  user?: {
    username: string;
    email: string;
  };
}

interface TrainersResponse {
  data: Trainer[];
  total: number;
  page: number;
  pages: number;
}

export const ManagerTrainers: React.FC = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTrainers = async (page: number = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });

      const res = await fetch(
        `https://atara-dajy.onrender.com/admin/trainers?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      if (!res.ok) throw new Error('Failed to fetch trainers');
      const data: TrainersResponse = await res.json();
      setTrainers(data.data || []);
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
    fetchTrainers(1);
  }, []);

  return (
    <div style={{ marginBottom: 24 }}>
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>⚡ Trainers</h3>

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
            Loading trainers...
          </div>
        )}

        {!loading && trainers.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999' }}>
            No trainers found
          </div>
        )}

        {!loading && trainers.length > 0 && (
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
                      Trainer ID
                    </th>
                    <th
                      style={{
                        padding: 12,
                        textAlign: 'left',
                        fontWeight: 'bold',
                      }}
                    >
                      Name
                    </th>
                    <th
                      style={{
                        padding: 12,
                        textAlign: 'left',
                        fontWeight: 'bold',
                      }}
                    >
                      Email
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
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {trainers.map((trainer, index) => (
                    <tr
                      key={trainer.trainer_id}
                      style={{
                        borderBottom: '1px solid #eee',
                        backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9',
                      }}
                    >
                      <td style={{ padding: 12 }}>
                        <strong>#{trainer.trainer_id}</strong>
                      </td>
                      <td style={{ padding: 12 }}>
                        {trainer.user?.username || 'Unknown'}
                      </td>
                      <td style={{ padding: 12 }}>
                        {trainer.user?.email || 'N/A'}
                      </td>
                      <td style={{ padding: 12 }}>
                        <span
                          style={{
                            backgroundColor:
                              trainer.status === 'active'
                                ? '#E8F5E9'
                                : '#FFF3E0',
                            color:
                              trainer.status === 'active'
                                ? '#2E7D32'
                                : '#E65100',
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 'bold',
                          }}
                        >
                          {trainer.status?.toUpperCase() || 'ACTIVE'}
                        </span>
                      </td>
                      <td style={{ padding: 12 }}>
                        {new Date(trainer.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div
                style={{
                  marginTop: 16,
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <button
                  onClick={() => fetchTrainers(currentPage - 1)}
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
                  onClick={() => fetchTrainers(currentPage + 1)}
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
            )}
          </>
        )}
      </div>
    </div>
  );
};
