import { useCallback, useEffect, useState } from 'react';
import {
  Dumbbell,
  RefreshCw,
  UserRound,
  Phone,
  Mail,
  CalendarDays,
  Clock,
  MessageSquare,
  Save,
  CheckCircle,
  XCircle
} from 'lucide-react';

import AdminNavbar from '../components/AdminNavbar';
import '../styles/AdminTraining.css';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
).replace(/\/$/, '');

const TRAINING_STATUSES = [
  'New',
  'Contacted',
  'Scheduled',
  'Completed',
  'Declined'
];

function AdminTraining() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const getToken = () => localStorage.getItem('twc_member_token');

  const loadEnquiries = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/training/admin`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      if (response.status === 401 || response.status === 403) {
        window.location.href = '/login';
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load training enquiries.');
      }

      setEnquiries(
        (data.enquiries || []).map((enquiry) => ({
          ...enquiry
        }))
      );
    } catch (err) {
      setError(err.message || 'Unable to load training enquiries.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEnquiries();
  }, [loadEnquiries]);

  const updateStatus = (id, status) => {
    setEnquiries((previous) =>
      previous.map((enquiry) =>
        enquiry.id === id ? { ...enquiry, status } : enquiry
      )
    );
  };

  const saveStatus = async (enquiry) => {
    setSavingId(enquiry.id);
    setError('');
    setNotice('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/training/admin/${enquiry.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({
            status: enquiry.status
          })
        }
      );

      if (response.status === 401 || response.status === 403) {
        window.location.href = '/login';
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to update enquiry.');
      }

      setNotice(`Enquiry #${enquiry.id} updated successfully.`);
      await loadEnquiries();
    } catch (err) {
      setError(err.message || 'Unable to update enquiry.');
    } finally {
      setSavingId(null);
    }
  };

  const formatDate = (value) => {
    if (!value) return 'Date unavailable';

    return new Date(value).toLocaleString('en-KE', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const statusClass = (status) =>
    (status || 'new').toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="admin-training-page">
      <AdminNavbar />

      <main className="admin-training-main">
        <section className="admin-training-header">
          <div>
            <span className="admin-training-eyebrow">
              TWC ADMINISTRATION
            </span>

            <h1>
              <Dumbbell size={30} />
              Personal Training
            </h1>

            <p>
              View enquiries, contact interested participants and manage
              training arrangements.
            </p>
          </div>

          <button
            className="admin-training-refresh"
            onClick={loadEnquiries}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </section>

        <section className="admin-training-package-banner">
          <div className="admin-training-package-icon">
            <Dumbbell size={27} />
          </div>

          <div>
            <span>AVAILABLE PACKAGE</span>
            <h2>Personal Training — 5 Sessions</h2>
            <p>Trainer: Pat Okaji, President of Thika Walking Club</p>
          </div>

          <strong>Ksh 1,000</strong>
        </section>

        {error && (
          <div className="admin-training-alert error">
            <XCircle size={18} />
            {error}
          </div>
        )}

        {notice && (
          <div className="admin-training-alert success">
            <CheckCircle size={18} />
            {notice}
          </div>
        )}

        <section className="admin-training-list">
          <div className="admin-training-list-heading">
            <div>
              <h2>Training Enquiries</h2>
              <p>{enquiries.length} enquiry/enquiries received</p>
            </div>
          </div>

          {loading ? (
            <div className="admin-training-empty">
              <RefreshCw size={25} className="admin-training-spin" />
              <p>Loading enquiries...</p>
            </div>
          ) : enquiries.length === 0 ? (
            <div className="admin-training-empty">
              <Dumbbell size={42} />
              <h3>No training enquiries yet</h3>
              <p>New enquiries submitted through the website will appear here.</p>
            </div>
          ) : (
            <div className="admin-training-cards">
              {enquiries.map((enquiry) => (
                <article
                  className="admin-training-card"
                  key={enquiry.id}
                >
                  <div className="admin-training-card-header">
                    <div>
                      <span className="admin-training-reference">
                        ENQUIRY #{enquiry.id}
                      </span>

                      <h3>{enquiry.full_name}</h3>
                      <p>{enquiry.package_name}</p>
                    </div>

                    <span
                      className={`admin-training-status ${statusClass(
                        enquiry.status
                      )}`}
                    >
                      {enquiry.status}
                    </span>
                  </div>

                  <div className="admin-training-details">
                    <div>
                      <UserRound size={17} />
                      <span>{enquiry.full_name}</span>
                    </div>

                    <div>
                      <Mail size={17} />
                      <a href={`mailto:${enquiry.email}`}>
                        {enquiry.email}
                      </a>
                    </div>

                    <div>
                      <Phone size={17} />
                      <a href={`tel:${enquiry.phone}`}>
                        {enquiry.phone}
                      </a>
                    </div>

                    <div>
                      <Dumbbell size={17} />
                      <span>
                        Ksh{' '}
                        {Number(enquiry.package_price || 1000).toLocaleString(
                          'en-KE'
                        )}
                      </span>
                    </div>
                  </div>

                  {(enquiry.preferred_days || enquiry.preferred_time) && (
                    <div className="admin-training-preferences">
                      <h4>
                        <CalendarDays size={17} />
                        Preferred Schedule
                      </h4>

                      {enquiry.preferred_days && (
                        <p>
                          <strong>Days:</strong> {enquiry.preferred_days}
                        </p>
                      )}

                      {enquiry.preferred_time && (
                        <p>
                          <strong>Time:</strong> {enquiry.preferred_time}
                        </p>
                      )}
                    </div>
                  )}

                  {enquiry.message && (
                    <div className="admin-training-message">
                      <h4>
                        <MessageSquare size={17} />
                        Additional Message
                      </h4>

                      <p>{enquiry.message}</p>
                    </div>
                  )}

                  <div className="admin-training-meta">
                    <Clock size={15} />
                    Received: {formatDate(enquiry.created_at)}
                  </div>

                  <div className="admin-training-status-editor">
                    <label htmlFor={`training-status-${enquiry.id}`}>
                      Update enquiry status
                    </label>

                    <select
                      id={`training-status-${enquiry.id}`}
                      value={enquiry.status}
                      onChange={(e) =>
                        updateStatus(enquiry.id, e.target.value)
                      }
                    >
                      {TRAINING_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    className="admin-training-save"
                    onClick={() => saveStatus(enquiry)}
                    disabled={savingId === enquiry.id}
                  >
                    <Save size={17} />
                    {savingId === enquiry.id
                      ? 'Saving...'
                      : 'Save Status'}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminTraining;
