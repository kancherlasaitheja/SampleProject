import Link from "next/link";

const signalPaths = [
  "M4 42C26 30 29 57 52 42S79 30 99 42s28 15 48 0 27-13 45 0 31 16 48 0",
  "M2 70c20-13 27 13 47 0s29-15 49 0 28 16 46-15 70 0 27 16 48-15 67 0",
];

export default function Home() {
  return (
    <main className="hub-shell">
      <div className="grid-glow" aria-hidden="true" />
      <div className="orb orb-one" aria-hidden="true" />
      <div className="orb orb-two" aria-hidden="true" />

      <header className="hub-header">
        <Link href="/" className="hub-brand" aria-label="Anime Sanyasi home">
          <span className="brand-mark"><i /><i /><i /></span>
          <span>ANIME SANYASI</span>
        </Link>
        <p>Experiments in wonder</p>
        <a className="header-jump" href="#projects">Explore projects <span>↓</span></a>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="status-line"><span /> LIVE DIGITAL ATLAS <em>01 / 01</em></div>
        <h1 id="hero-title">Stories that<br /><i>stretch</i> perspective.</h1>
        <p className="hero-copy">A growing collection of immersive digital worlds, built for curiosity. Begin at the edge of everything we can see.</p>
        <Link className="launch-button" href="/universe">
          <span className="launch-dot" />
          <span>Enter the Observable Universe</span>
          <b>↗</b>
        </Link>
        <p className="launch-note">Interactive experience · Sound optional · Best viewed full screen</p>
      </section>

      <aside className="coordinates" aria-label="Project coordinates">
        <span>PROJECT COORDINATES</span>
        <strong>20° 59′ N&nbsp;&nbsp;78° 57′ E</strong>
        <small>LOOK UP. LOOK OUT.</small>
      </aside>

      <section className="signal-art" aria-hidden="true">
        <div className="signal-sphere"><div className="sphere-core" /></div>
        <svg viewBox="0 0 280 110" preserveAspectRatio="none">
          {signalPaths.map((path) => <path key={path} d={path} />)}
        </svg>
        <div className="signal-caption"><span>THE OBSERVABLE</span><b>UNIVERSE</b><i>∞</i></div>
      </section>

      <section className="projects" id="projects" aria-labelledby="projects-title">
        <div className="projects-heading">
          <p>THE COLLECTION</p>
          <h2 id="projects-title">Choose your next<br />point of view.</h2>
          <span>More projects will appear here.</span>
        </div>
        <div className="project-grid">
          <Link className="project-card universe-card" href="/universe">
            <span className="card-index">01</span>
            <span className="card-orbit" aria-hidden="true"><i /><i /><i /></span>
            <div><p>IMMERSIVE ATLAS</p><h3>Observable<br />Universe</h3><span className="card-arrow">Open experience ↗</span></div>
          </Link>
          <article className="project-card future-card">
            <span className="card-index">02</span>
            <div className="future-glyph" aria-hidden="true">+</div>
            <div><p>IN DEVELOPMENT</p><h3>The next<br />world awaits.</h3><span className="card-arrow">Coming soon</span></div>
          </article>
          <article className="project-card future-card">
            <span className="card-index">03</span>
            <div className="future-glyph" aria-hidden="true">×</div>
            <div><p>OPEN SIGNAL</p><h3>More to<br />discover.</h3><span className="card-arrow">Coming soon</span></div>
          </article>
        </div>
      </section>

      <footer className="hub-footer"><span>ANIME SANYASI © 2026</span><span>MADE FOR CURIOSITY</span><a href="#projects">BACK TO PROJECTS ↑</a></footer>
    </main>
  );
}
