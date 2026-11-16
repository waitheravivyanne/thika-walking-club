import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  MapPin,
  Users,
  Plus,
  Pencil,
  Eye,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard
} from 'lucide-react';

import AdminNavbar from '../components/AdminNavbar';
import '../styles/AdminEvents.css';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
).replace(/\/$/, '');

const emptyForm = {
  name: '',
  category: 'COMMUNITY WALK',
  description: '',
  event_date: '',
  event_time: '',
  location: 'Thika, Kenya',
  fee: '0',
  capacity: '',
  status: 'Draft'
};

function AdminEvents() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [registrationLoading, setRegistrationLoading] = useState(false);

  const [paymentSavingId, setPaymentSavingId] = useState(null);

  const token = localStorage.getItem('twc_member_token');

  const requestHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // ==========================================
  // LOAD EVENTS
  // ==========================================

  const loadEvents = async () => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/events/admin`,
        { headers: requestHeaders }
      );

      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        navigate('/login', { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || 'Unable to load events.');
      }

      setEvents(result.events || []);

    } catch (err) {
      setError(err.message || 'Unable to connect to the server.');

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // ==========================================
  // FORM HANDLING
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
  };

  // ==========================================
  // CREATE / UPDATE EVENT
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError('');
    setMessage('');

    const payload = {
      ...form,
      fee: Number(form.fee),
      capacity: form.capacity === ''
        ? null
        : Number(form.capacity)
    };

    try {
      const url = editingId
        ? `${API_BASE_URL}/api/events/admin/${editingId}`
        : `${API_BASE_URL}/api/events/admin`;

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: requestHeaders,
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        navigate('/login', { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || 'Unable to save event.');
      }

      setMessage(result.message);
      resetForm();

      await loadEvents();

    } catch (err) {
      setError(err.message || 'Unable to save event.');

    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // EDIT EVENT
  // ==========================================

  const handleEdit = (event) => {
    setForm({
      name: event.name,
      category: event.category,
      description: event.description,
      event_date: event.event_date,
      event_time: event.event_time,
      location: event.location,
      fee: String(event.fee),
      capacity: event.capacity ?? '',
      status: event.status
    });

    setEditingId(event.id);
    setSelectedEvent(null);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // ==========================================
  // VIEW EVENT REGISTRATIONS
  // ==========================================

  const viewRegistrations = async (event) => {
    setSelectedEvent(event);
    setRegistrations([]);
    setRegistrationLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/events/admin/${event.id}/registrations`,
        { headers: requestHeaders }
      );

      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        navigate('/login', { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.message || 'Unable to load registrations.'
        );
      }

      setRegistrations(result.registrations || []);

    } catch (err) {
      setError(err.message || 'Unable to load registrations.');

    } finally {
      setRegistrationLoading(false);
    }
  };

  // ==========================================
  // VERIFY EVENT PAYMENT
  // ==========================================

  const updatePaymentStatus = async (
    registration,
    paymentStatus
  ) => {
    const confirmationMessage = paymentStatus === 'Paid'
      ? `Confirm that payment ${registration.mpesa_transaction_code} has been received?`
      : paymentStatus === 'Rejected'
        ? `Reject payment ${registration.mpesa_transaction_code}?`
        : 'Return this payment to verification pending?';

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    setPaymentSavingId(registration.id);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/events/admin/registrations/${registration.id}/payment`,
        {
          method: 'PATCH',
          headers: requestHeaders,
          body: JSON.stringify({
            payment_status: paymentStatus
          })
        }
      );

      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        navigate('/login', { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.message || 'Unable to update payment.'
        );
      }

      setMessage(result.message);

      // Update the selected registration immediately.
      setRegistrations((previous) =>
        previous.map((item) =>
          item.id === registration.id
            ? result.registration
            : item
        )
      );

      // Refresh event registration counts.
      await loadEvents();

    } catch (err) {
      setError(err.message || 'Unable to update payment.');

    } finally {
      setPaymentSavingId(null);
    }
  };

  // ==========================================
  // PAYMENT STATUS DISPLAY
  // ==========================================

  const getPaymentClass = (status) => {
    switch (status) {
      case 'Paid':
        return 'paid';

      case 'Rejected':
        return 'rejected';

      case 'Verification Pending':
        return 'verification-pending';

      default:
        return 'not-required';
    }
  };

  return (
    <main className="admin-events-page">

      {/* HEADER */}

      <header className="admin-events-header">

        <button
          type="button"
          className="events-back-button"
          onClick={() => navigate('/admin-dashboard')}
        >
          <ArrowLeft size={18} />
          ADMIN DASHBOARD
        </button>

        <div>
          <span>THIKA WALKING CLUB</span>
          <h1>EVENT MANAGEMENT</h1>
          <p>Manage club walks, activities and registrations.</p>
        </div>

      </header>

      <AdminNavbar />

      <section className="admin-events-content">

        {error && (
          <div className="events-alert error">
            {error}
          </div>
        )}

        {message && (
          <div className="events-alert success">
            {message}
          </div>
        )}

        {/* =====================================
            EVENT FORM
        ===================================== */}

        <section className="event-form-card">

          <div className="events-section-heading">

            <div>
              <span>EVENT SETUP</span>
              <h2>
                {editingId ? 'Edit Event' : 'Create New Event'}
              </h2>
            </div>

            <CalendarDays size={30} />

          </div>

          <form
            onSubmit={handleSubmit}
            className="admin-event-form"
          >

            <label>
              Event Name

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. TWC Community Walk"
                maxLength={150}
                required
              />
            </label>

            <label>
              Category

              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. COMMUNITY WALK"
                maxLength={80}
                required
              />
            </label>

            <label className="event-form-full">
              Description

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the event and what participants should expect..."
                required
                rows={4}
              />
            </label>

            <label>
              Event Date

              <input
                type="date"
                name="event_date"
                value={form.event_date}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Starting Time

              <input
                type="time"
                name="event_time"
                value={form.event_time}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Location

              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Event location"
                maxLength={200}
                required
              />
            </label>

            <label>
              Fee (KSh)

              <input
                type="number"
                name="fee"
                value={form.fee}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </label>

            <label>
              Maximum Participants

              <input
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                min="1"
                placeholder="Leave blank for unlimited"
              />
            </label>

            <label>
              Event Status

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </label>

            <div className="event-form-actions">

              <button
                type="submit"
                className="event-save-button"
                disabled={saving}
              >
                <Plus size={18} />

                {saving
                  ? 'SAVING...'
                  : editingId
                    ? 'SAVE CHANGES'
                    : 'CREATE EVENT'}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="event-cancel-button"
                  onClick={resetForm}
                >
                  CANCEL EDITING
                </button>
              )}

            </div>

          </form>

        </section>

        {/* =====================================
            ALL EVENTS
        ===================================== */}

        <section className="admin-events-list">

          <div className="events-section-heading">

            <div>
              <span>CLUB ACTIVITIES</span>
              <h2>All Events</h2>
            </div>

            <button
              type="button"
              className="events-refresh-button"
              onClick={loadEvents}
              disabled={loading}
            >
              <RefreshCw size={17} />
              REFRESH
            </button>

          </div>

          {loading ? (

            <p className="events-empty">
              Loading events...
            </p>

          ) : events.length === 0 ? (

            <p className="events-empty">
              No events have been created yet.
            </p>

          ) : (

            <div className="admin-events-grid">

              {events.map((event) => (

                <article
                  className="admin-event-card"
                  key={event.id}
                >

                  <div className="admin-event-card-top">

                    <span className="admin-event-category">
                      {event.category}
                    </span>

                    <span
                      className={`event-status ${event.status.toLowerCase()}`}
                    >
                      {event.status}
                    </span>

                  </div>

                  <h3>{event.name}</h3>

                  <p className="admin-event-description">
                    {event.description}
                  </p>

                  <div className="admin-event-details">

                    <span>
                      <CalendarDays size={16} />
                      {event.event_date}
                    </span>

                    <span>
                      <MapPin size={16} />
                      {event.location}
                    </span>

                    <span>
                      <Users size={16} />
                      {event.registered_count}
                      {event.capacity
                        ? ` / ${event.capacity}`
                        : ''}
                      {' '}registered
                    </span>

                  </div>

                  <strong className="admin-event-fee">
                    {event.fee === 0
                      ? 'FREE'
                      : `KSh ${Number(event.fee).toLocaleString()}`}
                  </strong>

                  <div className="admin-event-actions">

                    <button
                      type="button"
                      onClick={() => handleEdit(event)}
                    >
                      <Pencil size={16} />
                      EDIT
                    </button>

                    <button
                      type="button"
                      onClick={() => viewRegistrations(event)}
                    >
                      <Eye size={16} />
                      REGISTRATIONS
                    </button>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

        {/* =====================================
            EVENT REGISTRATIONS AND PAYMENTS
        ===================================== */}

        {selectedEvent && (

          <section className="event-registrations-panel">

            <div className="events-section-heading">

              <div>
                <span>PARTICIPANTS AND PAYMENTS</span>
                <h2>{selectedEvent.name}</h2>
              </div>

              <button
                type="button"
                className="event-cancel-button"
                onClick={() => {
                  setSelectedEvent(null);
                  setRegistrations([]);
                }}
              >
                CLOSE
              </button>

            </div>

            {registrationLoading ? (

              <p className="events-empty">
                Loading registrations...
              </p>

            ) : registrations.length === 0 ? (

              <p className="events-empty">
                No members have registered for this event yet.
              </p>

            ) : (

              <div className="event-registration-list">

                {registrations.map((registration) => (

                  <article
                    className="event-registration-item"
                    key={registration.id}
                  >

                    {/* MEMBER DETAILS */}

                    <div className="event-registration-member">

                      <h3>
                        {registration.member.full_name}
                      </h3>

                      <p>
                        {registration.member.email}
                      </p>

                      <p>
                        {registration.member.phone}
                      </p>

                    </div>

                    {/* REGISTRATION STATUS */}

                    <div className="event-registration-statuses">

                      <span
                        className={`registration-status ${
                          registration.status
                            .toLowerCase()
                            .replaceAll(' ', '-')
                        }`}
                      >
                        {registration.status}
                      </span>

                      <span
                        className={`event-payment-status ${getPaymentClass(
                          registration.payment_status
                        )}`}
                      >
                        {registration.payment_status}
                      </span>

                    </div>

                    {/* PAYMENT INFORMATION */}

                    {Number(registration.fee) > 0 && (

                      <div className="event-payment-details">

                        <h4>
                          <CreditCard size={17} />
                          M-PESA PAYMENT
                        </h4>

                        <p>
                          <strong>Transaction code:</strong>
                        </p>

                        <p className="event-transaction-code">
                          {registration.mpesa_transaction_code || 'Not provided'}
                        </p>

                        <p>
                          <strong>Amount:</strong>{' '}
                          KSh {Number(registration.fee).toLocaleString()}
                        </p>

                        <p>
                          <strong>Payment status:</strong>{' '}
                          {registration.payment_status}
                        </p>

                        {/* VERIFICATION ACTIONS */}

                        <div className="event-payment-actions">

                          {registration.payment_status !== 'Paid' && (

                            <>

                              <button
                                type="button"
                                className="event-mark-paid-button"
                                onClick={() =>
                                  updatePaymentStatus(
                                    registration,
                                    'Paid'
                                  )
                                }
                                disabled={
                                  paymentSavingId === registration.id ||
                                  !registration.mpesa_transaction_code
                                }
                              >
                                <CheckCircle size={16} />

                                {paymentSavingId === registration.id
                                  ? 'UPDATING...'
                                  : 'MARK AS PAID'}
                              </button>

                              <button
                                type="button"
                                className="event-reject-payment-button"
                                onClick={() =>
                                  updatePaymentStatus(
                                    registration,
                                    'Rejected'
                                  )
                                }
                                disabled={
                                  paymentSavingId === registration.id ||
                                  !registration.mpesa_transaction_code
                                }
                              >
                                <XCircle size={16} />
                                REJECT PAYMENT
                              </button>

                              {registration.payment_status === 'Rejected' && (

                                <button
                                  type="button"
                                  className="event-pending-payment-button"
                                  onClick={() =>
                                    updatePaymentStatus(
                                      registration,
                                      'Verification Pending'
                                    )
                                  }
                                  disabled={
                                    paymentSavingId === registration.id
                                  }
                                >
                                  <Clock size={16} />
                                  RETURN TO PENDING
                                </button>

                              )}

                            </>

                          )}

                          {registration.payment_status === 'Paid' && (

                            <span className="event-payment-confirmed">
                              <CheckCircle size={17} />
                              PAYMENT VERIFIED
                            </span>

                          )}

                        </div>

                      </div>

                    )}

                    {Number(registration.fee) === 0 && (

                      <div className="event-free-registration">
                        <CheckCircle size={17} />
                        FREE EVENT — NO PAYMENT REQUIRED
                      </div>

                    )}

                  </article>

                ))}

              </div>

            )}

          </section>

        )}

      </section>

    </main>
  );
}

export default AdminEvents;