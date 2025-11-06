import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  subtitle?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({
  message = 'Loading',
  subtitle = 'Please wait...',
  fullPage = false,
}: LoadingSpinnerProps) {
  if (fullPage) {
    return (
      <div className="app">
        <header className="header">
          <div className="logo">⏳</div>
          <div>
            <div className="title">Loading</div>
          </div>
        </header>
        <div className="card">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              gap: '24px',
            }}
          >
            <SpinnerAnimation />
            <div>
              <p
                style={{
                  color: '#666',
                  fontSize: '16px',
                  fontWeight: '500',
                  margin: '0 0 8px 0',
                }}
              >
                {message}
              </p>
              <p style={{ color: '#aaa', fontSize: '13px', margin: 0 }}>
                {subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          gap: '24px',
        }}
      >
        <SpinnerAnimation />
        <div>
          <p
            style={{
              color: '#666',
              fontSize: '16px',
              fontWeight: '500',
              margin: '0 0 8px 0',
            }}
          >
            {message}
          </p>
          <p style={{ color: '#aaa', fontSize: '13px', margin: 0 }}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

function SpinnerAnimation() {
  return (
    <>
      <div style={{ position: 'relative', width: '80px', height: '80px' }}>
        {/* Outer rotating circle */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            border: '3px solid transparent',
            borderTop: '3px solid var(--primary)',
            borderRight: '3px solid var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1.5s linear infinite',
          }}
        />
        {/* Middle rotating circle */}
        <div
          style={{
            position: 'absolute',
            width: '70%',
            height: '70%',
            top: '5%',
            left: '5%',
            border: '2px solid transparent',
            borderBottom: '2px solid rgba(100, 100, 100, 0.3)',
            borderLeft: '2px solid rgba(100, 100, 100, 0.3)',
            borderRadius: '50%',
            animation: 'spin 2.5s linear infinite reverse',
          }}
        />
        {/* Center dot */}
        <div
          style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            backgroundColor: 'var(--primary)',
            borderRadius: '50%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
