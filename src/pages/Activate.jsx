import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LockKeyhole, CheckCircle, AlertCircle } from 'lucide-react';

import '../styles/Activate.css';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
).replace(/\/$/, '');

function Activate() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({
    type: '',
    message: ''
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFeedback({ type: '', message: '' });

    if (!token) {
      setFeedback({
        type: 'error',
        message: 'Your activation link is missing its token. Please request a new link.'
      });
      return;
    }

    if (password.length < 12) {
      setFeedback({
        type: 'error',
        message: 'Your password must contain at least 12 characters.'
      });
      return;
    }

    if (password !== confirmPassword) {
      setFeedback({
        type: 'error',
        message: 'Your passwords do not match.'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/activate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token,
            password,
            confirm_password: confirmPassword
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || 'Account activation failed. Please try again.'
        );
      }

      setFeedback({
        type: 'success',
        message: result.message || 'Your account has been activated successfully.'
      });

      setPassword('');
      setConfirmPassword('');

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
    <main className="activate-page">
      <section className="activate-card">

        <div className="activate-icon">
          <LockKeyhole size={30} />
        </div>

        <span className="activate-eyebrow">
          WELCOME TO THE TWC FAMILY
        </span>

        <h1>ACTIVATE YOUR ACCOUNT</h1>

        <p className="activate-description">
          Set a password to complete your Thika Walking Club membership
          activation.
        </p>

        {feedback.message && (
          <div
            className={`activate-feedback ${feedback.type}`}
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

        {!feedback.type || feedback.type !== 'success' ? (
          <form onSubmit={handleSubmit}>

            <div className="activate-field">
              <label htmlFor="password">Create Password</label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 12 characters"
                minLength={12}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="activate-field">
              <label htmlFor="confirm-password">
                Confirm Password
              </label>

              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Enter your password again"
                minLength={12}
                autoComplete="new-password"
                required
              />
            </div>

            <button type="submit" disabled={loading || !token}>
              {loading ? 'ACTIVATING ACCOUNT...' : 'ACTIVATE ACCOUNT'}
            </button>

          </form>
        ) : (
          <Link to="/login" className="activate-login-link">
            CONTINUE TO LOGIN
          </Link>
        )}

        <p className="activate-note">
          Your activation link is valid for 24 hours and can only be used once.
        </p>

        <Link to="/" className="activate-home-link">
          Back to Thika Walking Club
        </Link>

      </section>
    </main>
  );
}

export default Activate;
