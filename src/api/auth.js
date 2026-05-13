import API from './axios';

// ── Auth API calls ────────────────────────────────────────────

export const registerUser = (data) =>
  API.post('/auth/register/', data);

export const loginUser = (data) =>
  API.post('/auth/login/', data);

export const logoutUser = (data) =>
  API.post('/auth/logout/', data);

export const getCurrentUser = () =>
  API.get('/auth/me/');

export const updateProfile = (data) =>
  API.put('/auth/profile/update/', data);

export const changePassword = (data) =>
  API.post('/auth/password/change/', data);