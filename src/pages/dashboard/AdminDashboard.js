import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboardStats } from '../../api/stats';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import {
  FiUsers, FiCalendar, FiTrendingUp,
  FiAward, FiBriefcase, FiActivity
} from 'react-icons/fi';
import './Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await getAdminDashboardStats();
      setStats(res.data);
    } catch {
      toast.error('Failed to load admin stats.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Loading admin dashboard..." />;

  const STAT_CARDS = [
    { label: 'Total Users',        value: stats?.platform_summary?.total_users,        icon: '👤', color: 'var(--primary)'       },
    { label: 'Total Hosts',        value: stats?.platform_summary?.total_hosts,        icon: '🎪', color: 'var(--accent)'        },
    { label: 'Total Events',       value: stats?.platform_summary?.total_events,       icon: '📅', color: 'var(--primary-light)' },
    { label: 'Tickets Sold',       value: stats?.platform_summary?.total_tickets_sold, icon: '🎟️', color: 'var(--success)'      },
    { label: 'Total Revenue',      value: stats?.platform_summary?.total_revenue,      icon: '💰', color: 'var(--success)'      },
    { label: 'Job Openings',       value: stats?.platform_summary?.total_job_openings, icon: '💼', color: 'var(--warning)'      },
    { label: 'Applications',       value: stats?.platform_summary?.total_applications, icon: '📋', color: 'var(--info)'         },
    { label: 'Active Events',      value: stats?.platform_summary?.active_events,      icon: '🔥', color: 'var(--danger)'       },
  ];

  return (
    <div className="dashboard-page">

      {/* ── Header ── */}
      <div className="dashboard-header">
        <div className="container">
          <div className="dashboard-header__inner">
            <div>
              <h1 className="dashboard-header__title">
                Admin Dashboard 🛡️
              </h1>
              <p className="dashboard-header__subtitle">
                Platform-wide overview and analytics
              </p>
            </div>
            <div className="admin-header-badges">
              <span className="badge badge-accent">
                <FiActivity /> Live Stats
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container dashboard-content">

        {/* ── Platform Stats Grid ── */}
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
                    {card.value ?? 0}
                  </span>
                </div>
                <p className="dash-stat-card__label">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Top Events Table ── */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-body">
            <div className="dash-section-header">
              <h2 className="dash-section-title">
                🏆 Top Events by Ticket Sales
              </h2>
              <Link to="/events" className="btn btn-outline btn-sm">
                View All Events
              </Link>
            </div>

            {stats?.top_events?.length === 0 ? (
              <div className="empty-state">
                <p style={{ fontSize: '2.5rem' }}>📅</p>
                <h3>No events yet</h3>
              </div>
            ) : (
              <div className="events-table-wrapper">
                <table className="events-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Event</th>
                      <th>Type</th>
                      <th>Host</th>
                      <th>Tickets Sold</th>
                      <th>Capacity</th>
                      <th>Fill Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.top_events?.map((event, i) => {
                      const fillRate = Math.round(
                        (event.tickets_sold / event.ticket_limit) * 100
                      );
                      return (
                        <tr key={event.event_id}>
                          <td>
                            <span className="rank-badge">
                              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                            </span>
                          </td>
                          <td>
                            <Link
                              to={`/events/${event.event_id}`}
                              className="table-event-title"
                              style={{ textDecoration: 'none' }}
                            >
                              {event.title}
                            </Link>
                          </td>
                          <td>
                            <span className="badge badge-primary">
                              {event.event_type.replace('_', ' ')}
                            </span>
                          </td>
                          <td>
                            <div className="host-pill">
                              <span className="host-pill__avatar">
                                {event.host?.charAt(0).toUpperCase()}
                              </span>
                              <span>{event.host}</span>
                            </div>
                          </td>
                          <td>
                            <strong style={{ color: 'var(--primary)' }}>
                              {event.tickets_sold}
                            </strong>
                          </td>
                          <td>{event.ticket_limit}</td>
                          <td>
                            <div className="fill-rate">
                              <div className="mini-progress" style={{ width: '80px' }}>
                                <div
                                  className="mini-progress__fill"
                                  style={{
                                    width     : `${fillRate}%`,
                                    background: fillRate > 80
                                      ? 'var(--success)'
                                      : fillRate > 50
                                      ? 'var(--warning)'
                                      : 'var(--primary-light)'
                                  }}
                                ></div>
                              </div>
                              <span className="fill-rate__pct">{fillRate}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Platform Health Cards ── */}
        <div className="grid-3">
          {[
            {
              title : '👥 User Breakdown',
              icon  : <FiUsers />,
              items : [
                { label: 'Attendees', value: stats?.platform_summary?.total_users,   color: 'var(--primary)'       },
                { label: 'Hosts',     value: stats?.platform_summary?.total_hosts,   color: 'var(--accent)'        },
                { label: 'Admins',    value: stats?.platform_summary?.total_admins,  color: 'var(--primary-light)' },
              ]
            },
            {
              title : '📅 Event Breakdown',
              icon  : <FiCalendar />,
              items : [
                { label: 'Total',   value: stats?.platform_summary?.total_events,  color: 'var(--primary)'  },
                { label: 'Active',  value: stats?.platform_summary?.active_events, color: 'var(--success)'  },
                { label: 'Tickets', value: stats?.platform_summary?.total_tickets_sold, color: 'var(--accent)' },
              ]
            },
            {
              title : '💼 Career Fair Stats',
              icon  : <FiBriefcase />,
              items : [
                { label: 'Job Openings',  value: stats?.platform_summary?.total_job_openings, color: 'var(--primary)'       },
                { label: 'Applications', value: stats?.platform_summary?.total_applications,  color: 'var(--accent)'        },
                { label: 'Revenue',      value: stats?.platform_summary?.total_revenue,        color: 'var(--success)'       },
              ]
            },
          ].map((section, i) => (
            <div className="card" key={i}>
              <div className="card-body">
                <h3 className="dash-section-title" style={{ marginBottom: '20px' }}>
                  {section.title}
                </h3>
                <div className="health-items">
                  {section.items.map((item, j) => (
                    <div className="health-item" key={j}>
                      <span className="health-item__label">{item.label}</span>
                      <span
                        className="health-item__value"
                        style={{ color: item.color }}
                      >
                        {item.value ?? 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;