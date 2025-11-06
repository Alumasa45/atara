import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUserFromToken } from '../api';

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getCurrentUserFromToken();

  const handleLogout = () => {
    localStorage.removeItem('token');
    onClose?.();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = {
    client: [
      { label: 'Home', path: '/', icon: '🏠' },
      { label: 'Dashboard', path: '/dashboard', icon: '📊' },
      { label: 'Schedule', path: '/schedule', icon: '📅' },
      { label: 'Trainers', path: '/trainers', icon: '👥' },
      { label: 'My Profile', path: '/my-profile', icon: '⭐' },
      { label: 'Profile', path: '/profile', icon: '👤' },
    ],
    trainer: [
      { label: 'Home', path: '/', icon: '🏠' },
      { label: 'Dashboard', path: '/dashboard', icon: '📊' },
      { label: 'My Sessions', path: '/my-sessions', icon: '📚' },
      { label: 'Student Bookings', path: '/bookings', icon: '📋' },
      { label: 'My Profile', path: '/my-profile', icon: '⭐' },
      { label: 'Profile', path: '/profile', icon: '👤' },
    ],
    manager: [
      { label: 'Home', path: '/', icon: '🏠' },
      { label: 'Dashboard', path: '/dashboard', icon: '📊' },
      { label: 'Schedule', path: '/schedule', icon: '📅' },
      { label: 'All Bookings', path: '/admin/bookings', icon: '📋' },
      { label: 'Users', path: '/admin/users', icon: '👥' },
    ],
    admin: [
      { label: 'Home', path: '/', icon: '🏠' },
      { label: 'Dashboard', path: '/dashboard', icon: '📊' },
      { label: 'Users', path: '/admin/users', icon: '👥' },
      { label: 'Trainers', path: '/admin/trainers', icon: '⚡' },
      { label: 'Bookings', path: '/admin/bookings', icon: '📋' },
      { label: 'Sessions', path: '/admin/sessions', icon: '📅' },
      { label: 'Schedules', path: '/admin/schedules', icon: '⏰' },
      { label: 'My Profile', path: '/my-profile', icon: '⭐' },
      { label: 'Profile', path: '/admin/profile', icon: '👤' },
    ],
  };

  const userRole = (currentUser?.role as keyof typeof navItems) || 'client';
  const items = navItems[userRole] || navItems.client;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">A</div>
        <div>
          <div className="sidebar-title">Atara</div>
          <div className="sidebar-subtitle">Studio</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar">
          {currentUser?.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="user-info">
          <div className="user-name">{currentUser?.username || 'User'}</div>
          <div className="user-role">{userRole}</div>
        </div>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        <span>🚪</span>
        <span>Logout</span>
      </button>
    </aside>
  );
}
