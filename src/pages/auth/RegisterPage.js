import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { registerUser } from '../../api/auth';
import toast from 'react-hot-toast';
import {
  FiUser, FiMail, FiLock, FiPhone,
  FiEye, FiEyeOff
} from 'react-icons/fi';
import './Auth.css';

const ROLES = [
  { value: 'user', label: '🎟️ Attendee', desc: 'Browse & book event tickets' },
  { value: 'host', label: '🎪 Host',     desc: 'Create & manage events' },
];

const RegisterPage = () => {
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const [formData, setFormData] = useState({
    username         : '',
    email            : '',
    password         : '',
    confirm_password : '',
    role             : 'user',
    phone            : '',
  });
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirm]   = useState(false);
  const [loading, setLoading]                   = useState(false);
  const [errors, setErrors]                     = useState({});

  // ── Handle Input ─────────────────────────────────────────────
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  // ── Validate ─────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim())
      newErrors.username = 'Username is required.';
    if (!formData.email.trim())
      newErrors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Enter a valid email address.';
    if (!formData.password)
      newErrors.password = 'Password is required.';
    else if (formData.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters.';
    if (formData.password !== formData.confirm_password)
      newErrors.confirm_password = 'Passwords do not match.';
    if (!formData.phone.trim())
      newErrors.phone = 'Phone number is required.';
    return newErrors;
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await registerUser(formData);
      const { user, tokens } = response.data;
      login(user, tokens);
      toast.success(`Welcome to Eventify, ${user.username}! 🎉`);

      if (user.role === 'host') navigate('/dashboard/host');
      else navigate('/dashboard/user');

    } catch (error) {
      const data = error.response?.data;
      if (data?.errors) setErrors(data.errors);
      toast.error(data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* ── Left Panel ── */}
      <div className="auth-left">
        <div className="auth-left__content">
          <div className="auth-left__logo">🎪 Eventify</div>
          <h1 className="auth-left__title">
            Join Eventify Today!
          </h1>
          <p className="auth-left__subtitle">
            Create your account and start exploring
            amazing events or host your own.
          </p>
          <div className="auth-left__features">
            <div className="auth-feature">
              <span>🎟️</span>
              <span>Get QR-coded tickets instantly</span>
            </div>
            <div className="auth-feature">
              <span>💼</span>
              <span>Attend career fairs & get hired</span>
            </div>
            <div className="auth-feature">
              <span>🎪</span>
              <span>Host events & manage attendees</span>
            </div>
            <div className="auth-feature">
              <span>📊</span>
              <span>Real-time stats & analytics</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="auth-right">
        <div className="auth-card">

          <div className="auth-card__header">
            <h2 className="auth-card__title">Create Account</h2>
            <p className="auth-card__subtitle">
              Fill in the details to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">

            {/* Role Selector */}
            <div className="form-group">
              <label className="form-label">I want to join as</label>
              <div className="role-selector">
                {ROLES.map((role) => (
                  <div
                    key={role.value}
                    className={`role-option ${formData.role === role.value ? 'role-option--active' : ''}`}
                    onClick={() => setFormData({ ...formData, role: role.value })}
                  >
                    <span className="role-option__label">{role.label}</span>
                    <span className="role-option__desc">{role.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Username */}
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  name="username"
                  className={`form-input input-with-icon ${errors.username ? 'input-error' : ''}`}
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              {errors.username && <span className="form-error">{errors.username}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  name="email"
                  className={`form-input input-with-icon ${errors.email ? 'input-error' : ''}`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-wrapper">
                <FiPhone className="input-icon" />
                <input
                  type="tel"
                  name="phone"
                  className={`form-input input-with-icon ${errors.phone ? 'input-error' : ''}`}
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              {errors.phone && <span className="form-error">{errors.phone}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-input input-with-icon input-with-toggle ${errors.password ? 'input-error' : ''}`}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirm_password"
                  className={`form-input input-with-icon input-with-toggle ${errors.confirm_password ? 'input-error' : ''}`}
                  placeholder="Repeat your password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowConfirm(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.confirm_password && (
                <span className="form-error">{errors.confirm_password}</span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  Creating account...
                </>
              ) : (
                'Create Account →'
              )}
            </button>

          </form>

          <div className="auth-card__footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;