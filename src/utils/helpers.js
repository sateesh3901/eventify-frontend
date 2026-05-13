// ── Date Helpers ──────────────────────────────────────────────

export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

export const formatDateTime = (dateStr) => {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export const formatTime = (dateStr) => {
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  });
};

// ── Countdown Timer ───────────────────────────────────────────
export const getCountdown = (dateStr) => {
  const now      = new Date();
  const eventDate= new Date(dateStr);
  const diff     = eventDate - now;

  if (diff <= 0) return null;

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
};

// ── Event Type Helpers ────────────────────────────────────────
export const EVENT_TYPE_BADGE = {
  career_fair : { label: 'Career Fair', cls: 'badge-accent'  },
  concert     : { label: 'Concert',     cls: 'badge-primary' },
  conference  : { label: 'Conference',  cls: 'badge-success' },
  workshop    : { label: 'Workshop',    cls: 'badge-warning' },
  hackathon   : { label: 'Hackathon',   cls: 'badge-gray'    },
  general     : { label: 'General',     cls: 'badge-gray'    },
};

export const EVENT_TYPE_EMOJI = {
  career_fair : '💼',
  concert     : '🎵',
  conference  : '🎤',
  workshop    : '🛠️',
  hackathon   : '💻',
  general     : '🎪',
};

// ── Status Badge Helper ───────────────────────────────────────
export const getStatusBadgeClass = (status) => {
  const map = {
    active      : 'badge-success',
    scanned     : 'badge-gray',
    cancelled   : 'badge-danger',
    upcoming    : 'badge-primary',
    ongoing     : 'badge-success',
    completed   : 'badge-gray',
    applied     : 'badge-primary',
    reviewed    : 'badge-warning',
    shortlisted : 'badge-accent',
    rejected    : 'badge-danger',
    selected    : 'badge-success',
    free        : 'badge-success',
    pending     : 'badge-warning',
    completed_payment: 'badge-success',
    failed      : 'badge-danger',
  };
  return map[status] || 'badge-gray';
};

// ── Text Helpers ──────────────────────────────────────────────
export const truncate = (text, length = 100) => {
  if (!text) return '';
  return text.length > length ? text.slice(0, length) + '...' : text;
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// ── Ticket Code Formatter ─────────────────────────────────────
export const formatTicketCode = (code) => {
  if (!code) return '';
  return String(code).slice(0, 8).toUpperCase();
};

// ── Copy to Clipboard ─────────────────────────────────────────
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

// ── Price Formatter ───────────────────────────────────────────
export const formatPrice = (price) => {
  if (price === 0 || price === '0.00' || price === '0') return 'FREE';
  return `₹${price}`;
};