import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Update mobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      // Keep sidebar open on desktop
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // On desktop, always show sidebar. On mobile, use toggle state.
  const shouldShowSidebar = !isMobile || sidebarOpen;

  return (
    <div className="layout">
      {/* Hamburger Toggle Button - visible on mobile only */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1000,
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: 24,
            cursor: 'pointer',
            color: '#333',
          }}
          className="hamburger-toggle"
          title="Toggle sidebar"
        >
          ☰
        </button>
      )}

      {/* Sidebar - always rendered, transform only on mobile */}
      <div
        style={{
          transition: 'transform 0.3s ease',
          transform:
            isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
        }}
      >
        <Sidebar onClose={() => isMobile && setSidebarOpen(false)} />
      </div>

      {/* Overlay when sidebar is open on mobile */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 500,
          }}
          className="sidebar-overlay"
        />
      )}

      <main className="main-content">{children}</main>

      {/* CSS for responsive behavior */}
      <style>{`
        .layout > div:nth-child(2) {
          position: relative;
        }

        @media (max-width: 768px) {
          .layout > div:nth-child(2) {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            zIndex: 600;
          }
        }
      `}</style>
    </div>
  );
}
