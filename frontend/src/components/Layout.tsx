import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Auto-open sidebar on desktop, close on mobile
      setSidebarOpen(!mobile);
    };

    handleResize(); // Set initial state
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
      {/* Mobile Header with Hamburger */}
      {isMobile && (
        <div className="mobile-header">
          <button
            onClick={toggleSidebar}
            className="hamburger-btn"
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className="mobile-logo">
            <div className="logo">🧘</div>
            <div>
              <div className="sidebar-title">ATARA</div>
              <div className="sidebar-subtitle">MOVEMENT STUDIO</div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`sidebar-container ${isMobile ? 'mobile' : 'desktop'} ${sidebarOpen ? 'open' : 'closed'}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className={`main-content ${isMobile ? 'mobile' : 'desktop'}`}>
        {children}
      </main>


    </div>
  );
}
