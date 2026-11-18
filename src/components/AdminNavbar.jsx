
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Menu,
  X,
  Globe,
  ShieldCheck
} from 'lucide-react';

import '../styles/AdminNavbar.css';

function AdminNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const websiteLinks = [
    { label: 'Home', path: '/', end: true },
    { label: 'About Us', path: '/about' },
    { label: 'Activities', path: '/activities' },
    { label: 'Events', path: '/events' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Shop', path: '/shop' },
    { label: 'Contact', path: '/contact' }
  ];

  const adminLinks = [
    { label: 'Dashboard', path: '/admin-dashboard', end: true },
    { label: 'Memberships', path: '/admin/members' },
    { label: 'Merchandise', path: '/admin/merchandise' },
    { label: 'Feedback', path: '/admin/feedback' },
    { label: 'Testimonials', path: '/admin/testimonials' },
    { label: 'Event Management', path: '/admin/events' },
    { label: 'Photo Manager', path: '/admin/photos' },
    { label: 'Advertisements', path: '/admin/advertisements' },
    { label: 'Personal Training', path: '/admin/training' }
  ];

  const renderLinks = (links) =>
    links.map((link) => (
      <NavLink
        key={link.path}
        to={link.path}
        end={link.end}
        className={({ isActive }) =>
          `admin-nav-link ${isActive ? 'active' : ''}`
        }
        onClick={() => setMenuOpen(false)}
      >
        {link.label}
      </NavLink>
    ));

  return (
    <nav className="admin-navbar" aria-label="Website and admin navigation">
      <div className="admin-navbar-inner">

        <div className="admin-navbar-top">
          <div className="admin-navbar-label">
            <ShieldCheck size={15} />
            ADMIN PORTAL
          </div>

          <a
            href="/"
            className="admin-view-website"
            onClick={() => setMenuOpen(false)}
          >
            <Globe size={16} />
            VIEW WEBSITE
          </a>

          <button
            type="button"
            className="admin-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <div className={`admin-navbar-content ${menuOpen ? 'open' : ''}`}>

          <div className="admin-nav-group">
            <span className="admin-nav-heading">WEBSITE</span>
            <div className="admin-nav-links">
              {renderLinks(websiteLinks)}
            </div>
          </div>

          <div className="admin-nav-divider" />

          <div className="admin-nav-group">
            <span className="admin-nav-heading">ADMINISTRATION</span>
            <div className="admin-nav-links">
              {renderLinks(adminLinks)}
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}

export default AdminNavbar;
