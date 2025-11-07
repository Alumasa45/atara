import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

const BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? 'https://atara-dajy.onrender.com/api';

interface TimeSlot {
  slot_id: number;
  session_id: number;
  start_time: string; // HH:MM:SS format
  end_time: string; // HH:MM:SS format
  session?: {
    title: string;
    category: string;
    duration_minutes: number;
  };
}

interface Schedule {
  schedule_id: number;
  date: string; // YYYY-MM-DD format
  timeSlots: TimeSlot[];
  status?: string;
  createdBy?: {
    username: string;
  };
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${BASE}/schedule`, { headers });
        if (!res.ok) {
          const errorData = await res.text();
          console.error('Schedule API error:', errorData);
          throw new Error(`Failed to fetch schedules: ${res.status}`);
        }

        const data = await res.json();
        console.log('Schedule response data:', data);
        const scheduleList = Array.isArray(data) ? data : data?.data || [];
        console.log('Parsed schedule list:', scheduleList);
        setSchedules(scheduleList);
        setError(null);
      } catch (err: any) {
        console.error('Schedule fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchSchedules();

    // Set up auto-polling to sync schedules in real-time (every 12 seconds)
    const interval = setInterval(fetchSchedules, 12000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const toggleDateExpand = (dateStr: string) => {
    const newSet = new Set(expandedDates);
    if (newSet.has(dateStr)) {
      newSet.delete(dateStr);
    } else {
      newSet.add(dateStr);
    }
    setExpandedDates(newSet);
  };

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday)
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Group schedules by date
  const schedulesByDate: Record<string, Schedule[]> = {};
  schedules.forEach((schedule) => {
    // schedule.date is already in YYYY-MM-DD format
    const dateStr = schedule.date;
    if (!schedulesByDate[dateStr]) {
      schedulesByDate[dateStr] = [];
    }
    schedulesByDate[dateStr].push(schedule);
  });

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
  };

  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  if (loading) {
    return (
      <LoadingSpinner
        message="Loading schedule"
        subtitle="Fetching available sessions..."
        fullPage={true}
      />
    );
  }

  if (error) {
    return (
      <div className="app">
        <header className="header">
          <div className="logo">📅</div>
          <div>
            <div className="title">Schedule</div>
          </div>
        </header>
        <div className="card" style={{ color: 'red' }}>
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">📅</div>
        <div>
          <div className="title">Schedule</div>
          <div className="muted">View all upcoming sessions</div>
        </div>
      </header>

      <div className="card" style={{ marginTop: 20 }}>
        {/* Calendar Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <button
            onClick={prevMonth}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            ← Previous
          </button>
          <h2 style={{ margin: 0, flex: 1, textAlign: 'center' }}>
            {monthName}
          </h2>
          <button
            onClick={nextMonth}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Next →
          </button>
        </div>

        {/* Day Headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 8,
            marginBottom: 12,
          }}
        >
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              style={{
                textAlign: 'center',
                fontWeight: 'bold',
                padding: '8px 0',
                color: 'var(--muted)',
                fontSize: 12,
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 8,
          }}
        >
          {days.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} />;
            }

            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const daySchedules = schedulesByDate[dateStr] || [];
            const isExpanded = expandedDates.has(dateStr);

            return (
              <div
                key={day}
                onClick={() =>
                  daySchedules.length > 0 && toggleDateExpand(dateStr)
                }
                style={{
                  minHeight: '80px',
                  padding: '8px',
                  backgroundColor:
                    daySchedules.length > 0
                      ? 'rgba(221, 184, 146, 0.1)'
                      : '#f9f9f9',
                  border:
                    daySchedules.length > 0
                      ? '2px solid var(--primary)'
                      : '1px solid #ddd',
                  borderRadius: 6,
                  cursor: daySchedules.length > 0 ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 4 }}
                >
                  {day}
                </div>

                {daySchedules.length > 0 && (
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--muted)',
                      marginBottom: 4,
                    }}
                  >
                    {daySchedules.length} session
                    {daySchedules.length > 1 ? 's' : ''}
                  </div>
                )}

                {isExpanded && daySchedules.length > 0 && (
                  <div
                    style={{
                      marginTop: 8,
                      borderTop: '1px solid #ddd',
                      paddingTop: 8,
                    }}
                  >
                    {daySchedules.map((schedule, schedIdx) => (
                      <div key={schedIdx}>
                        {schedule.timeSlots && schedule.timeSlots.length > 0 ? (
                          schedule.timeSlots.map((slot, slotIdx) => (
                            <div
                              key={slotIdx}
                              style={{
                                fontSize: 10,
                                marginBottom: 6,
                                padding: 6,
                                backgroundColor: 'rgba(0,0,0,0.03)',
                                borderRadius: 3,
                                borderLeft: '3px solid var(--primary)',
                                paddingLeft: 6,
                              }}
                            >
                              <div
                                style={{ fontWeight: 'bold', marginBottom: 2 }}
                              >
                                {slot.session?.title || 'Session'}
                              </div>
                              <div style={{ color: '#666' }}>
                                {slot.start_time} - {slot.end_time}
                              </div>
                              <div style={{ color: '#666', marginTop: 2 }}>
                                {slot.session?.category} •{' '}
                                {slot.session?.duration_minutes}min
                              </div>
                              {schedule.createdBy?.username && (
                                <div
                                  style={{
                                    color: 'var(--muted)',
                                    marginTop: 2,
                                  }}
                                >
                                  by {schedule.createdBy.username}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div
                            style={{
                              fontSize: 10,
                              marginBottom: 6,
                              padding: 6,
                              backgroundColor: 'rgba(0,0,0,0.03)',
                              borderRadius: 3,
                              color: '#999',
                            }}
                          >
                            No time slots
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
