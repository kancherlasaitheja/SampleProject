"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import WorldVisual from "./components/WorldVisual";

const worlds = [
  { number: "01", name: "World 1", title: "Observable Universe", available: true },
  { number: "02", name: "World 2", title: "Coming soon", available: false },
  { number: "03", name: "World 3", title: "Coming soon", available: false },
];

function WorldIcon({ world }: { world: number }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      {world === 1 ? <><circle cx="16" cy="16" r="8" /><ellipse cx="16" cy="16" rx="14" ry="5" transform="rotate(-35 16 16)" /><circle className="icon-star" cx="25" cy="7" r="1.5" /></> :
        world === 2 ? <><circle cx="16" cy="16" r="10" /><path d="M16 6c-6 6-6 14 0 20M16 6c6 6 6 14 0 20M6 16h20" /></> :
          <><path d="m16 3 12 13-12 13L4 16Z" /><path d="m16 8 7 8-7 8-7-8ZM16 3v5m12 8h-5m-7 13v-5M4 16h5" /></>}
    </svg>
  );
}

function Arrow() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>;
}

export default function Home() {
  const [active, setActive] = useState(0);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);

  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, current: number) {
    let next = current;
    if (event.key === "ArrowRight") next = (current + 1) % worlds.length;
    else if (event.key === "ArrowLeft") next = (current + worlds.length - 1) % worlds.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = worlds.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="world-hub" data-world={active + 1}>
      <a href="#world-tabs" className="skip-link">Skip to worlds</a>
      <div className="ambient" aria-hidden="true"><i /><i /><i /><div className="ambient-ring" /></div>

      <header className="site-header">
        <Link className="site-brand" href="/" aria-label="Anime Sanyasi home">
          <span className="brand-symbol"><WorldIcon world={1} /></span>
          <span>ANIME SANYASI</span>
        </Link>
        <span className="site-status"><i /> 1 world available</span>
      </header>

      <main className="world-dashboard">
        <div className="dashboard-heading"><h1>Worlds<span>.</span></h1><span className="dashboard-index">01 — 03</span></div>

        <div className="world-tabs glass" id="world-tabs" role="tablist" aria-label="Choose a world">
          <span className="tab-highlight" style={{ transform: `translateX(${active * 100}%)` }} aria-hidden="true" />
          {worlds.map((world, index) => (
            <button key={world.number} className="world-tab" role="tab" id={`world-tab-${index + 1}`}
              aria-controls={`world-panel-${index + 1}`} aria-selected={active === index} tabIndex={active === index ? 0 : -1}
              ref={(element) => { tabs.current[index] = element; }} onClick={() => setActive(index)} onKeyDown={(event) => navigateTabs(event, index)}>
              <span className="tab-orb"><WorldIcon world={index + 1} /></span>
              <span className="tab-copy"><strong>{world.name}</strong><span>{world.title}</span></span>
              {world.available ? <span className="availability-dot" aria-hidden="true" /> : <svg className="lock-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="4" y="7" width="8" height="6" rx="2" /><path d="M6 7V5a2 2 0 0 1 4 0v2" /></svg>}
            </button>
          ))}
        </div>

        {worlds.map((world, index) => (
          <section key={world.number} role="tabpanel" id={`world-panel-${index + 1}`} aria-labelledby={`world-tab-${index + 1}`}
            className={`world-panel glass ${world.available ? "available-panel" : "upcoming-panel"}`} hidden={active !== index} tabIndex={0}>
            {active === index && <WorldVisual world={index + 1} />}
            <div className="panel-light" aria-hidden="true" />
            <div className="world-content">
              <span className="world-label"><span className="label-line" />{world.name}</span>
              <h2>{world.available ? <>Observable<br /><span>Universe</span></> : <>World {index + 1}<br /><span>Coming soon.</span></>}</h2>
              <span className={`world-state ${world.available ? "is-available" : ""}`}><i />{world.available ? "Available now" : "Coming soon"}</span>
              {world.available ? <Link className="enter-world" href="/universe" prefetch={false}><span>Enter World 1</span><span className="enter-arrow"><Arrow /></span></Link> :
                <span className="locked-world"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="6" y="10" width="12" height="10" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>Not available yet</span>}
            </div>
            <div className="panel-top-mark" aria-hidden="true"><span /><span /><span /></div>
            <span className="panel-number" aria-hidden="true">{world.number}</span>
            <div className="panel-bottom"><span>{world.available ? "OBSERVABLE UNIVERSE" : `WORLD ${index + 1}`}</span><span>{world.number}<i>/</i>03</span></div>
          </section>
        ))}
      </main>

      <footer className="site-footer"><span>ANIME SANYASI <span className="copyright">© 2026</span></span><span className="footer-worlds"><i />{worlds[active].name}</span></footer>
    </div>
  );
}
