/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventDetail } from '../../api/events';
import { getJobOpenings, applyForJob, getMyApplications } from '../../api/careerfair';
import { useAuth } from '../../context/AuthContext';
import { SkeletonGrid } from '../../components/common/SkeletonCard';
import toast from 'react-hot-toast';
import {
  FiBriefcase, FiMapPin, FiUsers,
  FiArrowLeft, FiUpload, FiExternalLink,
  FiCheck
} from 'react-icons/fi';
import './CareerFair.css';
import { getMyTickets } from '../../api/tickets';

const CareerFairPage = () => {

  const { eventId }           = useParams();
  const navigate              = useNavigate();
  const { isLoggedIn, user }  = useAuth();

  const [hasTicket, setHasTicket] = useState(false); // ← add this state at top
  const [event, setEvent]           = useState(null);
  const [jobs, setJobs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [applying, setApplying]     = useState(null);
  const [search, setSearch]         = useState('');
  const [experience, setExp]        = useState('');
  const [appliedJobs, setAppliedJobs] = useState([]); // ← track applied jobs

  // Apply Modal State
  const [showModal, setShowModal]     = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyForm, setApplyForm]     = useState({
    cover_letter  : '',
    github_url    : '',
    linkedin_url  : '',
    portfolio_url : '',
  });
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => { fetchAll(); }, [eventId]);

const fetchAll = async () => {
    try {
      const [eventRes, jobsRes] = await Promise.all([
        getEventDetail(eventId),
        getJobOpenings(eventId),
      ]);

      setEvent(eventRes?.data?.event || null);
      const jobsData = jobsRes?.data?.jobs || jobsRes?.data || [];
      setJobs(Array.isArray(jobsData) ? jobsData : []);

      // ── Check if user has ticket + fetch applications ─────
      if (isLoggedIn) {
        try {
          const appsRes  = await getMyApplications();
          const apps     = appsRes?.data?.applications || [];
          const appliedIds = apps.map(app => app.job_id);
          setAppliedJobs(appliedIds);

          // ── Check ticket ──────────────────────────────────
          const ticketsRes = await getMyTickets();
          const tickets    = ticketsRes?.data?.tickets || [];
          const ticketForEvent = tickets.find(
            t => t.event?.id === parseInt(eventId) &&
                 ['completed', 'free'].includes(t.payment_status)
          );
          setHasTicket(!!ticketForEvent);

        } catch {
          setAppliedJobs([]);
          setHasTicket(false);
        }
      }

    } catch (error) {
      toast.error('Failed to load career fair data.');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };
  // ── Check if already applied ──────────────────────────────
  const hasApplied = (jobId) => appliedJobs.includes(jobId);

  // ── Open Apply Modal ──────────────────────────────────────
  const openApplyModal = (job) => {
    if (!isLoggedIn) {
      toast.error('Please login to apply!');
      navigate('/login');
      return;
    }
    if (hasApplied(job.id)) {
      toast.error('You have already applied for this job!');
      return;
    }
    setSelectedJob(job);
    setShowModal(true);
    setResumeFile(null);
    setApplyForm({
      cover_letter  : '',
      github_url    : '',
      linkedin_url  : '',
      portfolio_url : '',
    });
  };

  // ── Submit Application ────────────────────────────────────
  const handleApply = async (e) => {
    e.preventDefault();

    if (!resumeFile) {
      toast.error('Please upload your resume!');
      return;
    }

    const formData = new FormData();
    formData.append('resume',        resumeFile);
    formData.append('cover_letter',  applyForm.cover_letter);
    formData.append('github_url',    applyForm.github_url);
    formData.append('linkedin_url',  applyForm.linkedin_url);
    formData.append('portfolio_url', applyForm.portfolio_url);

    setApplying(selectedJob.id);

    try {
      await applyForJob(selectedJob.id, formData);
      toast.success(`🎉 Applied for "${selectedJob.job_title}" at ${selectedJob.company_name}!`);

      // ── Mark job as applied locally ─────────────────────
      setAppliedJobs(prev => [...prev, selectedJob.id]);
      setShowModal(false);

    } catch (error) {
      const msg = error?.response?.data?.message || 'Application failed.';
      // Handle already applied error from backend
      if (error?.response?.status === 400) {
        toast.error('You have already applied for this job!');
        setAppliedJobs(prev => [...prev, selectedJob.id]);
        setShowModal(false);
      } else {
        toast.error(msg);
      }
    } finally {
      setApplying(null);
    }
  };

  // ── Filter Jobs ───────────────────────────────────────────
  const filteredJobs = jobs.filter(job => {
    const matchSearch = !search ||
      job.job_title.toLowerCase().includes(search.toLowerCase()) ||
      job.company_name.toLowerCase().includes(search.toLowerCase()) ||
      job.skills_required.toLowerCase().includes(search.toLowerCase());
    const matchExp = !experience || job.experience === experience;
    return matchSearch && matchExp;
  });

  const EXPERIENCE_OPTIONS = [
    { value: '',         label: 'All Experience'       },
    { value: 'fresher',  label: 'Fresher (0-1 yrs)'   },
    { value: 'junior',   label: 'Junior (1-3 yrs)'    },
    { value: 'mid',      label: 'Mid Level (3-5 yrs)' },
    { value: 'senior',   label: 'Senior (5+ yrs)'     },
  ];

  const JOB_TYPE_COLORS = {
    full_time  : 'badge-success',
    part_time  : 'badge-warning',
    internship : 'badge-primary',
    contract   : 'badge-gray',
  };

  return (
    <div className="careerfair-page">

      {/* ── Header ── */}
      <div className="careerfair-header">
        <div className="container">
          <button
            className="back-btn"
            onClick={() => navigate(`/events/${eventId}`)}
          >
            <FiArrowLeft /> Back to Event
          </button>

          <div className="careerfair-header__inner">
            <div>
              <span className="careerfair-header__tag">💼 Career Fair</span>
              <h1 className="careerfair-header__title">
                {event?.title || 'Career Fair'}
              </h1>
              <p className="careerfair-header__subtitle">
                <FiMapPin /> {event?.venue}, {event?.city}
              </p>
            </div>
            <div className="careerfair-header__stats">
              <div className="cf-stat">
                <span className="cf-stat__value">{jobs.length}</span>
                <span className="cf-stat__label">Job Openings</span>
              </div>
              <div className="cf-stat">
                <span className="cf-stat__value">
                  {jobs.reduce((acc, j) => acc + (j.total_applications || 0), 0)}
                </span>
                <span className="cf-stat__label">Total Applicants</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
       {/* ── Ticket Required Banner ── */}
{isLoggedIn && !hasTicket && (
  <div className="ticket-required-banner">
    <span>🎟️</span>
    <div>
      <p className="ticket-required-banner__title">
        Ticket Required to Apply
      </p>
      <p className="ticket-required-banner__desc">
        You need a valid ticket for this event to apply for jobs.
      </p>
    </div>
    <Link
      to={`/events/${eventId}`}
      className="btn btn-accent btn-sm"
    >
      Get Ticket →
    </Link>
  </div>
)}

{!isLoggedIn && (
  <div className="ticket-required-banner">
    <span>🔒</span>
    <div>
      <p className="ticket-required-banner__title">
        Login Required
      </p>
      <p className="ticket-required-banner__desc">
        Please login and get a ticket to apply for jobs.
      </p>
    </div>
    <Link to="/login" className="btn btn-accent btn-sm">
      Login →
    </Link>
  </div>
)}

{isLoggedIn && hasTicket && (
  <div className="ticket-valid-banner">
    <span>✅</span>
    <p>You have a valid ticket — you can apply for jobs!</p>
  </div>
)} 

        {/* ── Filter Bar ── */}
        <div className="cf-filters">
          <input
            type="text"
            className="form-input cf-search"
            placeholder="🔍 Search by role, company, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="form-input cf-select"
            value={experience}
            onChange={(e) => setExp(e.target.value)}
          >
            {EXPERIENCE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* ── Results Count ── */}
        <p className="events-count" style={{ marginBottom: '20px' }}>
          Showing <strong>{filteredJobs.length}</strong> job openings
          {isLoggedIn && appliedJobs.length > 0 && (
            <span style={{ color: 'var(--success)', marginLeft: '12px' }}>
              ✅ Applied to {appliedJobs.length} job{appliedJobs.length > 1 ? 's' : ''}
            </span>
          )}
        </p>

        {/* ── Jobs Grid ── */}
        {loading ? (
          <SkeletonGrid count={6} />
        ) : filteredJobs.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: '3rem' }}>💼</p>
            <h3>No job openings found</h3>
            <p>Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid-3 cf-jobs-grid">
            {filteredJobs.map((job) => {
              const alreadyApplied = hasApplied(job.id);
              return (
                <div
                  className={`job-card card ${alreadyApplied ? 'job-card--applied' : ''}`}
                  key={job.id}
                >
                  <div className="card-body">

                    {/* Already Applied Banner */}
                    {alreadyApplied && (
                      <div className="applied-banner">
                        <FiCheck /> Already Applied
                      </div>
                    )}

                  <div className="job-card__company">
  <div className="job-card__company-avatar">
    {job.company_name?.charAt(0)}
  </div>
  <div>
    <p className="job-card__company-name">
      {job.company_name}
    </p>
    {job.company_website && (
      <a
        href={job.company_website}
        target="_blank"
        rel="noreferrer"
        className="job-card__website"
      >
        <FiExternalLink size={12} /> Website
      </a>
    )}
  </div>
</div>

                    {/* Job Title */}
                    <h3 className="job-card__title">{job.job_title}</h3>

                    {/* Badges */}
                    <div className="job-card__badges">
                      <span className={`badge ${JOB_TYPE_COLORS[job.job_type] || 'badge-gray'}`}>
                        {job.job_type?.replace('_', ' ')}
                      </span>
                      <span className="badge badge-primary">
                        {job.experience}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="job-card__desc">
                      {job.description?.slice(0, 120)}...
                    </p>

                    {/* Skills */}
                    <div className="job-card__skills">
                      {job.skills_required?.split(',').slice(0, 4).map((skill, i) => (
                        <span key={i} className="skill-tag">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="job-card__footer">
                      <div className="job-card__meta">
                        {job.salary_range && (
                          <span className="job-salary">
                            💰 {job.salary_range}
                          </span>
                        )}
                        <span className="job-openings">
                          <FiUsers size={12} /> {job.openings_count} openings
                        </span>
                        <span className="job-applicants">
                          📋 {job.total_applications} applied
                        </span>
                      </div>

                     {alreadyApplied ? (
  <button
    className="btn btn-sm"
    disabled
    style={{
      background : 'var(--success)',
      color      : 'white',
      opacity    : 1,
      cursor     : 'default'
    }}
  >
    <FiCheck /> Applied
  </button>
) : !hasTicket ? (
  <Link
    to={`/events/${eventId}`}
    className="btn btn-sm btn-outline"
  >
    🎟️ Get Ticket
  </Link>
) : (
  <button
    className="btn btn-primary btn-sm"
    onClick={() => openApplyModal(job)}
    disabled={applying === job.id}
  >
    {applying === job.id ? (
      <><span className="btn-spinner"></span> Applying...</>
    ) : (
      'Apply Now'
    )}
  </button>
)}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          APPLY MODAL
      ══════════════════════════════════════════════════════ */}
      {showModal && selectedJob && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>

            <div className="modal__header">
              <div>
                <h2 className="modal__title">{selectedJob.job_title}</h2>
                <p className="modal__company">@ {selectedJob.company_name}</p>
              </div>
              <button
                className="modal__close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApply} className="modal__body">

              {/* Resume Upload */}
              <div className="form-group">
                <label className="form-label">Resume (PDF) *</label>
                <div
                  className={`resume-upload ${resumeFile ? 'resume-upload--done' : ''}`}
                  onClick={() => document.getElementById('resume-input').click()}
                >
                  <input
                    id="resume-input"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    onChange={(e) => setResumeFile(e.target.files[0])}
                  />
                  {resumeFile ? (
                    <p className="resume-upload__name">
                      ✅ {resumeFile.name}
                    </p>
                  ) : (
                    <>
                      <FiUpload className="resume-upload__icon" />
                      <p>Click to upload your resume</p>
                      <span>PDF, DOC, DOCX supported</span>
                    </>
                  )}
                </div>
              </div>

              {/* Cover Letter */}
              <div className="form-group">
                <label className="form-label">Cover Letter</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Tell the company why you're a great fit..."
                  rows={4}
                  value={applyForm.cover_letter}
                  onChange={(e) => setApplyForm({
                    ...applyForm, cover_letter: e.target.value
                  })}
                />
              </div>

              {/* Links */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">GitHub URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://github.com/username"
                    value={applyForm.github_url}
                    onChange={(e) => setApplyForm({
                      ...applyForm, github_url: e.target.value
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">LinkedIn URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://linkedin.com/in/username"
                    value={applyForm.linkedin_url}
                    onChange={(e) => setApplyForm({
                      ...applyForm, linkedin_url: e.target.value
                    })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Portfolio URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://yourportfolio.com"
                  value={applyForm.portfolio_url}
                  onChange={(e) => setApplyForm({
                    ...applyForm, portfolio_url: e.target.value
                  })}
                />
              </div>

              <div className="modal__footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={applying === selectedJob?.id}
                >
                  {applying === selectedJob?.id ? (
                    <><span className="btn-spinner"></span> Submitting...</>
                  ) : (
                    '🚀 Submit Application'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CareerFairPage;