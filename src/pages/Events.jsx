import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  MapPin,
  Wallet,
  Users,
  RefreshCw,
  LogIn,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

import '../styles/Events.css';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
).replace(/\/$/, '');

function Events() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [mpesaCodes, setMpesaCodes] = useState({});

  const token = localStorage.getItem('twc_member_token');

  const loadEvents = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/events/`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Unable to load events.');
      }

      setEvents(result.events || []);
    } catch (error) {
      setMessage(error.message || 'Unable to connect to the server.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const loadMyRegistrations = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/events/my-registrations`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const result = await response.json();

        setRegisteredEvents(
          (result.registrations || []).map(
            registration => registration.event_id
          )
        );
      }
    } catch (error) {
      console.error('Could not load registrations:', error);
    }
  };

  useEffect(() => {
    loadEvents();
    loadMyRegistrations();
  }, []);

  const handleRegistration = async (event) => {
    if (!token) {
      navigate('/login');
      return;
    }

    const isFree = Number(event.fee) === 0;
    const transactionCode = (
      mpesaCodes[event.id] || ''
    ).trim().toUpperCase();

    if (!isFree && !transactionCode) {
      setMessage('Please enter your M-Pesa transaction code before registering.');
      setMessageType('error');
      return;
    }

    if (!isFree && transactionCode.length > 40) {
      setMessage('The M-Pesa transaction code cannot exceed 40 characters.');
      setMessageType('error');
      return;
    }

    setRegistering(event.id);
    setMessage('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/events/${event.id}/register`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            mpesa_transaction_code: isFree ? '' : transactionCode
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || 'Registration could not be completed.'
        );
      }

      setRegisteredEvents(previous =>
        previous.includes(event.id)
          ? previous
          : [...previous, event.id]
      );

      setMpesaCodes(previous => ({
        ...previous,
        [event.id]: ''
      }));

      setMessage(
        result.message ||
        (
          isFree
            ? 'You have registered successfully.'
            : 'Your payment details have been submitted for verification.'
        )
      );

      setMessageType('success');

      await loadEvents();
    } catch (error) {
      setMessage(error.message || 'Registration could not be completed.');
      setMessageType('error');
    } finally {
      setRegistering(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(`${dateString}T00:00:00`).toLocaleDateString(
      'en-KE',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }
    );
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();

    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString('en-KE', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <main className="events-page">

      <section className="events-hero">
        <span className="events-eyebrow">
          SAME FAMILY. DIFFERENT VIBES. ONE TWC.
        </span>

        <h1>
          TWC <span>EVENTS</span>
        </h1>

        <p>
          Let's move. Let's connect. Let's grow.
          Discover walks, fitness sessions and exciting experiences
          with the Thika Walking Club family.
        </p>
      </section>

      <section className="events-intro container">

        <div className="events-heading-row">
          <div>
            <h2>
              UPCOMING <span>EVENTS</span>
            </h2>

            <p>
              Find an event, bring your energy and be part of the movement.
            </p>
          </div>

          <button
            className="events-refresh-button"
            type="button"
            onClick={loadEvents}
            disabled={loading}
          >
            <RefreshCw size={17} />
            {loading ? 'LOADING...' : 'REFRESH'}
          </button>
        </div>

        <div className="events-free-note">
          <Wallet size={24} />

          <div>
            <strong>TWC WALKS REMAIN FREE!</strong>

            <p>
              Community walks remain free. Selected special events
              may have a participation fee.
            </p>
          </div>
        </div>

        {message && (
          <div className={`events-message ${messageType}`}>
            {messageType === 'success'
              ? <CheckCircle size={19} />
              : <AlertCircle size={19} />
            }

            <span>{message}</span>
          </div>
        )}

      </section>

      <section className="events-grid container">

        {loading ? (
          <div className="events-empty">
            Loading upcoming TWC events...
          </div>
        ) : events.length === 0 ? (
          <div className="events-empty">
            <CalendarDays size={45} />

            <h3>NO UPCOMING EVENTS JUST YET</h3>

            <p>
              New walks and activities will appear here once
              they are announced by Thika Walking Club.
            </p>
          </div>
        ) : (
          events.map(event => {
            const isFree = Number(event.fee) === 0;
            const isRegistered = registeredEvents.includes(event.id);

            const isFull =
              event.capacity !== null &&
              event.capacity !== undefined &&
              event.registered_count >= event.capacity;

            return (
              <article className="event-card" key={event.id}>

                <div className="event-card-top">
                  <span className="event-category">
                    {event.category}
                  </span>

                  <span className={isFree ? 'event-free' : 'event-paid'}>
                    {isFree
                      ? 'FREE'
                      : `KSH ${Number(event.fee).toLocaleString('en-KE')}`
                    }
                  </span>
                </div>

                <div className="event-icon">
                  <CalendarDays size={42} />
                </div>

                <h3>{event.name}</h3>

                <p className="event-description">
                  {event.description}
                </p>

                <div className="event-details">

                  <p>
                    <CalendarDays size={17} />
                    {formatDate(event.event_date)}
                  </p>

                  <p>
                    <Clock size={17} />
                    {formatTime(event.event_time)}
                  </p>

                  <p>
                    <MapPin size={17} />
                    {event.location}
                  </p>

                  <p>
                    <Users size={17} />
                    {event.capacity
                      ? `${event.registered_count} / ${event.capacity} registered`
                      : `${event.registered_count} registered`
                    }
                  </p>

                </div>

                {!isFree && (
                  <div className="event-payment">
                    <Wallet size={17} />

                    <span>
                      <strong>M-PESA BUY GOODS PAYMENT</strong>
                      <br />
                      Pay the event participation fee using:
                      <br />
                      <strong>BUY GOODS TILL: 123456</strong>
                      <br />
                      <strong>Business name: THIKA WALKING HUB</strong>
                      <br />
                      Keep your M-Pesa transaction confirmation.
                      Your payment will be verified by TWC.
                    </span>
                  </div>
                )}

                {!isFree && !isRegistered && (
                  <div className="event-mpesa-input">
                    <label htmlFor={`mpesa-code-${event.id}`}>
                      M-PESA TRANSACTION CODE
                    </label>

                    <input
                      id={`mpesa-code-${event.id}`}
                      type="text"
                      value={mpesaCodes[event.id] || ''}
                      onChange={(e) => {
                        const value = e.target.value
                          .toUpperCase()
                          .replace(/\s/g, '');

                        setMpesaCodes(previous => ({
                          ...previous,
                          [event.id]: value
                        }));
                      }}
                      placeholder="Enter your M-Pesa code"
                      maxLength={40}
                      required
                      disabled={registering === event.id || isFull}
                    />

                    <small>
                      Enter the transaction code from your M-Pesa confirmation message.
                    </small>
                  </div>
                )}

                <button
                  className="event-button"
                  type="button"
                  disabled={
                    isRegistered ||
                    isFull ||
                    registering === event.id
                  }
                  onClick={() => handleRegistration(event)}
                >
                  {registering === event.id
                    ? 'SUBMITTING...'
                    : isRegistered
                      ? 'ALREADY REGISTERED'
                      : isFull
                        ? 'FULLY BOOKED'
                        : !token
                          ? 'LOG IN TO REGISTER'
                          : isFree
                            ? 'JOIN THIS WALK'
                            : 'SUBMIT PAYMENT DETAILS'
                  }
                </button>

                {!token && (
                  <p className="event-login-note">
                    <LogIn size={14} />
                    Member login required to register.
                  </p>
                )}

              </article>
            );
          })
        )}

      </section>

      <section className="events-bottom">
        <h2>LET'S MOVE. LET'S CONNECT. LET'S GROW.</h2>
        <p>Be part of the TWC experience.</p>
      </section>

    </main>
  );
}

export default Events;