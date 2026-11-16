import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, UserRound } from 'lucide-react';
import '../styles/Navbar.css';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setMenuOpen(false);

  const memberToken = localStorage.getItem('twc_member_token');

  let member = null;

  try {
    member = JSON.parse(localStorage.getItem('twc_member') || 'null');
  } catch {
    member = null;
  }

  const isLoggedIn = Boolean(memberToken && member);
  const isAdmin = member?.role?.toLowerCase() === 'admin';

  const links = [
    { name: 'HOME', path: '/' },
    { name: 'ABOUT', path: '/about' },
    // { name: 'ACTIVITIES', path: '/activities' },
    { name: 'EVENTS', path: '/events' },
    { name: 'GALLERY', path: '/gallery' },
    { name: 'PARTNERSHIPS', path: '/partnerships' },
    { name: 'SHOP', path: '/shop' },
    { name: 'CONTACT US', path: '/contact' },
  ];

  return (
    <header className="navbar">
      <div className="nav-container">

        <Link to="/" className="nav-brand" onClick={closeMenu}>
          <img
            src="/images/IMG-20261109-WA0019.jpg"
            alt="Thika Walking Club official logo"
            className="brand-logo"
          />

          <div className="brand-text">
            <span>THIKA</span>
            <strong>WALKING CLUB</strong>
          </div>
        </Link>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <nav className={`nav-links ${menuOpen ? 'active' : ''}`}>
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={closeMenu}
              className={({ isActive }) =>
                isActive ? 'nav-link active-link' : 'nav-link'
              }
              end={link.path === '/'}
            >
              {link.name}
            </NavLink>
          ))}

          {isLoggedIn ? (
            <Link
              to={isAdmin ? '/admin-dashboard' : '/member-dashboard'}
              className="nav-member-login"
              onClick={closeMenu}
            >
              <UserRound size={16} />
              {isAdmin ? 'ADMIN ACCOUNT' : 'MY ACCOUNT'}
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="nav-member-login"
                onClick={closeMenu}
              >
                <UserRound size={16} />
                MEMBER LOGIN
              </Link>

              <Link
                to="/register"
                className="nav-join"
                onClick={closeMenu}
              >
                JOIN TWC
              </Link>
            </>
          )}
        </nav>

      </div>
    </header>
  );
}

export default Navbar;
