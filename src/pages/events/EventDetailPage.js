import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEventDetail } from '../../api/events';
import { purchaseTicket, createPaymentOrder, verifyPayment } from '../../api/tickets';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import {
  FiCalendar, FiMapPin, FiUsers, FiClock,
  FiUser, FiArrowLeft, FiCheck
} from 'react-icons/fi';
import './Events.css';
import { getCountdown } from '../../utils/helpers';

const EventDetailPage = () => {
  const { id }                      = useParams();
  const navigate                    = useNavigate();
  const { isLoggedIn, user }        = useAuth();
  const [event, setEvent]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [booking, setBooking]       = useState(false);
  const [ticketBooked, setTicketBooked] = useState(false);

  // Add this state + effect:
const [countdown, setCountdown] = useState(null);

useEffect(() => {
  if (!event) return;
  const timer = setInterval(() => {
    setCountdown(getCountdown(event.date_time));
  }, 1000);
  return () => clearInterval(timer);
}, [event]);

  // ── Fetch Event ──────────────────────────────────────────────
  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await getEventDetail(id);
      setEvent(res.data.event);
    } catch {
      toast.error('Event not found.');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  // ── Handle Booking ───────────────────────────────────────────
  const handleBooking = async () => {
    if (!isLoggedIn) {
      toast.error('Please login to book a ticket!');
      navigate('/login');
      return;
    }

    setBooking(true);

    try {
      // ── Free Event ───────────────────────────────────────────
      if (event.ticket_price === 0 || event.ticket_price === '0.00') {
        const res = await purchaseTicket(event.id);
        toast.success('🎉 Ticket booked successfully!');
        setTicketBooked(true);
        return;
      }

      // ── Paid Event — Razorpay ────────────────────────────────
      const orderRes = await createPaymentOrder(event.id);
      const { order_id, amount, razorpay_key_id } = orderRes.data;

      const options = {
        key         : razorpay_key_id,
        amount      : amount * 100,
        currency    : 'INR',
        name        : 'Eventify',
        description : `Ticket for ${event.title}`,
        order_id    : order_id,
        handler     : async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id   : response.razorpay_order_id,
              razorpay_payment_id : response.razorpay_payment_id,
              razorpay_signature  : response.razorpay_signature,
            });
            toast.success('🎉 Payment successful! Ticket confirmed!');
            setTicketBooked(true);
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: {
          name  : user?.username,
          email : user?.email,
        },
        theme: { color: '#1F3864' },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      const msg = error.response?.data?.message || 'Booking failed. Try again.';
      toast.error(msg);
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <Loader message="Loading event details..." />;
  if (!event)  return null;

  const isFree    = event.ticket_price === 0 || event.ticket_price === '0.00';
  const eventDate = new Date(event.date_time);

  return (
    <div className="event-detail-page">

      {/* ── Back Button ── */}
      <div className="container" style={{ paddingTop: '24px' }}>
        <Link to="/events" className="back-btn">
          <FiArrowLeft /> Back to Events
        </Link>
      </div>

      {/* ── Hero Banner ── */}
      <div className="event-detail__banner">
        <div className="event-detail__banner-content">
          <span className="badge badge-accent" style={{ marginBottom: '16px' }}>
            {event.event_type.replace('_', ' ').toUpperCase()}
          </span>
          <h1 className="event-detail__title">{event.title}</h1>
          <p className="event-detail__host">
            Hosted by <strong>{event.host?.username}</strong>
          </p>
        </div>
      </div>

      <div className="container">
        <div className="event-detail__grid">

          {/* ── Left — Main Info ── */}
          <div className="event-detail__main">

            {/* Quick Info Cards */}
            <div className="event-info-cards">
              <div className="event-info-card">
                <FiCalendar className="event-info-card__icon" />
                <div>
                  <span className="event-info-card__label">Date</span>
                  <span className="event-info-card__value">
                    {eventDate.toLocaleDateString('en-IN', {
                      weekday: 'long', day: 'numeric',
                      month: 'long', year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              <div className="event-info-card">
                <FiClock className="event-info-card__icon" />
                <div>
                  <span className="event-info-card__label">Time</span>
                  <span className="event-info-card__value">
                    {eventDate.toLocaleTimeString('en-IN', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              <div className="event-info-card">
                <FiMapPin className="event-info-card__icon" />
                <div>
                  <span className="event-info-card__label">Venue</span>
                  <span className="event-info-card__value">
                    {event.venue}, {event.city}
                  </span>
                </div>
              </div>
              <div className="event-info-card">
                <FiUsers className="event-info-card__icon" />
                <div>
                  <span className="event-info-card__label">Availability</span>
                  <span className="event-info-card__value">
                    {event.tickets_remaining} / {event.ticket_limit} seats left
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="event-detail__section">
              <h2 className="event-detail__section-title">About This Event</h2>
              <p className="event-detail__desc">{event.description}</p>
            </div>

            {/* Career Fair Jobs */}
            {event.event_type === 'career_fair' && (
              <div className="event-detail__section">
                <h2 className="event-detail__section-title">
                  💼 Job Opportunities
                </h2>
                <p style={{ color: 'var(--text-light)', marginBottom: '16px' }}>
                  Book your ticket to view and apply for job openings at this career fair!
                </p>
                <Link
                  to={`/careerfair/${event.id}/jobs`}
                  className="btn btn-primary"
                >
                  View Job Openings
                </Link>
              </div>
            )}

          </div>

          {/* ── Right — Booking Card ── */}
          <div className="event-detail__sidebar">
            <div className="booking-card card">
              <div className="card-body">

                {/* Price */}
                <div className="booking-card__price">
                  {isFree
                    ? <span className="booking-price-free">FREE</span>
                    : <span className="booking-price-paid">₹{event.ticket_price}</span>
                  }
                  <span className="booking-price-label">per ticket</span>
                </div>

                  {/* Countdown Timer */}
                  {countdown && (
                    <div className="countdown">
                      <p className="countdown__label">⏰ Event starts in</p>
                      <div className="countdown__grid">
                        {[
                          { value: countdown.days,    label: 'Days'    },
                          { value: countdown.hours,   label: 'Hours'   },
                          { value: countdown.minutes, label: 'Minutes' },
                          { value: countdown.seconds, label: 'Seconds' },
                        ].map((item, i) => (
                          <div className="countdown__item" key={i}>
                            <span className="countdown__value">{String(item.value).padStart(2, '0')}</span>
                            <span className="countdown__unit">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  
                {/* Availability Bar */}
                <div className="availability-bar">
                  <div className="availability-bar__track">
                    <div
                      className="availability-bar__fill"
                      style={{
                        width: `${(event.tickets_sold / event.ticket_limit) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className="availability-bar__labels">
                    <span>{event.tickets_sold} booked</span>
                    <span>{event.tickets_remaining} left</span>
                  </div>
                </div>

                {/* Book Button */}
                {ticketBooked ? (
                  <div className="booking-success">
                    <FiCheck className="booking-success__icon" />
                    <span>Ticket Confirmed!</span>
                    <Link
                      to="/dashboard/user"
                      className="btn btn-outline btn-sm"
                      style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}
                    >
                      View My Tickets
                    </Link>
                  </div>
                ) : event.is_sold_out ? (
                  <button className="btn btn-danger auth-submit" disabled>
                    Sold Out
                  </button>
                ) : (
                  <button
                    className="btn btn-primary auth-submit"
                    onClick={handleBooking}
                    disabled={booking}
                    style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}
                  >
                    {booking ? (
                      <><span className="btn-spinner"></span> Processing...</>
                    ) : isFree ? (
                      '🎟️ Book Free Ticket'
                    ) : (
                      `💳 Pay ₹${event.ticket_price}`
                    )}
                  </button>
                )}

                {!isLoggedIn && (
                  <p className="booking-login-note">
                    <Link to="/login">Login</Link> to book your ticket
                  </p>
                )}

                {/* Event Stats */}
                <div className="booking-card__stats">
                  <div className="booking-stat">
                    <span className="booking-stat__value">{event.tickets_sold}</span>
                    <span className="booking-stat__label">Booked</span>
                  </div>
                  <div className="booking-stat">
                    <span className="booking-stat__value">{event.ticket_limit}</span>
                    <span className="booking-stat__label">Total</span>
                  </div>
                  <div className="booking-stat">
                    <span className="booking-stat__value">{event.tickets_remaining}</span>
                    <span className="booking-stat__label">Available</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Host Info */}
            <div className="host-card card">
              <div className="card-body">
                <h4 className="host-card__title">Event Host</h4>
                <div className="host-card__info">
                  <div className="host-card__avatar">
                    {event.host?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="host-card__name">{event.host?.username}</p>
                    <p className="host-card__role">Event Organizer</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;