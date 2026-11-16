// import { Link } from 'react-router-dom';

// import {
//   Footprints,
//   Dumbbell,
//   Music,
//   Users,
//   Activity,
//   HeartPulse,
//   ArrowRight,
//   CalendarDays
// } from 'lucide-react';

// import '../styles/Activities.css';

// const activities = [
//   {
//     id: 1,
//     name: 'Walking Sessions',
//     category: 'WELLNESS',
//     description:
//       'Enjoy refreshing group walks, explore new places and build lasting friendships.',
//     image: '/images/IMG-20261109-WA0013.jpg',
//     icon: <Footprints size={30} />
//   },
//   {
//     id: 2,
//     name: 'Bootcamp Challenges',
//     category: 'FITNESS',
//     description:
//       'Push yourself, take on fitness challenges and enjoy energetic group sessions.',
//     image: null,
//     icon: <Dumbbell size={30} />
//   },
//   {
//     id: 3,
//     name: 'Katabox',
//     category: 'FITNESS',
//     description:
//       'Enjoy exciting fitness sessions combining energetic movement and boxing-inspired routines.',
//     image: null,
//     icon: <Activity size={30} />
//   },
//   {
//     id: 4,
//     name: 'Zumba',
//     category: 'DANCE',
//     description:
//       'Dance to exciting rhythms, enjoy the music and experience fitness in a fun way.',
//     image: null,
//     icon: <Music size={30} />
//   },
//   {
//     id: 5,
//     name: 'Team Building',
//     category: 'COMMUNITY',
//     description:
//       'Connect with people, strengthen friendships and create unforgettable memories.',
//     image: '/images/IMG-20261109-WA0017.jpg',
//     icon: <Users size={30} />
//   },
//   {
//     id: 6,
//     name: 'Aerobics',
//     category: 'FITNESS',
//     description:
//       'Participate in lively group exercise sessions designed to keep you moving.',
//     image: null,
//     icon: <Activity size={30} />
//   },
//   {
//     id: 7,
//     name: 'Sports Massage',
//     category: 'WELLNESS',
//     description:
//       'Discover sports massage and recovery support from qualified professionals.',
//     image: null,
//     icon: <HeartPulse size={30} />
//   }
// ];

// function Activities() {
//   return (
//     <main className="activities-page">

//       {/* PAGE HERO */}

//       <section className="activities-hero">
//         <div className="container activities-hero-content">

//           <span className="eyebrow">
//             LET'S MOVE • LET'S CONNECT • LET'S GROW
//           </span>

//           <h1>
//             DISCOVER OUR
//             <br />
//             <span>ACTIVITIES.</span>
//           </h1>

//           <p>
//             Different activities. Different experiences.
//             One amazing TWC family.
//           </p>

//           <a href="#activity-list" className="btn btn-primary">
//             EXPLORE ACTIVITIES <ArrowRight size={18} />
//           </a>

//         </div>
//       </section>

//       {/* INTRODUCTION */}

//       <section className="activities-intro">
//         <div className="container">

//           <span className="eyebrow">SOMETHING FOR EVERYONE</span>

//           <h2 className="section-title">
//             FIND YOUR <span className="highlight">MOVEMENT.</span>
//           </h2>

//           <div className="green-line"></div>

//           <p className="section-subtitle">
//             At Thika Walking Club, we believe that fitness should
//             bring people together. Explore our activities and find
//             the experiences you enjoy most.
//           </p>

//         </div>
//       </section>

//       {/* ACTIVITY CARDS */}

//       <section className="activity-list" id="activity-list">

//         <div className="container">

//           <div className="activities-page-grid">

//             {activities.map((activity) => (
//               <article className="twc-activity-card" key={activity.id}>

//                 <div className="twc-activity-image">

//                   {activity.image ? (
//                     <img
//                       src={activity.image}
//                       alt={`Thika Walking Club ${activity.name}`}
//                       loading="lazy"
//                     />
//                   ) : (
//                     <div className="activity-placeholder">
//                       {activity.icon}
//                       <span>{activity.name}</span>
//                     </div>
//                   )}

//                   <span className="activity-category">
//                     {activity.category}
//                   </span>

//                 </div>

//                 <div className="twc-activity-content">

//                   <div className="twc-activity-icon">
//                     {activity.icon}
//                   </div>

//                   <h3>{activity.name}</h3>

//                   <p>{activity.description}</p>

//                   <Link
//                     to={`/activities/${activity.id}`}
//                     className="activity-details-link"
//                   >
//                     EXPLORE ACTIVITY
//                     <ArrowRight size={17} />
//                   </Link>

//                 </div>

//               </article>
//             ))}

//           </div>

//         </div>

//       </section>

//       {/* COMMUNITY CTA */}

//       <section className="activities-cta">

//         <div className="container">

//           <CalendarDays size={42} />

//           <h2>
//             READY TO JOIN
//             <span> THE MOVEMENT?</span>
//           </h2>

//           <p>
//             Come move, connect and grow with the TWC family.
//           </p>

//           <Link to="/register" className="btn btn-primary">
//             JOIN THIKA WALKING CLUB
//             <ArrowRight size={18} />
//           </Link>

//         </div>

//       </section>

//     </main>
//   );
// }

// export default Activities;