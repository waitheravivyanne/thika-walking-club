import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import '../styles/ImageCarousel.css';

const fallbackSlides = [
  {
    image: '/images/thika-walking-new/CAROUSEL.JPG',
    title: 'TWC TO THE WORLD!',
    subtitle: 'Walking together. Growing together.'
  },
  {
    image: '/images/thika-walking-new/CAROUSEL2.JPG',
    title: 'TWC TO THE WORLD!',
    subtitle: 'Same family. Different vibes. One TWC.'
  },
  {
    image: '/images/thika-walking-new/CAROUSEL3.JPG',
    title: 'TWC TO THE WORLD!',
    subtitle: 'Building friendships and teamwork.'
  },
  {
    image: '/images/thika-walking-new/CAROUSEL4.JPG',
    title: 'TWC TO THE WORLD!',
    subtitle: 'Every moment tells a story.'
  },
  {
    image: '/images/thika-walking-new/CAROUSEL5.JPG',
    title: 'TWC TO THE WORLD!',
    subtitle: 'Stronger, healthier and happier together.'
  }
];

function ImageCarousel() {
  const [slides, setSlides] = useState(fallbackSlides);
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

    const timer = setInterval(() => {
      setActiveSlide((current) =>
        (current + 1) % slides.length
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const currentSlide = slides[activeSlide];

  return (
    <section
      className="twc-carousel"
      aria-label="Thika Walking Club photo slideshow"
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

        <h2>{currentSlide.title}</h2>

        <p>{currentSlide.subtitle}</p>

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
