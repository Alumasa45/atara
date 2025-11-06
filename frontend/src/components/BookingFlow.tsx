import React, { useEffect, useState } from 'react';
import api, { getCurrentUserFromToken } from '../api';
import toast from 'react-hot-toast';

type Step = 'pickDate' | 'pickClass' | 'confirm' | 'chooseBookingMethod';
type BookingMethod = 'registered' | 'guest' | null;

export default function BookingFlow({
  onDone,
  initialScheduleId,
  initialSessionId,
  initialTimeSlotId,
}: {
  onDone?: () => void;
  initialScheduleId?: number;
  initialSessionId?: number;
  initialTimeSlotId?: number;
}) {
  const [step, setStep] = useState<Step>('pickDate');
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any | null>(null);
  const [bookingMethod, setBookingMethod] = useState<BookingMethod>(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const currentUser = getCurrentUserFromToken();

  useEffect(() => {
    // fetch schedules and build available dates (group by date)
    api
      .fetchSchedules()
      .then((response: any) => {
        // Handle both array and paginated response format
        let arr: any[] = [];
        if (Array.isArray(response)) {
          arr = response;
        } else if (response?.data && Array.isArray(response.data)) {
          arr = response.data;
        } else {
          arr = [];
        }

        console.log('Fetched schedules:', arr); // Debug log
        setSchedules(arr);

        // Build date map from schedules with time slots
        const byDate = new Map<string, any[]>();
        arr.forEach((s: any) => {
          if (s.date) {
            const d = s.date.split('T')[0]; // Extract YYYY-MM-DD format
            if (!byDate.has(d)) byDate.set(d, []);
            const listForDate = byDate.get(d)!;
            listForDate.push(s);
          }
        });
        const keys = Array.from(byDate.keys()).sort();
        setDates(keys);
        console.log('Available dates:', keys); // Debug log

        // Handle time slot selection (new flow)
        if (initialTimeSlotId) {
          // Find the schedule and time slot
          let foundSlot: any = null;
          let foundSchedule: any = null;

          for (const schedule of arr) {
            if (schedule.timeSlots) {
              const slot = schedule.timeSlots.find(
                (ts: any) => ts.slot_id === initialTimeSlotId,
              );
              if (slot) {
                foundSlot = slot;
                foundSchedule = schedule;
                break;
              }
            }
          }

          if (foundSlot && foundSchedule) {
            setSelectedTimeSlot(foundSlot);
            setSelectedSchedule(foundSchedule);
            setStep('chooseBookingMethod');
            setBookingMethod(null);
          }
        }
        // Handle schedule selection (old flow)
        else if (initialScheduleId) {
          const found = arr.find(
            (x: any) => x.schedule_id === initialScheduleId,
          );
          if (found) {
            setSelectedSchedule(found);
            setStep('confirm');
          }
        }
        // Handle session selection (old flow)
        else if (initialSessionId) {
          const found = arr
            .filter(
              (x: any) =>
                x.session_id === initialSessionId ||
                x.session?.session_id === initialSessionId,
            )
            .sort(
              (a: any, b: any) =>
                new Date(a.start_time).getTime() -
                new Date(b.start_time).getTime(),
            )[0];
          if (found) {
            setSelectedSchedule(found);
            setStep('confirm');
          }
        }
      })
      .catch((err: any) => {
        console.error('Error fetching schedules:', err);
        setSchedules([]);
        setDates([]);
      });
  }, [initialScheduleId, initialSessionId, initialTimeSlotId]);

  function openDate(d: string) {
    setSelectedDate(d);
    // filter schedules for that date
    const daySchedules = schedules.filter(
      (s) => s.date && s.date.split('T')[0] === d,
    );
    setClasses(daySchedules);
    setStep('pickClass');
  }

  function pickClass(s: any) {
    setSelectedSchedule(s);
    setStep('chooseBookingMethod');
    setBookingMethod(null);
  }

  async function completeBooking() {
    if (!bookingMethod) return;

    // Check we have either selectedTimeSlot or selectedSchedule
    if (!selectedTimeSlot && !selectedSchedule) return;

    // Validate based on booking method
    if (bookingMethod === 'registered' && !currentUser?.userId) {
      toast.error('Please log in to book as a registered user');
      return;
    }

    if (bookingMethod === 'guest') {
      if (!guestName || !guestEmail || !guestPhone) {
        toast.error('Please provide your name, email, and phone number');
        return;
      }
    }

    setLoading(true);
    try {
      const payload: any = {
        payment_reference: paymentRef || null,
      };

      // Use time_slot_id if we have it (new flow)
      if (selectedTimeSlot) {
        payload.time_slot_id = selectedTimeSlot.slot_id;
      }
      // Fall back to schedule_id for backward compatibility (old flow)
      else if (selectedSchedule) {
        payload.schedule_id = selectedSchedule.schedule_id;
      }

      // Add user_id if booking as registered user
      if (bookingMethod === 'registered' && currentUser?.userId) {
        payload.user_id = currentUser.userId;
      }

      // Add guest info if booking as guest
      if (bookingMethod === 'guest') {
        payload.guest_name = guestName;
        payload.guest_email = guestEmail;
        payload.guest_phone = guestPhone;
      }

      const res = await api.createBooking(payload);
      toast.success('Booking created #' + (res?.booking_id ?? ''));
      // call confirm endpoint (backend will verify payment ref and may auto-complete)
      try {
        const confirmRes: any = await api.confirmBooking(
          res.booking_id,
          paymentRef || undefined,
        );
        if (confirmRes?.verified) {
          toast.success('Payment verified — booking completed');
        } else {
          toast.success(
            'Payment reference submitted for verification. You will receive SMS once confirmed.',
          );
        }
      } catch (e: any) {
        toast.error('Failed to submit payment reference for verification');
      }
      setLoading(false);
      onDone && onDone();
    } catch (err: any) {
      toast.error('Failed to create booking: ' + (err?.message ?? err));
      setLoading(false);
    }
  }

  // prefill from token if available when step is confirm
  useEffect(() => {
    const payload = getCurrentUserFromToken();
    if (payload) {
      if (!guestEmail && (payload.email || payload.username))
        setGuestEmail(payload.email ?? payload.username ?? '');
      if (!guestName && (payload.name || payload.username))
        setGuestName(payload.name ?? payload.username ?? '');
    }
  }, []);

  return (
    <div>
      {step === 'pickDate' && (
        <div className="card">
          <h3>Select a date</h3>
          {dates.length === 0 && (
            <div>
              <div style={{ color: '#999', marginBottom: 12 }}>
                No schedules available
              </div>
              {schedules.length > 0 && (
                <div
                  style={{
                    fontSize: 12,
                    color: '#ccc',
                    padding: 8,
                    backgroundColor: '#f9f9f9',
                    borderRadius: 4,
                  }}
                >
                  <div>Debug: Found {schedules.length} schedules</div>
                  <div>First schedule: {schedules[0]?.date}</div>
                </div>
              )}
            </div>
          )}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.max(1, dates.length)}, minmax(160px, 1fr))`,
              gap: 12,
              overflowX: 'auto',
            }}
          >
            {dates.map((d) => (
              <div
                key={d}
                style={{
                  border: '1px solid #f1eae0',
                  padding: 8,
                  borderRadius: 6,
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  {new Date(d).toDateString()}
                </div>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
                >
                  {schedules
                    .filter((s) => s.date && s.date.split('T')[0] === d)
                    .flatMap((s: any) =>
                      (s.timeSlots || []).map((ts: any) => ({
                        schedule: s,
                        timeSlot: ts,
                      })),
                    )
                    .map(({ schedule: s, timeSlot: ts }: any) => (
                      <div
                        key={`${s.schedule_id}-${ts.slot_id}`}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div style={{ fontSize: 13 }}>
                          <div style={{ fontWeight: 700 }}>
                            {ts.session?.title ?? 'Class'}
                          </div>
                          <div style={{ color: 'var(--muted)', fontSize: 12 }}>
                            {ts.start_time?.substring(0, 5)} •{' '}
                            {ts.session?.category}
                          </div>
                        </div>
                        <div>
                          <button
                            className="button"
                            onClick={() => {
                              setSelectedTimeSlot(ts);
                              setSelectedSchedule(s);
                              setStep('chooseBookingMethod');
                              setBookingMethod(null);
                            }}
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
                <div style={{ marginTop: 8 }}>
                  <button className="button" onClick={() => openDate(d)}>
                    View day
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'pickClass' && (
        <div className="card">
          <h3>Classes on {selectedDate}</h3>
          {classes
            .flatMap((s: any) =>
              (s.timeSlots || []).map((ts: any) => ({
                schedule: s,
                timeSlot: ts,
              })),
            )
            .map(({ schedule: s, timeSlot: ts }: any) => (
              <div
                key={`${s.schedule_id}-${ts.slot_id}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid #f1eae0',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {ts.session?.title ?? 'Class'}
                  </div>
                  <div style={{ color: 'var(--muted)' }}>
                    {ts.start_time?.substring(0, 5)} • {ts.session?.category}
                  </div>
                </div>
                <div>
                  <button
                    className="button"
                    onClick={() => {
                      setSelectedTimeSlot(ts);
                      setSelectedSchedule(s);
                      setStep('chooseBookingMethod');
                      setBookingMethod(null);
                    }}
                  >
                    Select Class
                  </button>
                </div>
              </div>
            ))}
          <div style={{ marginTop: 12 }}>
            <button className="button" onClick={() => setStep('pickDate')}>
              Back
            </button>
          </div>
        </div>
      )}

      {step === 'chooseBookingMethod' &&
        (selectedTimeSlot || selectedSchedule) && (
          <div className="card">
            <h3>How would you like to book?</h3>
            {selectedTimeSlot ? (
              <>
                <div style={{ marginBottom: 8 }}>
                  Class: <strong>{selectedTimeSlot.session?.title}</strong>
                </div>
                <div style={{ marginBottom: 20 }}>
                  Time: {selectedTimeSlot.start_time?.substring(0, 5)} -{' '}
                  {selectedTimeSlot.end_time?.substring(0, 5)}
                  {selectedSchedule?.date && (
                    <>
                      {' '}
                      on {new Date(selectedSchedule.date).toLocaleDateString()}
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 8 }}>
                  Class:{' '}
                  <strong>{selectedSchedule?.session?.description}</strong>
                </div>
                <div style={{ marginBottom: 20 }}>
                  Time:{' '}
                  {selectedSchedule &&
                    new Date(selectedSchedule.start_time).toLocaleString()}
                </div>
              </>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                marginBottom: 16,
              }}
            >
              {/* Option 1: Book as Registered User */}
              <div
                onClick={() => setBookingMethod('registered')}
                style={{
                  padding: 16,
                  border:
                    bookingMethod === 'registered'
                      ? '2px solid #4CAF50'
                      : '2px solid #ddd',
                  borderRadius: 8,
                  cursor: 'pointer',
                  backgroundColor:
                    bookingMethod === 'registered' ? '#f1f8f4' : '#fff',
                  transition: 'all 0.2s',
                }}
              >
                <div
                  style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 16 }}
                >
                  {currentUser?.userId ? '✅ My Account' : '🔓 Create Account'}
                </div>
                <div style={{ fontSize: 13, color: '#666' }}>
                  {currentUser?.userId
                    ? 'Book using your registered account'
                    : 'Register or log in with your account'}
                </div>
              </div>

              {/* Option 2: Book as Guest */}
              <div
                onClick={() => setBookingMethod('guest')}
                style={{
                  padding: 16,
                  border:
                    bookingMethod === 'guest'
                      ? '2px solid #4CAF50'
                      : '2px solid #ddd',
                  borderRadius: 8,
                  cursor: 'pointer',
                  backgroundColor:
                    bookingMethod === 'guest' ? '#f1f8f4' : '#fff',
                  transition: 'all 0.2s',
                }}
              >
                <div
                  style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 16 }}
                >
                  👤 Book as Guest
                </div>
                <div style={{ fontSize: 13, color: '#666' }}>
                  No account needed. Just provide your contact info
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="button"
                onClick={() => setStep('confirm')}
                disabled={!bookingMethod}
                style={{ opacity: !bookingMethod ? 0.5 : 1 }}
              >
                Continue
              </button>
              <button
                className="button"
                style={{ background: 'var(--accent-2)' }}
                onClick={() => setStep('pickClass')}
              >
                Back
              </button>
            </div>
          </div>
        )}

      {step === 'confirm' && selectedSchedule && bookingMethod && (
        <div className="card">
          <h3>Confirm booking</h3>
          <div style={{ marginBottom: 8 }}>
            Class: <strong>{selectedSchedule.session?.description}</strong>
          </div>
          <div style={{ marginBottom: 16 }}>
            Time: {new Date(selectedSchedule.start_time).toLocaleString()}
          </div>
          <div
            style={{
              marginBottom: 16,
              padding: 8,
              backgroundColor: '#f5f5f5',
              borderRadius: 4,
            }}
          >
            Booking as:{' '}
            <strong>
              {bookingMethod === 'registered'
                ? '✅ Registered User'
                : '👤 Guest'}
            </strong>
          </div>

          {/* Show fields based on booking method */}
          {bookingMethod === 'registered' && currentUser?.userId && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                Name:{' '}
                <strong>{currentUser.name || currentUser.username}</strong>
              </div>
              <div style={{ fontSize: 14, color: '#666' }}>
                Email:{' '}
                <strong>{currentUser.email || currentUser.username}</strong>
              </div>
            </div>
          )}

          {bookingMethod === 'registered' && !currentUser?.userId && (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                backgroundColor: '#fff3e0',
                borderRadius: 4,
              }}
            >
              <div style={{ marginBottom: 12 }}>
                Please log in or register to continue booking.
              </div>
              <button
                className="button"
                onClick={() => (window.location.href = '/login')}
                style={{ marginRight: 8 }}
              >
                Login/Register
              </button>
              <button
                className="button"
                style={{ background: 'var(--accent-2)' }}
                onClick={() => {
                  setBookingMethod(null);
                  setStep('chooseBookingMethod');
                }}
              >
                Cancel
              </button>
            </div>
          )}

          {bookingMethod === 'guest' && (
            <>
              <input
                className="input"
                placeholder="Your name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
              />
              <input
                className="input"
                placeholder="Email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
              />
              <input
                className="input"
                placeholder="Phone"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                required
              />
            </>
          )}

          <input
            className="input"
            placeholder="Payment reference"
            value={paymentRef}
            onChange={(e) => setPaymentRef(e.target.value)}
          />

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button
              className="button"
              onClick={completeBooking}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Complete booking'}
            </button>
            <button
              className="button"
              style={{ background: 'var(--accent-2)' }}
              onClick={() => {
                setBookingMethod(null);
                setStep('chooseBookingMethod');
              }}
            >
              Back
            </button>
          </div>

          {notice && (
            <div style={{ marginTop: 12, color: 'var(--muted)' }}>{notice}</div>
          )}
        </div>
      )}
    </div>
  );
}
