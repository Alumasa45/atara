import React from 'react';

type Props = {
  name?: string;
  specialty?: string;
  phone?: string;
  email?: string;
  bio?: string;
  profile_image?: string;
};

export default function TrainerCard({
  name = 'Jane Doe',
  specialty = 'yoga',
  phone = '+1234567890',
  email = 'trainer@example.com',
  bio = 'Experienced instructor.',
  profile_image,
}: Props) {
  return (
    <div
      style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center' }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 10,
          background: 'var(--accent-1)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {profile_image ? (
          <img
            src={`https://atara-dajy.onrender.com${profile_image}`}
            alt={name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <span style={{ fontSize: 24, color: '#fff' }}>👤</span>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700 }}>{name}</div>
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>
          {specialty}
        </div>
        <div style={{ marginTop: 6, fontSize: 13, color: '#444' }}>{bio}</div>
      </div>
    </div>
  );
}
