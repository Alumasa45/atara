import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUserFromToken } from '../api';
import { Home, BarChart3, Calendar, Users, Star, User, BookOpen, ClipboardList, Zap, Clock, DollarSign, LogOut } from 'lucide-react';

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

  const getIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'home': <Home size={20} />,
      'chart': <BarChart3 size={20} />,
      'calendar': <Calendar size={20} />,
      'users': <Users size={20} />,
      'star': <Star size={20} />,
      'user': <User size={20} />,
      'book': <BookOpen size={20} />,
      'clipboard': <ClipboardList size={20} />,
      'zap': <Zap size={20} />,
      'clock': <Clock size={20} />,
      'dollar': <DollarSign size={20} />,
    };
    return iconMap[iconName] || <Home size={20} />;
  };

  const navItems = {
    client: [
      { label: 'Home', path: '/', icon: 'home' },
      { label: 'Dashboard', path: '/dashboard', icon: 'chart' },
      { label: 'Schedule', path: '/schedule', icon: 'calendar' },
      { label: 'Trainers', path: '/trainers', icon: 'users' },
      { label: 'My Profile', path: '/my-profile', icon: 'star' },
      { label: 'Profile', path: '/profile', icon: 'user' },
    ],
    trainer: [
      { label: 'Home', path: '/', icon: 'home' },
      { label: 'Dashboard', path: '/dashboard', icon: 'chart' },
      { label: 'My Sessions', path: '/my-sessions', icon: 'book' },
      { label: 'Student Bookings', path: '/bookings', icon: 'clipboard' },
      { label: 'My Profile', path: '/my-profile', icon: 'star' },
      { label: 'Profile', path: '/profile', icon: 'user' },
    ],
    manager: [
      { label: 'Home', path: '/', icon: 'home' },
      { label: 'Dashboard', path: '/dashboard', icon: 'chart' },
      { label: 'Schedule', path: '/schedule', icon: 'calendar' },
      { label: 'All Bookings', path: '/admin/bookings', icon: 'clipboard' },
      { label: 'Users', path: '/admin/users', icon: 'users' },
      { label: 'Expenses', path: '/expenses', icon: 'dollar' },
    ],
    admin: [
      { label: 'Home', path: '/', icon: 'home' },
      { label: 'Dashboard', path: '/dashboard', icon: 'chart' },
      { label: 'Users', path: '/admin/users', icon: 'users' },
      { label: 'Trainers', path: '/admin/trainers', icon: 'zap' },
      { label: 'Bookings', path: '/admin/bookings', icon: 'clipboard' },
      { label: 'Sessions', path: '/admin/sessions', icon: 'calendar' },
      { label: 'Schedules', path: '/admin/schedules', icon: 'clock' },
      { label: 'Expenses', path: '/expenses', icon: 'dollar' },
      { label: 'My Profile', path: '/my-profile', icon: 'star' },
      { label: 'Profile', path: '/admin/profile', icon: 'user' },
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
            <span className="nav-icon">{getIcon(item.icon)}</span>
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
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </aside>
  );
}
