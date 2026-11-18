
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

import {
  ArrowRight,
  CalendarDays,
  Dumbbell,
  Users,
  MessageCircle
} from 'lucide-react';

import '../styles/Home.css';
import '../styles/HomePromotions.css';
import ImageCarousel from '../components/ImageCarousel';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
).replace(/\/$/, '');

function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [advertisements, setAdvertisements] = useState([]);

  // LOAD APPROVED AND ACTIVE ADVERTISEMENTS
  useEffect(() => {
    const controller = new AbortController();

    const loadAdvertisements = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/advertisements/`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('Unable to load advertisements.');
        }

        const data = await response.json();

        setAdvertisements(
          Array.isArray(data.advertisements)
            ? data.advertisements
            : []
        );
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error loading advertisements:', error);
          setAdvertisements([]);
        }
      }
    };

    loadAdvertisements();

    return () => controller.abort();
  }, []);

  // LOAD APPROVED MEMBER TESTIMONIALS
  useEffect(() => {
    const controller = new AbortController();

    const loadTestimonials = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/testimonials/`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('Unable to load testimonials.');
        }

        const data = await response.json();

        setTestimonials(
          Array.isArray(data.testimonials) ? data.testimonials : []
        );

        setActiveTestimonial(0);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error loading testimonials:', error);
          setTestimonials([]);
        }
      }
    };

    loadTestimonials();

    return () => controller.abort();
  }, []);

  // AUTOMATIC TESTIMONIAL SLIDER
  useEffect(() => {
    if (testimonials.length < 2) return undefined;

    const timer = setInterval(() => {
      setActiveTestimonial((current) =>
        (current + 1) % testimonials.length
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <main className="home-page">

      {/* MAIN HOMEPAGE CAROUSEL */}
      <ImageCarousel />

      {/* WHO WE ARE */}
      <section className="intro-section">
        <div className="container intro-grid">

          <div className="intro-content">
            <span className="eyebrow">WHO WE ARE</span>

            <h2 className="section-title">
              TWC TO THE
              <span className="highlight"> WORLD!</span>
            </h2>

            <div className="green-line"></div>

            <p className="section-subtitle">
              Thika Walking Club brings people together through
              movement, fitness, friendship and community.
              Whether you love walking, dancing, fitness challenges
              or simply meeting new people, there is a place for you
              in our family.
            </p>

            <Link to="/about" className="btn btn-primary intro-button">
              DISCOVER TWC <ArrowRight size={18} />
            </Link>
          </div>

          <div className="intro-visual">
            <div className="intro-image">
              <img
                src="/images/thika-walking-new/CAROUSEL3.JPG"
                alt="Members of Thika Walking Club enjoying a group activity"
                className="intro-photo"
              />

              <div className="intro-image-label">
                <strong>ONE TWC</strong>
                <span>SAME FAMILY. DIFFERENT VIBES.</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CLUB PRESIDENT */}
      <section className="president-section">
        <div className="container president-grid">

          <div className="president-photo-wrapper">
            <img
              src="/images/thika-walking-new/PAT.JPG"
              alt="Thika Walking Club president holding the club flag"
              className="president-photo"
              loading="lazy"
            />

            <div className="president-photo-label">
              <span>LEADERSHIP</span>
              <strong>THIKA WALKING CLUB</strong>
            </div>
          </div>

          <div className="president-content">
            <span className="eyebrow">THE PERSON BEHIND THE MOVEMENT</span>

            <h2 className="section-title">
              LEADING THE
              <span className="highlight"> TWC FAMILY.</span>
            </h2>

            <div className="green-line"></div>

            <p className="section-subtitle">
              Every great community begins with a vision.
              At Thika Walking Club, our leadership is built
              around bringing people together, encouraging
              healthy lifestyles and creating meaningful
              connections through movement.
            </p>

            <p className="president-message">
              One vision. One community. One step at a time.
            </p>

            <Link to="/about" className="btn btn-primary">
              GET TO KNOW TWC <ArrowRight size={18} />
            </Link>
          </div>

        </div>
      </section>

      {/* TWC COMMUNITY STATISTICS */}
      <section className="twc-stats-section">
        <div className="container twc-stats-grid">

          <div className="twc-stat-item">
            <div className="twc-stat-icon">
              <MessageCircle size={34} />
            </div>

            <strong>2,100+</strong>
            <span>WHATSAPP MEMBERS</span>
          </div>

          <div className="twc-stat-item">
            <div className="twc-stat-icon">
              <Users size={34} />
            </div>

            <strong>10,000+</strong>
            <span>COMMUNITY MEMBERS</span>
          </div>

        </div>
      </section>

      {/* SPONSORED ADVERTISEMENTS */}
      {advertisements.length > 0 && (
        <section className="home-sponsored-section">
          <div className="container">

            <div className="home-sponsored-heading">
              <span className="eyebrow">OUR ADVERTISING PARTNERS</span>

              <h2 className="section-title">
                SPONSORED
                <span className="highlight"> ADVERTISEMENTS.</span>
              </h2>

              <p className="section-subtitle">
                Discover businesses and services supporting our
                community through our advertising partners.
              </p>
            </div>

            <div className="home-sponsored-grid">
              {advertisements.map((advertisement) => (
                <article
                  className="home-sponsored-card"
                  key={advertisement.id}
                >
                  {advertisement.image && (
                    <a
                      href={advertisement.destination_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="home-sponsored-image-link"
                      aria-label={`Visit ${advertisement.headline}`}
                    >
                      <img
                        src={advertisement.image}
                        alt={advertisement.headline}
                        className="home-sponsored-image"
                        loading="lazy"
                      />
                    </a>
                  )}

                  <div className="home-sponsored-content">
                    <span className="home-sponsored-label">
                      SPONSORED
                    </span>

                    {advertisement.business_name && (
                      <span className="home-sponsored-business">
                        {advertisement.business_name}
                      </span>
                    )}

                    <h3>{advertisement.headline}</h3>

                    {advertisement.description && (
                      <p>{advertisement.description}</p>
                    )}

                    <a
                      href={advertisement.destination_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="home-sponsored-link"
                    >
                      LEARN MORE <ArrowRight size={17} />
                    </a>
                  </div>
                </article>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* UPCOMING EVENTS */}
      <section className="event-section">
        <div className="container event-grid">

          <div className="event-info">
            <span className="eyebrow">SAVE THE DATE</span>

            <h2 className="section-title">
              UPCOMING
              <span className="highlight"> EVENTS</span>
            </h2>

            <p className="section-subtitle">
              Don't miss our walks, fitness sessions, bootcamps
              and community experiences.
            </p>

            <Link to="/events" className="btn btn-primary">
              EXPLORE EVENTS <CalendarDays size={18} />
            </Link>
          </div>

          <div className="event-card">
            <div className="event-card-icon">
              <CalendarDays size={40} />
            </div>

            <span className="event-label">TWC COMMUNITY</span>

            <h3>THE NEXT CHALLENGE STARTS WITH YOU!</h3>

            <p>
              Join our community and stay updated on upcoming
              walking experiences and fitness events.
            </p>

            <Link to="/events" className="event-link">
              SEE UPCOMING EVENTS <ArrowRight size={17} />
            </Link>
          </div>

        </div>
      </section>

      {/* TWC HOME WORKOUT PROMOTION */}
      <section className="home-training-section">
        <div className="container">

          <div className="home-training-card">

            <div className="home-training-image">
              <img
                src="/images/thika-walking-new/PAT.JPG"
                alt="Pat Okaji, President of Thika Walking Club"
                loading="lazy"
              />
            </div>

            <div className="home-training-content">
              <span className="home-training-label">
                TWC HOME WORKOUT
              </span>

              <h2>
                YOUR FITNESS.
                <span> YOUR JOURNEY.</span>
              </h2>

              <p className="home-training-trainer">
                Train with Pat Okaji
                <strong>President, Thika Walking Club</strong>
              </p>

              <p>
                Join TWC's Home Workout programme and take a
                positive step towards a healthier, more active
                lifestyle. The programme is designed to support
                weight management, body toning, endurance,
                general fitness and mental wellness.
              </p>

              <div className="home-training-price">
                <span>SIX WORKOUT SESSIONS</span>
                <strong>Ksh 2,000</strong>
              </div>

              <Link
                to="/personal-training"
                className="home-training-button"
              >
                EXPLORE TWC HOME WORKOUT
                <ArrowRight size={19} />
              </Link>

              <small>
                Submit an enquiry to discuss availability and scheduling.
              </small>
            </div>

            <div className="home-training-icon" aria-hidden="true">
              <Dumbbell size={48} />
            </div>

          </div>

        </div>
      </section>

      {/* LIFE AT TWC / GALLERY PREVIEW */}
      <section className="media-section">
        <div className="container">

          <div className="section-heading">
            <span className="eyebrow">OUR COMMUNITY</span>

            <h2 className="section-title">
              LIFE AT
              <span className="highlight"> TWC.</span>
            </h2>

            <p className="section-subtitle">
              Every walk, every laugh and every shared experience
              creates another beautiful TWC memory.
            </p>
          </div>

          <div className="twc-gallery-preview">
            <Link to="/gallery" className="twc-gallery-tile twc-gallery-featured">
              <img
                src="/images/thika-walking-new/CAROUSEL.JPG"
                alt="TWC community moments"
                loading="lazy"
              />
              <div className="twc-gallery-caption">
                <span>THE TWC EXPERIENCE</span>
                <h3>ONE FAMILY. MANY MEMORIES.</h3>
              </div>
            </Link>

            <Link to="/gallery" className="twc-gallery-tile">
              <img
                src="/images/thika-walking-new/ZUMBA2.JPG"
                alt="TWC Zumba session"
                loading="lazy"
              />
              <div className="twc-gallery-caption">
                <span>FITNESS & FUN</span>
                <h3>DANCE ZUMBA MOMENTS</h3>
              </div>
            </Link>

            <Link to="/gallery" className="twc-gallery-tile">
              <img
                src="/images/thika-walking-new/TEAMBUILDING.JPG"
                alt="TWC team building"
                loading="lazy"
              />
              <div className="twc-gallery-caption">
                <span>TOGETHER WE GROW</span>
                <h3>TEAM BUILDING</h3>
              </div>
            </Link>

            <Link to="/gallery" className="twc-gallery-tile">
              <img
                src="/images/thika-walking-new/AEROBICS.JPG"
                alt="TWC aerobics session"
                loading="lazy"
              />
              <div className="twc-gallery-caption">
                <span>ACTIVE LIFESTYLE</span>
                <h3>MOVE WITH US</h3>
              </div>
            </Link>

            <Link to="/gallery" className="twc-gallery-tile">
              <img
                src="/images/thika-walking-new/IMG_1619.JPG"
                alt="TWC club moments"
                loading="lazy"
              />
              <div className="twc-gallery-caption">
                <span>MAKING MEMORIES</span>
                <h3>OUR CLUB MOMENTS</h3>
              </div>
            </Link>
          </div>

          <div className="twc-gallery-action">
            <p>
              Every picture tells a story. Come and experience ours.
              TWC TO THE WORLD!
            </p>

            <Link to="/gallery" className="btn btn-primary">
              EXPLORE FULL GALLERY <ArrowRight size={18} />
            </Link>
          </div>

        </div>
      </section>

      {/* MERCHANDISE */}
      <section className="shop-section">
        <div className="container shop-grid">

          <div className="shop-image-wrap">
            <img
              src="/images/twc-merchandise.jpg"
              alt="Thika Walking Club hoodies"
              className="shop-image"
            />
          </div>

          <div className="shop-content">
            <span className="eyebrow">REPRESENT THE FAMILY</span>

            <h2 className="section-title">
              WEAR THE
              <span className="highlight"> TWC SPIRIT.</span>
            </h2>

            <p className="section-subtitle">
              Explore our club merchandise and represent the
              Thika Walking Club community wherever you go.
            </p>

            <div className="shop-action">
              <Link to="/shop" className="btn btn-primary">
                VISIT OUR SHOP <ArrowRight size={18} />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* JOIN THE CLUB */}
      <section className="join-section">
        <div className="container join-content">

          <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>

          <h2>
            TAKE THE FIRST STEP.
            <span> JOIN THE FAMILY.</span>
          </h2>

          <p>
            Whether you are walking, dancing, training or making
            new friends, there is a place for you at Thika Walking Club.
          </p>

          <Link to="/register" className="btn btn-primary">
            BECOME PART OF TWC <ArrowRight size={20} />
          </Link>

        </div>
      </section>


      {/* BUY TWC A SODA */}
      <section className="soda-support-section">
        <div className="container">
          <div className="soda-support-card">
            

            <span className="soda-support-label">
              A LITTLE LOVE GOES A LONG WAY
            </span>

            <h2>
              ENJOYING THE TWC
              <span> GOOD VIBES?</span>
            </h2>

            <p>
              Help keep the walking, friendship and community spirit alive.
              Treat Thika Walking Club to a soda and show us some love!
            </p>

            <div className="soda-support-decoration" aria-hidden="true">
  
</div>

<div className="soda-pointing-hand" aria-hidden="true">
  👇
</div>

            <a
              href="https://buymesoda.com/eWsRxseBPzerXprP1YfunozIqMj1"
              target="_blank"
              rel="noopener noreferrer"
              className="soda-support-button"
            >
              BUY TWC A SODA 
            </a>

            <small>Every bit of support is appreciated. TWC TO THE WORLD! Thank you!</small>
          </div>
        </div>
      </section>


      {/* APPROVED MEMBER TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="twc-testimonials-section">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">VOICES OF OUR COMMUNITY</span>

              <h2 className="section-title">
                WHAT OUR MEMBERS
                <span className="highlight"> SAY.</span>
              </h2>

              <p className="section-subtitle">
                Real experiences shared by our TWC members.
              </p>
            </div>

            <div className="twc-testimonial-slider">
              <div
                className="twc-testimonial-card"
                aria-live="polite"
                key={testimonials[activeTestimonial]?.id}
              >
                <div className="twc-testimonial-quote" aria-hidden="true">
                  “
                </div>

                <p className="twc-testimonial-message">
                  {testimonials[activeTestimonial]?.message}
                </p>

                <div className="twc-testimonial-author">
                  {testimonials[activeTestimonial]?.full_name}
                </div>

                <span className="twc-testimonial-role">
                  TWC MEMBER
                </span>
              </div>

              {testimonials.length > 1 && (
                <div className="twc-testimonial-controls">
                  <div className="twc-testimonial-dots">
                    {testimonials.map((testimonial, index) => (
                      <button
                        key={testimonial.id}
                        type="button"
                        className={`twc-testimonial-dot ${
                          activeTestimonial === index ? 'active' : ''
                        }`}
                        onClick={() => setActiveTestimonial(index)}
                        aria-label={`Show testimonial ${index + 1}`}
                        aria-pressed={activeTestimonial === index}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

    </main>
  );
}

export default Home;
