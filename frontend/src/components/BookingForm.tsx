import React, { useState, useEffect } from 'react';
import api, { getCurrentUserFromToken } from '../api';
import toast from 'react-hot-toast';

export default function BookingForm() {
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any | null>(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingSchedules, setFetchingSchedules] = useState(true);

  // Fetch available schedules on component mount
  useEffect(() => {
    let mounted = true;
    setFetchingSchedules(true);
    api
      .fetchSchedules()
      .then((s: any) => {
        if (mounted) {
          // Handle both array and paginated response
          const scheduleList = Array.isArray(s) ? s : s?.data || [];
          console.log('BookingForm fetched schedules:', scheduleList);

          if (Array.isArray(scheduleList)) {
            // For quick booking, show ALL schedules, not just future
            // Users might want to book for past/current sessions
            setSchedules(scheduleList);
            console.log('Available schedules in form:', scheduleList.length);
          }
        }
      })
      .catch((err) => {
        // Silently fail - just show no schedules
        if (mounted) console.error('Failed to load schedules:', err);
      })
      .finally(() => {
        if (mounted) setFetchingSchedules(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Prefill user info from token if logged in
  useEffect(() => {
    const payload = getCurrentUserFromToken();
    if (payload) {
      if (!guestEmail && (payload.email || payload.username))
        setGuestEmail(payload.email ?? payload.username ?? '');
      if (!guestName && (payload.name || payload.username))
        setGuestName(payload.name ?? payload.username ?? '');
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedTimeSlot) {
      toast.error('Please select a time slot');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        time_slot_id: selectedTimeSlot.slot_id,
        guest_name: guestName || null,
        guest_email: guestEmail || null,
        guest_phone: guestPhone || null,
        payment_reference: paymentRef || null,
      };

      const res = await api.createBooking(payload);
      toast.success('Booking created #' + (res?.booking_id ?? ''));

      try {
        const confirmRes: any = await api.confirmBooking(
          res.booking_id,
          paymentRef || undefined,
        );
        if (confirmRes?.verified) {
          toast.success('Payment verified — booking completed');
        } else {
          toast.success('Payment reference submitted for verification');
        }
      } catch (e) {
        toast.error('Failed to submit payment reference');
      }

      // Reset form
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');
      setSelectedTimeSlot(null);
      setPaymentRef('');
    } catch (err: any) {
      toast.error('Failed to create booking: ' + (err?.message ?? err));
    } finally {
      setLoading(false);
    }
  }

  // Group schedules by date for easier viewing
  const schedulesByDate = schedules.reduce((acc: any, sch: any) => {
    const date = sch.date?.split('T')[0] || 'Unknown';
    if (!acc[date]) acc[date] = [];
    acc[date].push(sch);
    return acc;
  }, {});

  const sortedDates = Object.keys(schedulesByDate).sort();

  return (
    <form
      onSubmit={submit}
      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      {/* Guest Information Section */}
      <div style={{ paddingBottom: 8, borderBottom: '1px solid #f1eae0' }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 8,
            color: '#666',
          }}
        >
          GUEST INFORMATION
        </div>
        <input
          className="input"
          placeholder="Name (optional)"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
        />
        <input
          className="input"
          placeholder="Email (optional)"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
        />
        <input
          className="input"
          placeholder="Phone (optional)"
          value={guestPhone}
          onChange={(e) => setGuestPhone(e.target.value)}
        />
      </div>

      {/* Available Time Slots Section */}
      <div style={{ paddingBottom: 8, borderBottom: '1px solid #f1eae0' }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 8,
            color: '#666',
          }}
        >
          AVAILABLE TIME SLOTS
        </div>

        {fetchingSchedules ? (
          <div
            style={{
              color: '#999',
              fontSize: 13,
              textAlign: 'center',
              padding: 12,
            }}
          >
            Loading schedules...
          </div>
        ) : schedules.length === 0 ? (
          <div
            style={{
              color: '#999',
              fontSize: 13,
              textAlign: 'center',
              padding: 12,
            }}
          >
            No schedules available
          </div>
        ) : (
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {sortedDates.map((date) => (
              <div key={date} style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#999',
                    marginBottom: 6,
                  }}
                >
                  {new Date(date).toDateString()}
                </div>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
                >
                  {schedulesByDate[date].flatMap((sch: any) =>
                    (sch.timeSlots || []).map((ts: any) => (
                      <div
                        key={`${sch.schedule_id}-${ts.slot_id}`}
                        onClick={() => setSelectedTimeSlot(ts)}
                        style={{
                          padding: 10,
                          border:
                            selectedTimeSlot?.slot_id === ts.slot_id
                              ? '2px solid #4CAF50'
                              : '1px solid #ddd',
                          borderRadius: 6,
                          cursor: 'pointer',
                          backgroundColor:
                            selectedTimeSlot?.slot_id === ts.slot_id
                              ? '#f1f8f4'
                              : '#fff',
                          transition: 'all 0.2s',
                          fontSize: 13,
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                          {ts.session?.title ||
                            ts.session?.description ||
                            'Class'}
                        </div>
                        <div style={{ color: '#666', fontSize: 12 }}>
                          {ts.start_time?.substring(0, 5)} -{' '}
                          {ts.end_time?.substring(0, 5)}
                          {ts.session?.category && ` • ${ts.session.category}`}
                        </div>
                        {selectedTimeSlot?.slot_id === ts.slot_id && (
                          <div
                            style={{
                              marginTop: 6,
                              color: '#4CAF50',
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            ✓ Selected
                          </div>
                        )}
                      </div>
                    )),
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Reference Section */}
      <div style={{ paddingBottom: 8 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 8,
            color: '#666',
          }}
        >
          PAYMENT
        </div>
        <input
          className="input"
          placeholder="Payment reference (paste from payment)"
          value={paymentRef}
          onChange={(e) => setPaymentRef(e.target.value)}
        />
      </div>

      {/* Selected Slot Summary */}
      {selectedTimeSlot && (
        <div
          style={{
            padding: 10,
            backgroundColor: '#f5f5f5',
            borderRadius: 6,
            fontSize: 12,
            borderLeft: '3px solid #4CAF50',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Selected:</div>
          <div>{selectedTimeSlot.session?.title || 'Class'}</div>
          <div style={{ color: '#666' }}>
            {selectedTimeSlot.start_time?.substring(0, 5)} -{' '}
            {selectedTimeSlot.end_time?.substring(0, 5)}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="button"
          type="submit"
          disabled={loading || !selectedTimeSlot}
          style={{ opacity: !selectedTimeSlot ? 0.5 : 1 }}
        >
          {loading ? 'Processing...' : 'Book Now'}
        </button>
        <button
          type="button"
          className="button"
          style={{ background: 'var(--accent-2)' }}
          onClick={() => {
            setGuestName('');
            setGuestEmail('');
            setGuestPhone('');
            setSelectedTimeSlot(null);
            setPaymentRef('');
          }}
        >
          Clear
        </button>
      </div>
    </form>
  );
}
