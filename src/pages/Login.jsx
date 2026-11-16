import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LockKeyhole, Mail, CheckCircle, AlertCircle } from 'lucide-react';

import '../styles/Login.css';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
).replace(/\/$/, '');

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
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

    if (feedback.message) {
      setFeedback({ type: '', message: '' });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || 'Unable to log in. Please try again.'
        );
      }

      if (!result.access_token || !result.member) {
        throw new Error('The server returned an incomplete login response.');
      }

      localStorage.setItem('twc_member_token', result.access_token);
      localStorage.setItem('twc_member', JSON.stringify(result.member));

      setFeedback({
        type: 'success',
        message: 'Login successful. Opening your member dashboard...'
      });

      navigate(
        result.member.role === 'admin'
          ? '/admin-dashboard'
          : '/member-dashboard'
      );

    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.message || 'Unable to connect. Please try again.'
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="member-login-page">
      <section className="member-login-card">

        <div className="member-login-icon">
          <LockKeyhole size={30} />
        </div>

        <span className="member-login-eyebrow">
          THIKA WALKING CLUB
        </span>

        <h1>MEMBER LOGIN</h1>

        <p className="member-login-description">
          Welcome back! Sign in to access your TWC member account.
        </p>

        {feedback.message && (
          <div
            className={`member-login-feedback ${feedback.type}`}
            role="alert"
            aria-live="polite"
          >
            {feedback.type === 'success' ? (
              <CheckCircle size={21} />
            ) : (
              <AlertCircle size={21} />
            )}

            <p>{feedback.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="member-login-field">
            <label htmlFor="login-email">Email Address</label>

            <div className="member-login-input-wrap">
              <Mail size={18} />

              <input
                id="login-email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                maxLength={120}
                required
              />
            </div>
          </div>

          <div className="member-login-field">
            <label htmlFor="login-password">Password</label>

            <div className="member-login-input-wrap">
              <LockKeyhole size={18} />

              <input
                id="login-password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>

        </form>

        <p className="member-login-register">
          Not yet a member? <Link to="/register">Apply to join TWC</Link>
        </p>

        <Link to="/" className="member-login-home">
          Back to Thika Walking Club
        </Link>

      </section>
    </main>
  );
}

export default Login;
