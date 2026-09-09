"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { demoCatalog, demoStudioItems, type DemoProduct } from "../data/demo-catalog";
import { supabase } from "../lib/supabase";
import { fetchRealCurations, fetchCategoryAlternatives, type BackendCuration, type BackendProduct } from "../lib/backend";

type Screen = "home" | "feed" | "studio";
type Project = { name: string; budget: number; vibe: string[]; prompt: string };
type StudioItem = DemoProduct & { source?: "backend" };
type Board = { id: string; name: string; score: number; price: number; image: string; accents: string[]; items: StudioItem[] };

const vibes = ["Old money", "Soft romance", "City cool", "Y2K glow", "Coastal muse", "Desi modern"];

const initialBoards: Board[] = [
  { id: "1", name: "Saffron hour", score: 94, price: 4760, image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=80", accents: ["#d56844", "#f0c5a5", "#2b2d37"], items: demoStudioItems },
  { id: "2", name: "The linen edit", score: 91, price: 4290, image: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=900&q=80", accents: ["#e5dac8", "#6c7a63", "#b88d64"], items: demoStudioItems },
  { id: "3", name: "After dark", score: 89, price: 5180, image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80", accents: ["#211e2c", "#866e92", "#e7c2c7"], items: demoStudioItems }
];

function mapBackendProduct(p: BackendProduct): StudioItem {
  return {
    id: p.product_id,
    category: p.primary_category,
    name: p.title,
    brand: p.brand ?? "",
    retailer: p.source_platform,
    price: Math.round(p.current_price_minor / 100),
    currency: "INR",
    sizes: p.in_stock_sizes,
    inStock: p.is_available,
    image: p.primary_image_url,
    vibeTags: [],
    sourceUpdatedAt: "",
    productUrl: p.product_url,
    source: "backend"
  };
}

function mapCuration(curation: BackendCuration, index: number, fallbackImage: string): Board {
  const hero = curation.items[0];
  return {
    id: curation.id,
    name: hero?.sub_category ?? hero?.primary_category ?? `Board ${index + 1}`,
    score: Math.round(curation.compatibility_score),
    price: Math.round((curation.total_price_minor + curation.shipping_total_minor) / 100),
    image: hero?.primary_image_url ?? fallbackImage,
    accents: ["#d56844", "#f0c5a5", "#2b2d37"],
    items: curation.items.map(mapBackendProduct)
  };
}

function Rupee({ value }: { value: number }) {
  return <>₹{value.toLocaleString("en-IN")}</>;
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [project, setProject] = useState<Project>({ name: "Your first style moment", budget: 5000, vibe: ["Soft romance", "Coastal muse"], prompt: "A playful, polished outfit for a sunlit dinner." });
  const [draft, setDraft] = useState(project);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isGuestProjectHydrated, setIsGuestProjectHydrated] = useState(false);

  const [boards, setBoards] = useState<Board[]>(initialBoards);
  const [boardsLoading, setBoardsLoading] = useState(false);
  const [boardsError, setBoardsError] = useState<string | null>(null);

  const [activeBoard, setActiveBoard] = useState<Board>(initialBoards[0]);
  const [selectedItems, setSelectedItems] = useState<StudioItem[]>(initialBoards[0].items);
  const total = useMemo(() => selectedItems.reduce((sum, item) => sum + item.price, 0), [selectedItems]);

  useEffect(() => {
    const storedProject = window.localStorage.getItem("stylesync-guest-project");
    if (storedProject) {
      const parsedProject = JSON.parse(storedProject) as Project;
      setProject(parsedProject);
      setDraft(parsedProject);
    }
    setIsGuestProjectHydrated(true);
  }, []);

  useEffect(() => {
    if (!isGuestProjectHydrated) return;
    window.localStorage.setItem("stylesync-guest-project", JSON.stringify(project));
  }, [isGuestProjectHydrated, project]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === "SIGNED_IN" && nextSession) void migrateGuestProject(nextSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function migrateGuestProject(nextSession: Session) {
    if (!supabase) return;
    const savedProject = window.localStorage.getItem("stylesync-guest-project");
    if (!savedProject) return;
    const guestProject = JSON.parse(savedProject) as Project;
    const { error } = await supabase.from("projects").insert({
      user_id: nextSession.user.id,
      name: guestProject.name,
      max_budget_minor: Math.round(guestProject.budget * 100),
      currency: "INR",
      selected_vibes: guestProject.vibe,
      event_description: guestProject.prompt
    });
    if (!error) window.localStorage.removeItem("stylesync-guest-project");
  }

  function toggleVibe(vibe: string) {
    setDraft((current) => ({ ...current, vibe: current.vibe.includes(vibe) ? current.vibe.filter((entry) => entry !== vibe) : [...current.vibe, vibe] }));
  }

  function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProject(draft);
    setScreen("feed");
    setShowProjectForm(false);
    void loadRealBoards(draft);
  }

  async function loadRealBoards(forProject: Project) {
    setBoardsLoading(true);
    setBoardsError(null);
    try {
      const accessToken = session?.access_token ?? null;
      const curations = await fetchRealCurations(
        { name: forProject.name, budgetRupees: forProject.budget, prompt: forProject.prompt },
        accessToken,
        3
      );
      if (curations.length === 0) {
        setBoardsError("No combination of catalog items fit that budget yet — showing sample boards instead.");
        return;
      }
      const mapped = curations.map((c, i) => mapCuration(c, i, initialBoards[i % initialBoards.length].image));
      setBoards(mapped);
    }     catch (err) {
      console.error("STYLESYNC DEBUG", err);
      setBoardsError("Couldn't reach the curation backend — showing sample boards instead.");
    } finally {
      setBoardsLoading(false);
    }
  }

  async function replaceItem(index: number) {
    const current = selectedItems[index];
    if (current.source === "backend") {
      try {
        const alternatives = await fetchCategoryAlternatives(current.category, current.id);
        if (alternatives.length === 0) return;
        const replacement = mapBackendProduct(alternatives[Math.floor(Math.random() * alternatives.length)]);
        setSelectedItems((curr) => curr.map((item, i) => (i === index ? replacement : item)));
      } catch {
        // best-effort swap; leave item in place on failure
      }
      return;
    }
    const alternatives = demoCatalog.filter((product) => product.inStock && product.category === current.category);
    const replacement = alternatives.find((product) => product.id !== current.id) ?? current;
    setSelectedItems((curr) => curr.map((item, itemIndex) => (itemIndex === index ? replacement : item)));
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
        <button className="quiet-account" onClick={() => session ? setShowAccount(true) : setShowSignIn(true)}>{session ? "◉ Your account" : "♡ Sign in to keep your edits"}</button>
      </aside>

      <section className="content">
        <header className="topbar"><p className="eyebrow">STYLE, YOUR WAY</p><div className="top-actions"><button className="icon-button" aria-label="Notifications">◌</button><button className="avatar" aria-label={session ? "Open your account" : "Sign in"} onClick={() => session ? setShowAccount(true) : setShowSignIn(true)}>{session?.user.email?.charAt(0).toUpperCase() ?? "S"}</button></div></header>

        {screen === "home" && <HomeScreen project={project} onStart={() => { setDraft(project); setShowProjectForm(true); }} onExplore={() => setScreen("feed")} />}
        {screen === "feed" && <FeedScreen project={project} boards={boards} loading={boardsLoading} error={boardsError} onBack={() => setScreen("home")} onOpen={(board) => { setActiveBoard(board); setSelectedItems(board.items); setScreen("studio"); }} />}
        {screen === "studio" && <StudioScreen board={activeBoard} project={project} selectedItems={selectedItems} total={total} onBack={() => setScreen("feed")} onSwap={replaceItem} onSignIn={() => setShowSignIn(true)} />}
      </section>

      {showProjectForm && <ProjectForm draft={draft} onChange={setDraft} onToggleVibe={toggleVibe} onClose={() => setShowProjectForm(false)} onSubmit={createProject} />}
      {showSignIn && <SignInDialog onClose={() => setShowSignIn(false)} />}
      {showAccount && session && <AccountDialog session={session} onClose={() => setShowAccount(false)} onSignOut={async () => { await supabase?.auth.signOut(); setShowAccount(false); }} />}
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

function FeedScreen({ project, boards, loading, error, onBack, onOpen }: { project: Project; boards: Board[]; loading: boolean; error: string | null; onBack: () => void; onOpen: (board: Board) => void }) {
  return <div className="page feed-page"><div className="page-heading"><button className="back-button" onClick={onBack}>← Your space</button><p className="eyebrow">MADE FOR {project.name.toUpperCase()}</p><h1>Three ways to wear <em>the feeling.</em></h1><p>{project.prompt}</p></div><div className="filter-row"><span>Matching your vibe</span>{project.vibe.map((vibe) => <button key={vibe}>{vibe}</button>)}<button>Within <Rupee value={project.budget} /></button></div>
    {loading && <p className="feed-footnote">Curating your boards from the live catalog…</p>}
    {error && <p className="feed-footnote">{error}</p>}
    <div className="look-grid">{boards.map((board) => <article className="look-card" key={board.id}><div className="look-image" style={{ backgroundImage: `linear-gradient(0deg, rgba(26,23,28,.25), transparent 55%), url(${board.image})` }}><span className="style-score">{board.score}% match</span><button className="heart" aria-label="Save look">♡</button></div><div className="look-info"><div><h2>{board.name}</h2><p><Rupee value={board.price} /> <span>·</span> {board.items.length} pieces</p></div><button className="open-look" onClick={() => onOpen(board)}>Open look <span>→</span></button></div></article>)}</div><p className="feed-footnote">Prices refresh from the live catalog when the backend is reachable.</p></div>;
}

function StudioScreen({ board, project, selectedItems, total, onBack, onSwap, onSignIn }: { board: Board; project: Project; selectedItems: StudioItem[]; total: number; onBack: () => void; onSwap: (index: number) => void; onSignIn: () => void }) {
  const remaining = project.budget - total;
  return <div className="page studio-page"><div className="studio-heading"><button className="back-button" onClick={onBack}>← Looks for {project.name}</button><div><p className="eyebrow">MAKE IT YOURS</p><h1>{board.name}</h1></div><button className="save-button" onClick={onSignIn}>♡ Save this look</button></div><div className="studio-layout"><section className="outfit-canvas"><div className="canvas-label"><span>YOUR OUTFIT BOARD</span><b>{board.score}% style match</b></div><div className="canvas-art"><div className="canvas-sun" />{selectedItems.map((item, index) => <button key={`${item.name}-${index}`} className={`canvas-product product-${index}`} onClick={() => onSwap(index)}><img src={item.image} alt={item.name} /><span><b>{item.category}</b>{item.name}<em>Tap to swap</em></span></button>)}<i className="canvas-doodle">✦</i></div><p className="canvas-tip">Tap a piece to see a fresh alternative. We'll keep the vibe and budget in view.</p></section><aside className="budget-panel"><p className="eyebrow">THE NUMBERS</p><h2>Looking good, <em>budget too.</em></h2><div className="budget-total"><span>Total so far</span><strong><Rupee value={total} /></strong><small>{remaining >= 0 ? `${new Intl.NumberFormat("en-IN").format(remaining)} left for a little extra ✦` : `${new Intl.NumberFormat("en-IN").format(Math.abs(remaining))} over your budget`}</small><div className="budget-bar"><i style={{ width: `${Math.min(100, (total / project.budget) * 100)}%` }} /></div></div><div className="item-list">{selectedItems.map((item, index) => <button key={`${item.name}-list`} onClick={() => onSwap(index)}><span>{item.category}</span><b>{item.name}</b><em><Rupee value={item.price} /> · swap ↗</em></button>)}</div><button className="primary-button buy-button" onClick={onSignIn}>Save & shop this look <span>→</span></button><p className="legal-note">You'll sign in before saving. Shopping links are illustrative in this demo.</p></aside></div></div>;
}

function ProjectForm({ draft, onChange, onToggleVibe, onClose, onSubmit }: { draft: Project; onChange: (project: Project) => void; onToggleVibe: (vibe: string) => void; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <div className="dialog-backdrop" role="presentation"><form className="project-dialog" onSubmit={onSubmit}><button className="close-button" type="button" onClick={onClose}>×</button><p className="eyebrow">YOUR FIRST PROJECT</p><h2>What are we<br /><em>dressing for?</em></h2><label>Give this moment a name<input required value={draft.name} onChange={(event) => onChange({ ...draft, name: event.target.value })} placeholder="e.g. Cousin's cocktail night" /></label><div className="form-split"><label>Your max budget<div className="money-input"><span>₹</span><input type="number" min="500" step="100" value={draft.budget} onChange={(event) => onChange({ ...draft, budget: Number(event.target.value) })} /></div></label><label>Need it for<input value="An occasion" readOnly /></label></div><label>Choose 2–3 vibes<div className="vibe-picker">{vibes.map((vibe) => <button className={draft.vibe.includes(vibe) ? "selected" : ""} type="button" key={vibe} onClick={() => onToggleVibe(vibe)}>{draft.vibe.includes(vibe) ? "✓ " : ""}{vibe}</button>)}</div></label><label>Tell us a little more<textarea value={draft.prompt} onChange={(event) => onChange({ ...draft, prompt: event.target.value })} rows={3} /></label><button className="primary-button form-submit" type="submit">Show me my looks <span>→</span></button><p className="dialog-helper">No account needed to make your first project.</p></form></div>;
}

function SignInDialog({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) { setMessage("Add your Supabase URL and anon key to .env.local first."); return; }
    setIsSubmitting(true);
    setMessage("");
    const result = mode === "signIn" ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password });
    setIsSubmitting(false);
    if (result.error) { setMessage(result.error.message); return; }
    if (mode === "signUp" && !result.data.session) { setMessage("Check your email to confirm your account, then sign in."); return; }
    onClose();
  }

  return <div className="dialog-backdrop"><form className="signin-dialog" onSubmit={submit}><button className="close-button" type="button" onClick={onClose}>×</button><span className="sign-in-star">✦</span><p className="eyebrow">SAVE YOUR GOOD TASTE</p><h2>{mode === "signIn" ? <>Welcome <em>back.</em></> : <>Make it <em>yours.</em></>}</h2><p>{mode === "signIn" ? "Sign in to pick up where you left off." : "Create a free account to save edits and make your next look even more you."}</p><label style={{ display: "block", textAlign: "left", fontSize: 12, fontWeight: 700, marginTop: 14 }}>Email<input style={{ display: "block", width: "100%", marginTop: 6, padding: 11, border: "1px solid #ddd4d5", borderRadius: 10 }} type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label><label style={{ display: "block", textAlign: "left", fontSize: 12, fontWeight: 700, marginTop: 14 }}>Password<input style={{ display: "block", width: "100%", marginTop: 6, padding: 11, border: "1px solid #ddd4d5", borderRadius: 10 }} type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" /></label>{message && <p className="auth-message">{message}</p>}<button className="primary-button" disabled={isSubmitting}>{isSubmitting ? "One moment…" : mode === "signIn" ? "Sign in" : "Create free account"}<span>→</span></button><button className="email-button" type="button" onClick={() => { setMode(mode === "signIn" ? "signUp" : "signIn"); setMessage(""); }}>{mode === "signIn" ? "New here? Create an account" : "Already have an account? Sign in"}</button><small>By continuing, you agree to StyleSync's terms.</small></form></div>;
}

function AccountDialog({ session, onClose, onSignOut }: { session: Session; onClose: () => void; onSignOut: () => Promise<void> }) {
  const initialName = session.user.user_metadata.display_name ?? session.user.email?.split("@")[0] ?? "StyleSync friend";
  const [profile, setProfile] = useState<ProfileForm>({ displayName: initialName, topSize: "", bottomSize: "", waist: "", inseam: "", shoeSize: "", vibes: [], autoFilterStock: true });
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("profiles").select("display_name, top_size, bottom_size, waist_inches, inseam_inches, shoe_size_eu, selected_vibes, auto_filter_stock").eq("id", session.user.id).maybeSingle().then(({ data, error }) => {
      if (error) { setMessage("We could not load your profile yet."); return; }
      if (!data) return;
      setProfile({ displayName: data.display_name ?? initialName, topSize: data.top_size ?? "", bottomSize: data.bottom_size ?? "", waist: data.waist_inches?.toString() ?? "", inseam: data.inseam_inches?.toString() ?? "", shoeSize: data.shoe_size_eu?.toString() ?? "", vibes: data.selected_vibes ?? [], autoFilterStock: data.auto_filter_stock ?? true });
    });
  }, [initialName, session.user.id]);

  function updateProfile(partial: Partial<ProfileForm>) { setProfile((current) => ({ ...current, ...partial })); }
  function toggleVibe(vibe: string) { updateProfile({ vibes: profile.vibes.includes(vibe) ? profile.vibes.filter((entry) => entry !== vibe) : [...profile.vibes, vibe] }); }

  async function saveProfile() {
    if (!supabase) { setMessage("Add your Supabase URL and anon key to .env.local first."); return; }
    setIsSaving(true);
    setMessage("");
    const { error } = await supabase.from("profiles").upsert({ id: session.user.id, display_name: profile.displayName.trim() || initialName, top_size: profile.topSize || null, bottom_size: profile.bottomSize || null, waist_inches: profile.waist ? Number(profile.waist) : null, inseam_inches: profile.inseam ? Number(profile.inseam) : null, shoe_size_eu: profile.shoeSize ? Number(profile.shoeSize) : null, selected_vibes: profile.vibes, auto_filter_stock: profile.autoFilterStock });
    setIsSaving(false);
    setMessage(error ? error.message : "Preferences saved.");
  }

  const fieldStyle = { display: "block", width: "100%", marginTop: 6, padding: 10, border: "1px solid #ddd4d5", borderRadius: 10, background: "#fff" };
  const labelStyle = { display: "block", textAlign: "left" as const, fontSize: 11, fontWeight: 700, marginTop: 13 };
  return <div className="dialog-backdrop"><div className="signin-dialog" style={{ width: "min(100%, 620px)", maxHeight: "92vh", overflowY: "auto", textAlign: "left" }}><button className="close-button" onClick={onClose}>×</button><p className="eyebrow">YOUR ACCOUNT</p><h2 style={{ fontSize: 40 }}>{profile.displayName}</h2><p style={{ marginTop: -10 }}>{session.user.email}</p><section style={{ borderTop: "1px solid #eee7e9", marginTop: 22, paddingTop: 10 }}><p className="eyebrow">PERSONAL DETAILS</p><label style={labelStyle}>Display name<input style={fieldStyle} value={profile.displayName} onChange={(event) => updateProfile({ displayName: event.target.value })} /></label><p style={{ fontSize: 10, color: "#81767d" }}>Your email is managed securely by Supabase: {session.user.email}</p></section><section style={{ borderTop: "1px solid #eee7e9", marginTop: 20, paddingTop: 15 }}><p className="eyebrow">FIT MEASUREMENTS</p><div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}><label style={labelStyle}>Top size<select style={fieldStyle} value={profile.topSize} onChange={(event) => updateProfile({ topSize: event.target.value })}><option value="">Select</option>{["XS", "S", "M", "L", "XL", "XXL"].map((size) => <option key={size}>{size}</option>)}</select></label><label style={labelStyle}>Bottom size<select style={fieldStyle} value={profile.bottomSize} onChange={(event) => updateProfile({ bottomSize: event.target.value })}><option value="">Select</option>{["XS", "S", "M", "L", "XL", "XXL"].map((size) => <option key={size}>{size}</option>)}</select></label><label style={labelStyle}>Waist (inches)<input style={fieldStyle} type="number" min="18" max="60" value={profile.waist} onChange={(event) => updateProfile({ waist: event.target.value })} /></label><label style={labelStyle}>Inseam (inches)<input style={fieldStyle} type="number" min="20" max="44" value={profile.inseam} onChange={(event) => updateProfile({ inseam: event.target.value })} /></label><label style={labelStyle}>EU shoe size<input style={fieldStyle} type="number" min="30" max="48" step="0.5" value={profile.shoeSize} onChange={(event) => updateProfile({ shoeSize: event.target.value })} /></label></div></section><section style={{ borderTop: "1px solid #eee7e9", marginTop: 20, paddingTop: 15 }}><p className="eyebrow">STYLE PREFERENCES</p><div className="vibe-picker">{vibes.map((vibe) => <button className={profile.vibes.includes(vibe) ? "selected" : ""} type="button" key={vibe} onClick={() => toggleVibe(vibe)}>{profile.vibes.includes(vibe) ? "✓ " : ""}{vibe}</button>)}</div><label style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 12, marginTop: 15 }}><input type="checkbox" checked={profile.autoFilterStock} onChange={(event) => updateProfile({ autoFilterStock: event.target.checked })} /> Only show items available in my size</label></section>{message && <p className="auth-message">{message}</p>}<button className="primary-button" style={{ width: "100%", marginTop: 22 }} onClick={saveProfile} disabled={isSaving}>{isSaving ? "Saving…" : "Save preferences"}<span>→</span></button><button className="email-button" style={{ width: "100%" }} onClick={onSignOut}>Sign out</button></div></div>;
}
