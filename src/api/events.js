import API from './axios';

// ── Events API calls ──────────────────────────────────────────

export const getAllEvents = (params) =>
  API.get('/events/', { params });

export const getEventDetail = (id) =>
  API.get(`/events/${id}/`);

export const createEvent = (data) =>
  API.post('/events/create/', data);

export const updateEvent = (id, data) =>
  API.patch(`/events/${id}/update/`, data);

export const deleteEvent = (id) =>
  API.delete(`/events/${id}/delete/`);

export const getMyEvents = () =>
  API.get('/events/my-events/');