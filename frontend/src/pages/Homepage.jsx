import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TAGS = ["All", "Realistic", "Cyberpunk", "Anime", "Fantasy", "3D Render", "Watercolor"];

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton" style={{ width: "100%", height: "220px" }} />
      <div className="skeleton-content">
        <div className="skeleton" style={{ width: "70%", height: "14px" }} />
        <div className="skeleton" style={{ width: "45%", height: "12px" }} />
      </div>
    </div>
  );
}

function ImageCard({ post, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyPrompt = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(post.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = (e) => {
    e.stopPropagation();
    window.open(post.photo, "_blank");
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`fade-up image-card ${hovered ? "hovered" : ""}`}
    >
      {/* Image */}
      <div className="image-wrapper">
        <img src={post.photo} alt={post.prompt} loading="lazy" className={`image ${hovered ? "zoomed" : ""}`} />
        {/* Hover overlay */}
        <div className={`overlay ${hovered ? "visible" : ""}`}>
          <p className="prompt-text">"{post.prompt}"</p>
          <div className="card-footer">
            <div className="author-info">
              <div className="author-avatar">{(post.name || "AI").slice(0, 2).toUpperCase()}</div>
              <span className="author-name">{post.name || "Anonymous"}</span>
            </div>
            <div className="card-actions">
              <button onClick={copyPrompt} className={`action-btn ${copied ? "success" : ""}`}>
                {copied ? "✓" : "Copy"}
              </button>
              <button onClick={download} className="action-btn">↓</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Lightbox({ post, onClose }) {
  const [copied, setCopied] = useState(false);

  const copyPrompt = () => {
    navigator.clipboard.writeText(post.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div onClick={onClose} className="lightbox-overlay">
      <div onClick={e => e.stopPropagation()} className="fade-up lightbox-content">
        {/* Image */}
        <div className="lightbox-image-container">
          <img src={post.photo} alt={post.prompt} className="lightbox-img" />
        </div>

        {/* Info */}
        <div className="lightbox-info">
          <div className="lightbox-header">
            <span className="badge">✦ AI Generated</span>
            <button onClick={onClose} className="close-btn">×</button>
          </div>

          <div className="lightbox-section">
            <p className="section-label">Prompt</p>
            <p className="prompt-box">"{post.prompt}"</p>
          </div>

          <div className="lightbox-section">
            <p className="section-label">Creator</p>
            <div className="creator-info">
              <div className="creator-avatar">{(post.name || "AI").slice(0, 2).toUpperCase()}</div>
              <div>
                <p className="creator-name">{post.name || "Anonymous"}</p>
                <p className="creator-meta">Synthesized with DALL-E 3</p>
              </div>
            </div>
          </div>

          <div className="lightbox-actions">
            <button onClick={copyPrompt} className={`btn-secondary ${copied ? "success" : ""}`}>
              {copied ? "✓ Copied!" : "Copy Prompt"}
            </button>
            <button onClick={() => window.open(post.photo, "_blank")} className="btn-primary">
              ↓ Download HD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Homepage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("All");
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5555/api/post/get")
      .then(r => setPosts(r.data || []))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filtered = posts.filter(p => {
    const q = search.toLowerCase();
    const matches = p.prompt?.toLowerCase().includes(q) || p.name?.toLowerCase().includes(q);
    if (tag === "All") return matches;
    return matches && p.prompt?.toLowerCase().includes(tag.toLowerCase());
  });

  return (
    <>
      <div className="homepage-container">
        {/* HERO */}
        <section className="hero-section">
          <div className="glow-blob blob-1" />
          <div className="glow-blob blob-2" />

          <div className="hero-content">
            <div className="fade-up badge">✦ Community AI Gallery</div>

            <h1 className="fade-up hero-title">
              Imagine. <span className="text-gradient">Generate.</span> Inspire.
            </h1>

            <p className="fade-up hero-subtitle">
              Discover breathtaking high-fidelity images crafted entirely by AI. Browse the global creative feed or unleash your own vision.
            </p>

            <div className="fade-up hero-actions">
              <button onClick={() => navigate("/create")} className="btn-primary large">
                ✦ Start Generating
              </button>
              <a href="#gallery" className="btn-secondary large">
                Browse Gallery ↓
              </a>
            </div>
          </div>
        </section>

        {/* DIVIDER */}
        <div className="divider" />

        {/* CONTROLS */}
        <section id="gallery" className="controls-section">
          <div className="controls-container">
            {/* Tags */}
            <div className="tags-container">
              {TAGS.map(t => (
                <button
                  key={t}
                  onClick={() => setTag(t)}
                  className={`tag-btn ${tag === t ? "active" : ""}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="search-container">
              <input
                type="text"
                placeholder="Search prompt or creator..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">⊕</span>
            </div>
          </div>
        </section>

        {/* GALLERY GRID */}
        <main className="gallery-main">
          {loading ? (
            <div className="masonry-grid">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length > 0 ? (
            <div className="masonry-grid">
              {filtered.map(p => (
                <ImageCard key={p._id} post={p} onClick={() => setSelected(p)} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🎨</div>
              <h3 className="empty-title">
                {posts.length === 0 ? "Gallery is empty — be the first!" : "No results found"}
              </h3>
              <p className="empty-desc">
                {posts.length === 0
                  ? "No creations yet in the database. Generate your first masterpiece and post it to the community!"
                  : "No creations match your current filters. Try a different keyword."}
              </p>
              <button onClick={() => navigate("/create")} className="btn-primary">
                ✦ Create First Masterpiece
              </button>
            </div>
          )}
        </main>

        {/* LIGHTBOX */}
        {selected && <Lightbox post={selected} onClose={() => setSelected(null)} />}
      </div>

      <style>{`
        .homepage-container {
          min-height: 100vh;
          background: #030712;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding-top: 60px; /* matches navbar height */
        }
        
        /* Hero */
        .hero-section {
          position: relative;
          overflow: hidden;
          padding: 40px 16px;
          text-align: center;
        }
        .glow-blob {
          position: absolute;
          pointer-events: none;
        }
        .blob-1 {
          top: -40px; left: 50%; transform: translateX(-50%);
          width: 300px; height: 300px;
          background: radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, transparent 70%);
        }
        .blob-2 {
          top: 0; right: -50px;
          width: 200px; height: 200px;
          background: radial-gradient(ellipse, rgba(168,85,247,0.15) 0%, transparent 70%);
        }
        .hero-content {
          position: relative; z-index: 1;
          max-width: 780px; margin: 0 auto;
        }
        .badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.3);
          border-radius: 99px; padding: 4px 12px;
          font-size: 11px; font-weight: 700; color: #818cf8;
          letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 16px;
        }
        .hero-title {
          font-size: clamp(32px, 8vw, 68px);
          font-weight: 900; line-height: 1.1; letter-spacing: -0.03em;
          color: #f8fafc; margin-bottom: 16px;
        }
        .text-gradient {
          background: linear-gradient(135deg,#818cf8,#a855f7,#06b6d4);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .hero-subtitle {
          color: #64748b; font-size: clamp(14px, 4vw, 18px);
          line-height: 1.6; max-width: 560px; margin: 0 auto 24px;
        }
        .hero-actions {
          display: flex; gap: 10px; justify-content: center; flex-direction: column;
        }
        
        /* Buttons */
        .btn-primary {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 10px 20px; border-radius: 12px;
          background: linear-gradient(135deg,#6366f1,#a855f7);
          border: none; color: #fff; cursor: pointer;
          font-size: 14px; font-weight: 700;
          box-shadow: 0 0 14px rgba(99,102,241,0.4);
          transition: all 0.2s; text-decoration: none;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 20px rgba(99,102,241,0.6); }
        .btn-secondary {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 10px 20px; border-radius: 12px;
          background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.25);
          color: #818cf8; text-decoration: none;
          font-size: 14px; font-weight: 700; transition: all 0.2s; cursor: pointer;
        }
        .btn-secondary:hover { background: rgba(99,102,241,0.15); }
        
        .divider { border-top: 1px solid #1e293b; margin: 0 16px; }
        
        /* Controls */
        .controls-section { padding: 20px 16px; max-width: 1400px; margin: 0 auto; }
        .controls-container {
          display: flex; align-items: stretch; justify-content: space-between;
          flex-direction: column; gap: 12px;
        }
        .tags-container {
          display: flex; flex-wrap: nowrap; overflow-x: auto; gap: 8px; padding-bottom: 4px;
          -webkit-overflow-scrolling: touch; scrollbar-width: none;
        }
        .tags-container::-webkit-scrollbar { display: none; }
        .tag-btn {
          padding: 6px 14px; border-radius: 99px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; border: 1px solid; white-space: nowrap;
          background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.07); color: #64748b;
        }
        .tag-btn.active {
          background: rgba(99,102,241,0.18); border-color: rgba(99,102,241,0.6); color: #a5b4fc;
        }
        .search-container { position: relative; width: 100%; }
        .search-input {
          width: 100%; padding: 10px 16px 10px 34px;
          background: #0f172a; border: 1px solid #1e293b;
          border-radius: 12px; color: #e2e8f0; font-size: 13px;
          outline: none; font-family: inherit; transition: border-color 0.2s;
        }
        .search-input:focus { border-color: #6366f1; }
        .search-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          color: #475569; font-size: 14px; pointer-events: none;
        }
        
        /* Gallery */
        .gallery-main { padding: 0 16px 40px; max-width: 1400px; margin: 0 auto; }
        .masonry-grid {
          column-count: 1; column-gap: 16px;
        }
        .skeleton-card {
          background: #0f172a; border: 1px solid #1e293b;
          border-radius: 16px; overflow: hidden; break-inside: avoid; margin-bottom: 16px;
        }
        .skeleton-content { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
        .image-card {
          background: #0f172a; border: 1px solid #1e293b;
          border-radius: 16px; overflow: hidden; cursor: pointer;
          break-inside: avoid; margin-bottom: 16px; transition: all 0.3s ease;
        }
        .image-card.hovered {
          border-color: rgba(99,102,241,0.4); transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        }
        .image-wrapper { position: relative; overflow: hidden; }
        .image {
          width: 100%; display: block; transition: transform 0.5s ease;
        }
        .image.zoomed { transform: scale(1.03); }
        .overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(3,7,18,0.95) 0%, rgba(3,7,18,0.2) 50%, transparent 100%);
          opacity: 0; transition: opacity 0.3s ease;
          display: flex; flex-direction: column; justify-content: flex-end; padding: 12px;
        }
        .overlay.visible { opacity: 1; }
        /* Always show overlay content faintly on mobile if no hover */
        @media (hover: none) {
          .overlay { opacity: 1; background: linear-gradient(to top, rgba(3,7,18,0.9) 0%, transparent 100%); }
          .prompt-text, .author-name { text-shadow: 0 1px 2px #000; }
        }
        .prompt-text {
          color: #e2e8f0; font-size: 12px; font-weight: 600; line-height: 1.4; margin-bottom: 8px;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .card-footer { display: flex; justify-content: space-between; align-items: center; }
        .author-info { display: flex; align-items: center; gap: 6px; }
        .author-avatar {
          width: 20px; height: 20px; border-radius: 6px;
          background: linear-gradient(135deg,#6366f1,#a855f7);
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; font-weight: 800; color: #fff;
        }
        .author-name { font-size: 11px; font-weight: 600; color: #cbd5e1; }
        .card-actions { display: flex; gap: 4px; }
        .action-btn {
          padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 700;
          background: rgba(99,102,241,0.2); border: 1px solid rgba(99,102,241,0.4);
          color: #a5b4fc; cursor: pointer;
        }
        .action-btn.success { color: #34d399; }
        
        .empty-state {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 40px 16px; text-align: center;
        }
        .empty-icon {
          width: 60px; height: 60px; border-radius: 16px;
          background: rgba(99,102,241,0.1); border: 1px dashed rgba(99,102,241,0.3);
          display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 16px;
        }
        .empty-title { color: #e2e8f0; font-size: 18px; font-weight: 700; margin-bottom: 8px; }
        .empty-desc { color: #475569; font-size: 13px; line-height: 1.5; max-width: 300px; margin-bottom: 20px; }
        
        /* Lightbox */
        .lightbox-overlay {
          position: fixed; inset: 0; z-index: 2000;
          background: rgba(3,7,18,0.9); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; padding: 12px;
        }
        .lightbox-content {
          background: #0f172a; border: 1px solid #1e293b; border-radius: 20px;
          overflow: hidden; width: 100%; max-width: 880px;
          display: flex; flex-direction: column; max-height: 90vh;
        }
        .lightbox-image-container {
          background: #030712; display: flex; align-items: center; justify-content: center;
          overflow: hidden; flex: 1 1 auto; min-height: 200px;
        }
        .lightbox-img { width: 100%; height: 100%; object-fit: contain; max-height: 50vh; }
        .lightbox-info {
          padding: 20px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; flex: 0 0 auto;
        }
        .lightbox-header { display: flex; justify-content: space-between; align-items: center; }
        .close-btn {
          background: #1e293b; border: none; color: #94a3b8; cursor: pointer;
          width: 28px; height: 28px; border-radius: 8px; font-size: 16px;
          display: flex; align-items: center; justify-content: center;
        }
        .section-label { font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 6px; }
        .prompt-box {
          background: #030712; border: 1px solid #1e293b; border-radius: 12px;
          padding: 12px; font-size: 13px; color: #cbd5e1; line-height: 1.5; font-style: italic;
        }
        .creator-info { display: flex; align-items: center; gap: 10px; }
        .creator-avatar {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg,#6366f1,#a855f7);
          display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: #fff;
        }
        .creator-name { font-weight: 700; color: #e2e8f0; font-size: 14px; }
        .creator-meta { font-size: 11px; color: #475569; }
        .lightbox-actions { display: flex; gap: 8px; margin-top: 8px; }
        .lightbox-actions button { flex: 1; padding: 10px; font-size: 12px; }
        
        /* Media Queries */
        @media (min-width: 576px) {
          .masonry-grid { column-count: 2; }
          .hero-actions { flex-direction: row; }
        }
        @media (min-width: 768px) {
          .homepage-container { padding-top: 66px; }
          .hero-section { padding: 80px 32px 60px; }
          .blob-1 { width: 500px; height: 300px; }
          .blob-2 { width: 300px; height: 300px; right: 10%; }
          .badge { font-size: 12px; padding: 5px 16px; margin-bottom: 24px; }
          .hero-title { margin-bottom: 20px; }
          .hero-subtitle { margin-bottom: 36px; }
          .btn-primary.large, .btn-secondary.large { padding: 13px 28px; font-size: 15px; }
          .divider { margin: 0 32px; }
          .controls-section { padding: 28px 32px; }
          .controls-container { flex-direction: row; align-items: center; }
          .search-container { width: 280px; }
          .gallery-main { padding: 0 32px 64px; }
          .masonry-grid { column-count: 3; }
        }
        @media (min-width: 1024px) {
          .masonry-grid { column-count: 4; }
          .lightbox-content { flex-direction: row; max-height: 80vh; }
          .lightbox-image-container { flex: 0 0 55%; min-height: unset; }
          .lightbox-img { max-height: 100%; }
          .lightbox-info { flex: 1; padding: 32px; gap: 20px; }
          .lightbox-actions { margin-top: auto; padding-top: 16px; border-top: 1px solid #1e293b; }
        }
      `}</style>
    </>
  );
}
