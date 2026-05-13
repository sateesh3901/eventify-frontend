import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getHostDashboardStats } from '../../api/stats';
import { getMyEvents, deleteEvent } from '../../api/events';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import {
  FiPlus, FiEdit, FiTrash2,
  FiEye, FiCalendar, FiUsers
} from 'react-icons/fi';
import './Dashboard.css';

const HostDashboard = () => {
  const { user }                  = useAuth();
  const [stats, setStats]         = useState(null);
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [deleting, setDeleting]   = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, eventsRes] = await Promise.all([
        getHostDashboardStats(),
        getMyEvents(),
      ]);
      setStats(statsRes.data.summary);
      setEvents(eventsRes.data.events);
    } catch {
      toast.error('Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(eventId);
    try {
      await deleteEvent(eventId);
      toast.success(`"${title}" deleted successfully!`);
      setEvents(events.filter(e => e.id !== eventId));
    } catch {
      toast.error('Failed to delete event.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <Loader message="Loading host dashboard..." />;

  const STAT_CARDS = [
    { label: 'Total Events',    value: stats?.total_events    || 0, icon: '🎪', color: 'var(--primary)'       },
    { label: 'Tickets Sold',    value: stats?.tickets_sold    || 0, icon: '🎟️', color: 'var(--accent)'        },
    { label: 'Total Revenue',   value: stats?.total_revenue   || '₹0', icon: '💰', color: 'var(--success)'   },
    { label: 'Job Openings',    value: stats?.job_openings    || 0, icon: '💼', color: 'var(--primary-light)' },
  ];

  const getStatusBadge = (status) => {
    const map = {
      upcoming  : 'badge-primary',
      ongoing   : 'badge-success',
      completed : 'badge-gray',
      cancelled : 'badge-danger',
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
                Host Dashboard 🎪
              </h1>
              <p className="dashboard-header__subtitle">
                Manage your events, tickets, and career fair listings
              </p>
            </div>
            <Link to="/events/create" className="btn btn-accent btn-lg">
              <FiPlus /> Create Event
            </Link>
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
                  <span className="dash-stat-card__value" style={{ color: card.color }}>
                    {card.value}
                  </span>
                </div>
                <p className="dash-stat-card__label">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Secondary Stats ── */}
        <div className="grid-4 dashboard-stats">
          {[
            { label: 'Upcoming',     value: stats?.upcoming_events  || 0, icon: '📅' },
            { label: 'Scanned',      value: stats?.tickets_scanned  || 0, icon: '✅' },
            { label: 'Applications', value: stats?.total_applications || 0, icon: '📋' },
            { label: 'Shortlisted',  value: stats?.shortlisted       || 0, icon: '⭐' },
          ].map((card, i) => (
            <div className="dash-mini-card card" key={i}>
              <div className="card-body">
                <span className="dash-mini-card__icon">{card.icon}</span>
                <span className="dash-mini-card__value">{card.value}</span>
                <span className="dash-mini-card__label">{card.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── My Events Table ── */}
        <div className="card">
          <div className="card-body">
            <div className="dash-section-header">
              <h2 className="dash-section-title">My Events</h2>
              <Link to="/events/create" className="btn btn-primary btn-sm">
                <FiPlus /> New Event
              </Link>
            </div>

            {events.length === 0 ? (
              <div className="empty-state">
                <p style={{ fontSize: '3rem' }}>🎪</p>
                <h3>No events yet</h3>
                <p>Create your first event to get started!</p>
                <Link to="/events/create" className="btn btn-primary"
                  style={{ marginTop: '16px' }}>
                  Create Event
                </Link>
              </div>
            ) : (
              <div className="events-table-wrapper">
                <table className="events-table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Tickets</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id}>
                        <td>
                          <p className="table-event-title">{event.title}</p>
                          <p className="table-event-city">
                            <FiUsers size={12} /> {event.tickets_sold} sold
                          </p>
                        </td>
                        <td>
                          <span className="badge badge-primary">
                            {event.event_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <span className="table-date">
                            <FiCalendar size={13} />
                            {new Date(event.date_time).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </span>
                        </td>
                        <td>
                          <div className="table-tickets">
                            <span>{event.tickets_sold}/{event.ticket_limit}</span>
                            <div className="mini-progress">
                              <div
                                className="mini-progress__fill"
                                style={{ width: `${(event.tickets_sold / event.ticket_limit) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadge(event.status)}`}>
                            {event.status}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <Link
                              to={`/events/${event.id}`}
                              className="action-btn action-btn--view"
                              title="View"
                            >
                              <FiEye />
                            </Link>
                            <Link
                              to={`/events/${event.id}/edit`}
                              className="action-btn action-btn--edit"
                              title="Edit"
                            >
                              <FiEdit />
                            </Link>
                            <button
                              className="action-btn action-btn--delete"
                              title="Delete"
                              disabled={deleting === event.id}
                              onClick={() => handleDelete(event.id, event.title)}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HostDashboard;