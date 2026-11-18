import { useState } from 'react';
import {
  Megaphone,
  Upload,
  CheckCircle,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import '../styles/Advertise.css';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
).replace(/\/$/, '');

const initialForm = {
  advertiser_name: '',
  business_name: '',
  email: '',
  phone: '',
  headline: '',
  description: '',
  destination_url: '',
  mpesa_transaction_code: ''
};

function Advertise() {
  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Please choose a JPG, PNG or WEBP image.');
      event.target.value = '';
      setImage(null);
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('Your image must not exceed 8 MB.');
      event.target.value = '';
      setImage(null);
      return;
    }

    setError('');
    setImage(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!image) {
      setError('Please upload an advert image.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        data.append(key, value.trim());
      });

      data.append('image', image);

      const response = await fetch(
        `${API_BASE_URL}/api/advertisements/`,
        {
          method: 'POST',
          body: data
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || 'Unable to submit your advertisement.'
        );
      }

      setSuccess(
        result.message ||
        'Your advertisement has been submitted for review.'
      );

      setForm(initialForm);
      setImage(null);

      const fileInput = document.getElementById('advert-image');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setError(err.message || 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="advertise-page">

      <section className="advertise-hero">
        <div className="advertise-hero-content">
          <span className="advertise-eyebrow">
            PARTNER WITH THIKA WALKING CLUB
          </span>

          <h1>
            PUT YOUR BUSINESS
            <span> IN THE SPOTLIGHT</span>
          </h1>

          <p>
            Reach an active community through Thika Walking Club.
            Promote your business, services, products or upcoming events
            to our website visitors.
          </p>

          <a href="#advertise-form" className="advertise-hero-button">
            Submit Your Advert
            <Megaphone size={18} />
          </a>
        </div>
      </section>

      <section className="advertise-benefits">
        <div className="advertise-section-heading">
          <span>GROW WITH OUR COMMUNITY</span>
          <h2>Advertise With TWC</h2>
          <p>
            We welcome local businesses, entrepreneurs and individuals
            interested in promoting their offerings.
          </p>
        </div>

        <div className="advertise-benefit-grid">
          <article>
            <Megaphone size={30} />
            <h3>Promote Your Business</h3>
            <p>
              Showcase your products, services, offers and events.
            </p>
          </article>

          <article>
            <ShieldCheck size={30} />
            <h3>Admin Reviewed</h3>
            <p>
              Every submission is reviewed before it appears on our website.
            </p>
          </article>

          <article>
            <CheckCircle size={30} />
            <h3>Simple Submission</h3>
            <p>
              Submit your advert details and payment reference online.
            </p>
          </article>
        </div>
      </section>

      <section className="advertise-form-section" id="advertise-form">
        <div className="advertise-form-intro">
          <span>START ADVERTISING</span>
          <h2>Submit Your Advertisement</h2>
          <p>
            Complete the form below. Our administration team will
            review your submission and contact you if clarification
            or further information is required.
          </p>

          <div className="advertise-payment-card">
            <CreditCard size={25} />

            <div>
              <h3>M-Pesa Payment</h3>
              <p>Pay through our official Buy Goods Till:</p>
              <strong>123456</strong>
              <span>THIKA WALKING HUB</span>
            </div>
          </div>

          <p className="advertise-payment-note">
            Enter your M-Pesa transaction code in the form. Payment
            will be verified by our administration team. Submitting
            an advert does not guarantee publication.
          </p>
        </div>

        <form className="advertise-form" onSubmit={handleSubmit}>

          {error && (
            <div className="advertise-alert error">
              {error}
            </div>
          )}

          {success && (
            <div className="advertise-alert success">
              <CheckCircle size={19} />
              {success}
            </div>
          )}

          <div className="advertise-form-heading">
            <h3>Advertiser Information</h3>
            <p>Fields marked * are required.</p>
          </div>

          <label>
            Your Full Name *
            <input
              type="text"
              name="advertiser_name"
              value={form.advertiser_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              maxLength={150}
              required
            />
          </label>

          <label>
            Business / Organisation Name
            <input
              type="text"
              name="business_name"
              value={form.business_name}
              onChange={handleChange}
              placeholder="Enter business name (if applicable)"
              maxLength={150}
            />
          </label>

          <div className="advertise-form-row">
            <label>
              Email Address *
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                maxLength={120}
                required
              />
            </label>

            <label>
              Phone Number *
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g. 07XXXXXXXX"
                maxLength={20}
                required
              />
            </label>
          </div>

          <div className="advertise-form-heading">
            <h3>Advertisement Details</h3>
          </div>

          <label>
            Advert Headline *
            <input
              type="text"
              name="headline"
              value={form.headline}
              onChange={handleChange}
              placeholder="A short, attention-grabbing headline"
              maxLength={200}
              required
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Tell visitors about your business, product or service..."
              rows={5}
            />
          </label>

          <label className="advertise-upload">
            <Upload size={27} />
            <strong>Upload Advertisement Image *</strong>
            <span>JPG, PNG or WEBP. Maximum size: 8 MB.</span>

            <input
              id="advert-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              required
            />

            {image && (
              <span className="advertise-selected-file">
                Selected: {image.name}
              </span>
            )}
          </label>

          <label>
            Website or Destination Link *
            <input
              type="url"
              name="destination_url"
              value={form.destination_url}
              onChange={handleChange}
              placeholder="https://example.com"
              maxLength={500}
              required
            />
            <small>
              Where should visitors go when they click your advert?
            </small>
          </label>

          <div className="advertise-form-heading">
            <h3>Payment Reference</h3>
          </div>

          <label>
            M-Pesa Transaction Code *
            <input
              type="text"
              name="mpesa_transaction_code"
              value={form.mpesa_transaction_code}
              onChange={handleChange}
              placeholder="Enter your M-Pesa confirmation code"
              maxLength={40}
              required
            />
          </label>

          <div className="advertise-submit-note">
            Your advert will remain unpublished until payment has been
            verified and the advert has been approved by TWC administration.
          </div>

          <button
            type="submit"
            className="advertise-submit-button"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Advertisement'}
            {!loading && <Megaphone size={19} />}
          </button>

        </form>
      </section>

    </main>
  );
}

export default Advertise;
