import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

interface Session {
  session_id: number;
  title: string;
  category: string;
  duration_minutes: number;
  price?: number;
}

interface TimeSlot {
  slot_id?: number;
  session_id: number;
  start_time: string;
  end_time: string;
  session?: Session;
}

interface Schedule {
  schedule_id: number;
  date: string;
  timeSlots: TimeSlot[];
  createdBy?: {
    username: string;
  };
}

interface TimeSlotFormItem {
  session_id: string;
  start_time: string;
  end_time: string;
}

export default function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlotFormItem[]>([
    { session_id: '', start_time: '', end_time: '' },
  ]);

  const BASE =
    (import.meta as any).env?.VITE_API_BASE_URL ?? 'https://atara-dajy.onrender.com';

  // Fetch schedules and sessions on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Fetch schedules
        const schedRes = await fetch(`${BASE}/admin/schedules`, { headers });
        if (!schedRes.ok) {
          throw new Error(`Failed to fetch schedules: ${schedRes.status}`);
        }
        const schedData = await schedRes.json();
        const scheduleList = Array.isArray(schedData)
          ? schedData
          : schedData?.data || [];
        setSchedules(scheduleList);

        // Fetch sessions
        const sessRes = await fetch(`${BASE}/sessions`, { headers });
        if (!sessRes.ok) {
          throw new Error(`Failed to fetch sessions: ${sessRes.status}`);
        }
        const sessData = await sessRes.json();
        const sessionList = Array.isArray(sessData)
          ? sessData
          : sessData?.data || [];
        setSessions(sessionList);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const handleDateClick = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setTimeSlots([{ session_id: '', start_time: '', end_time: '' }]);
    setEditingId(null);
    setIsCreating(true);
  };

  const handleTimeSlotChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    const newSlots = [...timeSlots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setTimeSlots(newSlots);
  };

  const addTimeSlot = () => {
    setTimeSlots([
      ...timeSlots,
      { session_id: '', start_time: '', end_time: '' },
    ]);
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate) {
      setError('No date selected');
      return;
    }

    if (timeSlots.length === 0) {
      setError('At least one time slot is required');
      return;
    }

    const validSlots = timeSlots.filter(
      (slot) => slot.session_id && slot.start_time && slot.end_time,
    );

    if (validSlots.length === 0) {
      setError('All time slots must have a session and times');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload = {
        date: selectedDate,
        timeSlots: validSlots.map((slot) => ({
          session_id: Number(slot.session_id),
          start_time: slot.start_time, // Already in HH:MM format from form
          end_time: slot.end_time, // Already in HH:MM format from form
        })),
      };

      let response;
      if (editingId) {
        // Update existing schedule
        response = await fetch(`${BASE}/admin/schedules/${editingId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        // Create new schedule
        response = await fetch(`${BASE}/admin/schedules`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to save schedule: ${errorData}`);
      }

      // Refresh schedules
      const schedRes = await fetch(`${BASE}/admin/schedules`, {
        headers: { Accept: 'application/json', ...headers },
      });
      const schedData = await schedRes.json();
      const scheduleList = Array.isArray(schedData)
        ? schedData
        : schedData?.data || [];
      setSchedules(scheduleList);

      // Reset form
      setIsCreating(false);
      setEditingId(null);
      setSelectedDate(null);
      setTimeSlots([{ session_id: '', start_time: '', end_time: '' }]);
      setError(null);
    } catch (err: any) {
      console.error('Create/Update error:', err);
      setError(err.message);
    }
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingId(schedule.schedule_id);
    setSelectedDate(schedule.date);
    const formattedSlots = schedule.timeSlots.map((slot) => ({
      session_id: slot.session_id.toString(),
      start_time:
        typeof slot.start_time === 'string'
          ? slot.start_time.substring(0, 5) // Extract HH:MM from HH:MM:SS
          : new Date(slot.start_time).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }),
      end_time:
        typeof slot.end_time === 'string'
          ? slot.end_time.substring(0, 5) // Extract HH:MM from HH:MM:SS
          : new Date(slot.end_time).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }),
    }));
    setTimeSlots(formattedSlots);
    setIsCreating(true);
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${BASE}/admin/schedules/${scheduleId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to delete schedule: ${response.status}`);
      }

      // Refresh schedules
      const schedRes = await fetch(`${BASE}/admin/schedules`, {
        headers: { Accept: 'application/json', ...headers },
      });
      const schedData = await schedRes.json();
      const scheduleList = Array.isArray(schedData)
        ? schedData
        : schedData?.data || [];
      setSchedules(scheduleList);
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setSelectedDate(null);
    setTimeSlots([{ session_id: '', start_time: '', end_time: '' }]);
    setError(null);
  };

  if (loading) {
    return (
      <LoadingSpinner
        message="Loading schedules"
        subtitle="Fetching schedules and sessions..."
        fullPage={true}
      />
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">⏰</div>
        <div>
          <div className="title">Schedule Management</div>
          <div className="muted">Create and manage studio schedules</div>
        </div>
      </header>

      {error && (
        <div className="card" style={{ color: 'red', marginTop: 20 }}>
          <p>Error: {error}</p>
          <button
            onClick={() => setError(null)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f0f0f0',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
          marginTop: 20,
        }}
      >
        {/* Left: Calendar */}
        <div className="card">
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
              const daySchedule = schedulesByDate[dateStr];
              const isExpanded = expandedDates.has(dateStr);

              return (
                <div
                  key={day}
                  style={{
                    minHeight: '80px',
                    padding: '8px',
                    backgroundColor:
                      daySchedule && daySchedule.length > 0
                        ? 'rgba(221, 184, 146, 0.1)'
                        : '#f9f9f9',
                    border:
                      daySchedule && daySchedule.length > 0
                        ? '2px solid var(--primary)'
                        : '1px solid #ddd',
                    borderRadius: 6,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    overflow: 'hidden',
                  }}
                  onClick={() => {
                    if (daySchedule && daySchedule.length > 0) {
                      toggleDateExpand(dateStr);
                    } else {
                      handleDateClick(day);
                    }
                  }}
                >
                  <div
                    style={{
                      fontWeight: 'bold',
                      fontSize: 14,
                      marginBottom: 4,
                    }}
                  >
                    {day}
                  </div>

                  {daySchedule && daySchedule.length > 0 && (
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--muted)',
                        marginBottom: 4,
                      }}
                    >
                      {daySchedule.reduce(
                        (count, schedule) => count + schedule.timeSlots.length,
                        0,
                      )}{' '}
                      session
                      {daySchedule.reduce(
                        (count, schedule) => count + schedule.timeSlots.length,
                        0,
                      ) > 1
                        ? 's'
                        : ''}
                    </div>
                  )}

                  {isExpanded && daySchedule && daySchedule.length > 0 && (
                    <div
                      style={{
                        marginTop: 8,
                        borderTop: '1px solid #ddd',
                        paddingTop: 8,
                      }}
                    >
                      {daySchedule.map((schedule) =>
                        schedule.timeSlots.map((slot, slotIdx) => (
                          <div
                            key={`${schedule.schedule_id}-${slotIdx}`}
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
                            <div style={{ color: '#666', fontSize: 9 }}>
                              {new Date(slot.start_time).toLocaleTimeString(
                                'en-US',
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                },
                              )}{' '}
                              -{' '}
                              {new Date(slot.end_time).toLocaleTimeString(
                                'en-US',
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                },
                              )}
                            </div>
                          </div>
                        )),
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Create/Edit Form or Schedule List */}
        <div className="card">
          {isCreating ? (
            <div>
              <h3 style={{ marginTop: 0 }}>
                {editingId ? 'Edit Schedule' : 'Create New Schedule'}
              </h3>
              <div
                style={{
                  color: 'var(--muted)',
                  fontSize: 14,
                  marginBottom: 15,
                }}
              >
                Date: <strong>{selectedDate}</strong>
              </div>

              <form onSubmit={handleCreateSubmit}>
                <div style={{ marginBottom: 15 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 10,
                    }}
                  >
                    <label style={{ fontWeight: 'bold' }}>
                      Time Slots * (Add sessions at different times)
                    </label>
                    <button
                      type="button"
                      onClick={addTimeSlot}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 12,
                      }}
                    >
                      + Add Slot
                    </button>
                  </div>

                  <div
                    style={{
                      border: '1px solid #ddd',
                      padding: 10,
                      borderRadius: 4,
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    {timeSlots.map((slot, index) => (
                      <div
                        key={index}
                        style={{
                          marginBottom: 15,
                          padding: 12,
                          backgroundColor: 'white',
                          border: '1px solid #e0e0e0',
                          borderRadius: 4,
                          position: 'relative',
                        }}
                      >
                        <div style={{ marginBottom: 10 }}>
                          <label
                            style={{
                              display: 'block',
                              marginBottom: 5,
                              fontSize: 12,
                            }}
                          >
                            Session *
                          </label>
                          <select
                            value={slot.session_id}
                            onChange={(e) =>
                              handleTimeSlotChange(
                                index,
                                'session_id',
                                e.target.value,
                              )
                            }
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #ddd',
                              borderRadius: 4,
                              fontSize: 14,
                            }}
                          >
                            <option value="">Select a session</option>
                            {sessions.map((session) => (
                              <option
                                key={session.session_id}
                                value={session.session_id}
                              >
                                {session.title} ({session.category}) -{' '}
                                {session.duration_minutes}m
                              </option>
                            ))}
                          </select>
                        </div>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 10,
                            marginBottom: 10,
                          }}
                        >
                          <div>
                            <label
                              style={{
                                display: 'block',
                                marginBottom: 5,
                                fontSize: 12,
                              }}
                            >
                              Start Time *
                            </label>
                            <input
                              type="time"
                              value={slot.start_time}
                              onChange={(e) =>
                                handleTimeSlotChange(
                                  index,
                                  'start_time',
                                  e.target.value,
                                )
                              }
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #ddd',
                                borderRadius: 4,
                                fontSize: 14,
                              }}
                            />
                          </div>

                          <div>
                            <label
                              style={{
                                display: 'block',
                                marginBottom: 5,
                                fontSize: 12,
                              }}
                            >
                              End Time *
                            </label>
                            <input
                              type="time"
                              value={slot.end_time}
                              onChange={(e) =>
                                handleTimeSlotChange(
                                  index,
                                  'end_time',
                                  e.target.value,
                                )
                              }
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #ddd',
                                borderRadius: 4,
                                fontSize: 14,
                              }}
                            />
                          </div>
                        </div>

                        {timeSlots.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(index)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#ff6b6b',
                              color: 'white',
                              border: 'none',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: 12,
                            }}
                          >
                            × Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    {editingId ? 'Update' : 'Create'} Schedule
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      backgroundColor: '#f0f0f0',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <h3 style={{ marginTop: 0 }}>Recent Schedules</h3>

              {schedules.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>
                  No schedules yet. Click on a date to create one.
                </p>
              ) : (
                <div>
                  {schedules
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime(),
                    )
                    .slice(0, 5)
                    .map((schedule) => (
                      <div
                        key={schedule.schedule_id}
                        style={{
                          padding: 12,
                          marginBottom: 10,
                          backgroundColor: 'rgba(0,0,0,0.03)',
                          borderRadius: 4,
                          borderLeft: '3px solid var(--primary)',
                        }}
                      >
                        <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
                          📅 {new Date(schedule.date).toLocaleDateString()}
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          {schedule.timeSlots.map((slot, idx) => (
                            <div
                              key={idx}
                              style={{
                                fontSize: 12,
                                color: '#333',
                                marginBottom: 4,
                                paddingLeft: 10,
                                borderLeft: '2px solid var(--primary)',
                                paddingTop: 4,
                                paddingBottom: 4,
                              }}
                            >
                              <strong>
                                {slot.session?.title || 'Session'}
                              </strong>{' '}
                              •{' '}
                              {new Date(slot.start_time).toLocaleTimeString(
                                'en-US',
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                },
                              )}{' '}
                              -{' '}
                              {new Date(slot.end_time).toLocaleTimeString(
                                'en-US',
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                },
                              )}
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button
                            onClick={() => handleEditSchedule(schedule)}
                            style={{
                              flex: 1,
                              padding: '6px 12px',
                              backgroundColor: 'var(--primary)',
                              color: 'white',
                              border: 'none',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: 12,
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteSchedule(schedule.schedule_id)
                            }
                            style={{
                              flex: 1,
                              padding: '6px 12px',
                              backgroundColor: '#ff6b6b',
                              color: 'white',
                              border: 'none',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: 12,
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}

                  {schedules.length > 5 && (
                    <p style={{ color: 'var(--muted)', fontSize: 12 }}>
                      Showing {Math.min(5, schedules.length)} of{' '}
                      {schedules.length} schedules
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
