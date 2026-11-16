
import { Link } from 'react-router-dom';

import {
  MapPin,
  Phone,
  Mail,
  ArrowUp,
  Heart
} from 'lucide-react';

import {
  FaFacebookF,
  FaInstagram,
  FaTiktok
} from 'react-icons/fa6';

import '../styles/Footer.css';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="twc-footer">

      <div className="footer-main container">

        {/* BRAND */}
        <div className="footer-brand">

          <div className="footer-logo">
            <img
              src="/images/IMG-20261109-WA0019.jpg"
              alt="Thika Walking Club official logo"
              className="footer-brand-logo"
            />
          </div>

          <h2>
            THIKA <span>WALKING CLUB</span>
          </h2>

          <p>
            Stronger. Healthier. Happier. Together.
          </p>

          <p className="footer-description">
            Building a healthier, happier and more connected
            community through walking, fitness and friendship.
          </p>

        </div>

        {/* QUICK LINKS */}
        <div className="footer-column">

          <h3>QUICK LINKS</h3>

          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/activities">Activities</Link>
          <Link to="/events">Events</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/shop">Merchandise</Link>
          <Link to="/contact">Contact Us</Link>

        </div>

        {/* CONTACT */}
        <div className="footer-column">

          <h3>GET IN TOUCH</h3>

          <p>
            <MapPin size={17} />
            Thika, Kenya
          </p>

          <a href="tel:+254719802423">
            <Phone size={17} />
            +254 719 802 423
          </a>

          <p>
            <Mail size={17} />
            Thikawalkingclub@gmail.com
          </p>

        </div>

        {/* SOCIAL MEDIA */}
        <div className="footer-column">

          <h3>FOLLOW THE MOVEMENT</h3>

          <p>Stay connected with the TWC family.</p>

          <div className="footer-socials">

            <a
              href="https://www.facebook.com/p/Thika-walking-club-61594587350769/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Thika Walking Club on Facebook"
            >
              <FaFacebookF />
            </a>

            <a
              href="https://www.instagram.com/thika_walking_club/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Thika Walking Club on Instagram"
            >
              <FaInstagram />
            </a>

          <a
            href="https://www.tiktok.com/@thika.walking.clu"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow Thika Walking Club on TikTok"
>
            <FaTiktok />
          </a>

          </div>

          <a
            href="https://wa.me/254719802423"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-whatsapp"
          >
            CHAT WITH US ON WHATSAPP
          </a>

        </div>

      </div>

      {/* FOOTER BOTTOM */}
      <div className="footer-bottom">

        <div className="container footer-bottom-content">

          <p>
            © {year} Thika Walking Club. All rights reserved.
          </p>

                    <p> TWC TO THE WORLD!</p>


          <p>
            Made with <Heart size={14} fill="currentColor" /> for the TWC family.
          </p>

          <button
            className="back-to-top"
            onClick={() => window.scrollTo({
              top: 0,
              behavior: 'smooth'
            })}
            aria-label="Back to top"
          >
            <ArrowUp size={20} />
          </button>

        </div>

      </div>

    </footer>
  );
}

export default Footer;