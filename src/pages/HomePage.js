import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllEvents } from '../api/events';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import {
  FiSearch, FiCalendar, FiMapPin,
  FiUsers, FiArrowRight, FiStar
} from 'react-icons/fi';
import './HomePage.css';

// ── Event Type Config ─────────────────────────────────────────
const EVENT_TYPES = [
  { value: '',            label: 'All Events',   icon: '🎪' },
  { value: 'career_fair', label: 'Career Fair',  icon: '💼' },
  { value: 'concert',     label: 'Concert',      icon: '🎵' },
  { value: 'conference',  label: 'Conference',   icon: '🎤' },
  { value: 'workshop',    label: 'Workshop',     icon: '🛠️' },
  { value: 'hackathon',   label: 'Hackathon',    icon: '💻' },
];

// ── Stats Data ────────────────────────────────────────────────
const PLATFORM_STATS = [
  { value: '500+',  label: 'Events Hosted',     icon: '🎪' },
  { value: '50K+',  label: 'Tickets Sold',       icon: '🎟️' },
  { value: '200+',  label: 'Companies Hiring',   icon: '💼' },
  { value: '10K+',  label: 'Happy Attendees',    icon: '😊' },
];

const HomePage = () => {
  const { isLoggedIn, isHost } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchQuery, setSearch]    = useState('');
  const [activeType, setActiveType] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = { type: activeType || undefined };
      const res    = await getAllEvents(params);
      setEvents(res.data.events.slice(0, 6)); // show 6 on home
    } catch {
      toast.error('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

    // ── Fetch Events ──────────────────────────────────────────
  useEffect(() => {
    fetchEvents();
  }, [activeType]);

  // ── Search ────────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/events?search=${searchQuery}`);
  };

  // ── Event Type Badge ──────────────────────────────────────
  const getTypeBadge = (type) => {
    const map = {
      career_fair : { label: 'Career Fair',  cls: 'badge-accent'   },
      concert     : { label: 'Concert',      cls: 'badge-primary'  },
      conference  : { label: 'Conference',   cls: 'badge-success'  },
      workshop    : { label: 'Workshop',     cls: 'badge-warning'  },
      hackathon   : { label: 'Hackathon',    cls: 'badge-gray'     },
      general     : { label: 'General',      cls: 'badge-gray'     },
    };
    return map[type] || map.general;
  };

  return (
    <div className="home">

      {/* ══════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════ */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__circle hero__circle--1"></div>
          <div className="hero__circle hero__circle--2"></div>
          <div className="hero__circle hero__circle--3"></div>
        </div>

        <div className="container hero__content">
          <div className="hero__badge">
            <FiStar /> India's #1 Event & Career Platform
          </div>

          <h1 className="hero__title">
            Discover Events,<br />
            <span className="hero__title-accent">Get Hired,</span><br />
            Make Memories
          </h1>

          <p className="hero__subtitle">
            Book tickets with unique QR codes, attend career fairs,
            and connect with top companies — all in one platform.
          </p>

          {/* Search Bar */}
          <form className="hero__search" onSubmit={handleSearch}>
            <div className="hero__search-inner">
              <FiSearch className="hero__search-icon" />
              <input
                type="text"
                placeholder="Search events, concerts, career fairs..."
                className="hero__search-input"
                value={searchQuery}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-accent">
                Search
              </button>
            </div>
          </form>

          {/* CTA Buttons */}
          <div className="hero__cta">
            <Link to="/events" className="btn btn-primary btn-lg">
              Browse Events <FiArrowRight />
            </Link>
            {!isLoggedIn && (
              <Link to="/register" className="btn btn-outline-white btn-lg">
                Join Free →
              </Link>
            )}
            {isHost && (
              <Link to="/events/create" className="btn btn-accent btn-lg">
                + Create Event
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS SECTION
      ══════════════════════════════════════════════════════ */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {PLATFORM_STATS.map((stat, i) => (
              <div className="stat-card" key={i}>
                <span className="stat-card__icon">{stat.icon}</span>
                <span className="stat-card__value">{stat.value}</span>
                <span className="stat-card__label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          EVENTS SECTION
      ══════════════════════════════════════════════════════ */}
      <section className="section events-section">
        <div className="container">

          {/* Header */}
          <div className="events-section__header">
            <div>
              <h2 className="section-title">Upcoming Events</h2>
              <p className="section-subtitle">
                Discover and book tickets for the best events near you
              </p>
            </div>
            <Link to="/events" className="btn btn-outline">
              View All <FiArrowRight />
            </Link>
          </div>

          {/* Type Filter */}
          <div className="event-type-filter">
            {EVENT_TYPES.map((type) => (
              <button
                key={type.value}
                className={`type-btn ${activeType === type.value ? 'type-btn--active' : ''}`}
                onClick={() => setActiveType(type.value)}
              >
                {type.icon} {type.label}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          {loading ? (
            <Loader message="Loading events..." />
          ) : events.length === 0 ? (
            <div className="empty-state">
              <p style={{ fontSize: '3rem' }}>🎪</p>
              <h3>No events found</h3>
              <p>Check back soon for upcoming events!</p>
            </div>
          ) : (
            <div className="grid-3">
              {events.map((event) => {
                const badge = getTypeBadge(event.event_type);
                return (
                  <div className="event-card card" key={event.id}>
                    {/* Banner */}
                    <div className="event-card__banner">
                      <div className="event-card__banner-placeholder">
                        {event.event_type === 'career_fair'  && '💼'}
                        {event.event_type === 'concert'      && '🎵'}
                        {event.event_type === 'conference'   && '🎤'}
                        {event.event_type === 'workshop'     && '🛠️'}
                        {event.event_type === 'hackathon'    && '💻'}
                        {event.event_type === 'general'      && '🎪'}
                      </div>
                      <span className={`badge ${badge.cls} event-card__badge`}>
                        {badge.label}
                      </span>
                      {event.is_sold_out && (
                        <span className="event-card__sold-out">SOLD OUT</span>
                      )}
                    </div>

                    {/* Body */}
                    <div className="card-body">
                      <h3 className="event-card__title">{event.title}</h3>
                      <p className="event-card__desc">
                        {event.description.slice(0, 100)}...
                      </p>

                      <div className="event-card__meta">
                        <div className="event-meta-item">
                          <FiCalendar />
                          <span>
                            {new Date(event.date_time).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="event-meta-item">
                          <FiMapPin />
                          <span>{event.city}</span>
                        </div>
                        <div className="event-meta-item">
                          <FiUsers />
                          <span>{event.tickets_remaining} seats left</span>
                        </div>
                      </div>

                      <div className="event-card__footer">
                        <div className="event-card__price">
                          {event.ticket_price === 0 || event.ticket_price === '0.00'
                            ? <span className="price-free">FREE</span>
                            : <span className="price-paid">₹{event.ticket_price}</span>
                          }
                        </div>
                        <Link
                          to={`/events/${event.id}`}
                          className="btn btn-primary btn-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════ */}
      <section className="section how-it-works">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>
            How Eventify Works
          </h2>
          <p className="section-subtitle" style={{ textAlign: 'center' }}>
            Get started in 3 simple steps
          </p>

          <div className="grid-3">
            {[
              {
                step : '01',
                icon : '👤',
                title: 'Create Account',
                desc : 'Sign up as an Attendee to book tickets or as a Host to create events.'
              },
              {
                step : '02',
                icon : '🎟️',
                title: 'Book Your Ticket',
                desc : 'Browse events, purchase tickets securely, and get your unique QR code.'
              },
              {
                step : '03',
                icon : '✅',
                title: 'Attend & Enjoy',
                desc : 'Show your QR code at entry, get scanned, and enjoy the event!'
              },
            ].map((item, i) => (
              <div className="how-card" key={i}>
                <div className="how-card__step">{item.step}</div>
                <div className="how-card__icon">{item.icon}</div>
                <h3 className="how-card__title">{item.title}</h3>
                <p className="how-card__desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CAREER FAIR BANNER
      ══════════════════════════════════════════════════════ */}
      <section className="career-banner">
        <div className="container career-banner__inner">
          <div className="career-banner__content">
            <span className="career-banner__tag">💼 Career Opportunities</span>
            <h2 className="career-banner__title">
              Looking for a Job?<br />Attend Our Career Fairs!
            </h2>
            <p className="career-banner__desc">
              Meet top companies like Google, Microsoft, Amazon and more.
              Get your ticket, submit your resume, and land your dream job!
            </p>
            <Link to="/events?type=career_fair" className="btn btn-accent btn-lg">
              Explore Career Fairs <FiArrowRight />
            </Link>
          </div>
          <div className="career-banner__emoji">💼</div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA SECTION
      ══════════════════════════════════════════════════════ */}
      {!isLoggedIn && (
        <section className="cta-section">
          <div className="container cta-section__inner">
            <h2 className="cta-section__title">
              Ready to Get Started?
            </h2>
            <p className="cta-section__desc">
              Join thousands of event-goers and job seekers on Eventify today!
            </p>
            <div className="cta-section__btns">
              <Link to="/register" className="btn btn-white btn-lg">
                Create Free Account
              </Link>
              <Link to="/events" className="btn btn-outline-white btn-lg">
                Browse Events
              </Link>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

export default HomePage;