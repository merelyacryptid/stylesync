"use client";

import { FormEvent, useMemo, useState } from "react";

type Screen = "home" | "feed" | "studio";
type Project = { name: string; budget: number; vibe: string[]; prompt: string };

const vibes = ["Old money", "Soft romance", "City cool", "Y2K glow", "Coastal muse", "Desi modern"];
const boards = [
  { id: 1, name: "Saffron hour", score: 94, price: 4760, image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=80", accents: ["#d56844", "#f0c5a5", "#2b2d37"] },
  { id: 2, name: "The linen edit", score: 91, price: 4290, image: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=900&q=80", accents: ["#e5dac8", "#6c7a63", "#b88d64"] },
  { id: 3, name: "After dark", score: 89, price: 5180, image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80", accents: ["#211e2c", "#866e92", "#e7c2c7"] }
];

const items = [
  { category: "Dress", name: "Satin slip dress", price: 1890, image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=700&q=80" },
  { category: "Layer", name: "Cloud white shrug", price: 899, image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=700&q=80" },
  { category: "Shoes", name: "Strappy kitten heels", price: 1199, image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=700&q=80" },
  { category: "Bag", name: "Mini shoulder bag", price: 772, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=80" }
];

function Rupee({ value }: { value: number }) {
  return <>₹{value.toLocaleString("en-IN")}</>;
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [project, setProject] = useState<Project>({ name: "Your first style moment", budget: 5000, vibe: ["Soft romance", "Coastal muse"], prompt: "A playful, polished outfit for a sunlit dinner." });
  const [draft, setDraft] = useState(project);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [activeBoard, setActiveBoard] = useState(boards[0]);
  const [selectedItems, setSelectedItems] = useState(items);
  const total = useMemo(() => selectedItems.reduce((sum, item) => sum + item.price, 0), [selectedItems]);

  function toggleVibe(vibe: string) {
    setDraft((current) => ({ ...current, vibe: current.vibe.includes(vibe) ? current.vibe.filter((entry) => entry !== vibe) : [...current.vibe, vibe] }));
  }

  function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProject(draft);
    setScreen("feed");
    setShowProjectForm(false);
  }

  function replaceItem(index: number) {
    const alternatives = [
      { ...items[index], name: index === 0 ? "Rose wrap mini" : `${items[index].name} — fresh pick`, price: Math.max(499, items[index].price - 140) },
      { ...items[index], name: index === 0 ? "Berry midi dress" : `${items[index].name} — evening edit`, price: items[index].price + 90 }
    ];
    setSelectedItems((current) => current.map((item, itemIndex) => itemIndex === index ? alternatives[(item.price + index) % 2] : item));
  }

  return (
    <main className="app-shell">
      <aside className="side-nav" aria-label="Main navigation">
        <button className="brand" onClick={() => setScreen("home")} aria-label="StyleSync home"><span>✦</span> StyleSync</button>
        <nav>
          <button className={screen === "home" ? "nav-link active" : "nav-link"} onClick={() => setScreen("home")}><span>⌂</span> Your space</button>
          <button className={screen === "feed" ? "nav-link active" : "nav-link"} onClick={() => setScreen("feed")}><span>◈</span> Explore looks</button>
          <button className={screen === "studio" ? "nav-link active" : "nav-link"} onClick={() => setScreen("studio")}><span>✣</span> Mix & match</button>
        </nav>
        <div className="nav-note"><span className="sparkle">✦</span><p>Your first project is free to explore. Sign in only when you want to save it.</p></div>
        <button className="quiet-account" onClick={() => setShowSignIn(true)}>♡ Sign in to keep your edits</button>
      </aside>

      <section className="content">
        <header className="topbar"><p className="eyebrow">STYLE, YOUR WAY</p><div className="top-actions"><button className="icon-button" aria-label="Notifications">◌</button><button className="avatar" onClick={() => setShowSignIn(true)}>S</button></div></header>

        {screen === "home" && <HomeScreen project={project} onStart={() => { setDraft(project); setShowProjectForm(true); }} onExplore={() => setScreen("feed")} />}
        {screen === "feed" && <FeedScreen project={project} onBack={() => setScreen("home")} onOpen={(board) => { setActiveBoard(board); setScreen("studio"); }} />}
        {screen === "studio" && <StudioScreen board={activeBoard} project={project} selectedItems={selectedItems} total={total} onBack={() => setScreen("feed")} onSwap={replaceItem} onSignIn={() => setShowSignIn(true)} />}
      </section>

      {showProjectForm && <ProjectForm draft={draft} onChange={setDraft} onToggleVibe={toggleVibe} onClose={() => setShowProjectForm(false)} onSubmit={createProject} />}
      {showSignIn && <SignInDialog onClose={() => setShowSignIn(false)} />}
    </main>
  );
}

function HomeScreen({ project, onStart, onExplore }: { project: Project; onStart: () => void; onExplore: () => void }) {
  return <div className="page home-page">
    <section className="hero"><div><p className="eyebrow">YOUR LITTLE CORNER OF THE INTERNET</p><h1>Dress the<br /><em>moment.</em></h1><p className="hero-copy">Turn a plan into an outfit you cannot stop thinking about.</p><button className="primary-button" onClick={onStart}>Start a new style project <span>→</span></button></div><div className="hero-collage" aria-hidden="true"><div className="blob blob-one" /><div className="blob blob-two" /><div className="image-card card-main" /><div className="image-card card-small" /><span className="sticker">for<br />the plot<br />✦</span></div></section>
    <section className="project-preview"><div><p className="eyebrow">PICK UP WHERE YOU LEFT OFF</p><h2>{project.name}</h2><p>{project.vibe.join(" · ")} <span>•</span> <Rupee value={project.budget} /> budget</p></div><button className="outline-button" onClick={onExplore}>See your edits <span>↗</span></button></section>
    <section className="vibe-strip"><p className="eyebrow">A FEW WAYS TO BEGIN</p><div className="vibe-cards">{["Brunch in bloom", "Airport but make it cute", "The wedding guest edit"].map((name, index) => <button key={name} className={`vibe-card vibe-${index}`} onClick={onStart}><span>✦</span><strong>{name}</strong><small>Make this a project →</small></button>)}</div></section>
  </div>;
}

function FeedScreen({ project, onBack, onOpen }: { project: Project; onBack: () => void; onOpen: (board: typeof boards[number]) => void }) {
  return <div className="page feed-page"><div className="page-heading"><button className="back-button" onClick={onBack}>← Your space</button><p className="eyebrow">MADE FOR {project.name.toUpperCase()}</p><h1>Three ways to wear <em>the feeling.</em></h1><p>{project.prompt}</p></div><div className="filter-row"><span>Matching your vibe</span>{project.vibe.map((vibe) => <button key={vibe}>{vibe}</button>)}<button>Within <Rupee value={project.budget} /></button></div><div className="look-grid">{boards.map((board) => <article className="look-card" key={board.id}><div className="look-image" style={{ backgroundImage: `linear-gradient(0deg, rgba(26,23,28,.25), transparent 55%), url(${board.image})` }}><span className="style-score">{board.score}% match</span><button className="heart" aria-label="Save look">♡</button></div><div className="look-info"><div><h2>{board.name}</h2><p><Rupee value={board.price} /> <span>·</span> 4 pieces</p></div><button className="open-look" onClick={() => onOpen(board)}>Open look <span>→</span></button></div></article>)}</div><p className="feed-footnote">These are concept boards for your course prototype. Availability is illustrative.</p></div>;
}

function StudioScreen({ board, project, selectedItems, total, onBack, onSwap, onSignIn }: { board: typeof boards[number]; project: Project; selectedItems: typeof items; total: number; onBack: () => void; onSwap: (index: number) => void; onSignIn: () => void }) {
  const remaining = project.budget - total;
  return <div className="page studio-page"><div className="studio-heading"><button className="back-button" onClick={onBack}>← Looks for {project.name}</button><div><p className="eyebrow">MAKE IT YOURS</p><h1>{board.name}</h1></div><button className="save-button" onClick={onSignIn}>♡ Save this look</button></div><div className="studio-layout"><section className="outfit-canvas"><div className="canvas-label"><span>YOUR OUTFIT BOARD</span><b>{board.score}% style match</b></div><div className="canvas-art"><div className="canvas-sun" />{selectedItems.map((item, index) => <button key={`${item.name}-${index}`} className={`canvas-product product-${index}`} onClick={() => onSwap(index)}><img src={item.image} alt={item.name} /><span><b>{item.category}</b>{item.name}<em>Tap to swap</em></span></button>)}<i className="canvas-doodle">✦</i></div><p className="canvas-tip">Tap a piece to see a fresh alternative. We’ll keep the vibe and budget in view.</p></section><aside className="budget-panel"><p className="eyebrow">THE NUMBERS</p><h2>Looking good, <em>budget too.</em></h2><div className="budget-total"><span>Total so far</span><strong><Rupee value={total} /></strong><small>{remaining >= 0 ? `${new Intl.NumberFormat("en-IN").format(remaining)} left for a little extra ✦` : `${new Intl.NumberFormat("en-IN").format(Math.abs(remaining))} over your budget`}</small><div className="budget-bar"><i style={{ width: `${Math.min(100, (total / project.budget) * 100)}%` }} /></div></div><div className="item-list">{selectedItems.map((item, index) => <button key={`${item.name}-list`} onClick={() => onSwap(index)}><span>{item.category}</span><b>{item.name}</b><em><Rupee value={item.price} /> · swap ↗</em></button>)}</div><button className="primary-button buy-button" onClick={onSignIn}>Save & shop this look <span>→</span></button><p className="legal-note">You’ll sign in before saving. Shopping links are illustrative in this demo.</p></aside></div></div>;
}

function ProjectForm({ draft, onChange, onToggleVibe, onClose, onSubmit }: { draft: Project; onChange: (project: Project) => void; onToggleVibe: (vibe: string) => void; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <div className="dialog-backdrop" role="presentation"><form className="project-dialog" onSubmit={onSubmit}><button className="close-button" type="button" onClick={onClose}>×</button><p className="eyebrow">YOUR FIRST PROJECT</p><h2>What are we<br /><em>dressing for?</em></h2><label>Give this moment a name<input required value={draft.name} onChange={(event) => onChange({ ...draft, name: event.target.value })} placeholder="e.g. Cousin's cocktail night" /></label><div className="form-split"><label>Your max budget<div className="money-input"><span>₹</span><input type="number" min="500" step="100" value={draft.budget} onChange={(event) => onChange({ ...draft, budget: Number(event.target.value) })} /></div></label><label>Need it for<input value="An occasion" readOnly /></label></div><label>Choose 2–3 vibes<div className="vibe-picker">{vibes.map((vibe) => <button className={draft.vibe.includes(vibe) ? "selected" : ""} type="button" key={vibe} onClick={() => onToggleVibe(vibe)}>{draft.vibe.includes(vibe) ? "✓ " : ""}{vibe}</button>)}</div></label><label>Tell us a little more<textarea value={draft.prompt} onChange={(event) => onChange({ ...draft, prompt: event.target.value })} rows={3} /></label><button className="primary-button form-submit" type="submit">Show me my looks <span>→</span></button><p className="dialog-helper">No account needed to make your first project.</p></form></div>;
}

function SignInDialog({ onClose }: { onClose: () => void }) { return <div className="dialog-backdrop"><div className="signin-dialog"><button className="close-button" onClick={onClose}>×</button><span className="sign-in-star">✦</span><p className="eyebrow">SAVE YOUR GOOD TASTE</p><h2>Want to keep this<br /><em>one?</em></h2><p>Create a free account to save edits, track price drops, and make your next look even more you.</p><button className="primary-button">Continue with Google <span>→</span></button><button className="email-button">Continue with email</button><small>By continuing, you agree to StyleSync’s terms.</small></div></div>; }
