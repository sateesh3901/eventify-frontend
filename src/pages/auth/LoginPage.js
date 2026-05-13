import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../api/auth';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import './Auth.css';

const LoginPage = () => {
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const [formData, setFormData] = useState({
    username : '',
    password : '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [errors, setErrors]             = useState({});

  // ── Handle Input ─────────────────────────────────────────────
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  // ── Validate ─────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required.';
    if (!formData.password)        newErrors.password = 'Password is required.';
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
      const response = await loginUser(formData);
      const { user, tokens } = response.data;
      login(user, tokens);
      toast.success(`Welcome back, ${user.username}! 🎉`);

      // Redirect based on role
      if (user.role === 'admin') navigate('/dashboard/admin');
      else if (user.role === 'host') navigate('/dashboard/host');
      else navigate('/dashboard/user');

    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Try again.';
      toast.error(msg);
      setErrors({ general: msg });
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
            Welcome Back to Eventify!
          </h1>
          <p className="auth-left__subtitle">
            Login to access your tickets, events,
            and career opportunities.
          </p>
          <div className="auth-left__features">
            <div className="auth-feature">
              <span>🎟️</span>
              <span>Book tickets with QR codes</span>
            </div>
            <div className="auth-feature">
              <span>💼</span>
              <span>Apply for jobs at career fairs</span>
            </div>
            <div className="auth-feature">
              <span>📊</span>
              <span>Track your events & applications</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="auth-right">
        <div className="auth-card">

          <div className="auth-card__header">
            <h2 className="auth-card__title">Sign In</h2>
            <p className="auth-card__subtitle">
              Enter your credentials to continue
            </p>
          </div>

          {errors.general && (
            <div className="auth-error-banner">
              ⚠️ {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">

            {/* Username */}
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="text"
                  name="username"
                  className={`form-input input-with-icon ${errors.username ? 'input-error' : ''}`}
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              {errors.username && (
                <span className="form-error">{errors.username}</span>
              )}
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
                  placeholder="Enter your password"
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
              {errors.password && (
                <span className="form-error">{errors.password}</span>
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
                  Signing in...
                </>
              ) : (
                'Sign In →'
              )}
            </button>

          </form>

          <div className="auth-card__footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Register here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;