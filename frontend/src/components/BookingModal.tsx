import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BookingFlow from './BookingFlow';

export default function BookingModal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sessionId = id ? Number(id) : undefined;
  const timeSlotId = id ? Number(id) : undefined;

  // Check if this is a time slot route or session route
  const isTimeSlotRoute = window.location.pathname.includes('/time-slot/');

  return (
    <div className="modal-overlay" onClick={() => navigate(-1)}>
      <div className="modal" onClick={(e) => (e as any).stopPropagation()}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3 style={{ margin: 0 }}>Book a class</h3>
          <button className="close" onClick={() => navigate(-1)}>
            ✕
          </button>
        </div>
        <div style={{ marginTop: 12 }}>
          <BookingFlow
            initialSessionId={!isTimeSlotRoute ? sessionId : undefined}
            initialTimeSlotId={isTimeSlotRoute ? timeSlotId : undefined}
            onDone={() => navigate(-1)}
          />
        </div>
      </div>
    </div>
  );
}
