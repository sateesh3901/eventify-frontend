import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllEvents } from '../../api/events';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import {
  FiSearch, FiCalendar, FiMapPin,
  FiUsers, FiFilter, FiX
} from 'react-icons/fi';
import './Events.css';
import { SkeletonGrid } from '../../components/common/SkeletonCard';

// ── Constants ─────────────────────────────────────────────────
const EVENT_TYPES = [
  { value: '',            label: 'All',         icon: '🎪' },
  { value: 'career_fair', label: 'Career Fair', icon: '💼' },
  { value: 'concert',     label: 'Concert',     icon: '🎵' },
  { value: 'conference',  label: 'Conference',  icon: '🎤' },
  { value: 'workshop',    label: 'Workshop',    icon: '🛠️' },
  { value: 'hackathon',   label: 'Hackathon',   icon: '💻' },
  { value: 'general',     label: 'General',     icon: '✨' },
];

const TYPE_BADGE = {
  career_fair : { label: 'Career Fair', cls: 'badge-accent'  },
  concert     : { label: 'Concert',     cls: 'badge-primary' },
  conference  : { label: 'Conference',  cls: 'badge-success' },
  workshop    : { label: 'Workshop',    cls: 'badge-warning' },
  hackathon   : { label: 'Hackathon',   cls: 'badge-gray'    },
  general     : { label: 'General',     cls: 'badge-gray'    },
};

const EventsPage = () => {
  const [searchParams]              = useSearchParams();
  const [events, setEvents]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState(searchParams.get('search') || '');
  const [activeType, setActiveType] = useState(searchParams.get('type') || '');
  const [searchInput, setSearchInput] = useState(search);

  // ── Fetch Events ─────────────────────────────────────────────
  useEffect(() => {
    fetchEvents();
  }, [activeType, search]);

const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {
        type   : activeType || undefined,
        search : search     || undefined,
      };
      const res = await getAllEvents(params);

      // ── Safe check ────────────────────────────────────────
      const eventsData = res?.data?.events || res?.data || [];
      setEvents(Array.isArray(eventsData) ? eventsData : []);

    } catch {
      toast.error('Failed to load events.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setActiveType('');
  };

  const hasFilters = search || activeType;

  return (
    <div className="events-page">

      {/* ── Page Header ── */}
      <div className="events-page__header">
        <div className="container">
          <h1 className="events-page__title">Browse Events</h1>
          <p className="events-page__subtitle">
            Discover concerts, career fairs, workshops & more
          </p>

          {/* Search */}
          <form className="events-search" onSubmit={handleSearch}>
            <div className="events-search__inner">
              <FiSearch className="events-search__icon" />
              <input
                type="text"
                placeholder="Search by event name, city, or keyword..."
                className="events-search__input"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  type="button"
                  className="events-search__clear"
                  onClick={() => { setSearchInput(''); setSearch(''); }}
                >
                  <FiX />
                </button>
              )}
              <button type="submit" className="btn btn-primary">
                <FiSearch /> Search
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="container">

        {/* ── Type Filter ── */}
        <div className="events-filter">
          <div className="events-filter__types">
            <FiFilter className="filter-icon" />
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

          {hasFilters && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              <FiX /> Clear Filters
            </button>
          )}
        </div>

        {/* ── Results Count ── */}
        {!loading && (
          <p className="events-count">
            Showing <strong>{events.length}</strong> event{events.length !== 1 ? 's' : ''}
            {search && <span> for "<strong>{search}</strong>"</span>}
            {activeType && <span> in <strong>{EVENT_TYPES.find(t => t.value === activeType)?.label}</strong></span>}
          </p>
        )}

        {/* ── Events Grid ── */}
        {loading ? <SkeletonGrid count={6} />  : events.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: '3.5rem' }}>🔍</p>
            <h3>No events found</h3>
            <p>Try adjusting your search or filters</p>
            <button className="btn btn-outline" onClick={clearFilters}
              style={{ marginTop: '16px' }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid-3" style={{ marginBottom: '60px' }}>
            {events.map((event) => {
              const badge = TYPE_BADGE[event.event_type] || TYPE_BADGE.general;
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
                        <span>{event.venue}, {event.city}</span>
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
    </div>
  );
};

export default EventsPage;