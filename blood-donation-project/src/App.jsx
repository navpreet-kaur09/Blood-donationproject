import { useEffect, useState } from 'react';

const LOADER_DURATION = 1800; // ms, same as your old loader.js

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [percent, setPercent] = useState(() => (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 100 : 0
  ));
  const [camps, setCamps] = useState([]);
  const [campLoadError, setCampLoadError] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let start = null;
    let frameId;

    function step(t) {
      if (start === null) start = t;
      const p = Math.min((t - start) / LOADER_DURATION, 1);
      const eased =
        p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      setPercent(Math.round(eased * 100));
      if (p < 1) frameId = requestAnimationFrame(step);
    }

    if (!reduceMotion) {
      frameId = requestAnimationFrame(step);
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, LOADER_DURATION + 200);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    function loadCamps() {
      try {
        const saved = localStorage.getItem('jeevanHospitalCamps');
        const allCamps = saved ? JSON.parse(saved) : [];
        if (!Array.isArray(allCamps)) {
          throw new Error('Saved camp data must be a list.');
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = allCamps
          .filter((camp) => {
            const date = new Date(`${camp.date}T00:00:00`);
            return camp.name && camp.date && !Number.isNaN(date.getTime()) && date >= today;
          })
          .sort((first, second) => (
            new Date(`${first.date}T00:00:00`) - new Date(`${second.date}T00:00:00`)
          ));

        setCamps(upcoming);
        setCampLoadError(false);
      } catch (error) {
        console.error('[Jeevan] Could not load upcoming camps.', error);
        setCamps([]);
        setCampLoadError(true);
      }
    }

    loadCamps();
    window.addEventListener('storage', loadCamps);
    return () => window.removeEventListener('storage', loadCamps);
  }, []);

  return (
    <>
      {loading && (
        <div className="jv-loader" id="loader">
          <div className="jv-loader-box">
            <svg
              className="jv-drop"
              viewBox="0 0 200 260"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="jvDropGrad"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0" stopColor="#ffffff" />
                  <stop offset="1" stopColor="#fecaca" />
                </linearGradient>
              </defs>

              <path
                d="M100 10C100 10 20 110 20 165a80 80 0 0 0 160 0C180 110 100 10 100 10Z"
                fill="url(#jvDropGrad)"
              />

              <ellipse
                cx="68"
                cy="150"
                rx="9"
                ry="22"
                fill="#8a0303"
                opacity=".25"
                transform="rotate(18 68 150)"
              />
            </svg>

            <h2 className="jv-loader-title">Jeevan</h2>

            <div className="jv-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <p className="jv-loader-pct">
              <span id="loaderPct">{percent}</span>%
            </p>
          </div>
        </div>
      )}

      <header className="navbar">
        <div className="logo">
          <a href="/">
            <img
              src="/logo1.png"
              alt="Jeevan"
              className="logo-img"
            />
          </a>
        </div>

        <button
          id="menuBtn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          ☰
        </button>

        <nav id="navbar" className={menuOpen ? 'show' : ''}>
          <a href="/" className="active">Home</a>
          <a href="/find_blood.html">Find Blood</a>
          <a href="/donate.html">Donate Blood</a>
          <a href="/Hospital_Dashboard.html">Hospital Dashboard</a>
          <a href="/about.html">About</a>
        </nav>
        <a href="/login.html" className="nav-login-btn">Login</a>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-heading">
              <span className="script-text">Khoon Ka Rishta</span>
            </h1>

            <p>
              Donate blood. Help someone in need. Your small
              contribution can make a life-changing difference.
            </p>

            <div className="hero-buttons">
              <a href="/find_blood.html" className="btn primary">
                Find Blood
              </a>

              <a href="/donate.html" className="btn secondary">
                Become a Donor
              </a>
            </div>
          </div>

          <div className="hero-image">
            <div className="blood-drop">🩸</div>
          </div>
        </section>

        <section className="home-camps" aria-labelledby="upcomingCampsHeading">
          <h2 id="upcomingCampsHeading">Upcoming Blood Donation Camps</h2>
          <p className="section-description">Find a nearby camp and take part in saving lives.</p>
          <div className="camps-card-grid" aria-live="polite">
            {camps.map((camp) => (
              <article className="camp-item-card" key={camp.id || `${camp.name}-${camp.date}`}>
                <h3>{camp.name}</h3>
                <div className="camp-details-list">
                  <p>Organizer: <span>{camp.organizer || 'Not specified'}</span></p>
                  <p>Date: <span>{new Date(`${camp.date}T00:00:00`).toLocaleDateString()}</span></p>
                  <p>Time: <span>{camp.timing || 'To be announced'}</span></p>
                  <p>Venue: <span>{camp.venue || 'To be announced'}</span></p>
                </div>
              </article>
            ))}
          </div>
          {camps.length === 0 && (
            <p className="home-camps-empty">
              {campLoadError ? 'Upcoming camps could not be loaded from this browser.' : 'No upcoming camps have been published yet.'}
            </p>
          )}
          <a href="/Hospital_Dashboard.html" className="btn primary">Hospital Camp Dashboard</a>
        </section>

        <section className="stats">
          <div className="stat-card">
            <h2>10K+</h2>
            <p>Registered Donors</p>
          </div>

          <div className="stat-card">
            <h2>5K+</h2>
            <p>Lives Supported</p>
          </div>

          <div className="stat-card">
            <h2>20+</h2>
            <p>Partner Hospitals</p>
          </div>

          <div className="stat-card">
            <h2>8</h2>
            <p>Blood Groups</p>
          </div>
        </section>

        <section className="how-it-works">
          <h2>How It Works</h2>

          <p className="section-description">
            Three simple steps can help save a life.
          </p>

          <div className="steps">
            <div className="step">
              <div className="step-number">01</div>
              <h3>Register</h3>
              <p>
                Register yourself as a blood donor and provide
                your basic information.
              </p>
            </div>

            <div className="step">
              <div className="step-number">02</div>
              <h3>Find Blood</h3>
              <p>
                Search for available blood groups near your
                location.
              </p>
            </div>

            <div className="step">
              <div className="step-number">03</div>
              <h3>Save a Life</h3>
              <p>
                Connect with donors and help someone receive the
                blood they need.
              </p>
            </div>
          </div>
        </section>

        <section className="reviews">
          <h2>What Our Users Say</h2>

          <p className="section-description">
            Real experiences from people who helped make a
            difference.
          </p>

          <div className="review-cards">
            <div className="review-card">
              <div className="stars">★★★★★</div>
              <p>
                "Jeevan made it incredibly easy to find a donor
                when my family needed blood urgently. The process
                was simple and quick."
              </p>
              <div className="review-user">
                <div className="user-avatar">A</div>
                <div>
                  <h3>Aditya Sharma</h3>
                  <span>Blood Recipient</span>
                </div>
              </div>
            </div>

            <div className="review-card">
              <div className="stars">★★★★★</div>
              <p>
                "I registered as a donor and was able to connect
                with someone who needed my blood. Knowing that my
                donation helped someone feels amazing."
              </p>
              <div className="review-user">
                <div className="user-avatar">R</div>
                <div>
                  <h3>Riya Mehta</h3>
                  <span>Blood Donor</span>
                </div>
              </div>
            </div>

            <div className="review-card">
              <div className="stars">★★★★★</div>
              <p>
                "The interface is simple and easy to use. Finding
                the required blood group and nearby availability
                took only a few minutes."
              </p>
              <div className="review-user">
                <div className="user-avatar">K</div>
                <div>
                  <h3>Karan Verma</h3>
                  <span>Blood Recipient</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="emergency">
          <div>
            <h2>Need Blood Urgently?</h2>
            <p>
              Find available blood donors and blood banks near you.
            </p>
          </div>

          <a href="/find_blood.html" className="btn emergency-btn">
            Find Blood Now
          </a>
        </section>
      </main>

      <footer>&copy; 2026 Jeevan. Every Drop Counts.</footer>
    </>
  );
}

export default App;