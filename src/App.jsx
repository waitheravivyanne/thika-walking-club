
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation
} from 'react-router-dom';

import { useEffect } from 'react';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Events from './pages/Events';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Shop from './pages/Shop';
import Contact from './pages/Contact';
import Partnerships from './pages/Partnerships';
import Register from './pages/Register';
import Activate from './pages/Activate';
import Login from './pages/Login';
import MemberDashboard from './pages/MemberDashboard';

import AdminDashboard from './pages/AdminDashboard';
import AdminMembers from './pages/AdminMembers';
import AdminMerchandise from './pages/AdminMerchandise';
import AdminFeedback from './pages/AdminFeedback';
import AdminTestimonials from './pages/AdminTestimonials';
import AdminEvents from './pages/AdminEvents';
import AdminPhotos from './pages/AdminPhotos';
import AdminAdvertisements from './pages/AdminAdvertisements';
import AdminTraining from './pages/AdminTraining';

import Advertise from './pages/Advertise';
import PersonalTraining from './pages/PersonalTraining';
import Membership from './pages/Membership';

// Automatically scroll to the top when the page changes.
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname]);

  return null;
}

function AppContent() {
  const location = useLocation();

  const isAccountPage = [
    '/activate',
    '/login',
    '/admin-dashboard',
    '/admin/members',
    '/admin/merchandise',
    '/admin/feedback',
    '/admin/testimonials',
    '/admin/events',
    '/admin/photos',
    '/admin/advertisements',
    '/admin/training'
  ].includes(location.pathname);

  return (
    <>
      <ScrollToTop />

      {!isAccountPage && <Navbar />}

      <Routes>
        {/* PUBLIC PAGES */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/partnerships" element={<Partnerships />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events" element={<Events />} />

        {/* ADVERTISING AND PERSONAL TRAINING */}
        <Route path="/advertise" element={<Advertise />} />
        <Route path="/personal-training" element={<PersonalTraining />} />

        {/* MEMBER ACCOUNT */}
        <Route path="/activate" element={<Activate />} />
        <Route path="/login" element={<Login />} />
        <Route path="/member-dashboard" element={<MemberDashboard />} />

        {/* ADMIN DASHBOARD */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/members" element={<AdminMembers />} />
        <Route path="/admin/merchandise" element={<AdminMerchandise />} />
        <Route path="/admin/feedback" element={<AdminFeedback />} />
        <Route path="/admin/testimonials" element={<AdminTestimonials />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/photos" element={<AdminPhotos />} />
        <Route path="/membership" element={<Membership />} />

        {/* ADMIN ADVERTISEMENTS AND TRAINING */}
        <Route
          path="/admin/advertisements"
          element={<AdminAdvertisements />}
        />

        <Route
          path="/admin/training"
          element={<AdminTraining />}
        />
      </Routes>

      {!isAccountPage && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
