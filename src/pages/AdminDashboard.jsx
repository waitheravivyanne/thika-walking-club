import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ShoppingBag,
  MessageSquare,
  CalendarDays,
  LogOut,
  RefreshCw,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

import AdminNavbar from '../components/AdminNavbar';
import '../styles/AdminDashboard.css';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
).replace(/\/$/, '');

function AdminDashboard() {
  const navigate = useNavigate();

  const [memberCount, setMemberCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    const token = localStorage.getItem('twc_member_token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const headers = {
        Authorization: `Bearer ${token}`
      };

      const [membersResponse, feedbackResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/members`, { headers }),
        fetch(`${API_BASE_URL}/api/feedback/`, { headers })
      ]);

      if (
        membersResponse.status === 401 ||
        membersResponse.status === 403 ||
        feedbackResponse.status === 401 ||
        feedbackResponse.status === 403
      ) {
        navigate('/login', { replace: true });
        return;
      }

      const membersResult = await membersResponse.json();
      const feedbackResult = await feedbackResponse.json();

      if (!membersResponse.ok) {
        throw new Error(
          membersResult.message || 'Could not load membership information.'
        );
      }

      if (!feedbackResponse.ok) {
        throw new Error(
          feedbackResult.message || 'Could not load feedback information.'
        );
      }

      setMemberCount(membersResult.total || 0);
      setFeedbackCount(feedbackResult.new || 0);

    } catch (err) {
      setError(err.message || 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('twc_member_token');
    localStorage.removeItem('twc_member');
    navigate('/login', { replace: true });
  };

  return (
    <main className="admin-dashboard">

      <header className="admin-header">

        <div className="admin-brand">
          <img
            src="/images/IMG-20261109-WA0019.jpg"
            alt="Thika Walking Club Logo"
            className="dashboard-logo"
          />

          <div>
            <span>THIKA WALKING CLUB</span>
            <h1>ADMINISTRATION</h1>
          </div>
        </div>

        <button
          className="admin-logout"
          onClick={handleLogout}
        >
          <LogOut size={17} />
          LOG OUT
        </button>

      </header>

      <AdminNavbar />

      <section className="admin-content">

        <div className="admin-welcome">

          <div>
            <span className="admin-eyebrow">
              ADMINISTRATION
            </span>

            <h2>Welcome, PAT</h2>

            <p>
              Manage your Thika Walking Club community,
              events and merchandise from one place.
            </p>
          </div>

          <button
            className="admin-refresh"
            onClick={loadDashboard}
            disabled={loading}
          >
            <RefreshCw size={17} />
            {loading ? 'LOADING...' : 'REFRESH'}
          </button>

        </div>

        {error && (
          <div className="admin-message error">
            {error}
          </div>
        )}

        <div className="admin-management-grid">

          <button
            className="admin-management-card"
            onClick={() => navigate('/admin/members')}
          >
            <div className="admin-card-icon">
              <Users size={32} />
            </div>

            <div className="admin-card-content">
              <span>MEMBER MANAGEMENT</span>
              <h3>Memberships</h3>
              <strong>{loading ? '...' : memberCount}</strong>
              <p>Registered club members</p>
            </div>

            <div className="admin-card-link">
              MANAGE MEMBERS
              <ArrowRight size={18} />
            </div>
          </button>

          <button
            className="admin-management-card"
            onClick={() => navigate('/admin/feedback')}
          >
            <div className="admin-card-icon">
              <MessageSquare size={32} />
            </div>

            <div className="admin-card-content">
              <span>COMMUNITY MESSAGES</span>
              <h3>Feedback</h3>
              <strong>{loading ? '...' : feedbackCount}</strong>
              <p>New feedback messages</p>
            </div>

            <div className="admin-card-link">
              MANAGE FEEDBACK
              <ArrowRight size={18} />
            </div>
          </button>

          <button
            className="admin-management-card"
            onClick={() => navigate('/admin/merchandise')}
          >
            <div className="admin-card-icon">
              <ShoppingBag size={32} />
            </div>

            <div className="admin-card-content">
              <span>SHOP MANAGEMENT</span>
              <h3>Merch Bought</h3>
              <strong>—</strong>
              <p>Merchandise orders and purchases</p>
            </div>

            <div className="admin-card-link">
              VIEW PURCHASES
              <ArrowRight size={18} />
            </div>
          </button>

          <button
            className="admin-management-card"
            onClick={() => navigate('/admin/events')}
          >
            <div className="admin-card-icon">
              <CalendarDays size={32} />
            </div>

            <div className="admin-card-content">
              <span>CLUB ACTIVITIES</span>
              <h3>Walks & Events</h3>
              <strong>→</strong>
              <p>Create events and manage registrations</p>
            </div>

            <div className="admin-card-link">
              MANAGE EVENTS
              <ArrowRight size={18} />
            </div>
          </button>

        </div>

        <div className="admin-dashboard-footer">
          <ShieldCheck size={19} />
          <p>
            THIKA WALKING CLUB
            <span> • </span>
            ADMINISTRATION PORTAL
          </p>
        </div>

      </section>

    </main>
  );
}

export default AdminDashboard;