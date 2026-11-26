
import {
  Footprints,
  CalendarDays,
  Users,
  Trophy,
  ShoppingBag,
  HeartHandshake,
  Award,
  Target,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

import { Link } from 'react-router-dom';
import '../styles/Membership.css';

const benefits = [
  {
    icon: Footprints,
    title: 'Organised Walking Activities',
    description:
      'Take part in organised walks, group fitness activities and opportunities to stay active with the TWC community.'
  },
  {
    icon: CalendarDays,
    title: 'Club Events and Experiences',
    description:
      'Discover upcoming walks, hikes, fitness events and special community experiences.'
  },
  {
    icon: Users,
    title: 'A Supportive Community',
    description:
      'Connect with people who encourage one another, build friendships and work towards healthier lifestyles.'
  },
  {
    icon: Target,
    title: 'Fitness Challenges',
    description:
      'Take part in walking challenges and activities designed to encourage consistency and personal progress.'
  },
  {
    icon: ShoppingBag,
    title: 'Merchandise Offers',
    description:
      'Enjoy access to selected TWC merchandise promotions and any member offers announced by the club.'
  },
  {
    icon: Trophy,
    title: 'Member Recognition',
    description:
      'Celebrate participation, personal milestones, team achievements and contributions to the community.'
  },
  {
    icon: HeartHandshake,
    title: 'Community Opportunities',
    description:
      'Participate in selected community initiatives, social activities and opportunities to give back.'
  },
  {
    icon: Award,
    title: 'Leadership and Volunteering',
    description:
      'Explore opportunities to support club activities, volunteer and grow into leadership roles.'
  }
];

const membershipValues = [
  'A welcoming fitness and walking community',
  'Opportunities to participate in organised activities',
  'Encouragement and support from fellow members',
  'Opportunities to develop healthy lifestyle habits',
  'Recognition of participation and achievements',
  'Opportunities to contribute to the growth of TWC'
];

function Membership() {
  return (
    <main className="membership-page">

      {/* HERO SECTION */}
      <section className="membership-hero">
        <div className="membership-hero-content">
          <span className="membership-eyebrow">
            ONE TWC. SAME FAMILY. DIFFERENT VIBES.
          </span>

          <h1>
            MORE THAN A CLUB.
            <span> A COMMUNITY.</span>
          </h1>

          <p>
            Membership at Thika Walking Club is about belonging,
            building friendships, embracing healthier lifestyles
            and growing stronger together.
          </p>

          <div className="membership-hero-actions">
            <Link to="/register" className="membership-primary-btn">
              JOIN TWC <ArrowRight size={18} />
            </Link>

            <Link to="/events" className="membership-secondary-btn">
              EXPLORE OUR EVENTS
            </Link>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="membership-intro">
        <div className="membership-container">
          <span className="membership-section-label">
            THE TWC EXPERIENCE
          </span>

          <h2>
            YOUR MEMBERSHIP.
            <span> YOUR COMMUNITY. YOUR GROWTH.</span>
          </h2>

          <p>
            We believe that fitness is better when people come
            together. TWC brings people from different backgrounds
            together through walking, fitness, friendship and
            community activities.
          </p>

          <p>
            Whether you are just starting your fitness journey or
            already active, there is room for you to grow and
            contribute at Thika Walking Club.
          </p>
        </div>
      </section>

      {/* BENEFITS GRID */}
      <section className="membership-benefits">
        <div className="membership-container">

          <div className="membership-heading">
            <span className="membership-section-label">
              WHY JOIN TWC?
            </span>

            <h2>
              WHAT MEMBERSHIP <span>CAN OFFER YOU</span>
            </h2>

            <p>
              Be part of a community that celebrates movement,
              connection, consistency and progress.
            </p>
          </div>

          <div className="membership-benefits-grid">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <article className="membership-benefit-card" key={index}>
                  <div className="membership-benefit-icon">
                    <Icon size={27} />
                  </div>

                  <h3>{benefit.title}</h3>

                  <p>{benefit.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* MEMBERSHIP VALUES */}
      <section className="membership-values">
        <div className="membership-container membership-values-grid">

          <div className="membership-values-content">
            <span className="membership-section-label">
              WHAT WE STAND FOR
            </span>

            <h2>
              STRONGER.
              <span> HEALTHIER. HAPPIER.</span>
            </h2>

            <p>
              TWC is built on the belief that everyone deserves
              an opportunity to live an active, healthier and
              more connected life.
            </p>

            <Link to="/about" className="membership-text-link">
              LEARN MORE ABOUT TWC <ArrowRight size={17} />
            </Link>
          </div>

          <div className="membership-values-list">
            {membershipValues.map((value, index) => (
              <div className="membership-value-item" key={index}>
                <CheckCircle size={20} />
                <span>{value}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* HOW TO JOIN */}
      <section className="membership-steps">
        <div className="membership-container">

          <div className="membership-heading">
            <span className="membership-section-label">
              BECOME PART OF THE FAMILY
            </span>

            <h2>
              YOUR JOURNEY <span>STARTS HERE</span>
            </h2>
          </div>

          <div className="membership-steps-grid">
            <article>
              <span className="membership-step-number">01</span>
              <h3>REGISTER</h3>
              <p>
                Complete the TWC membership registration form.
              </p>
            </article>

            <article>
              <span className="membership-step-number">02</span>
              <h3>GET CONNECTED</h3>
              <p>
                Follow club updates and discover upcoming activities.
              </p>
            </article>

            <article>
              <span className="membership-step-number">03</span>
              <h3>GET INVOLVED</h3>
              <p>
                Participate, make connections and grow with the TWC family.
              </p>
            </article>
          </div>

          <div className="membership-join-action">
            <h2>READY TO WALK WITH US?</h2>
            <p>
              Take the first step towards a stronger, healthier
              and happier lifestyle.
            </p>

            <Link to="/register" className="membership-primary-btn">
              BECOME A TWC MEMBER <ArrowRight size={18} />
            </Link>
          </div>

        </div>
      </section>

    </main>
  );
}

export default Membership;
