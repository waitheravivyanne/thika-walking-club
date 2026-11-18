
import { useCallback, useEffect, useState } from 'react';
import {
  Megaphone,
  RefreshCw,
  ExternalLink,
  CalendarDays,
  CheckCircle,
  XCircle,
  Clock,
  Save,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';

import AdminNavbar from '../components/AdminNavbar';
import '../styles/AdminAdvertisements.css';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
).replace(/\/$/, '');

const PAYMENT_OPTIONS = ['Pending', 'Verified', 'Rejected'];
const APPROVAL_OPTIONS = ['Pending', 'Approved', 'Rejected'];

function AdminAdvertisements() {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const getToken = () => localStorage.getItem('twc_member_token');

  const loadAdvertisements = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/advertisements/admin`,
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
        throw new Error(data.message || 'Unable to load advertisements.');
      }

      setAdvertisements(
        (data.advertisements || []).map((ad) => ({
          ...ad,
          start_date: ad.start_date || '',
          end_date: ad.end_date || ''
        }))
      );
    } catch (err) {
      setError(err.message || 'Unable to load advertisements.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdvertisements();
  }, [loadAdvertisements]);

  const updateLocalAdvertisement = (id, field, value) => {
    setAdvertisements((previous) =>
      previous.map((ad) =>
        ad.id === id ? { ...ad, [field]: value } : ad
      )
    );
  };

  const saveAdvertisement = async (ad) => {
    setSavingId(ad.id);
    setError('');
    setNotice('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/advertisements/admin/${ad.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({
            payment_status: ad.payment_status,
            approval_status: ad.approval_status,
            is_active: ad.is_active,
            start_date: ad.start_date || null,
            end_date: ad.end_date || null
          })
        }
      );

      if (response.status === 401 || response.status === 403) {
        window.location.href = '/login';
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to update advertisement.');
      }

      setNotice(`Advertisement #${ad.id} updated successfully.`);
      await loadAdvertisements();
    } catch (err) {
      setError(err.message || 'Unable to update advertisement.');
    } finally {
      setSavingId(null);
    }
  };

  const deleteAdvertisement = async (ad) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete advertisement #${ad.id}?\n\n` +
      `"${ad.headline}"\n\n` +
      'This action cannot be undone. The advert will be removed from the database.'
    );

    if (!confirmed) return;

    setDeletingId(ad.id);
    setError('');
    setNotice('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/advertisements/admin/${ad.id}`,
        {
          method: 'DELETE',
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
        throw new Error(data.message || 'Unable to delete advertisement.');
      }

      setAdvertisements((previous) =>
        previous.filter((item) => item.id !== ad.id)
      );

      setNotice(data.message || `Advertisement #${ad.id} deleted successfully.`);
    } catch (err) {
      setError(err.message || 'Unable to delete advertisement.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (value) => {
    if (!value) return 'Not set';

    return new Date(`${value}T00:00:00`).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCampaignStatus = (ad) => {
    if (
      ad.payment_status !== 'Verified' ||
      ad.approval_status !== 'Approved' ||
      !ad.is_active
    ) {
      return 'Not published';
    }

    const today = new Date().toISOString().slice(0, 10);

    if (ad.start_date && ad.start_date > today) return 'Scheduled';
    if (ad.end_date && ad.end_date < today) return 'Campaign ended';

    return 'Published';
  };

  return (
    <div className="admin-advertisements-page">
      <AdminNavbar />

      <main className="admin-advertisements-main">
        <section className="admin-advertisements-header">
          <div>
            <span className="admin-advertisements-eyebrow">
              TWC ADMINISTRATION
            </span>

            <h1>
              <Megaphone size={30} />
              Advertisement Manager
            </h1>

            <p>
              Review submitted adverts, verify M-Pesa payments and manage
              publication.
            </p>
          </div>

          <button
            className="admin-ad-refresh"
            onClick={loadAdvertisements}
            disabled={loading || Boolean(deletingId)}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </section>

        <section className="admin-advertisement-notice">
          <CheckCircle size={20} />
          <div>
            <strong>Publication requires three separate checks</strong>
            <p>
              Verify payment, approve the advert and activate it. Payment
              verification alone does not publish an advert.
            </p>
          </div>
        </section>

        {error && (
          <div className="admin-ad-alert error">
            <XCircle size={18} />
            {error}
          </div>
        )}

        {notice && (
          <div className="admin-ad-alert success">
            <CheckCircle size={18} />
            {notice}
          </div>
        )}

        <section className="admin-advertisements-list">
          <div className="admin-ad-list-heading">
            <div>
              <h2>Submitted Advertisements</h2>
              <p>{advertisements.length} advertisement(s) received</p>
            </div>
          </div>

          {loading ? (
            <div className="admin-ad-loading">
              <RefreshCw size={24} className="admin-ad-spin" />
              <p>Loading advertisements...</p>
            </div>
          ) : advertisements.length === 0 ? (
            <div className="admin-ad-empty">
              <Megaphone size={42} />
              <h3>No advertisements yet</h3>
              <p>Submitted adverts will appear here for review.</p>
            </div>
          ) : (
            <div className="admin-advertisement-cards">
              {advertisements.map((ad) => (
                <article className="admin-advertisement-card" key={ad.id}>
                  <div className="admin-ad-card-top">
                    <div>
                      <span className="admin-ad-reference">
                        ADVERTISEMENT #{ad.id}
                      </span>

                      <h3>{ad.headline}</h3>

                      <p className="admin-ad-business">
                        {ad.business_name || ad.advertiser_name}
                      </p>
                    </div>

                    <span
                      className={`admin-ad-publication-status ${getCampaignStatus(ad)
                        .toLowerCase()
                        .replace(/\s+/g, '-')}`}
                    >
                      {getCampaignStatus(ad)}
                    </span>
                  </div>

                  {ad.image && (
                    <a
                      href={ad.image}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-ad-banner-link"
                    >
                      <img
                        src={ad.image}
                        alt={`${ad.headline} banner`}
                        className="admin-ad-banner"
                      />

                      <span>
                        <ImageIcon size={14} />
                        View banner
                      </span>
                    </a>
                  )}

                  {ad.description && (
                    <p className="admin-ad-description">{ad.description}</p>
                  )}

                  <div className="admin-ad-information">
                    <div>
                      <span>Advertiser</span>
                      <strong>{ad.advertiser_name}</strong>
                    </div>

                    <div>
                      <span>Email</span>
                      <strong>{ad.email}</strong>
                    </div>

                    <div>
                      <span>Phone</span>
                      <strong>{ad.phone}</strong>
                    </div>

                    <div>
                      <span>Advertising fee</span>
                      <strong>
                        {ad.advertising_fee !== null &&
                        ad.advertising_fee !== undefined
                          ? `Ksh ${Number(ad.advertising_fee).toLocaleString('en-KE')}`
                          : 'Not set'}
                      </strong>
                    </div>
                  </div>

                  <a
                    href={ad.destination_url}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-ad-destination"
                  >
                    <ExternalLink size={15} />
                    Open advertiser website
                  </a>

                  <div className="admin-ad-payment-section">
                    <h4>
                      <Clock size={17} />
                      M-Pesa Payment Verification
                    </h4>

                    <div className="admin-ad-payment-details">
                      <div>
                        <span>Transaction code</span>
                        <strong>
                          {ad.mpesa_transaction_code || 'Not provided'}
                        </strong>
                      </div>

                      <div>
                        <span>Payment destination</span>
                        <strong>123456 — THIKA WALKING HUB</strong>
                      </div>
                    </div>

                    <label className="admin-ad-field">
                      Payment status

                      <select
                        value={ad.payment_status}
                        onChange={(e) =>
                          updateLocalAdvertisement(
                            ad.id,
                            'payment_status',
                            e.target.value
                          )
                        }
                      >
                        {PAYMENT_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="admin-ad-approval-section">
                    <h4>Advertisement Approval</h4>

                    <label className="admin-ad-field">
                      Approval status

                      <select
                        value={ad.approval_status}
                        onChange={(e) =>
                          updateLocalAdvertisement(
                            ad.id,
                            'approval_status',
                            e.target.value
                          )
                        }
                      >
                        {APPROVAL_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="admin-ad-campaign-section">
                    <h4>
                      <CalendarDays size={17} />
                      Campaign Schedule
                    </h4>

                    <div className="admin-ad-date-grid">
                      <label className="admin-ad-field">
                        Start date

                        <input
                          type="date"
                          value={ad.start_date}
                          onChange={(e) =>
                            updateLocalAdvertisement(
                              ad.id,
                              'start_date',
                              e.target.value
                            )
                          }
                        />
                      </label>

                      <label className="admin-ad-field">
                        End date

                        <input
                          type="date"
                          value={ad.end_date}
                          min={ad.start_date || undefined}
                          onChange={(e) =>
                            updateLocalAdvertisement(
                              ad.id,
                              'end_date',
                              e.target.value
                            )
                          }
                        />
                      </label>
                    </div>

                    <div className="admin-ad-schedule-summary">
                      <span>Campaign period</span>
                      <strong>
                        {formatDate(ad.start_date)} — {formatDate(ad.end_date)}
                      </strong>
                    </div>
                  </div>

                  <div className="admin-ad-activation">
                    <div>
                      <strong>Activate advertisement</strong>
                      <p>
                        Only activate after payment verification and approval.
                      </p>
                    </div>

                    <label className="admin-ad-toggle">
                      <input
                        type="checkbox"
                        checked={Boolean(ad.is_active)}
                        onChange={(e) =>
                          updateLocalAdvertisement(
                            ad.id,
                            'is_active',
                            e.target.checked
                          )
                        }
                      />
                      <span />
                    </label>
                  </div>

                  <button
                    className="admin-ad-save-button"
                    onClick={() => saveAdvertisement(ad)}
                    disabled={
                      savingId === ad.id ||
                      deletingId === ad.id
                    }
                  >
                    <Save size={17} />
                    {savingId === ad.id ? 'Saving...' : 'Save Advertisement'}
                  </button>

                  <button
                    type="button"
                    className="admin-ad-delete-button"
                    onClick={() => deleteAdvertisement(ad)}
                    disabled={
                      deletingId === ad.id ||
                      savingId === ad.id
                    }
                  >
                    <Trash2 size={17} />
                    {deletingId === ad.id
                      ? 'Deleting Advertisement...'
                      : 'Delete Advertisement'}
                  </button>

                  <p className="admin-ad-created">
                    Submitted:{' '}
                    {ad.created_at
                      ? new Date(ad.created_at).toLocaleString('en-KE')
                      : 'Date unavailable'}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminAdvertisements;
