
import { useState } from 'react';
import {
  Dumbbell,
  UserRound,
  CalendarDays,
  CheckCircle,
  ArrowRight,
  Camera,
  Trophy
} from 'lucide-react';

import '../styles/PersonalTraining.css';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
).replace(/\/$/, '');

const initialForm = {
  full_name: '',
  email: '',
  phone: '',
  preferred_days: '',
  preferred_time: '',
  message: ''
};

// Replace these placeholder image paths with approved participant photos.
const transformationPhotos = [
  {
    id: 1,
    image: '/images/training/member-1.jpg',
    title: 'Training Journey 01',
    caption: 'A member of our training community',
    testimonial: 'Add an approved participant testimonial here.'
  },
  {
    id: 2,
    image: '/images/training/member-2.jpg',
    title: 'Training Journey 02',
    caption: 'Consistency and commitment',
    testimonial: 'Add an approved participant testimonial here.'
  },
  {
    id: 3,
    image: '/images/training/member-3.jpg',
    title: 'Training Journey 03',
    caption: 'Building an active lifestyle',
    testimonial: 'Add an approved participant testimonial here.'
  },
  {
    id: 4,
    image: '/images/training/member-4.jpg',
    title: 'Training Journey 04',
    caption: 'Progress through regular activity',
    testimonial: 'Add an approved participant testimonial here.'
  },
  {
    id: 5,
    image: '/images/training/member-5.jpg',
    title: 'Training Journey 05',
    caption: 'Every step is progress',
    testimonial: 'Add an approved participant testimonial here.'
  },
  {
    id: 6,
    image: '/images/training/member-6.jpg',
    title: 'Training Journey 06',
    caption: 'Celebrating active living',
    testimonial: 'Add an approved participant testimonial here.'
  }
];

function PersonalTraining() {
  const [form, setForm] = useState(initialForm);
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/training/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(form)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || 'Unable to submit your enquiry.'
        );
      }

      setSuccess(
        result.message ||
        'Your enquiry has been received. Our team will contact you.'
      );

      setForm(initialForm);
    } catch (err) {
      setError(err.message || 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="personal-training-page">

      {/* HERO */}

      <section className="training-hero">
        <div className="training-hero-content">

          <span className="training-eyebrow">
            THIKA WALKING CLUB
          </span>

          <h1>
            INVEST IN YOUR
            <span> FITNESS JOURNEY</span>
          </h1>

          <p>
            Take a step towards a more active lifestyle with personal
            training offered through Thika Walking Club.
          </p>

          <a href="#training-package" className="training-hero-button">
            Explore the Package
            <ArrowRight size={18} />
          </a>

        </div>
      </section>

      {/* INTRODUCTION */}

      <section className="training-introduction">
        <div className="training-intro-icon">
          <Dumbbell size={38} />
        </div>

        <div>
          <span>PERSONAL TRAINING</span>
          <h2>Make Every Session Count</h2>

          <p>
            Whether you are getting started or looking to make physical
            activity a more regular part of your routine, our personal
            training package offers an opportunity to work towards
            your fitness goals with guidance.
          </p>
        </div>
      </section>

      {/* TRAINER PROFILE */}

      <section className="training-coach-section">
        <div className="training-section-heading">
          <span>GUIDANCE AND EXPERIENCE</span>
          <h2>Meet Your Trainer</h2>
          <p>
            Get to know the person leading our personal training programme.
          </p>
        </div>

        <div className="training-coach-card">

          <div className="training-coach-photo">
            <img
              src="/images/training/pat-okaji.jpg"
              alt="Pat Okaji, President of Thika Walking Club"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
                event.currentTarget.nextElementSibling.style.display = 'flex';
              }}
            />

            <div className="training-photo-placeholder">
              <UserRound size={76} />
              <span>Pat Okaji's Photo</span>
              <small>
                Add pat-okaji.jpg to public/images/training/
              </small>
            </div>
          </div>

          <div className="training-coach-details">
            <span>MEET YOUR TRAINER</span>
            <h2>Pat Okaji</h2>
            <h3>President, Thika Walking Club</h3>

            <p>
              Personal training is offered by Pat Okaji, President
              of Thika Walking Club. Get in touch to enquire about
              the programme and discuss your preferred training times.
            </p>

            <div className="training-coach-highlight">
              <CheckCircle size={19} />
              <span>
                Personal training enquiries and five-session package
              </span>
            </div>

            <a
              href="#training-enquiry"
              className="training-coach-button"
            >
              Enquire About Training
              <ArrowRight size={18} />
            </a>
          </div>

        </div>
      </section>

      {/* TRANSFORMATION GALLERY */}

      <section className="training-transformations-section">
        <div className="training-section-heading">
          <span>OUR COMMUNITY</span>
          <h2>Training Journeys and Experiences</h2>
          <p>
            Celebrate the people who make our walking and fitness
            community special.
          </p>
        </div>

        <div className="training-transformation-grid">
          {transformationPhotos.map((person) => (
            <article
              className="training-transformation-card"
              key={person.id}
            >
              <div className="training-transformation-photo">
                <img
                  src={person.image}
                  alt={person.title}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                    event.currentTarget.nextElementSibling.style.display = 'flex';
                  }}
                />

                <div className="training-transformation-placeholder">
                  <Camera size={38} />
                  <strong>{person.title}</strong>
                  <span>
                    Add photo to public/images/training/
                  </span>
                </div>
              </div>

              <div className="training-transformation-content">
                <h3>{person.title}</h3>
                <p>{person.caption}</p>

                <blockquote>
                  "{person.testimonial}"
                </blockquote>
              </div>
            </article>
          ))}
        </div>

        <div className="training-gallery-note">
          <Trophy size={21} />
          <p>
            Every person's journey is different. These gallery spaces
            are reserved for real community stories and photographs
            shared with permission.
          </p>
        </div>
      </section>

      {/* PACKAGE */}

      <section
        className="training-package-section"
        id="training-package"
      >

        <div className="training-section-heading">
          <span>OUR TRAINING OFFER</span>
          <h2>Simple. Accessible. Purposeful.</h2>
          <p>
            Start with a five-session personal training package.
          </p>
        </div>

        <div className="training-package-card">

          <div className="training-package-top">
            <span>PERSONAL TRAINING PACKAGE</span>
            <Dumbbell size={34} />
          </div>

          <div className="training-package-price">
            <span>Ksh</span>
            <strong>1,000</strong>
          </div>

          <h3>Five Training Sessions</h3>

          <p>
            One package covering five personal training sessions.
          </p>

          <div className="training-package-divider" />

          <div className="training-package-feature">
            <CheckCircle size={19} />
            Five training sessions
          </div>

          <div className="training-package-feature">
            <CheckCircle size={19} />
            Personal training enquiry
          </div>

          <div className="training-package-feature">
            <CheckCircle size={19} />
            Discuss your preferred training times
          </div>

        
          <small>
            Training arrangements and session availability will be
            confirmed by the TWC team.
          </small>

        </div>
      </section>

      {/* ENQUIRY FORM */}

      <section
        className="training-enquiry-section"
        id="training-enquiry"
      >

        <div className="training-enquiry-intro">
          <CalendarDays size={38} />

          <span>TAKE THE FIRST STEP</span>
          <h2>Interested in Personal Training?</h2>

          <p>
            Complete the enquiry form and our team will get in touch
            to discuss the package and possible training arrangements.
          </p>

          <div className="training-enquiry-price">
            <strong>Ksh 1,000</strong>
            <span>Five-session package</span>
          </div>
        </div>

        <form
          className="training-enquiry-form"
          onSubmit={handleSubmit}
        >

          <div className="training-form-heading">
            <h3>Training Enquiry Form</h3>
            <p>Fields marked * are required.</p>
          </div>

          {error && (
            <div className="training-alert error">
              {error}
            </div>
          )}

          {success && (
            <div className="training-alert success">
              <CheckCircle size={19} />
              {success}
            </div>
          )}

          <label>
            Full Name *
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              maxLength={120}
              required
            />
          </label>

          <div className="training-form-row">

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
                placeholder="Your contact number"
                maxLength={20}
                required
              />
            </label>

          </div>

          <label>
            Preferred Training Days
            <input
              type="text"
              name="preferred_days"
              value={form.preferred_days}
              onChange={handleChange}
              placeholder="e.g. Monday, Wednesday, Saturday"
              maxLength={200}
            />
          </label>

          <label>
            Preferred Training Time
            <input
              type="text"
              name="preferred_time"
              value={form.preferred_time}
              onChange={handleChange}
              placeholder="e.g. Morning or afternoon"
              maxLength={120}
            />
          </label>

          <label>
            Additional Information
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Tell us anything else you would like us to know..."
              rows={5}
            />
          </label>

          <button
            type="submit"
            className="training-submit-button"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Training Enquiry'}
            {!loading && <ArrowRight size={19} />}
          </button>

          <p className="training-form-note">
            Submitting this form is an enquiry, not a confirmed booking
            or payment.
          </p>

        </form>
      </section>

    </main>
  );
}

export default PersonalTraining;
