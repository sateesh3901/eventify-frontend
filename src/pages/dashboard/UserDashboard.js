import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserDashboardStats } from '../../api/stats';
import { getMyTickets } from '../../api/tickets';
import { getMyApplications } from '../../api/careerfair';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import {
  FiCalendar, FiCheckCircle, FiBriefcase,
  FiStar, FiClock, FiMapPin, FiUser
} from 'react-icons/fi';
import './Dashboard.css';
import { copyToClipboard, formatTicketCode } from '../../utils/helpers';
import { getMyApplications } from '../../api/careerfair';

const UserDashboard = () => {
  const { user }                    = useAuth();
  const [stats, setStats]           = useState(null);
  const [tickets, setTickets]       = useState([]);
  const [applications, setApps]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState('tickets');

  useEffect(() => {
    fetchAll();
  }, []);

const fetchAll = async () => {
    try {
      const [statsRes, ticketsRes, appsRes] = await Promise.all([
        getUserDashboardStats(),
        getMyTickets(),
        getMyApplications(),
      ]);
      setStats(statsRes?.data?.stats || {});
      setTickets(ticketsRes?.data?.tickets || []);

      // ── Safe applications data ────────────────────────────
      const appsData = appsRes?.data?.applications || appsRes?.data || [];
      setApps(Array.isArray(appsData) ? appsData : []);

    } catch (error) {
      console.log('Dashboard error:', error?.response?.data);
      toast.error('Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Loading your dashboard..." />;

  const STAT_CARDS = [
    {
      label : 'Total Tickets',
      value : stats?.total_tickets || 0,
      icon  : '🎟️',
      color : 'var(--primary)',
    },
    {
      label : 'Upcoming Events',
      value : stats?.upcoming_events || 0,
      icon  : '📅',
      color : 'var(--accent)',
    },
    {
      label : 'Events Attended',
      value : stats?.attended_events || 0,
      icon  : '✅',
      color : 'var(--success)',
    },
    {
      label : 'Job Applications',
      value : stats?.total_applications || 0,
      icon  : '💼',
      color : 'var(--primary-light)',
    },
  ];

  const getStatusBadge = (status) => {
    const map = {
      active      : 'badge-success',
      scanned     : 'badge-gray',
      cancelled   : 'badge-danger',
      applied     : 'badge-primary',
      reviewed    : 'badge-warning',
      shortlisted : 'badge-accent',
      rejected    : 'badge-danger',
      selected    : 'badge-success',
    };
    return map[status] || 'badge-gray';
  };

  return (
    <div className="dashboard-page">

      {/* ── Header ── */}
      <div className="dashboard-header">
        <div className="container">
          <div className="dashboard-header__inner">
            <div>
              <h1 className="dashboard-header__title">
                Welcome back, {user?.username}! 👋
              </h1>
              <p className="dashboard-header__subtitle">
                Here's your Eventify activity overview
              </p>
            </div>
            <div className="dashboard-header__avatar">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      <div className="container dashboard-content">

        {/* ── Stat Cards ── */}
        <div className="grid-4 dashboard-stats">
          {STAT_CARDS.map((card, i) => (
            <div className="dash-stat-card card" key={i}>
              <div className="card-body">
                <div className="dash-stat-card__top">
                  <span className="dash-stat-card__icon">{card.icon}</span>
                  <span
                    className="dash-stat-card__value"
                    style={{ color: card.color }}
                  >
                    {card.value}
                  </span>
                </div>
                <p className="dash-stat-card__label">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Application Status Summary ── */}
        {stats?.total_applications > 0 && (
          <div className="card app-summary">
            <div className="card-body">
              <h3 className="section-title" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>
                💼 Job Application Status
              </h3>
              <div className="app-summary__grid">
                {[
                  { label: 'Applied',     value: stats.total_applications, cls: 'badge-primary' },
                  { label: 'Shortlisted', value: stats.shortlisted,        cls: 'badge-accent'  },
                  { label: 'Selected',    value: stats.selected,            cls: 'badge-success' },
                  { label: 'Rejected',    value: stats.rejected,            cls: 'badge-danger'  },
                ].map((item, i) => (
                  <div className="app-summary__item" key={i}>
                    <span className={`badge ${item.cls}`}>{item.label}</span>
                    <span className="app-summary__count">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="dash-tabs">
          <button
            className={`dash-tab ${activeTab === 'tickets' ? 'dash-tab--active' : ''}`}
            onClick={() => setActiveTab('tickets')}
          >
            🎟️ My Tickets ({tickets.length})
          </button>
          <button
            className={`dash-tab ${activeTab === 'applications' ? 'dash-tab--active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            💼 My Applications ({applications.length})
          </button>
        </div>

        {/* ── Tickets Tab ── */}
        {activeTab === 'tickets' && (
          <div className="dash-tab-content">
            {tickets.length === 0 ? (
              <div className="empty-state">
                <p style={{ fontSize: '3rem' }}>🎟️</p>
                <h3>No tickets yet</h3>
                <p>Browse events and book your first ticket!</p>
                <Link to="/events" className="btn btn-primary"
                  style={{ marginTop: '16px' }}>
                  Browse Events
                </Link>
              </div>
            ) : (
              <div className="tickets-list">
                {tickets.map((ticket) => (
                  <div className="ticket-card card" key={ticket.id}>
                    <div className="card-body">
                      <div className="ticket-card__inner">

                        {/* QR Code */}
                        <div className="ticket-card__qr">
                          {ticket.qr_code ? (
                            <img
                              src={`${process.env.REACT_APP_MEDIA_URL}/media/${ticket.qr_code}`}
                              alt="QR Code"
                            />
                          ) : (
                            <div className="ticket-card__qr-placeholder">🎟️</div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="ticket-card__info">
                          <h3 className="ticket-card__event">
                            {ticket.event?.title}
                          </h3>
                          <div className="ticket-meta">
                            <span className="ticket-meta-item">
                              <FiCalendar />
                              {new Date(ticket.event?.date_time).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </span>
                            <span className="ticket-meta-item">
                              <FiMapPin /> {ticket.event?.city}
                            </span>
                          </div>
                          {/* // Replace ticket code p tag: */}
                          <p
                            className="ticket-card__code"
                            onClick={async () => {
                              const ok = await copyToClipboard(String(ticket.ticket_code));
                              if (ok) toast.success('Ticket code copied!');
                            }}
                            style={{ cursor: 'pointer' }}
                            title="Click to copy"
                          >
                            #{formatTicketCode(ticket.ticket_code)} 📋
                          </p>
                        </div>

                        {/* Status */}
                        <div className="ticket-card__status">
                          <span className={`badge ${getStatusBadge(ticket.status)}`}>
                            {ticket.status}
                          </span>
                          <span className={`badge ${getStatusBadge(ticket.payment_status)}`}
                            style={{ marginTop: '8px' }}>
                            {ticket.payment_status}
                          </span>
                        </div>

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Applications Tab ── */}
        {activeTab === 'applications' && (
          <div className="dash-tab-content">
            {applications.length === 0 ? (
              <div className="empty-state">
                <p style={{ fontSize: '3rem' }}>💼</p>
                <h3>No applications yet</h3>
                <p>Attend a career fair and apply for jobs!</p>
                <Link to="/events?type=career_fair" className="btn btn-primary"
                  style={{ marginTop: '16px' }}>
                  Find Career Fairs
                </Link>
              </div>
            ) : (
              <div className="applications-list">
                {applications.map((app) => (
                  <div className="app-card card" key={app.id}>
                    <div className="card-body">
                      <div className="app-card__inner">
                        <div className="app-card__info">
                          <h3 className="app-card__title">{app.job_title}</h3>
                          <p className="app-card__company">🏢 {app.company}</p>
                          <p className="app-card__date">
                            <FiClock />
                            Applied {new Date(app.applied_at).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <span className={`badge ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default UserDashboard;