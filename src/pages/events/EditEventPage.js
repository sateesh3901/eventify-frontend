import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEventDetail, updateEvent } from '../../api/events';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import {
  FiCalendar, FiMapPin, FiUsers,
  FiDollarSign, FiFileText, FiTag, FiSave
} from 'react-icons/fi';
import '../events/CreateEvent.css';

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
  { value: 'cancelled', label: 'Cancelled' },
];

const EditEventPage = () => {
  const { id }                      = useParams();
  const navigate                    = useNavigate();
  const [formData, setFormData]     = useState(null);
  const [errors, setErrors]         = useState({});
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);

  // ── Load Event ────────────────────────────────────────────────
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res   = await getEventDetail(id);
        const event = res.data.event;

        // Format datetime for input
        const dt = new Date(event.date_time);
        const formatted = dt.toISOString().slice(0, 16);

        setFormData({
          title        : event.title,
          description  : event.description,
          event_type   : event.event_type,
          status       : event.status,
          date_time    : formatted,
          venue        : event.venue,
          city         : event.city,
          ticket_limit : event.ticket_limit,
          ticket_price : event.ticket_price,
        });
      } catch {
        toast.error('Event not found.');
        navigate('/dashboard/host');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const validate = () => {
    const err = {};
    if (!formData.title.trim())       err.title        = 'Title is required.';
    if (!formData.description.trim()) err.description  = 'Description is required.';
    if (!formData.date_time)          err.date_time    = 'Date and time is required.';
    if (!formData.venue.trim())       err.venue        = 'Venue is required.';
    if (!formData.city.trim())        err.city         = 'City is required.';
    if (!formData.ticket_limit)       err.ticket_limit = 'Ticket limit is required.';
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      await updateEvent(id, formData);
      toast.success('Event updated successfully! 🎉');
      navigate('/dashboard/host');
    } catch (error) {
      const data = error.response?.data;
      if (data?.errors) setErrors(data.errors);
      toast.error(data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) return <Loader message="Loading event..." />;

  return (
    <div className="create-event-page">

      {/* ── Header ── */}
      <div className="create-event__header">
        <div className="container">
          <h1 className="create-event__title">Edit Event ✏️</h1>
          <p className="create-event__subtitle">
            Update your event details below
          </p>
        </div>
      </div>

      <div className="container">
        <div className="create-event__grid">

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="create-event__form">

            {/* Basic Info */}
            <div className="form-section card">
              <div className="card-body">
                <h3 className="form-section__title">
                  <FiFileText /> Basic Information
                </h3>
                <div className="form-group">
                  <label className="form-label">Event Title *</label>
                  <input
                    type="text"
                    name="title"
                    className={`form-input ${errors.title ? 'input-error' : ''}`}
                    value={formData.title}
                    onChange={handleChange}
                  />
                  {errors.title && <span className="form-error">{errors.title}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    name="description"
                    className={`form-input form-textarea ${errors.description ? 'input-error' : ''}`}
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                  />
                  {errors.description && <span className="form-error">{errors.description}</span>}
                </div>
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

            {/* Date & Location */}
            <div className="form-section card">
              <div className="card-body">
                <h3 className="form-section__title">
                  <FiMapPin /> Date & Location
                </h3>
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
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Venue *</label>
                    <div className="input-wrapper">
                      <FiMapPin className="input-icon" />
                      <input
                        type="text"
                        name="venue"
                        className={`form-input input-with-icon ${errors.venue ? 'input-error' : ''}`}
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
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.city && <span className="form-error">{errors.city}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Tickets */}
            <div className="form-section card">
              <div className="card-body">
                <h3 className="form-section__title">
                  <FiUsers /> Tickets & Pricing
                </h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Ticket Limit *</label>
                    <div className="input-wrapper">
                      <FiUsers className="input-icon" />
                      <input
                        type="number"
                        name="ticket_limit"
                        className={`form-input input-with-icon ${errors.ticket_limit ? 'input-error' : ''}`}
                        value={formData.ticket_limit}
                        onChange={handleChange}
                        min="1"
                      />
                    </div>
                    {errors.ticket_limit && <span className="form-error">{errors.ticket_limit}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ticket Price (₹)</label>
                    <div className="input-wrapper">
                      <FiDollarSign className="input-icon" />
                      <input
                        type="number"
                        name="ticket_price"
                        className="form-input input-with-icon"
                        value={formData.ticket_price}
                        onChange={handleChange}
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
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
                disabled={saving}
              >
                {saving ? (
                  <><span className="btn-spinner"></span> Saving...</>
                ) : (
                  <><FiSave /> Save Changes</>
                )}
              </button>
            </div>

          </form>

          {/* Tips */}
          <div className="create-event__preview">
            <div className="create-tips card">
              <div className="card-body">
                <h4 className="create-tips__title">✏️ Edit Tips</h4>
                <ul className="create-tips__list">
                  <li>✅ You can update any field anytime</li>
                  <li>✅ Changing ticket limit won't cancel existing bookings</li>
                  <li>✅ Status "Cancelled" will hide event from public</li>
                  <li>⚠️ Changing price won't affect existing tickets</li>
                  <li>⚠️ Reducing ticket limit below sold count may cause issues</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EditEventPage;