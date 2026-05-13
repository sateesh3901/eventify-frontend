import API from './axios';

// ── Stats API calls ───────────────────────────────────────────

export const getHostDashboardStats = () =>
  API.get('/stats/host/dashboard/');

export const getHostEventStats = (eventId) =>
  API.get(`/stats/host/events/${eventId}/`);

export const getUserDashboardStats = () =>
  API.get('/stats/user/dashboard/');

export const getAdminDashboardStats = () =>
  API.get('/stats/admin/dashboard/');