import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  MessageSquare,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  Clock,
  Mail,
  User,
  CalendarDays
} from 'lucide-react';

import AdminNavbar from '../components/AdminNavbar';
import '../styles/AdminFeedback.css';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
).replace(/\/$/, '');

function AdminFeedback() {
  const navigate = useNavigate();

  const [feedback, setFeedback] = useState([]);
  const [total, setTotal] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const loadFeedback = async () => {
    const token = localStorage.getItem('twc_member_token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/feedback/`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        navigate('/login', { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.message || 'Unable to load feedback.'
        );
      }

      setFeedback(result.feedback || []);
      setTotal(result.total || 0);
      setNewCount(result.new || 0);

    } catch (err) {
      setError(err.message || 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const updateStatus = async (id, status) => {
    const token = localStorage.getItem('twc_member_token');

    setUpdatingId(id);
    setError('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/feedback/${id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        }
      );

      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        navigate('/login', { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.message || 'Unable to update feedback.'
        );
      }

      await loadFeedback();

    } catch (err) {
      setError(err.message || 'Unable to update feedback.');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Date unavailable';

    return new Date(date).toLocaleString('en-KE', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <main className="admin-feedback-page">

      <header className="feedback-header">

        <div className="feedback-header-brand">
          <MessageSquare size={32} />

          <div>
            <span>THIKA WALKING CLUB</span>
            <h1>FEEDBACK MANAGEMENT</h1>
          </div>
        </div>

        <button
          className="feedback-back-button"
          onClick={() => navigate('/admin-dashboard')}
        >
          <ArrowLeft size={17} />
          DASHBOARD
        </button>

      </header>

      <AdminNavbar />

      <section className="feedback-content">

        <div className="feedback-welcome">

          <div>
            <span>ADMINISTRATION</span>
            <h2>Member Feedback</h2>
            <p>
              Read messages, suggestions and enquiries
              from the TWC community.
            </p>
          </div>

          <button
            className="feedback-refresh"
            onClick={loadFeedback}
            disabled={loading}
          >
            <RefreshCw size={17} />
            {loading ? 'LOADING...' : 'REFRESH'}
          </button>

        </div>

        <div className="feedback-stats">

          <div className="feedback-stat-card">
            <MessageSquare size={25} />
            <div>
              <span>TOTAL MESSAGES</span>
              <strong>{loading ? '...' : total}</strong>
            </div>
          </div>

          <div className="feedback-stat-card">
            <Clock size={25} />
            <div>
              <span>NEW MESSAGES</span>
              <strong>{loading ? '...' : newCount}</strong>
            </div>
          </div>

          <div className="feedback-stat-card">
            <CheckCircle size={25} />
            <div>
              <span>REVIEWED / RESOLVED</span>
              <strong>
                {loading ? '...' : total - newCount}
              </strong>
            </div>
          </div>

        </div>

        {error && (
          <div className="feedback-error" role="alert">
            {error}
          </div>
        )}

        <div className="feedback-list-heading">
          <h3>SUBMITTED MESSAGES</h3>
          <span>{total} message(s)</span>
        </div>

        {loading ? (
          <div className="feedback-empty">
            Loading feedback...
          </div>
        ) : feedback.length === 0 ? (
          <div className="feedback-empty">
            <MessageSquare size={42} />
            <h3>No feedback yet</h3>
            <p>
              Messages submitted through the Contact page
              will appear here.
            </p>
          </div>
        ) : (
          <div className="feedback-list">

            {feedback.map((item) => (
              <article
                className="feedback-card"
                key={item.id}
              >

                <div className="feedback-card-top">

                  <div>
                    <span className="feedback-subject">
                      {item.subject}
                    </span>

                    <span className={`feedback-status ${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </div>

                  <span className="feedback-date">
                    <CalendarDays size={15} />
                    {formatDate(item.created_at)}
                  </span>

                </div>

                <div className="feedback-sender">

                  <span>
                    <User size={16} />
                    {item.full_name}
                  </span>

                  <a href={`mailto:${item.email}`}>
                    <Mail size={16} />
                    {item.email}
                  </a>

                </div>

                <div className="feedback-message">
                  {item.message}
                </div>

                <div className="feedback-card-actions">

                  <label htmlFor={`status-${item.id}`}>
                    UPDATE STATUS
                  </label>

                  <select
                    id={`status-${item.id}`}
                    value={item.status}
                    disabled={updatingId === item.id}
                    onChange={(event) =>
                      updateStatus(item.id, event.target.value)
                    }
                  >
                    <option value="New">New</option>
                    <option value="Reviewed">Reviewed</option>
                    <option value="Resolved">Resolved</option>
                  </select>

                  {updatingId === item.id && (
                    <span>Updating...</span>
                  )}

                </div>

              </article>
            ))}

          </div>
        )}

      </section>

    </main>
  );
}

export default AdminFeedback;

