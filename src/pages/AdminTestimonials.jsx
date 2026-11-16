import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  MessageSquare,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  CalendarDays,
  UserRound,
  ShieldCheck
} from 'lucide-react';

import AdminNavbar from '../components/AdminNavbar';
import '../styles/AdminTestimonials.css';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
).replace(/\/$/, '');

function AdminTestimonials() {
  const navigate = useNavigate();

  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState('All');

  const loadTestimonials = async () => {
    const token = localStorage.getItem('twc_member_token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/testimonials/admin`,
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
          result.message || 'Unable to load testimonials.'
        );
      }

      setTestimonials(result.testimonials || []);

    } catch (err) {
      setError(err.message || 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const updateTestimonialStatus = async (id, status) => {
    const token = localStorage.getItem('twc_member_token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    setUpdatingId(id);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/testimonials/admin/${id}/decision`,
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
          result.message || 'Unable to update testimonial.'
        );
      }

      setSuccess(result.message || `Testimonial ${status.toLowerCase()}.`);

      await loadTestimonials();

    } catch (err) {
      setError(err.message || 'Unable to update testimonial.');
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

  const pendingCount = testimonials.filter(
    (item) => item.status === 'Pending'
  ).length;

  const approvedCount = testimonials.filter(
    (item) => item.status === 'Approved'
  ).length;

  const rejectedCount = testimonials.filter(
    (item) => item.status === 'Rejected'
  ).length;

  const filteredTestimonials = filter === 'All'
    ? testimonials
    : testimonials.filter((item) => item.status === filter);

  return (
    <main className="admin-testimonials-page">

      <header className="testimonials-header">

        <div className="testimonials-header-brand">
          <MessageSquare size={32} />

          <div>
            <span>THIKA WALKING CLUB</span>
            <h1>TESTIMONIAL MANAGEMENT</h1>
          </div>
        </div>

        <button
          type="button"
          className="testimonials-back-button"
          onClick={() => navigate('/admin-dashboard')}
        >
          <ArrowLeft size={17} />
          DASHBOARD
        </button>

      </header>

      <AdminNavbar />

      <section className="testimonials-content">

        <div className="testimonials-welcome">

          <div>
            <span>ADMINISTRATION</span>
            <h2>Member Testimonials</h2>
            <p>
              Review member experiences and choose which testimonials
              may be displayed on the TWC homepage.
            </p>
          </div>

          <button
            type="button"
            className="testimonials-refresh"
            onClick={loadTestimonials}
            disabled={loading}
          >
            <RefreshCw size={17} />
            {loading ? 'LOADING...' : 'REFRESH'}
          </button>

        </div>

        <div className="testimonials-stats">

          <div className="testimonials-stat-card">
            <MessageSquare size={25} />
            <div>
              <span>TOTAL SUBMISSIONS</span>
              <strong>{loading ? '...' : testimonials.length}</strong>
            </div>
          </div>

          <div className="testimonials-stat-card pending-stat">
            <Clock size={25} />
            <div>
              <span>AWAITING REVIEW</span>
              <strong>{loading ? '...' : pendingCount}</strong>
            </div>
          </div>

          <div className="testimonials-stat-card approved-stat">
            <CheckCircle size={25} />
            <div>
              <span>APPROVED</span>
              <strong>{loading ? '...' : approvedCount}</strong>
            </div>
          </div>

          <div className="testimonials-stat-card rejected-stat">
            <XCircle size={25} />
            <div>
              <span>REJECTED</span>
              <strong>{loading ? '...' : rejectedCount}</strong>
            </div>
          </div>

        </div>

        {error && (
          <div className="testimonials-alert error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="testimonials-alert success" role="status">
            <CheckCircle size={18} />
            {success}
          </div>
        )}

        <div className="testimonials-list-heading">

          <div>
            <h3>SUBMITTED TESTIMONIALS</h3>
            <span>
              {filteredTestimonials.length} submission(s)
            </span>
          </div>

          <label className="testimonials-filter">
            FILTER
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="All">All submissions</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </label>

        </div>

        {loading ? (
          <div className="testimonials-empty">
            Loading member testimonials...
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="testimonials-empty">
            <MessageSquare size={45} />
            <h3>No testimonials found</h3>
            <p>
              {filter === 'All'
                ? 'Member testimonials will appear here when submitted.'
                : `There are currently no ${filter.toLowerCase()} testimonials.`}
            </p>
          </div>
        ) : (
          <div className="testimonials-list">

            {filteredTestimonials.map((item) => (
              <article
                className="admin-testimonial-card"
                key={item.id}
              >

                <div className="admin-testimonial-top">

                  <div className="admin-testimonial-member">
                    <div className="admin-testimonial-avatar">
                      <UserRound size={22} />
                    </div>

                    <div>
                      <h3>{item.full_name}</h3>
                      <span>THIKA WALKING CLUB MEMBER</span>
                    </div>
                  </div>

                  <span
                    className={`admin-testimonial-status ${item.status.toLowerCase()}`}
                  >
                    {item.status}
                  </span>

                </div>

                <div className="admin-testimonial-message">
                  <MessageSquare size={20} />
                  <p>{item.message}</p>
                </div>

                <div className="admin-testimonial-date">
                  <CalendarDays size={15} />
                  Submitted: {formatDate(item.created_at)}
                </div>

                <div className="admin-testimonial-actions">

                  {item.status !== 'Approved' && (
                    <button
                      type="button"
                      className="testimonial-approve-button"
                      disabled={updatingId === item.id}
                      onClick={() =>
                        updateTestimonialStatus(item.id, 'Approved')
                      }
                    >
                      <CheckCircle size={17} />
                      {updatingId === item.id
                        ? 'UPDATING...'
                        : 'APPROVE & PUBLISH'}
                    </button>
                  )}

                  {item.status !== 'Rejected' && (
                    <button
                      type="button"
                      className="testimonial-reject-button"
                      disabled={updatingId === item.id}
                      onClick={() =>
                        updateTestimonialStatus(item.id, 'Rejected')
                      }
                    >
                      <XCircle size={17} />
                      REJECT
                    </button>
                  )}

                  {item.status === 'Approved' && (
                    <span className="testimonial-published-note">
                      <ShieldCheck size={16} />
                      Approved for homepage display
                    </span>
                  )}

                  {item.status === 'Rejected' && (
                    <span className="testimonial-rejected-note">
                      This testimonial is not displayed publicly.
                    </span>
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

export default AdminTestimonials;
