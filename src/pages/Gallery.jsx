import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

import '../styles/Gallery.css';
import ImageCarousel from '../components/ImageCarousel';

const fallbackGalleryPhotos = [
  {
    image: '/images/IMG-20261109-WA0013.jpg',
    title: 'COMMUNITY WALKS',
    description: 'Sharing the journey, one step at a time.',
    category: 'WALKING',
  },
  {
    image: '/images/IMG-20261109-WA0014.jpg',
    title: 'WALK WITH US',
    description: 'Moving together and creating memories.',
    category: 'WALKING',
  },
  {
    image: '/images/IMG-20261109-WA0015.jpg',
    title: 'FITNESS & FRIENDSHIP',
    description: 'Building healthy habits and lasting friendships.',
    category: 'COMMUNITY',
  },
  {
    image: '/images/IMG-20261109-WA0017.jpg',
    title: 'ONE TWC FAMILY',
    description: 'Different people, one amazing community.',
    category: 'COMMUNITY',
  },
  {
    image: '/images/IMG-20261109-WA0018.jpg',
    title: 'STRONGER TOGETHER',
    description: 'Every step brings us closer.',
    category: 'COMMUNITY',
  },
  {
    image: '/images/thika-walking-new/PAT.JPG',
    title: 'CLUB LEADERSHIP',
    description: 'Representing the spirit of Thika Walking Club.',
    category: 'TWC MOMENTS',
  },

  {
    image: '/images/thika-walking-new/AEROBICS.JPG',
    title: 'AEROBICS & FITNESS',
    description: 'Keeping active, energised and healthy together.',
    category: 'FITNESS',
  },
  {
    image: '/images/thika-walking-new/CAROUSEL.JPG',
    title: 'TWC COMMUNITY MOMENTS',
    description: 'Celebrating the experiences that bring us together.',
    category: 'TWC MOMENTS',
  },
  {
    image: '/images/thika-walking-new/CAROUSEL2.JPG',
    title: 'MEMORIES IN MOTION',
    description: 'Another memorable chapter in our club journey.',
    category: 'TWC MOMENTS',
  },
  {
    image: '/images/thika-walking-new/CAROUSEL3.JPG',
    title: 'LIFE WITH TWC',
    description: 'Enjoying every moment of our walking community.',
    category: 'TWC MOMENTS',
  },
  {
    image: '/images/thika-walking-new/CAROUSEL4.JPG',
    title: 'TOGETHER WE MOVE',
    description: 'Making memories and sharing experiences.',
    category: 'COMMUNITY',
  },
  {
    image: '/images/thika-walking-new/CAROUSEL5.JPG',
    title: 'OUR CLUB STORY',
    description: 'The people and moments behind TWC.',
    category: 'TWC MOMENTS',
  },
  {
    image: '/images/thika-walking-new/IMG_1377.JPG',
    title: 'SPECIAL CLUB MOMENTS',
    description: 'Capturing the spirit of our community.',
    category: 'COMMUNITY',
  },
  {
    image: '/images/thika-walking-new/IMG_1384.JPG',
    title: 'SHARED EXPERIENCES',
    description: 'Growing stronger through shared experiences.',
    category: 'COMMUNITY',
  },
  {
    image: '/images/thika-walking-new/KATABOX.JPG',
    title: 'KATABOX MOMENTS',
    description: 'More memories from the Thika Walking Club journey.',
    category: 'TWC MOMENTS',
  },
  {
    image: '/images/thika-walking-new/TEAMBUILDING.JPG',
    title: 'TEAM BUILDING',
    description: 'Building teamwork, connection and friendship.',
    category: 'TEAM BUILDING',
  },
  {
    image: '/images/thika-walking-new/TEAMBUILDING2.JPG',
    title: 'STRONGER AS A TEAM',
    description: 'Togetherness makes our community stronger.',
    category: 'TEAM BUILDING',
  },
  {
    image: '/images/thika-walking-new/ZUMBA.JPG',
    title: 'ZUMBA & FUN',
    description: 'Moving, dancing and enjoying an active lifestyle.',
    category: 'FITNESS',
  },
  {
    image: '/images/thika-walking-new/ZUMBA2.JPG',
    title: 'ZUMBA ENERGY',
    description: 'Bringing energy and fun to our fitness sessions.',
    category: 'FITNESS',
  },
  {
    image: '/images/thika-walking-new/ZUMBA3.JPG',
    title: 'FITNESS TOGETHER',
    description: 'Celebrating movement, health and friendship.',
    category: 'FITNESS',
  },
];

function Gallery() {
  const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000').replace(/\/$/, '');

  const [galleryPhotos, setGalleryPhotos] = useState(fallbackGalleryPhotos);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadGalleryPhotos = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/photos/?placement=gallery`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('Unable to load gallery photos.');
        }

        const result = await response.json();

        if (Array.isArray(result.photos) && result.photos.length > 0) {
          const uploadedPhotos = result.photos.map((photo) => ({
            image: photo.url?.startsWith('http')
              ? photo.url
              : `${API_BASE_URL}${photo.url || ''}`,
            title: photo.caption || 'TWC MOMENTS',
            description: photo.description || 'A moment from the Thika Walking Club community.',
            category: 'GALLERY',
          }));

          setGalleryPhotos(uploadedPhotos);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Gallery photo loading failed:', error);
        }
      }
    };

    loadGalleryPhotos();

    return () => controller.abort();
  }, [API_BASE_URL]);

  const showPrevious = () => {
    setSelectedPhoto((current) => {
      const index = galleryPhotos.findIndex(
        (photo) => photo.image === current.image
      );

      return galleryPhotos[
        (index - 1 + galleryPhotos.length) % galleryPhotos.length
      ];
    });
  };

  const showNext = () => {
    setSelectedPhoto((current) => {
      const index = galleryPhotos.findIndex(
        (photo) => photo.image === current.image
      );

      return galleryPhotos[(index + 1) % galleryPhotos.length];
    });
  };

  return (
    <main className="gallery-page">

      <ImageCarousel />

      {/* GALLERY HERO */}

      <section className="gallery-hero">
        <span>SAME FAMILY. DIFFERENT VIBES. ONE TWC.</span>

        <h1>
          OUR <span>GALLERY</span>
        </h1>

        <p>
          Every step tells a story. Explore the people,
          friendships and experiences that make TWC special.
        </p>
      </section>

      {/* GALLERY INTRODUCTION */}

      <section className="gallery-intro container">
        <span className="gallery-label">CAPTURED MOMENTS</span>

        <h2>
          MEMORIES IN <span>MOTION</span>
        </h2>

        <p>
          From community walks to special club moments,
          celebrate the journey and the people who make
          Thika Walking Club one big family.
        </p>
      </section>

      {/* PHOTO COLLECTION */}

      <section className="gallery-grid container">

        {galleryPhotos.map((photo, index) => (
          <article
            className="gallery-card"
            key={photo.image}
            onClick={() => setSelectedPhoto(photo)}
          >

            <div className="gallery-image-wrapper">

              <img
                src={photo.image}
                alt={photo.title}
                className="gallery-image"
                loading="lazy"
              />

              <span className="gallery-photo-number">
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="gallery-image-overlay">
                <span>VIEW PHOTO</span>
              </div>

            </div>

            <div className="gallery-card-content">
  {/* Photo captions and category labels hidden */}
</div>

          </article>
        ))}

      </section>

      {/* CLOSING SECTION */}

      <section className="gallery-closing">
        <h2>STRONGER. HEALTHIER. HAPPIER. TOGETHER.</h2>
        <p>Every moment is part of the TWC story.</p>
      </section>

      {/* PHOTO LIGHTBOX */}

      {selectedPhoto && (
        <div
          className="gallery-lightbox"
          onClick={() => setSelectedPhoto(null)}
        >

          <button
            className="lightbox-close"
            onClick={() => setSelectedPhoto(null)}
            aria-label="Close photo"
          >
            <X size={28} />
          </button>

          <button
            className="lightbox-arrow lightbox-prev"
            onClick={(event) => {
              event.stopPropagation();
              showPrevious();
            }}
            aria-label="Previous photo"
          >
            <ChevronLeft size={32} />
          </button>

          <div
            className="lightbox-content"
            onClick={(event) => event.stopPropagation()}
          >

            <img
              src={selectedPhoto.image}
              alt={selectedPhoto.title}
            />

            <h3>{selectedPhoto.title}</h3>
            <p>{selectedPhoto.description}</p>

          </div>

          <button
            className="lightbox-arrow lightbox-next"
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            aria-label="Next photo"
          >
            <ChevronRight size={32} />
          </button>

        </div>
      )}

    </main>
  );
}

export default Gallery;