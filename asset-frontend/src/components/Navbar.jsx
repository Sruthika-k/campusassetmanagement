import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, hasRole, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link to="/dashboard" className="sidebar-brand">
          <div className="sidebar-logo-mark">
            <div className="logo-square square-1"></div>
            <div className="logo-square square-2"></div>
          </div>
          <span className="sidebar-brand-title">AssetFlow</span>
        </Link>
      </div>

      <div className="sidebar-nav-section">
        <div className="sidebar-nav-label">NAVIGATION</div>
        <nav className="sidebar-nav">
          <Link
            to="/dashboard"
            className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span className="sidebar-link-label">Dashboard</span>
          </Link>
          <Link
            to="/assets"
            className={`sidebar-link ${isActive('/assets') ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            <span className="sidebar-link-label">Assets</span>
          </Link>
          <Link
            to="/borrow"
            className={`sidebar-link ${isActive('/borrow') ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
            <span className="sidebar-link-label">Borrows</span>
          </Link>
          <Link
            to="/issues"
            className={`sidebar-link ${isActive('/issues') ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
            <span className="sidebar-link-label">Maintenance</span>
          </Link>
        </nav>
      </div>

      {hasRole && hasRole(['ADMIN']) && (
        <div className="sidebar-nav-section">
          <div className="sidebar-nav-label" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 20 }}>ADMIN</div>
          <nav className="sidebar-nav">
            <Link
              to="/admin/departments"
              className={`sidebar-link ${isActive('/admin/departments') ? 'active' : ''}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="2"></line><line x1="8" y1="6" x2="20" y2="6"></line><line x1="8" y1="10" x2="20" y2="10"></line><line x1="8" y1="14" x2="20" y2="14"></line><line x1="8" y1="18" x2="20" y2="18"></line></svg>
              <span className="sidebar-link-label">Departments</span>
            </Link>
            <Link
              to="/admin/rooms"
              className={`sidebar-link ${isActive('/admin/rooms') ? 'active' : ''}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              <span className="sidebar-link-label">Rooms</span>
            </Link>
            <Link
              to="/admin/users"
              className={`sidebar-link ${isActive('/admin/users') ? 'active' : ''}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              <span className="sidebar-link-label">Users</span>
            </Link>
            <Link
              to="/admin/settings"
              className={`sidebar-link ${isActive('/admin/settings') ? 'active' : ''}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              <span className="sidebar-link-label">Settings</span>
            </Link>
          </nav>
        </div>
      )}

      <div className="sidebar-footer">
        <div className="sidebar-footer-divider"></div>
        {user ? (
          <div className="sidebar-user-block">
            <div className="sidebar-user-info">
              <div className="sidebar-avatar">
                {getUserInitials(user.name)}
              </div>
              <div className="sidebar-meta">
                <span className="sidebar-name" title={user.name}>{user.name}</span>
                <span className="sidebar-role">{user.role}</span>
              </div>
            </div>
            <button className="sidebar-logout-icon" onClick={handleLogout} title="Logout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary" style={{width: '100%', justifyContent:'center'}}>
            Login
          </Link>
        )}
      </div>
    </aside>
  );
};

export default Navbar;
