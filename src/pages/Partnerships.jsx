import { Link } from 'react-router-dom';
import {
  Handshake,
  CalendarDays,
  Award,
  HeartHandshake,
  Users,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

import '../styles/Partnerships.css';

const opportunities = [
  {
    icon: <CalendarDays size={30} />,
    title: 'EVENT PARTNERSHIPS',
    description:
      'Support our walks, hikes, bootcamps, Zumba sessions and community events through meaningful event collaborations.'
  },
  {
    icon: <Award size={30} />,
    title: 'BRAND PARTNERSHIPS',
    description:
      'Connect your brand with our community through sponsorships, product showcases and promotional collaborations.'
  },
  {
    icon: <HeartHandshake size={30} />,
    title: 'WELLNESS PARTNERSHIPS',
    description:
      'Work with us to encourage fitness, healthy lifestyles, wellness awareness and positive living.'
  },
  {
    icon: <Users size={30} />,
    title: 'COMMUNITY PARTNERSHIPS',
    description:
      'Collaborate with TWC on initiatives that bring people together and create meaningful community experiences.'
  }
];

const benefits = [
  'Connect with an active and engaged community.',
  'Increase your brand visibility through club activities.',
  'Support fitness, wellness and healthy living.',
  'Build meaningful relationships within the community.',
  'Create memorable experiences through collaboration.'
];

function Partnerships() {
  return (
    <main className="partnerships-page">

      {/* PAGE HERO */}
      <section className="partnerships-hero">
        <div className="partnerships-hero-overlay"></div>

        <div className="container partnerships-hero-content">
          <span className="partnerships-eyebrow">
            GROW WITH THE TWC FAMILY
          </span>

          <h1>
            PARTNER WITH <span>TWC.</span>
          </h1>

          <p>
            Together, we move communities forward.
            Let's create meaningful experiences through
            fitness, wellness and community.
          </p>

          <a href="#partnership-opportunities" className="partnerships-button">
            EXPLORE PARTNERSHIPS <ArrowRight size={19} />
          </a>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="partnerships-intro section-padding">
        <div className="container partnerships-intro-grid">

          <div className="partnerships-intro-image">
            <img
              src="/images/thika-walking-new/TEAMBUILDING.JPG"
              alt="Thika Walking Club members enjoying a team activity"
            />
            <div className="partnerships-image-label">
              <strong>ONE COMMUNITY</strong>
              <span>ONE SHARED VISION</span>
            </div>
          </div>

          <div className="partnerships-intro-content">
            <span className="partnerships-eyebrow">
              LET'S WORK TOGETHER
            </span>

            <h2>
              STRONGER <span>TOGETHER.</span>
            </h2>

            <div className="partnerships-line"></div>

            <p>
              Thika Walking Club believes that great things happen
              when people and organisations come together.
            </p>

            <p>
              Through walking, fitness, wellness and community
              experiences, we create opportunities for people
              to connect, grow and make lasting memories.
            </p>

            <p>
              We welcome businesses, organisations and brands
              that share our passion for healthy living,
              community development and positive social impact.
            </p>
          </div>

        </div>
      </section>

      {/* PARTNERSHIP OPPORTUNITIES */}
      <section
        className="partnerships-opportunities section-padding"
        id="partnership-opportunities"
      >
        <div className="container">

          <div className="partnerships-section-heading">
            <span className="partnerships-eyebrow">
              HOW WE CAN COLLABORATE
            </span>

            <h2>
              PARTNERSHIP <span>OPPORTUNITIES.</span>
            </h2>

            <p>
              Different ways to connect, collaborate and make
              a positive difference together.
            </p>
          </div>

          <div className="partnerships-cards">
            {opportunities.map((item) => (
              <article className="partnership-card" key={item.title}>
                <div className="partnership-card-icon">
                  {item.icon}
                </div>

                <h3>{item.title}</h3>

                <p>{item.description}</p>

                <div className="partnership-card-bottom">
                  <Handshake size={19} />
                  <span>LET'S COLLABORATE</span>
                </div>
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* WHY PARTNER WITH TWC */}
      <section className="partnerships-benefits section-padding">
        <div className="container partnerships-benefits-grid">

          <div className="partnerships-benefits-content">
            <span className="partnerships-eyebrow">
              THE VALUE OF PARTNERSHIP
            </span>

            <h2>
              WHY PARTNER <span>WITH TWC?</span>
            </h2>

            <p>
              We believe partnerships should create value
              for everyone involved while making a positive
              contribution to the community.
            </p>

            <div className="partnerships-benefits-list">
              {benefits.map((benefit) => (
                <div className="partnership-benefit" key={benefit}>
                  <CheckCircle2 size={21} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="partnerships-benefits-image">
            <img
              src="/images/thika-walking-new/IMG_1619.JPG"
              alt="Thika Walking Club community members"
              loading="lazy"
            />
          </div>

        </div>
      </section>

      {/* PARTNERSHIP CALL TO ACTION */}
      <section className="partnerships-cta">
        <div className="container partnerships-cta-content">

          <span className="partnerships-eyebrow">
            LET'S MAKE IT HAPPEN
          </span>

          <h2>
            LET'S CREATE SOMETHING
            <span> GREAT TOGETHER.</span>
          </h2>

          <p>
            Have a partnership idea, sponsorship proposal
            or collaboration opportunity? We would love
            to hear from you and work with you.
          </p>

          <Link to="/contact" className="partnerships-button">
            CONTACT TWC <ArrowRight size={19} />
          </Link>

        </div>
      </section>

    </main>
  );
}

export default Partnerships;
