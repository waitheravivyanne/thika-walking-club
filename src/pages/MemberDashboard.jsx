import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  CalendarDays,
  LogOut,
  Footprints,
  Pencil,
  Save,
  X,
  CheckCircle,
  MapPin,
  Clock,
  Wallet,
  Users,
  RefreshCw,
  MessageSquare,
  Send
} from 'lucide-react';

import '../styles/MemberDashboard.css';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
).replace(/\/$/, '');

async function fetchMemberEvents(token) {
  const [eventsResponse, registrationsResponse] = await Promise.all([
    fetch(`${API_BASE_URL}/api/events/`),
    fetch(`${API_BASE_URL}/api/events/my-registrations`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  ]);

  const eventsResult = await eventsResponse.json();
  const registrationsResult = await registrationsResponse.json();

  if (!eventsResponse.ok) {
    throw new Error(
      eventsResult.message || 'Unable to load upcoming events.'
    );
  }

  if (!registrationsResponse.ok) {
    throw new Error(
      registrationsResult.message || 'Unable to load your registrations.'
    );
  }

  return {
    events: eventsResult.events || [],
    registrations: registrationsResult.registrations || []
  };
}

function formatEventDate(dateString) {
  if (!dateString) return 'Date to be announced';

  return new Date(`${dateString}T00:00:00`).toLocaleDateString(
    'en-KE',
    {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }
  );
}

function formatEventTime(timeString) {
  if (!timeString) return 'Time to be announced';

  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString('en-KE', {
    hour: 'numeric',
    minute: '2-digit'
  });
}

function MemberDashboard() {
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    phone: ''
  });

  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState('');
  const [eventMessage, setEventMessage] = useState('');
  const [registering, setRegistering] = useState(null);

  const [testimonial, setTestimonial] = useState(null);
  const [testimonialMessage, setTestimonialMessage] = useState('');
  const [testimonialConsent, setTestimonialConsent] = useState(false);
  const [testimonialLoading, setTestimonialLoading] = useState(true);
  const [testimonialSaving, setTestimonialSaving] = useState(false);
  const [testimonialError, setTestimonialError] = useState('');
  const [testimonialSuccess, setTestimonialSuccess] = useState('');

  const loadMyTestimonial = async (token) => {
    setTestimonialLoading(true);
    setTestimonialError('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/testimonials/mine`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || 'Unable to load your testimonial.'
        );
      }

      setTestimonial(result.testimonial || null);
      setTestimonialMessage(result.testimonial?.message || '');
    } catch (testimonialLoadError) {
      setTestimonialError(testimonialLoadError.message);
    } finally {
      setTestimonialLoading(false);
    }
  };

  const loadMemberEvents = async (token) => {
    setEventsLoading(true);
    setEventsError('');

    try {
      const data = await fetchMemberEvents(token);
      setEvents(data.events);
      setRegistrations(data.registrations);
    } catch (eventError) {
      setEventsError(eventError.message);
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadMember = async () => {
      const token = localStorage.getItem('twc_member_token');

      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const result = await response.json();

        if (!response.ok) {
          localStorage.removeItem('twc_member_token');
          localStorage.removeItem('twc_member');
          navigate('/login', { replace: true });
          return;
        }

        if (!cancelled) {
          setMember(result.member);
          setFormData({
            full_name: result.member.full_name || '',
            phone: result.member.phone || ''
          });

          localStorage.setItem(
            'twc_member',
            JSON.stringify(result.member)
          );

          await loadMemberEvents(token);
          await loadMyTestimonial(token);
        }

      } catch {
        if (!cancelled) {
          setError(
            'We could not connect to the membership system. Please try again.'
          );
        }

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadMember();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('twc_member_token');
    localStorage.removeItem('twc_member');
    navigate('/login', { replace: true });
  };

  const handleEdit = () => {
    setFormData({
      full_name: member.full_name || '',
      phone: member.phone || ''
    });
    setSuccess('');
    setError('');
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setFormData({
      full_name: member.full_name || '',
      phone: member.phone || ''
    });
    setEditing(false);
    setError('');
    setSuccess('');
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    const fullName = formData.full_name.trim();
    const phone = formData.phone.trim();

    if (!fullName || !phone) {
      setError('Please enter your full name and phone number.');
      return;
    }

    const token = localStorage.getItem('twc_member_token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: fullName,
          phone
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Your profile could not be updated.');
        return;
      }

      setMember(result.member);

      setFormData({
        full_name: result.member.full_name,
        phone: result.member.phone
      });

      localStorage.setItem(
        'twc_member',
        JSON.stringify(result.member)
      );

      setEditing(false);
      setSuccess('Your profile has been updated successfully.');

    } catch {
      setError(
        'Unable to connect to the server. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleTestimonialSubmit = async (event) => {
    event.preventDefault();

    const message = testimonialMessage.trim();

    if (message.length < 20 || message.length > 1000) {
      setTestimonialError(
        'Your testimonial must be between 20 and 1000 characters.'
      );
      return;
    }

    if (!testimonialConsent) {
      setTestimonialError(
        'Please agree to publication before submitting.'
      );
      return;
    }

    const token = localStorage.getItem('twc_member_token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    setTestimonialSaving(true);
    setTestimonialError('');
    setTestimonialSuccess('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/testimonials/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            message,
            consent_to_publish: true
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || 'Your testimonial could not be submitted.'
        );
      }

      setTestimonial(result.testimonial);
      setTestimonialMessage(result.testimonial.message);
      setTestimonialConsent(false);
      setTestimonialSuccess(result.message);
    } catch (submissionError) {
      setTestimonialError(submissionError.message);
    } finally {
      setTestimonialSaving(false);
    }
  };

  const handleEventRegistration = async (event) => {
    const token = localStorage.getItem('twc_member_token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    setRegistering(event.id);
    setEventMessage('');
    setEventsError('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/events/${event.id}/register`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || 'Registration could not be completed.'
        );
      }

      setEventMessage(result.message);

      await loadMemberEvents(token);

    } catch (registrationError) {
      setEventMessage(registrationError.message);
    } finally {
      setRegistering(null);
    }
  };

  if (loading) {
    return (
      <main className="member-dashboard-loading">
        <div className="member-loading-icon">
          <Footprints size={32} />
        </div>
        <p>LOADING YOUR TWC ACCOUNT...</p>
      </main>
    );
  }

  if (error && !member) {
    return (
      <main className="member-dashboard-loading">
        <p className="member-dashboard-error">{error}</p>
        <button onClick={() => window.location.reload()}>
          TRY AGAIN
        </button>
      </main>
    );
  }

  if (!member) return null;

  const formattedDate = member.created_at
    ? new Date(member.created_at).toLocaleDateString('en-KE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : 'Not available';

  const registeredEventIds = registrations.map(
    registration => registration.event_id
  );

  return (
    <main className="member-dashboard-page">

      <section className="member-dashboard-hero">
        <div className="member-dashboard-hero-content">
          <span>THIKA WALKING CLUB</span>

          <h1>
            WELCOME,
            <br />
            {member.full_name}
          </h1>

          <p>
            Your TWC member space. Stay active, stay connected
            and keep moving forward.
          </p>
        </div>

        <div className="member-dashboard-hero-icon">
          <img
            src="/images/IMG-20261109-WA0019.jpg"
            alt="Thika Walking Club Logo"
            className="dashboard-logo"
          />
        </div>
      </section>

      <section className="member-dashboard-content">

        <div className="member-dashboard-heading">
          <div>
            <span className="member-dashboard-eyebrow">
              YOUR ACCOUNT
            </span>
            <h2>MEMBER PROFILE</h2>
            <p>Your registered membership information.</p>
          </div>

          <button
            className="member-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            LOG OUT
          </button>
        </div>

        {success && (
          <div className="member-profile-success">
            <CheckCircle size={19} />
            {success}
          </div>
        )}

        {error && (
          <div className="member-profile-error">
            {error}
          </div>
        )}

        <div className="member-profile-card">

          <div className="member-profile-avatar">
            <UserRound size={38} />
          </div>

          <div className="member-profile-name">
            <h3>{member.full_name}</h3>
            <span>
              <ShieldCheck size={15} />
              TWC {member.role || 'Member'}
            </span>
          </div>

          {!editing ? (
            <>
              <div className="member-profile-details">

                <div className="member-detail">
                  <Mail size={20} />
                  <div>
                    <span>EMAIL ADDRESS</span>
                    <strong>{member.email}</strong>
                  </div>
                </div>

                <div className="member-detail">
                  <Phone size={20} />
                  <div>
                    <span>PHONE NUMBER</span>
                    <strong>{member.phone || 'Not provided'}</strong>
                  </div>
                </div>

                <div className="member-detail">
                  <CalendarDays size={20} />
                  <div>
                    <span>MEMBER SINCE</span>
                    <strong>{formattedDate}</strong>
                  </div>
                </div>

              </div>

              <button
                type="button"
                className="member-edit-button"
                onClick={handleEdit}
              >
                <Pencil size={17} />
                EDIT PROFILE
              </button>
            </>
          ) : (
            <form
              className="member-edit-form"
              onSubmit={handleSaveProfile}
            >
              <div className="member-edit-field">
                <label htmlFor="member-full-name">FULL NAME</label>
                <input
                  id="member-full-name"
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  maxLength={120}
                  required
                />
              </div>

              <div className="member-edit-field">
                <label htmlFor="member-email">EMAIL ADDRESS</label>
                <input
                  id="member-email"
                  type="email"
                  value={member.email}
                  disabled
                />
                <small>Email address cannot be changed here.</small>
              </div>

              <div className="member-edit-field">
                <label htmlFor="member-phone">PHONE NUMBER</label>
                <input
                  id="member-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={20}
                  required
                />
              </div>

              <div className="member-edit-actions">
                <button
                  type="submit"
                  className="member-edit-button"
                  disabled={saving}
                >
                  <Save size={17} />
                  {saving ? 'SAVING...' : 'SAVE CHANGES'}
                </button>

                <button
                  type="button"
                  className="member-cancel-button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  <X size={17} />
                  CANCEL
                </button>
              </div>
            </form>
          )}

        </div>

        {/* UPCOMING EVENTS */}

        <section className="member-events-section">
          <div className="member-events-heading">
            <span>BE PART OF THE MOVEMENT</span>
            <h2>UPCOMING TWC EVENTS</h2>
            <p>Discover upcoming walks, fitness activities and club events.</p>
          </div>

          {eventMessage && (
            <div className="member-profile-success">
              <CheckCircle size={19} />
              {eventMessage}
            </div>
          )}

          {eventsError && (
            <p className="member-events-error">{eventsError}</p>
          )}

          {eventsLoading ? (
            <div className="member-events-empty">
              Loading upcoming events...
            </div>
          ) : events.length === 0 ? (
            <div className="member-events-empty">
              No upcoming events have been published yet.
              Check back soon!
            </div>
          ) : (
            <div className="member-events-grid">
              {events.map(event => {
                const isRegistered = registeredEventIds.includes(event.id);
                const isFull = (
                  event.capacity !== null &&
                  event.registered_count >= event.capacity
                );

                return (
                  <article
                    className="member-event-card"
                    key={event.id}
                  >
                    <span className="member-event-category">
                      {event.category}
                    </span>

                    <h3>{event.name}</h3>

                    <p className="member-event-description">
                      {event.description}
                    </p>

                    <div className="member-event-info">
                      <span>
                        <CalendarDays size={16} />
                        {formatEventDate(event.event_date)}
                      </span>

                      <span>
                        <Clock size={16} />
                        {formatEventTime(event.event_time)}
                      </span>

                      <span>
                        <MapPin size={16} />
                        {event.location}
                      </span>

                      <span>
                        <Wallet size={16} />
                        {Number(event.fee) === 0
                          ? 'FREE'
                          : `KSh ${Number(event.fee).toLocaleString('en-KE')}`}
                      </span>

                      {event.capacity !== null && (
                        <span>
                          <Users size={16} />
                          {event.registered_count} / {event.capacity} registered
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="member-event-button"
                      disabled={
                        isRegistered ||
                        isFull ||
                        registering === event.id
                      }
                      onClick={() => handleEventRegistration(event)}
                    >
                      {registering === event.id
                        ? 'REGISTERING...'
                        : isRegistered
                          ? 'ALREADY REGISTERED'
                          : isFull
                            ? 'FULLY BOOKED'
                            : Number(event.fee) === 0
                              ? 'JOIN THIS EVENT'
                              : 'REGISTER FOR EVENT'}
                    </button>
                  </article>
                );
              })}
            </div>
          )}

          <button
            type="button"
            className="member-events-link"
            onClick={() => navigate('/events')}
          >
            VIEW ALL CLUB EVENTS
          </button>
        </section>

        {/* MEMBER REGISTRATION HISTORY */}

        <section className="member-events-section">
          <div className="member-events-heading">
            <span>YOUR TWC ACTIVITIES</span>
            <h2>MY EVENT REGISTRATIONS</h2>
            <p>Keep track of the events you have joined.</p>
          </div>

          {eventsLoading ? (
            <div className="member-events-empty">
              Loading your registrations...
            </div>
          ) : registrations.length === 0 ? (
            <div className="member-events-empty">
              You haven't registered for any events yet.
              Explore the upcoming events above!
            </div>
          ) : (
            registrations.map(registration => (
              <article
                className="member-registration-card"
                key={registration.id}
              >
                <div>
                  <h3>{registration.event_name}</h3>

                  <p>
                    <CalendarDays size={14} />
                    {' '}{formatEventDate(registration.event_date)}
                  </p>

                  <p>
                    <Clock size={14} />
                    {' '}{formatEventTime(registration.event_time)}
                  </p>

                  <p>
                    <MapPin size={14} />
                    {' '}{registration.location}
                  </p>

                  <p>
                    <Wallet size={14} />
                    {' '}
                    {Number(registration.fee) === 0
                      ? 'FREE'
                      : `KSh ${Number(registration.fee).toLocaleString('en-KE')}`}
                  </p>
                </div>

                <span
                  className={`member-registration-status ${
                    registration.status === 'Pending Payment'
                      ? 'pending'
                      : ''
                  }`}
                >
                  {registration.status.toUpperCase()}
                </span>
              </article>
            ))
          )}

          <button
            type="button"
            className="member-events-link"
            onClick={() => {
              const token = localStorage.getItem('twc_member_token');
              if (token) loadMemberEvents(token);
            }}
          >
            <RefreshCw size={14} />
            {' '}REFRESH MY EVENTS
          </button>
        </section>

        {/* MEMBER TESTIMONIAL */}

        <section className="member-testimonial-section">
          <div className="member-events-heading">
            <span>YOUR VOICE MATTERS</span>
            <h2>SHARE YOUR TWC EXPERIENCE</h2>
            <p>
              Tell us what being part of Thika Walking Club
              means to you. Your experience could inspire someone
              else to take their first step!
            </p>
          </div>

          {testimonialSuccess && (
            <div className="member-profile-success">
              <CheckCircle size={19} />
              {testimonialSuccess}
            </div>
          )}

          {testimonialError && (
            <div className="member-profile-error">
              {testimonialError}
            </div>
          )}

          {testimonialLoading ? (
            <div className="member-events-empty">
              Loading your testimonial...
            </div>
          ) : (
            <div className="member-testimonial-card">
              <div className="member-testimonial-intro">
                <div className="member-testimonial-icon">
                  <MessageSquare size={25} />
                </div>

                <div>
                  <h3>Your story, your experience.</h3>
                  <p>
                    Your name will automatically appear with
                    your testimonial if it is approved.
                  </p>
                </div>
              </div>

              {testimonial && (
                <div className="member-testimonial-status">
                  <span>YOUR CURRENT REVIEW STATUS</span>
                  <strong className={
                    testimonial.status === 'Approved'
                      ? 'approved'
                      : testimonial.status === 'Rejected'
                        ? 'rejected'
                        : 'pending'
                  }>
                    {testimonial.status}
                  </strong>
                </div>
              )}

              <form
                className="member-testimonial-form"
                onSubmit={handleTestimonialSubmit}
              >
                <div className="member-testimonial-name">
                  <label>YOUR NAME</label>
                  <strong>{member.full_name}</strong>
                  <small>
                    This name will be displayed alongside your
                    testimonial if you give consent and it is approved.
                  </small>
                </div>

                <div className="member-testimonial-field">
                  <label htmlFor="member-testimonial-message">
                    YOUR TESTIMONIAL
                  </label>

                  <textarea
                    id="member-testimonial-message"
                    value={testimonialMessage}
                    onChange={(event) => {
                      setTestimonialMessage(event.target.value);
                      setTestimonialError('');
                      setTestimonialSuccess('');
                    }}
                    placeholder="Share what you enjoy about TWC, your walking journey, or how the club has encouraged you..."
                    minLength={20}
                    maxLength={1000}
                    rows={6}
                    required
                  />

                  <small>
                    {testimonialMessage.length}/1000 characters
                    (minimum 20)
                  </small>
                </div>

                <label className="member-testimonial-consent">
                  <input
                    type="checkbox"
                    checked={testimonialConsent}
                    onChange={(event) =>
                      setTestimonialConsent(event.target.checked)
                    }
                  />
                  <span>
                    I agree that Thika Walking Club may publicly
                    display my full name and testimonial on its website
                    if my submission is approved.
                  </span>
                </label>

                <button
                  type="submit"
                  className="member-testimonial-submit"
                  disabled={testimonialSaving || testimonialLoading}
                >
                  <Send size={16} />
                  {testimonialSaving
                    ? 'SUBMITTING...'
                    : testimonial
                      ? 'UPDATE & RESUBMIT FOR REVIEW'
                      : 'SUBMIT FOR REVIEW'}
                </button>

                <p className="member-testimonial-note">
                  All testimonials are reviewed by a club administrator
                  before appearing publicly on the website. Updating
                  your testimonial sends it for review again.
                </p>
              </form>
            </div>
          )}
        </section>

        <div className="member-dashboard-message">
          <Footprints size={27} />

          <div>
            <h3>TWC TO THE WORLD!</h3>
            <p>
              Every step counts. Thank you for being part of
              the Thika Walking Club community. TWC TO THE WORLD!!
            </p>
          </div>
        </div>

      </section>
    </main>
  );
}

export default MemberDashboard;
