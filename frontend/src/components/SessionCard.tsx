import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function SessionCard({
  description = 'Morning Yoga Flow',
  category = 'yoga',
  duration = 60,
  price = 2000,
  onBook,
  sessionId,
}: {
  description?: string;
  category?: string;
  duration?: number;
  price?: number;
  onBook?: () => void;
  sessionId?: number;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Format price as KES
  const formatPrice = (p: number) => {
    return `KES ${p.toLocaleString()}`;
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid #f1eae0',
        flexWrap: 'wrap',
        gap: 8,
      }}
    >
      <div style={{ flex: 1, minWidth: '150px' }}>
        <div style={{ fontWeight: 700 }}>{description}</div>
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>
          {category} • {duration} mins
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontWeight: 700, color: 'var(--accent-2)' }}>
          {formatPrice(price)}
        </div>
        <button
          className="button"
          onClick={() => {
            if (onBook) return onBook();
            if (sessionId) {
              return navigate(`/sessions/${sessionId}/book`, {
                state: { background: location },
              });
            }
            return undefined;
          }}
          style={{
            fontSize: 13,
            padding: '6px 12px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
