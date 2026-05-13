import API from './axios';

// ── Career Fair API calls ─────────────────────────────────────

export const getJobOpenings = (eventId, params) =>
  API.get(`/careerfair/events/${eventId}/jobs/`, { params });

export const createJobOpening = (data) =>
  API.post('/careerfair/jobs/create/', data);

export const getJobDetail = (jobId) =>
  API.get(`/careerfair/jobs/${jobId}/`);

export const updateJobOpening = (jobId, data) =>
  API.patch(`/careerfair/jobs/${jobId}/update/`, data);

export const deleteJobOpening = (jobId) =>
  API.delete(`/careerfair/jobs/${jobId}/delete/`);

export const applyForJob = (jobId, data) =>
  API.post(`/careerfair/jobs/${jobId}/apply/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const getMyApplications = () =>
  API.get('/careerfair/my-applications/');

export const getJobApplications = (jobId) =>
  API.get(`/careerfair/jobs/${jobId}/applications/`);

export const updateApplicationStatus = (applicationId, status) =>
  API.patch(`/careerfair/applications/${applicationId}/status/`, { status });