import React, { useState } from 'react';
import { scanTicket } from '../../api/tickets';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiSearch, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import './QRScanner.css';

const QRScannerPage = () => {
  const { user }                      = useAuth();
  const navigate                      = useNavigate();
  const [ticketCode, setTicketCode]   = useState('');
  const [scanning, setScanning]       = useState(false);
  const [result, setResult]           = useState(null);
  const [history, setHistory]         = useState([]);

  // ── Scan Ticket ───────────────────────────────────────────────
  const handleScan = async (e) => {
    e.preventDefault();
    if (!ticketCode.trim()) {
      toast.error('Please enter a ticket code.');
      return;
    }

    setScanning(true);
    setResult(null);

    try {
      const res    = await scanTicket(ticketCode.trim());
      const data   = res.data;
      const entry  = {
        ticket_code : ticketCode,
        status      : data.status,
        message     : data.message,
        attendee    : data.attendee,
        event       : data.event,
        time        : new Date().toLocaleTimeString('en-IN'),
      };

      setResult(entry);
      setHistory(prev => [entry, ...prev.slice(0, 9)]);

      if (data.status === 'valid') {
        toast.success(`✅ ${data.attendee} — Entry Granted!`);
      } else {
        toast.error(data.message);
      }

      setTicketCode('');

    } catch (error) {
      const msg  = error.response?.data?.message || 'Scan failed.';
      const status = error.response?.data?.status || 'invalid';
      const entry = {
        ticket_code : ticketCode,
        status,
        message     : msg,
        time        : new Date().toLocaleTimeString('en-IN'),
      };
      setResult(entry);
      setHistory(prev => [entry, ...prev.slice(0, 9)]);
      toast.error(msg);
      setTicketCode('');
    } finally {
      setScanning(false);
    }
  };

  const getResultConfig = (status) => {
    const map = {
      valid        : { icon: <FiCheckCircle />, cls: 'result--valid',    label: 'VALID — ENTRY GRANTED'    },
      already_used : { icon: <FiAlertCircle />, cls: 'result--used',     label: 'ALREADY SCANNED'          },
      invalid      : { icon: <FiXCircle />,     cls: 'result--invalid',  label: 'INVALID TICKET'           },
      payment_pending: { icon: <FiXCircle />,   cls: 'result--invalid',  label: 'PAYMENT NOT COMPLETED'    },
    };
    return map[status] || map.invalid;
  };

  return (
    <div className="scanner-page">

      {/* ── Header ── */}
      <div className="scanner-header">
        <div className="container">
          <h1 className="scanner-header__title">QR Ticket Scanner 📷</h1>
          <p className="scanner-header__subtitle">
            Enter or paste the ticket code to validate entry
          </p>
        </div>
      </div>

      <div className="container scanner-content">
        <div className="scanner-grid">

          {/* ── Scanner Input ── */}
          <div className="scanner-main">

            {/* Input Form */}
            <div className="card scanner-card">
              <div className="card-body">
                <h2 className="scanner-card__title">
                  🎟️ Scan Ticket
                </h2>
                <p className="scanner-card__desc">
                  Enter the ticket code shown on the attendee's QR ticket
                </p>

                <form onSubmit={handleScan} className="scanner-form">
                  <div className="scanner-input-wrapper">
                    <input
                      type="text"
                      className="scanner-input"
                      placeholder="Paste ticket code here..."
                      value={ticketCode}
                      onChange={(e) => setTicketCode(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="btn btn-primary scanner-btn"
                      disabled={scanning}
                    >
                      {scanning ? (
                        <><span className="btn-spinner"></span> Scanning...</>
                      ) : (
                        <><FiSearch /> Verify</>
                      )}
                    </button>
                  </div>
                </form>

                {/* Result Display */}
                {result && (() => {
                  const config = getResultConfig(result.status);
                  return (
                    <div className={`scan-result ${config.cls}`}>
                      <div className="scan-result__icon">{config.icon}</div>
                      <div className="scan-result__content">
                        <span className="scan-result__status">{config.label}</span>
                        {result.attendee && (
                          <span className="scan-result__attendee">
                            👤 {result.attendee}
                          </span>
                        )}
                        {result.event && (
                          <span className="scan-result__event">
                            🎪 {result.event}
                          </span>
                        )}
                        <span className="scan-result__msg">{result.message}</span>
                      </div>
                    </div>
                  );
                })()}

              </div>
            </div>

            {/* Tips */}
            <div className="card scanner-tips">
              <div className="card-body">
                <h4 style={{ color: 'var(--primary)', marginBottom: '14px' }}>
                  💡 How to Scan
                </h4>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    'Ask attendee to show their QR code ticket',
                    'Copy the ticket code from under the QR image',
                    'Paste it in the input box above',
                    'Click Verify — result shows instantly',
                    'Green = Valid Entry ✅  |  Red = Invalid ❌',
                  ].map((tip, i) => (
                    <li key={i} style={{ fontSize: '0.88rem', color: 'var(--text-light)', display: 'flex', gap: '8px' }}>
                      <span style={{ color: 'var(--primary-light)', fontWeight: '700' }}>{i + 1}.</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          {/* ── Scan History ── */}
          <div className="scanner-history">
            <div className="card">
              <div className="card-body">
                <h3 className="dash-section-title" style={{ marginBottom: '16px' }}>
                  📋 Recent Scans
                </h3>

                {history.length === 0 ? (
                  <div className="empty-state" style={{ padding: '30px 0' }}>
                    <p style={{ fontSize: '2rem' }}>🎟️</p>
                    <h3>No scans yet</h3>
                    <p style={{ fontSize: '0.85rem' }}>
                      Scan history will appear here
                    </p>
                  </div>
                ) : (
                  <div className="history-list">
                    {history.map((entry, i) => {
                      const config = getResultConfig(entry.status);
                      return (
                        <div key={i} className={`history-item history-item--${entry.status === 'valid' ? 'valid' : 'invalid'}`}>
                          <div className="history-item__icon">{config.icon}</div>
                          <div className="history-item__info">
                            <p className="history-item__attendee">
                              {entry.attendee || 'Unknown'}
                            </p>
                            <p className="history-item__code">
                              #{String(entry.ticket_code).slice(0, 8).toUpperCase()}
                            </p>
                          </div>
                          <span className="history-item__time">{entry.time}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {history.length > 0 && (
                  <div className="history-summary">
                    <span className="history-summary__valid">
                      ✅ {history.filter(h => h.status === 'valid').length} valid
                    </span>
                    <span className="history-summary__invalid">
                      ❌ {history.filter(h => h.status !== 'valid').length} invalid
                    </span>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default QRScannerPage;