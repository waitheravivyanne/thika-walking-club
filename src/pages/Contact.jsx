import { useState } from 'react';

import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Send
} from 'lucide-react';

import '../styles/Contact.css';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
).replace(/\/$/, '');

function Contact() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));

    setSuccess('');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/feedback/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || 'Unable to send your message.'
        );
      }

      setSuccess(
        'Thank you for contacting TWC! Your message has been received.'
      );

      setFormData({
        full_name: '',
        email: '',
        subject: '',
        message: ''
      });

    } catch (err) {
      setError(
        err.message || 'Unable to connect to the server. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">

      <section className="contact-hero">
        <p>WE'D LOVE TO HEAR FROM YOU</p>
        <h1>GET IN TOUCH</h1>

        <p>
          Have a question, suggestion or want to join our community?
          Reach out to the TWC family.
        </p>
      </section>

      <section className="contact-content container">

        <div className="contact-info">
          <h2>LET'S CONNECT</h2>

          <p className="contact-description">
            We're always happy to connect with fellow fitness
            enthusiasts and members of our community.
          </p>

          <div className="contact-item">
            <MapPin />
            <div>
              <h3>LOCATION</h3>
              <p>Thika, Kenya</p>
            </div>
          </div>

          <div className="contact-item">
            <Phone />
            <div>
              <h3>PHONE</h3>
              <p>+254 719 802 423</p>
            </div>
          </div>

          <div className="contact-item">
            <Mail />
            <div>
              <h3>EMAIL</h3>
              <p>Contact us through the message form</p>
            </div>
          </div>

          <div className="contact-item">
            <MessageCircle />
            <div>
              <h3>WHATSAPP</h3>
              <a
                href="https://wa.me/254719802423"
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat with Thika Walking Club
              </a>
            </div>
          </div>
        </div>

        <div className="contact-form-container">
          <h2>SEND US A MESSAGE</h2>

          {success && (
            <div className="contact-success" role="status">
              {success}
            </div>
          )}

          {error && (
            <div className="contact-error" role="alert">
              {error}
            </div>
          )}

          <form
            className="contact-form"
            onSubmit={handleSubmit}
          >

            <input
              type="text"
              name="full_name"
              placeholder="Your full name"
              value={formData.full_name}
              onChange={handleChange}
              maxLength={120}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Your email address"
              value={formData.email}
              onChange={handleChange}
              maxLength={120}
              required
            />

            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              maxLength={200}
              required
            />

            <textarea
              name="message"
              placeholder="Write your message here..."
              rows="6"
              value={formData.message}
              onChange={handleChange}
              maxLength={10000}
              required
            />

            <button
              type="submit"
              disabled={loading}
            >
              <Send size={18} />
              {loading ? 'SENDING...' : 'SEND MESSAGE'}
            </button>

          </form>
        </div>

      </section>

    </div>
  );
}

export default Contact;
