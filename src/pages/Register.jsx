import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserPlus,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

import '../styles/Register.css';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
).replace(/\/$/, '');

function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [feedback, setFeedback] = useState({
    type: '',
    message: ''
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));

    setSubmitted(false);

    if (feedback.message) {
      setFeedback({ type: '', message: '' });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFeedback({ type: '', message: '' });
    setSubmitted(false);

    if (formData.password.length < 6) {
      setFeedback({
        type: 'error',
        message: 'Your password must contain at least 6 characters.'
      });
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setFeedback({
        type: 'error',
        message: 'Your passwords do not match.'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/membership/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || 'Unable to create your account.'
        );
      }

      setSubmitted(true);

      setFeedback({
        type: 'success',
        message: result.message ||
          'Your account has been created successfully. You can now log in.'
      });

      setFormData({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        confirm_password: ''
      });

    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.message ||
          'Unable to connect. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      <section className="register-hero">
        <UserPlus className="register-icon" />

        <p>ONE COMMUNITY. ONE FAMILY.</p>

        <h1>JOIN TWC</h1>

        <p>
          Let's move. Let's connect. Let's grow.
          Become part of the Thika Walking Club family.
        </p>
      </section>

      <section className="register-content container">

        <div className="register-heading">
          <h2>CREATE YOUR ACCOUNT</h2>
          <p>
            Register today and become part of the Thika Walking Club community.
          </p>
        </div>

        {submitted && (
          <div className="register-feedback success" role="status">
            <CheckCircle size={22} />
            <div>
              <strong>ACCOUNT CREATED!</strong>
              <p>
                Your membership account is ready.
                You can now log in and access your member dashboard.
              </p>
            </div>
          </div>
        )}

        <form className="register-form" onSubmit={handleSubmit}>

          {feedback.message && (
            <div
              className={`register-feedback ${feedback.type}`}
              role="alert"
              aria-live="polite"
            >
              {feedback.type === 'success' ? (
                <CheckCircle size={22} />
              ) : (
                <AlertCircle size={22} />
              )}

              <p>{feedback.message}</p>
            </div>
          )}

          <div className="register-grid">

            <div className="register-field register-full">
              <label htmlFor="full_name">Full Name *</label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={handleChange}
                maxLength={120}
                autoComplete="name"
                required
              />
            </div>

            <div className="register-field register-full">
              <label htmlFor="email">Email Address *</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                maxLength={120}
                autoComplete="email"
                required
              />
            </div>

            <div className="register-field register-full">
              <label htmlFor="phone">Phone Number *</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="e.g. 07XX XXX XXX"
                value={formData.phone}
                onChange={handleChange}
                maxLength={20}
                autoComplete="tel"
                required
              />
            </div>

            <div className="register-field register-full">
              <label htmlFor="password">Password *</label>

              <div className="register-password-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password (minimum 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={6}
                  maxLength={128}
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="register-field register-full">
              <label htmlFor="confirm_password">Confirm Password *</label>

              <div className="register-password-wrapper">
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Enter your password again"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  minLength={6}
                  maxLength={128}
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  aria-label={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

          </div>

          <button
            type="submit"
            className="register-submit"
            disabled={loading}
          >
            {loading ? 'CREATING ACCOUNT...' : 'CREATE MY ACCOUNT'}
          </button>

          <div className="register-login-link">
            <p>
              Already a member? <Link to="/login">Log in here</Link>
            </p>
          </div>

        </form>
      </section>
    </div>
  );
}

export default Register;
