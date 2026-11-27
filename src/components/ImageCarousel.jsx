
import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { Link } from 'react-router-dom';
import '../styles/ImageCarousel.css';

const fallbackSlides = [
  {
    image: '/images/thika-walking-new/CAROUSEL.webp',
    title: 'MORE THAN A WALK.',
    highlight: 'A COMMUNITY.',
    subtitle: 'Movement, friendship and unforgettable experiences. Discover what makes Thika Walking Club special.'
  },
  {
    image: '/images/thika-walking-new/CAROUSEL2.webp',
    title: 'SAME FAMILY.',
    highlight: 'DIFFERENT VIBES.',
    subtitle: 'Different people, different stories, one community united by movement and friendship.'
  },
  {
    image: '/images/thika-walking-new/CAROUSEL3.webp',
    title: 'MOVE TOGETHER.',
    highlight: 'GROW TOGETHER.',
    subtitle: 'Building connections, creating memories and celebrating every step.'
  },
  {
    image: '/images/thika-walking-new/CAROUSEL4.webp',
    title: 'EVERY STEP.',
    highlight: 'A NEW STORY.',
    subtitle: 'From walks to shared adventures, there is always something happening at TWC.'
  },
  {
    image: '/images/thika-walking-new/CAROUSEL5.webp',
    title: 'YOUR PEOPLE.',
    highlight: 'YOUR COMMUNITY.',
    subtitle: 'Come for the movement. Stay for the friendships. Be part of the TWC family.'
  }
];

function ImageCarousel() {
  const [slides] = useState(fallbackSlides);
  const [activeSlide, setActiveSlide] = useState(0);

  const nextSlide = () => {
    setActiveSlide((current) => (current + 1) % slides.length);
  };

  const previousSlide = () => {
    setActiveSlide((current) =>
      (current - 1 + slides.length) % slides.length
    );
  };

  useEffect(() => {
    if (slides.length < 2) return undefined;

    const timer = setInterval(nextSlide, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const currentSlide = slides[activeSlide];

  return (
    <section
      className="twc-carousel"
      aria-label="Thika Walking Club community"
    >
      {slides.map((slide, index) => (
        <div
          key={slide.image}
          className={`carousel-slide ${
            activeSlide === index ? 'active' : ''
          }`}
          style={{
            backgroundImage: `url("${slide.image}")`
          }}
          aria-hidden={activeSlide !== index}
        />
      ))}

      <div className="carousel-overlay" />

      <div className="carousel-content" key={activeSlide}>
        <span className="carousel-label">
          FITNESS • FRIENDSHIP • COMMUNITY
        </span>

        <h2>
          {currentSlide.title}
          <span>{currentSlide.highlight}</span>
        </h2>

        <p>{currentSlide.subtitle}</p>

        <div className="carousel-actions">
          <Link to="/register" className="carousel-join">
            JOIN OUR COMMUNITY
          </Link>

          <Link to="/events" className="carousel-explore">
            EXPLORE OUR WALKS
          </Link>
        </div>

        <span className="carousel-brand">
          THIKA WALKING CLUB
        </span>
      </div>

      <button
        className="carousel-arrow carousel-prev"
        onClick={previousSlide}
        aria-label="Previous photograph"
      >
        <ChevronLeft size={25} />
      </button>

      <button
        className="carousel-arrow carousel-next"
        onClick={nextSlide}
        aria-label="Next photograph"
      >
        <ChevronRight size={25} />
      </button>

      <div className="carousel-dots">
        {slides.map((slide, index) => (
          <button
            key={slide.image}
            className={`carousel-dot ${
              activeSlide === index ? 'active' : ''
            }`}
            onClick={() => setActiveSlide(index)}
            aria-label={`Show photograph ${index + 1}`}
            aria-current={activeSlide === index ? 'true' : undefined}
          />
        ))}
      </div>

      <span className="carousel-counter">
        {activeSlide + 1} / {slides.length}
      </span>
    </section>
  );
}

export default ImageCarousel;
