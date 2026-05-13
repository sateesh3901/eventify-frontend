import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../api/auth';
import toast from 'react-hot-toast';
import {
  FiMenu, FiX, FiLogOut,
  FiCalendar, FiHome, FiGrid
} from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, isLoggedIn, logout, isHost, isAdmin } = useAuth();
  const navigate  = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      await logoutUser({ refresh });
    } catch {}
    logout();
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/dashboard/admin';
    if (isHost)  return '/dashboard/host';
    return '/dashboard/user';
  };

  return (
    <nav className="navbar">
      <div className="container navbar__inner">

        {/* ── Logo ── */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">🎪</span>
          <span className="navbar__logo-text">
            Event<span>ify</span>
          </span>
        </Link>

        {/* ── Desktop Links ── */}
        <ul className="navbar__links">
          <li><Link to="/" className="navbar__link">
            <FiHome /> Home
          </Link></li>
          <li><Link to="/events" className="navbar__link">
            <FiCalendar /> Events
          </Link></li>
          {isLoggedIn && (
            <li><Link to={getDashboardLink()} className="navbar__link">
              <FiGrid /> Dashboard
            </Link></li>
          )}
          {isHost && (
            <li>
              <Link to="/scanner" className="navbar__link">
                📷 Scanner
              </Link>
            </li>
          )}
        </ul>

        {/* ── Auth Buttons ── */}
        <div className="navbar__auth">
          {isLoggedIn ? (
            <div className="navbar__user">
              <div className="navbar__user-info">
                <span className="navbar__avatar">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
                <div className="navbar__user-details">
                  <span className="navbar__username">{user?.username}</span>
                  <span className="navbar__role">{user?.role}</span>
                </div>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={handleLogout}
              >
                <FiLogOut /> Logout
              </button>
            </div>
          ) : (
            <div className="navbar__guest">
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* ── Mobile Toggle ── */}
        <button
          className="navbar__toggle"
          onClick={() => setOpen(!open)}
        >
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* ── Mobile Menu ── */}
      {open && (
        <div className="navbar__mobile">
          <Link to="/"       onClick={() => setOpen(false)}>Home</Link>
          <Link to="/events" onClick={() => setOpen(false)}>Events</Link>
          {isLoggedIn && (
            <Link to={getDashboardLink()} onClick={() => setOpen(false)}>
              Dashboard
            </Link>
          )}
          {isLoggedIn ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <Link to="/login"    onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;