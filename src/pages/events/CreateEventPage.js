import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../../api/events';
import toast from 'react-hot-toast';
import {
  FiCalendar, FiMapPin, FiUsers,
  FiDollarSign, FiFileText, FiTag
} from 'react-icons/fi';
import './CreateEvent.css';

const EVENT_TYPES = [
  { value: 'general',     label: '✨ General Event'  },
  { value: 'career_fair', label: '💼 Career Fair'    },
  { value: 'concert',     label: '🎵 Concert'        },
  { value: 'workshop',    label: '🛠️ Workshop'       },
  { value: 'conference',  label: '🎤 Conference'     },
  { value: 'hackathon',   label: '💻 Hackathon'      },
];

const STATUS_OPTIONS = [
  { value: 'upcoming',  label: 'Upcoming'  },
  { value: 'ongoing',   label: 'Ongoing'   },
  { value: 'completed', label: 'Completed' },
];

const INITIAL_STATE = {
  title        : '',
  description  : '',
  event_type   : 'general',
  status       : 'upcoming',
  date_time    : '',
  venue        : '',
  city         : '',
  ticket_limit : '',
  ticket_price : '',
};

const CreateEventPage = () => {
  const navigate              = useNavigate();
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);

  // ── Handle Input ─────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  // ── Validate ─────────────────────────────────────────────────
  const validate = () => {
    const err = {};
    if (!formData.title.trim())       err.title        = 'Title is required.';
    if (!formData.description.trim()) err.description  = 'Description is required.';
    if (!formData.date_time)          err.date_time    = 'Date and time is required.';
    if (!formData.venue.trim())       err.venue        = 'Venue is required.';
    if (!formData.city.trim())        err.city         = 'City is required.';
    if (!formData.ticket_limit)       err.ticket_limit = 'Ticket limit is required.';
    else if (formData.ticket_limit < 1) err.ticket_limit = 'Must be at least 1.';
    if (formData.ticket_price === '')  err.ticket_price = 'Ticket price is required (0 for free).';
    else if (formData.ticket_price < 0) err.ticket_price = 'Price cannot be negative.';
    return err;
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the errors below.');
      return;
    }

    setLoading(true);
    try {
      const res = await createEvent(formData);
      toast.success(`🎉 "${res.data.event.title}" created successfully!`);
      navigate('/dashboard/host');
    } catch (error) {
      const data = error.response?.data;
      if (data?.errors) setErrors(data.errors);
      toast.error(data?.message || 'Failed to create event.');
    } finally {
      setLoading(false);
    }
  };

  // ── Preview Card ─────────────────────────────────────────────
  const isFree = formData.ticket_price === '0' || formData.ticket_price === '';

  return (
    <div className="create-event-page">

      {/* ── Header ── */}
      <div className="create-event__header">
        <div className="container">
          <h1 className="create-event__title">Create New Event 🎪</h1>
          <p className="create-event__subtitle">
            Fill in the details below to publish your event
          </p>
        </div>
      </div>

      <div className="container">
        <div className="create-event__grid">

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="create-event__form">

            {/* ── Basic Info ── */}
            <div className="form-section card">
              <div className="card-body">
                <h3 className="form-section__title">
                  <FiFileText /> Basic Information
                </h3>

                {/* Title */}
                <div className="form-group">
                  <label className="form-label">Event Title *</label>
                  <input
                    type="text"
                    name="title"
                    className={`form-input ${errors.title ? 'input-error' : ''}`}
                    placeholder="e.g. Google & Microsoft Career Fair 2026"
                    value={formData.title}
                    onChange={handleChange}
                  />
                  {errors.title && <span className="form-error">{errors.title}</span>}
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    name="description"
                    className={`form-input form-textarea ${errors.description ? 'input-error' : ''}`}
                    placeholder="Describe your event in detail..."
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                  />
                  {errors.description && <span className="form-error">{errors.description}</span>}
                </div>

                {/* Event Type + Status */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Event Type *</label>
                    <div className="select-wrapper">
                      <FiTag className="select-icon" />
                      <select
                        name="event_type"
                        className="form-input form-select"
                        value={formData.event_type}
                        onChange={handleChange}
                      >
                        {EVENT_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status *</label>
                    <div className="select-wrapper">
                      <select
                        name="status"
                        className="form-input form-select"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* ── Date & Location ── */}
            <div className="form-section card">
              <div className="card-body">
                <h3 className="form-section__title">
                  <FiMapPin /> Date & Location
                </h3>

                {/* Date Time */}
                <div className="form-group">
                  <label className="form-label">Date & Time *</label>
                  <div className="input-wrapper">
                    <FiCalendar className="input-icon" />
                    <input
                      type="datetime-local"
                      name="date_time"
                      className={`form-input input-with-icon ${errors.date_time ? 'input-error' : ''}`}
                      value={formData.date_time}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.date_time && <span className="form-error">{errors.date_time}</span>}
                </div>

                {/* Venue + City */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Venue *</label>
                    <div className="input-wrapper">
                      <FiMapPin className="input-icon" />
                      <input
                        type="text"
                        name="venue"
                        className={`form-input input-with-icon ${errors.venue ? 'input-error' : ''}`}
                        placeholder="e.g. HICC Convention Center"
                        value={formData.venue}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.venue && <span className="form-error">{errors.venue}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <div className="input-wrapper">
                      <FiMapPin className="input-icon" />
                      <input
                        type="text"
                        name="city"
                        className={`form-input input-with-icon ${errors.city ? 'input-error' : ''}`}
                        placeholder="e.g. Hyderabad"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.city && <span className="form-error">{errors.city}</span>}
                  </div>
                </div>

              </div>
            </div>

            {/* ── Tickets & Pricing ── */}
            <div className="form-section card">
              <div className="card-body">
                <h3 className="form-section__title">
                  <FiUsers /> Tickets & Pricing
                </h3>

                <div className="form-row">
                  {/* Ticket Limit */}
                  <div className="form-group">
                    <label className="form-label">Ticket Limit *</label>
                    <div className="input-wrapper">
                      <FiUsers className="input-icon" />
                      <input
                        type="number"
                        name="ticket_limit"
                        className={`form-input input-with-icon ${errors.ticket_limit ? 'input-error' : ''}`}
                        placeholder="e.g. 500"
                        value={formData.ticket_limit}
                        onChange={handleChange}
                        min="1"
                      />
                    </div>
                    {errors.ticket_limit && <span className="form-error">{errors.ticket_limit}</span>}
                  </div>

                  {/* Ticket Price */}
                  <div className="form-group">
                    <label className="form-label">Ticket Price (₹) *</label>
                    <div className="input-wrapper">
                      <FiDollarSign className="input-icon" />
                      <input
                        type="number"
                        name="ticket_price"
                        className={`form-input input-with-icon ${errors.ticket_price ? 'input-error' : ''}`}
                        placeholder="0 for free event"
                        value={formData.ticket_price}
                        onChange={handleChange}
                        min="0"
                        max="99"
                      />
                    </div>
                    {errors.ticket_price && <span className="form-error">{errors.ticket_price}</span>}
                    <span className="form-hint">Enter 0 for a free event</span>
                  </div>
                </div>

              </div>
            </div>

            {/* ── Submit Buttons ── */}
            <div className="create-event__actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/dashboard/host')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                {loading ? (
                  <><span className="btn-spinner"></span> Creating...</>
                ) : (
                  '🎪 Publish Event'
                )}
              </button>
            </div>

          </form>

          {/* ── Live Preview ── */}
          <div className="create-event__preview">
            <div className="preview-card card">
              <div className="preview-card__banner">
                <div className="preview-card__emoji">
                  {formData.event_type === 'career_fair'  && '💼'}
                  {formData.event_type === 'concert'      && '🎵'}
                  {formData.event_type === 'conference'   && '🎤'}
                  {formData.event_type === 'workshop'     && '🛠️'}
                  {formData.event_type === 'hackathon'    && '💻'}
                  {formData.event_type === 'general'      && '🎪'}
                </div>
                <span className="badge badge-accent preview-card__badge">
                  {EVENT_TYPES.find(t => t.value === formData.event_type)?.label}
                </span>
              </div>
              <div className="card-body">
                <h3 className="preview-card__title">
                  {formData.title || 'Your Event Title'}
                </h3>
                <p className="preview-card__desc">
                  {formData.description
                    ? formData.description.slice(0, 100) + '...'
                    : 'Your event description will appear here...'}
                </p>
                <div className="preview-card__meta">
                  {formData.date_time && (
                    <div className="event-meta-item">
                      <FiCalendar />
                      <span>
                        {new Date(formData.date_time).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  {formData.city && (
                    <div className="event-meta-item">
                      <FiMapPin />
                      <span>{formData.venue ? `${formData.venue}, ` : ''}{formData.city}</span>
                    </div>
                  )}
                  {formData.ticket_limit && (
                    <div className="event-meta-item">
                      <FiUsers />
                      <span>{formData.ticket_limit} seats available</span>
                    </div>
                  )}
                </div>
                <div className="preview-card__footer">
                  <span className={isFree ? 'price-free' : 'price-paid'}>
                    {isFree ? 'FREE' : `₹${formData.ticket_price}`}
                  </span>
                  <span className="btn btn-primary btn-sm" style={{ cursor: 'default' }}>
                    View Details
                  </span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="create-tips card">
              <div className="card-body">
                <h4 className="create-tips__title">💡 Tips for Success</h4>
                <ul className="create-tips__list">
                  <li>✅ Add a clear, descriptive title</li>
                  <li>✅ Write a detailed description</li>
                  <li>✅ Set a realistic ticket limit</li>
                  <li>✅ Set price to 0 for free events</li>
                  <li>✅ Double-check date and venue</li>
                </ul>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;