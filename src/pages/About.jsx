import {
  Heart,
  Users,
  Footprints,
  Target,
  Mountain,
  Handshake,
  ArrowRight,
  Flag,
  Sparkles,
  Brain,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Scale,
  TrendingUp,
  HeartHandshake,
  BookOpen,
  Dumbbell,
  Globe,
} from 'lucide-react';

import { Link } from 'react-router-dom';

import '../styles/About.css';

const pillars = [
  {
    icon: Brain,
    title: 'MENTAL HEALTH FIRST',
    description:
      'We recognise the importance of mental well-being. We create opportunities for people to connect, interact, relieve stress and support one another through shared experiences.',
  },
  {
    icon: Activity,
    title: 'HEALTHY LIFESTYLE',
    description:
      'We encourage consistent physical activity, walking, fitness, healthy habits and personal wellness as essential components of a better life.',
  },
  {
    icon: Users,
    title: 'CONNECTIONS & COMMUNITY',
    description:
      'We bring people together from different backgrounds, professions and walks of life, building friendships, networks and a sense of belonging.',
  },
];

const coreValues = [
  {
    icon: ShieldCheck,
    title: 'ACCOUNTABILITY',
    description:
      'Taking responsibility for our actions and commitments.',
  },
  {
    icon: Users,
    title: 'UNITY',
    description:
      'Building a community where everyone feels included.',
  },
  {
    icon: Footprints,
    title: 'CONSISTENCY',
    description:
      'Encouraging sustainable and healthy habits.',
  },
  {
    icon: Scale,
    title: 'INTEGRITY',
    description:
      'Leading with honesty, transparency and respect.',
  },
  {
    icon: Heart,
    title: 'INCLUSIVITY',
    description:
      'Welcoming people regardless of their fitness level or background.',
  },
  {
    icon: HeartHandshake,
    title: 'SERVICE',
    description:
      'Making a positive contribution to our community.',
  },
  {
    icon: TrendingUp,
    title: 'GROWTH',
    description:
      'Continuously improving as individuals and as an organisation.',
  },
];

const activities = [
  {
    icon: Footprints,
    title: 'COMMUNITY WALKS',
    description: 'Community walks and endurance challenges.',
  },
  {
    icon: Dumbbell,
    title: 'FITNESS & WELLNESS',
    description: 'Fitness bootcamps and wellness events.',
  },
  {
    icon: Brain,
    title: 'MENTAL WELL-BEING',
    description: 'Mental health awareness and community support.',
  },
  {
    icon: BookOpen,
    title: 'HEALTH EDUCATION',
    description: 'Health and wellness education.',
  },
  {
    icon: Handshake,
    title: 'CONNECTIONS',
    description: 'Social networking and team-building experiences.',
  },
  {
    icon: HeartHandshake,
    title: 'COMMUNITY OUTREACH',
    description: 'Community outreach and social responsibility initiatives.',
  },
  {
    icon: Users,
    title: 'PARTNERSHIPS',
    description: 'Partnerships with wellness professionals and organisations.',
  },
];

function About() {
  return (
    <main className="about-page">

      {/* HERO */}

      <section className="about-hero">
        <span>THIKA WALKING CLUB (TWC)</span>

        <h1>
          TWC TO  <span>THE WORLD!</span>
        </h1>

        <p>
          Driven by Purpose. Connected Through Movement.
        </p>

        <Link to="/register" className="about-hero-button">
          BECOME PART OF TWC <ArrowRight size={18} />
        </Link>

        <div className="about-hero-motto">
          FITNESS • FRIENDSHIP • COMMUNITY
        </div>
      </section>


      {/* OUR STORY */}

      <section className="about-story container">

        <div className="about-story-visual">
          <img
            src="/images/IMG-20261109-WA0013.jpg"
            alt="Thika Walking Club members enjoying a community walk"
          />

          <div className="about-story-photo-label">
            <span>FITNESS</span>
            <strong>FRIENDSHIP</strong>
            <span>COMMUNITY</span>
          </div>
        </div>

        <div className="about-story-content">

          <span className="about-label">GET TO KNOW US</span>

          <h2>
            MORE THAN <span>A WALK.</span>
          </h2>

          <p>
            Thika Walking Club is a community-driven wellness
            and lifestyle movement built around mental
            well-being, physical activity and meaningful
            human connections.
          </p>

          <p>
            We believe that movement is powerful, but its
            impact goes far beyond physical fitness. A walk
            can be an opportunity to clear your mind, find
            encouragement, meet new people and build
            meaningful connections.
          </p>

          <p>
            Our journey is founded on the belief that mental
            health matters, healthy living matters and human
            connections matter.
          </p>

          <p className="about-highlight">
            STRONGER. HEALTHIER. HAPPIER. TOGETHER.
          </p>

        </div>
      </section>


      {/* A WORD FROM THE FOUNDER */}

      <section className="about-leadership">

        <div className="container about-leadership-grid">

          <div className="about-leader-photo">
            <img
              src="/images/thika-walking-new/PAT.JPG"
              alt="Pat Okaji, Founder and President of Thika Walking Club"
            />

            <div className="about-leader-photo-caption">
              <Flag size={18} />
              <span>FOUNDER • PRESIDENT • VISION</span>
            </div>
          </div>

          <div className="about-leadership-content">

            <span className="about-label">
              A WORD FROM THE FOUNDER & PRESIDENT,
            </span>

            <h2>
          
              <span> PAT OKAJI.</span>
            </h2>

            <div className="about-green-line"></div>

            <p>
              When I envisioned Thika Walking Club, I wanted
              to create more than a walking group. I wanted
              to build a community where people could find
              purpose, improve their well-being, build
              meaningful connections and become better
              versions of themselves.
            </p>

            <p>
              I believe that movement is powerful, but the
              impact of movement goes far beyond physical
              fitness. Sometimes, a walk is more than exercise.
              It is an opportunity to clear your mind, find
              encouragement, meet new people and remind
              yourself that you are not alone.
            </p>

            <p>
              TWC was founded on a simple but powerful belief:
              Mental health matters, healthy living matters,
              and human connections matter.
            </p>

            <p>
              Our journey is built on the understanding that
              everyone deserves a space where they feel
              welcome, valued, respected and encouraged,
              regardless of their age, background, fitness
              level or experience.
            </p>

            <p>
              As we grow, our commitment remains the same:
              to build a responsible, inclusive and
              accountable community that creates meaningful
              impact in society.
            </p>

            <p>
              I am proud of every member, volunteer,
              administrator, partner and supporter who
              continues to believe in this vision. TWC is
              not about one individual; it is about all of
              us working together towards something bigger.
            </p>

            <p>
              We are just getting started.
            </p>

            <div className="about-leadership-quote">
              TWC TO THE WORLD! 
            </div>

            <div className="about-founder-signature">
              <strong>Pat Okaji</strong>
              <span>Founder & President</span>
              <span>Thika Walking Club</span>
            </div>

          </div>

        </div>
      </section>


      {/* VISION AND MISSION */}

      <section className="about-mission">

        <div className="container">

          <div className="about-section-heading">
            <span className="about-label">OUR PURPOSE & DIRECTION</span>

            <h2>
              OUR VISION <span>& MISSION</span>
            </h2>
          </div>

          <div className="about-mission-grid">

            <div className="about-mission-card">
              <Mountain size={38} />

              <span>WHERE WE ARE GOING</span>

              <h2>OUR VISION</h2>

              <p>
                To become a leading community driven wellness
                and lifestyle movement, inspiring healthier
                individuals, stronger communities and
                meaningful human connections locally and
                globally.
              </p>
            </div>

            <div className="about-mission-card">
              <Target size={38} />

              <span>WHAT WE ARE HERE TO DO</span>

              <h2>OUR MISSION</h2>

              <p>
                To promote mental well-being, physical activity
                and healthy lifestyles through accessible
                walking experiences, fitness activities,
                community engagement, education and meaningful
                social connections.
              </p>

              <p>
                We are committed to creating an inclusive
                environment where individuals can grow,
                support one another and embrace healthier living.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* OUR CORE PILLARS */}

      <section className="about-values container">

        <span className="about-label">WHAT GUIDES OUR MOVEMENT</span>

        <h2>
          OUR CORE <span>PILLARS</span>
        </h2>

        <p className="about-values-intro">
          Everything we do is guided by three important pillars
          that shape our community and the impact we want to make.
        </p>

        <div className="about-values-grid">

          {pillars.map((pillar) => {
            const Icon = pillar.icon;

            return (
              <article className="about-value-card" key={pillar.title}>
                <div className="about-value-icon">
                  <Icon size={34} />
                </div>

                <h3>{pillar.title}</h3>

                <p>{pillar.description}</p>
              </article>
            );
          })}

        </div>
      </section>


      {/* OUR CORE VALUES */}

      <section className="about-core-values">

        <div className="container">

          <div className="about-section-heading">
            <span className="about-label">THE PRINCIPLES WE LIVE BY</span>

            <h2>
              OUR CORE <span>VALUES</span>
            </h2>

            <p>
              These values define who we are, how we relate
              with one another and how we serve our community.
            </p>
          </div>

          <div className="about-core-values-grid">

            {coreValues.map((value) => {
              const Icon = value.icon;

              return (
                <article className="about-core-value-card" key={value.title}>
                  <div className="about-value-icon">
                    <Icon size={30} />
                  </div>

                  <h3>{value.title}</h3>

                  <p>{value.description}</p>
                </article>
              );
            })}

          </div>
        </div>
      </section>


      {/* WHAT WE DO */}

      <section className="about-activities container">

        <div className="about-section-heading">
          <span className="about-label">HOW WE MAKE A DIFFERENCE</span>

          <h2>
            WHAT <span>WE DO</span>
          </h2>

          <p>
            We create opportunities for people to embrace
            active living and meaningful connections through:
          </p>
        </div>

        <div className="about-activities-grid">

          {activities.map((activity) => {
            const Icon = activity.icon;

            return (
              <article className="about-activity-card" key={activity.title}>
                <Icon size={30} />

                <h3>{activity.title}</h3>

                <p>{activity.description}</p>
              </article>
            );
          })}

        </div>

        <Link to="/activities" className="about-text-link">
          EXPLORE OUR ACTIVITIES <ArrowRight size={18} />
        </Link>

      </section>


      {/* COMMUNITY COMMITMENT */}

      <section className="about-commitment">

        <div className="container about-commitment-content">

          <HeartHandshake size={42} />

          <span className="about-label">ACCESSIBILITY • INCLUSION • PARTNERSHIP</span>

          <h2>
            OUR COMMITMENT TO
            <span> THE COMMUNITY</span>
          </h2>

          <p>
            Our regular community walks are designed to remain
            accessible and welcoming.
          </p>

          <p>
            We believe that building a healthier community
            starts by creating opportunities for people to
            participate without unnecessary barriers.
          </p>

          <p>
            We also welcome partnerships that align with our
            mission, uphold our values and bring genuine
            value to our members.
          </p>

        </div>
      </section>


      {/* OUR IDENTITY */}

      <section className="about-identity container">

        <div className="about-identity-icon">
          <Globe size={40} />
        </div>

        <div className="about-identity-content">

          <span className="about-label">WHO WE ARE</span>

          <h2>
            OUR <span>IDENTITY</span>
          </h2>

          <p>
            Thika Walking Club is independent and non-political.
          </p>

          <p>
            We are not affiliated with any political party,
            political movement or political agenda. Our focus
            is wellness, community development, healthy
            lifestyles and positive social connections.
          </p>

        </div>
      </section>


      {/* CLOSING COMMUNITY INVITATION */}

      <section className="about-community">

        <div className="container about-community-content">

          <Sparkles size={35} />

          <span>ONE COMMUNITY. ONE PURPOSE.</span>

          <h2>
            THERE IS A PLACE
            <br />
            FOR YOU IN OUR FAMILY.
          </h2>

          <p>
            Come for the walks. Stay for the friendships.
            Grow with the community.
          </p>

          <Link to="/register" className="about-community-button">
            JOIN THIKA WALKING CLUB <ArrowRight size={18} />
          </Link>

          <div className="about-community-slogan">
            UNIFIED BY ACCOUNTABILITY. DRIVEN BY PURPOSE.
            CONNECTED THROUGH MOVEMENT.
          </div>

          <div className="about-world-message">
            TWC TO THE WORLD! 
          </div>

        </div>
      </section>

    </main>
  );
}

export default About;