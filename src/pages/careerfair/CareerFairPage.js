import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventDetail } from '../../api/events';
import { getJobOpenings, applyForJob } from '../../api/careerfair';
import { useAuth } from '../../context/AuthContext';
import { SkeletonGrid } from '../../components/common/SkeletonCard';
import toast from 'react-hot-toast';
import {
  FiMapPin, FiUsers,
  FiArrowLeft, FiUpload, FiExternalLink
} from 'react-icons/fi';
import './CareerFair.css';

const CareerFairPage = () => {
  const { eventId }             = useParams();
  const navigate                = useNavigate();
  const { isLoggedIn }    = useAuth();

  const [event, setEvent]       = useState(null);
  const [jobs, setJobs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [applying, setApplying] = useState(null);
  const [search, setSearch]     = useState('');
  const [experience, setExp]    = useState('');

  // Apply Modal State
  const [showModal, setShowModal]   = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyForm, setApplyForm]   = useState({
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
      setEvent(eventRes.data.event);
      setJobs(jobsRes.data.jobs);
    } catch {
      toast.error('Failed to load career fair data.');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await getJobOpenings(eventId, {
        search     : search     || undefined,
        experience : experience || undefined,
      });
      setJobs(res.data.jobs);
    } catch {
      toast.error('Failed to filter jobs.');
    }
  };

  // ── Open Apply Modal ──────────────────────────────────────────
  const openApplyModal = (job) => {
    if (!isLoggedIn) {
      toast.error('Please login to apply!');
      navigate('/login');
      return;
    }
    setSelectedJob(job);
    setShowModal(true);
  };

  // ── Submit Application ────────────────────────────────────────
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
      toast.success(`🎉 Applied for "${selectedJob.job_title}" successfully!`);
      setShowModal(false);
      setResumeFile(null);
      setApplyForm({ cover_letter: '', github_url: '', linkedin_url: '', portfolio_url: '' });
    } catch (error) {
      const msg = error.response?.data?.message || 'Application failed.';
      toast.error(msg);
    } finally {
      setApplying(null);
    }
  };

  // ── Filter Jobs ───────────────────────────────────────────────
  const filteredJobs = jobs.filter(job => {
    const matchSearch = !search ||
      job.job_title.toLowerCase().includes(search.toLowerCase()) ||
      job.company_name.toLowerCase().includes(search.toLowerCase()) ||
      job.skills_required.toLowerCase().includes(search.toLowerCase());
    const matchExp = !experience || job.experience === experience;
    return matchSearch && matchExp;
  });

  const EXPERIENCE_OPTIONS = [
    { value: '',         label: 'All Experience' },
    { value: 'fresher',  label: 'Fresher (0-1 yrs)' },
    { value: 'junior',   label: 'Junior (1-3 yrs)' },
    { value: 'mid',      label: 'Mid Level (3-5 yrs)' },
    { value: 'senior',   label: 'Senior (5+ yrs)' },
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
                  {jobs.reduce((acc, j) => acc + j.total_applications, 0)}
                </span>
                <span className="cf-stat__label">Total Applicants</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">

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

        {/* ── Results ── */}
        <p className="events-count" style={{ marginBottom: '20px' }}>
          Showing <strong>{filteredJobs.length}</strong> job openings
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
            {filteredJobs.map((job) => (
              <div className="job-card card" key={job.id}>
                <div className="card-body">

                  {/* Company Header */}
                  <div className="job-card__company">
                    <div className="job-card__company-avatar">
                      {job.company_name.charAt(0)}
                    </div>
                    <div>
                      <p className="job-card__company-name">{job.company_name}</p>
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
                      {job.job_type.replace('_', ' ')}
                    </span>
                    <span className="badge badge-primary">
                      {job.experience}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="job-card__desc">
                    {job.description.slice(0, 120)}...
                  </p>

                  {/* Skills */}
                  <div className="job-card__skills">
                    {job.skills_required.split(',').slice(0, 4).map((skill, i) => (
                      <span key={i} className="skill-tag">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="job-card__footer">
                    <div className="job-card__meta">
                      {job.salary_range && (
                        <span className="job-salary">💰 {job.salary_range}</span>
                      )}
                      <span className="job-openings">
                        <FiUsers size={12} /> {job.openings_count} openings
                      </span>
                      <span className="job-applicants">
                        📋 {job.total_applications} applied
                      </span>
                    </div>
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
                  </div>

                </div>
              </div>
            ))}
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
                  onChange={(e) => setApplyForm({ ...applyForm, cover_letter: e.target.value })}
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
                    onChange={(e) => setApplyForm({ ...applyForm, github_url: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">LinkedIn URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://linkedin.com/in/username"
                    value={applyForm.linkedin_url}
                    onChange={(e) => setApplyForm({ ...applyForm, linkedin_url: e.target.value })}
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
                  onChange={(e) => setApplyForm({ ...applyForm, portfolio_url: e.target.value })}
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
                  disabled={applying === selectedJob.id}
                >
                  {applying === selectedJob.id ? (
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