import API from './axios';

// ── Tickets API calls ─────────────────────────────────────────

export const purchaseTicket = (eventId) =>
  API.post(`/tickets/purchase/${eventId}/`);

export const getMyTickets = () =>
  API.get('/tickets/my-tickets/');

export const getTicketDetail = (ticketCode) =>
  API.get(`/tickets/${ticketCode}/`);

export const scanTicket = (ticketCode) =>
  API.post('/tickets/scan/', { ticket_code: ticketCode });

export const getEventTickets = (eventId) =>
  API.get(`/tickets/event/${eventId}/`);

// ── Payment ───────────────────────────────────────────────────
export const createPaymentOrder = (eventId) =>
  API.post('/tickets/payment/create-order/', { event_id: eventId });

export const verifyPayment = (data) =>
  API.post('/tickets/payment/verify/', data);

export const getPaymentStatus = (ticketId) =>
  API.get(`/tickets/payment/status/${ticketId}/`);