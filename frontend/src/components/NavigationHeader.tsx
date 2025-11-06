import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function NavigationHeader() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <nav
      style={{
        background:
          'linear-gradient(135deg, #7F5539 0%, #9C6644 50%, #B08968 100%)',
        color: '#FFFFFF',
        padding: '0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderBottom: '2px solid #DDB892',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          height: '72px',
          padding: '0 32px',
        }}
      >
        {/* Logo/Brand */}
        <Link
          to="/"
          style={{
            color: '#FFFFFF',
            textDecoration: 'none',
            fontSize: '22px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#DDB892';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <span
            style={{
              fontSize: '28px',
              background: 'linear-gradient(135deg, #DDB892, #E6CCB2)',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            💪
          </span>
          <span style={{ fontSize: '18px', fontWeight: 600 }}>
            Atara Movement Studio
          </span>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link
            to="/"
            style={{
              color: '#FFFFFF',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: 600,
              padding: '10px 18px',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              border: '1px solid transparent',
              letterSpacing: '0.3px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#DDB892';
              e.currentTarget.style.color = '#3b2f2a';
              e.currentTarget.style.borderColor = '#DDB892';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Home
          </Link>

          {/* Admin-only Membership Management Link - HIGHLIGHTED */}
          {isAdmin && (
            <Link
              to="/admin/memberships"
              style={{
                color: '#3b2f2a',
                backgroundColor: '#DDB892',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: 700,
                padding: '10px 20px',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: '2px solid #DDB892',
                boxShadow: '0 3px 8px rgba(221, 184, 146, 0.4)',
                letterSpacing: '0.3px',
                textTransform: 'uppercase',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E6CCB2';
                e.currentTarget.style.borderColor = '#E6CCB2';
                e.currentTarget.style.transform =
                  'translateY(-3px) scale(1.05)';
                e.currentTarget.style.boxShadow =
                  '0 6px 16px rgba(221, 184, 146, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#DDB892';
                e.currentTarget.style.borderColor = '#DDB892';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow =
                  '0 3px 8px rgba(221, 184, 146, 0.4)';
              }}
            >
              <span style={{ fontSize: '16px' }}>⭐</span>
              <span>Membership</span>
            </Link>
          )}

          <Link
            to="/about"
            style={{
              color: '#FFFFFF',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: 600,
              padding: '10px 18px',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              border: '1px solid transparent',
              letterSpacing: '0.3px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#DDB892';
              e.currentTarget.style.color = '#3b2f2a';
              e.currentTarget.style.borderColor = '#DDB892';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
             About Us
          </Link>

          <Link
            to="/contact"
            style={{
              color: '#FFFFFF',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: 600,
              padding: '10px 18px',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              border: '1px solid transparent',
              letterSpacing: '0.3px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#DDB892';
              e.currentTarget.style.color = '#3b2f2a';
              e.currentTarget.style.borderColor = '#DDB892';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
             Contact
          </Link>

          {/* User Info & Logout */}
          {user && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginLeft: '16px',
              }}
            >
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#E6CCB2',
                  borderLeft: '2px solid #DDB892',
                  paddingLeft: '16px',
                  letterSpacing: '0.3px',
                }}
              >
                👤 {user.username}
                <span
                  style={{
                    marginLeft: '6px',
                    fontSize: '12px',
                    background: '#DDB892',
                    color: '#3b2f2a',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  {user.role}
                </span>
              </span>
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: 'rgba(221, 184, 146, 0.2)',
                  color: '#FFFFFF',
                  border: '2px solid #DDB892',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  letterSpacing: '0.3px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#DDB892';
                  e.currentTarget.style.color = '#3b2f2a';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'rgba(221, 184, 146, 0.2)';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
