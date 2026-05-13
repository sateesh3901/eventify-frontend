import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">

          {/* ── Brand ── */}
          <div className="footer__brand">
            <div className="footer__logo">
              🎪 Event<span>ify</span>
            </div>
            <p className="footer__tagline">
              Your one-stop platform for events,
              tickets, and career opportunities.
            </p>
          </div>

          {/* ── Quick Links ── */}
          <div className="footer__col">
            <h4 className="footer__title">Quick Links</h4>
            <ul className="footer__links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/events">Browse Events</Link></li>
              <li><Link to="/register">Get Started</Link></li>
            </ul>
          </div>

          {/* ── For Users ── */}
          <div className="footer__col">
            <h4 className="footer__title">For Users</h4>
            <ul className="footer__links">
              <li><Link to="/dashboard/user">My Dashboard</Link></li>
              <li><Link to="/tickets">My Tickets</Link></li>
              <li><Link to="/applications">My Applications</Link></li>
            </ul>
          </div>

          {/* ── For Hosts ── */}
          <div className="footer__col">
            <h4 className="footer__title">For Hosts</h4>
            <ul className="footer__links">
              <li><Link to="/dashboard/host">Host Dashboard</Link></li>
              <li><Link to="/events/create">Create Event</Link></li>
              <li><Link to="/scanner">QR Scanner</Link></li>
            </ul>
          </div>

        </div>

        {/* ── Bottom ── */}
        <div className="footer__bottom">
          <p>© 2026 Eventify. Built with ❤️ by Yenuganti Sateesh</p>
          <p>Python · Django · React · MySQL</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;