import { useState, useRef } from "react";
import axios from "axios";
import { puter } from '@heyputer/puter.js';

const SURPRISES = [
  "A hyper-realistic cyborg wolf standing on neon-lit Tokyo ruins, cinematic 8K render, volumetric fog",
  "An ethereal cosmic goddess floating in an aurora-borealis nebula, digital oil painting, ultra detailed",
  "A lone astronaut discovering an ancient alien temple on a terraformed Mars, golden hour, Unreal Engine 5",
  "A breathtaking underwater city with bioluminescent coral skyscrapers and manta rays, photorealistic",
  "A futuristic samurai warrior in cyberpunk alleyway rain, neon reflections, cinematic 35mm film",
  "An ancient dragon perched on a crystalline mountain during a lightning storm, epic fantasy, 4K",
  "A steampunk airship fleet sailing through golden storm clouds at sunset, dramatic lighting, concept art",
  "A magical enchanted bookshop with floating books and amber stained-glass light, cozy atmosphere",
];

const STYLES = [
  { id: "photo", label: "Photo", emoji: "📷", suffix: ", photorealistic, hyperdetailed, 8K DSLR photography, depth of field", color: "#06b6d4" },
  { id: "cyber", label: "Cyber", emoji: "🌆", suffix: ", cyberpunk neon aesthetic, blade runner, rain-slick streets, holographic HUD", color: "#a855f7" },
  { id: "anime", label: "Anime", emoji: "🎌", suffix: ", anime art style, Studio Ghibli, vibrant watercolor, hand-drawn cel shading", color: "#ec4899" },
  { id: "fantasy", label: "Fantasy", emoji: "🧙", suffix: ", epic high fantasy, dramatic lighting, intricate magical details", color: "#f59e0b" },
  { id: "3d", label: "3D", emoji: "🎮", suffix: ", Octane render, 3D CGI, volumetric lighting, Unreal Engine 5, subsurface scattering", color: "#10b981" },
  { id: "watercolor", label: "Paint", emoji: "🎨", suffix: ", delicate watercolor illustration, soft washes, impressionistic brushstrokes", color: "#f97316" },
];

const RATIOS = [
  { id: "1024x1024", label: "1:1", sub: "Square", w: 22, h: 22 },
  { id: "1792x1024", label: "16:9", sub: "Landscape", w: 28, h: 17 },
  { id: "1024x1792", label: "9:16", sub: "Portrait", w: 17, h: 28 },
];

const LOADING_MSGS = [
  "Seeding the neural network…",
  "Dreaming in latent space…",
  "Diffusing noise into pixels…",
  "Rendering light and shadows…",
  "Composing the final canvas…",
  "Bringing your vision to life…",
];

function Toast({ data, onClose }) {
  if (!data) return null;
  const colors = {
    success: { bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.35)", color: "#34d399" },
    error: { bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.35)", color: "#f87171" },
    info: { bg: "rgba(99,102,241,0.15)", border: "rgba(99,102,241,0.35)", color: "#a5b4fc" },
  };
  const c = colors[data.type] || colors.info;
  return (
    <div className="toast-notification" style={{
      background: c.bg, border: `1px solid ${c.border}`, color: c.color
    }}>
      <span className="toast-icon">{data.type === "success" ? "✓" : data.type === "error" ? "✗" : "i"}</span>
      {data.message}
      <button onClick={onClose} className="toast-close">×</button>
    </div>
  );
}

export default function CreatePage() {
  const [prompt, setPrompt] = useState("");
  const [author, setAuthor] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");
  const [style, setStyle] = useState(null);
  const [ratio, setRatio] = useState(RATIOS[0]);
  const [cfg, setCfg] = useState(7);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [posting, setPosting] = useState(false);
  const interval = useRef(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const finalPrompt = () => {
    const base = prompt.trim();
    return style && base ? `${base}${style.suffix}` : base;
  };

  const handleSurprise = async () => {
    try {
      setLoadingPrompt(true);
      // Use Puter.js AI chat to generate a creative image prompt
      const response = await puter.ai.chat("Generate a highly creative, detailed, and visually stunning prompt for an AI image generator. The prompt should be exactly 1 to 2 sentences long, describing a fascinating scene, character, or landscape. Do not include any introductory text, just return the prompt itself.");
      
      let newPrompt = typeof response === 'string' ? response : (response.message || response.text || SURPRISES[Math.floor(Math.random() * SURPRISES.length)]);
      
      // Clean up quotes if the AI returned them
      newPrompt = newPrompt.replace(/^["']|["']$/g, '').trim();
      setPrompt(newPrompt);
    } catch (err) {
      console.error("AI Prompt generation failed:", err);
      // Fallback to local surprises if API fails
      setPrompt(SURPRISES[Math.floor(Math.random() * SURPRISES.length)]);
    } finally {
      setLoadingPrompt(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) { showToast("Write a prompt first!", "error"); return; }
    try {
      setLoading(true); setImage(null);
      let i = 0; setLoadMsg(LOADING_MSGS[0]);
      interval.current = setInterval(() => { i = (i + 1) % LOADING_MSGS.length; setLoadMsg(LOADING_MSGS[i]); }, 2200);
      
      // Disable Puter console logs
      puter.quiet = true;

      // Use puter.js default model and pass the aspect ratio
      const imageElement = await puter.ai.txt2img(finalPrompt(), { 
        model: "gpt-image-2",
        aspect_ratio: ratio.label, // e.g. "16:9"
        size: ratio.id // e.g. "1792x1024" as fallback
      });
      
      // Convert to base64 if needed for Cloudinary backend
      const src = imageElement.src;
      let base64Data = src;
      if (!src.startsWith('data:')) {
        const response = await fetch(src);
        const blob = await response.blob();
        base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }

      setImage(base64Data); 
      showToast("Masterpiece ready! ✨", "success");
    } catch (err) {
      console.error("Puter Error:", err);
      showToast(`Error: ${err.message}`, "error");
    } finally {
      clearInterval(interval.current); setLoading(false); setLoadMsg("");
    }
  };

  const handleDownload = () => {
    if (!image) return;
    const a = document.createElement("a");
    a.href = image; // image is now the full base64 data URL
    a.download = `heyai_${Date.now()}.png`;
    a.click();
    showToast("Image downloaded!", "success");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(finalPrompt());
    setCopied(true); setTimeout(() => setCopied(false), 2200);
    showToast("Prompt copied!", "info");
  };

  const handlePost = async () => {
    if (!image) { showToast("Generate an image first!", "error"); return; }
    if (!author.trim()) { showToast("Enter your creator name!", "error"); return; }
    try {
      setPosting(true);
      await axios.post("http://localhost:5555/api/post/create", {
        name: author.trim(),
        prompt: finalPrompt(),
        photo: image, // image is already base64 data url from puter.js
      });
      showToast("🎉 Live on the Community Feed!", "success");
    } catch (err) {
      showToast(`Post failed: ${err.response?.data?.message || err.message}`, "error");
    } finally { setPosting(false); }
  };

  return (
    <>
      <div className="create-container">
        <Toast data={toast} onClose={() => setToast(null)} />

        {/* Page header */}
        <div className="create-header">
          <div className="header-blob" />
          <div className="header-content">
            <div className="badge">⚡ AI Creative Studio</div>
            <h1 className="title">Craft Your Vision</h1>
            <p className="subtitle">
              Describe your idea — our AI will paint it into a breathtaking high-fidelity image in seconds.
            </p>
          </div>
        </div>

        {/* Dual-pane layout */}
        <div className="create-layout">
          {/* ══════ LEFT: CONTROLS ══════ */}
          <div className="controls-panel">
            {/* Prompt */}
            <div className="card">
              <div className="card-header">
                <span className="card-label">✦ Your Prompt</span>
                <button onClick={handleSurprise} disabled={loadingPrompt} className="surprise-btn" style={{ opacity: loadingPrompt ? 0.7 : 1 }}>
                  {loadingPrompt ? "✨ Thinking..." : "🎲 Surprise Me"}
                </button>
              </div>
              <textarea
                rows={4}
                placeholder="e.g. A hyper-realistic astronaut discovering ancient alien ruins..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                className="prompt-input"
              />
              <div className="char-count">{prompt.length} characters</div>
            </div>

            {/* Style Presets */}
            <div className="card">
              <span className="card-label">🎨 Art Style</span>
              <div className="style-grid">
                {STYLES.map(s => {
                  const active = style?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setStyle(active ? null : s)}
                      className={`style-btn ${active ? "active" : ""}`}
                      style={{
                        borderColor: active ? s.color : "#1e293b",
                        background: active ? `${s.color}18` : "rgba(255,255,255,0.02)",
                        boxShadow: active ? `0 0 14px ${s.color}44` : "none",
                      }}
                    >
                      <span className="style-emoji">{s.emoji}</span>
                      <span className="style-label" style={{ color: active ? s.color : "#475569" }}>
                        {s.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ratio + CFG */}
            <div className="card">
              <span className="card-label">📐 Canvas Ratio</span>
              <div className="ratio-grid">
                {RATIOS.map(r => {
                  const active = ratio.id === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setRatio(r)}
                      className={`ratio-btn ${active ? "active" : ""}`}
                    >
                      <div className="ratio-icon" style={{
                        width: `${r.w}px`, height: `${r.h}px`,
                        borderColor: active ? "#6366f1" : "#334155"
                      }} />
                      <div className="ratio-text-group">
                        <div className="ratio-label" style={{ color: active ? "#818cf8" : "#475569" }}>{r.label}</div>
                        <div className="ratio-sub">{r.sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="cfg-header">
                <span className="cfg-label">Creativity Scale</span>
                <span className="cfg-value">{cfg}</span>
              </div>
              <input type="range" min={1} max={15} value={cfg}
                style={{ "--pct": `${((cfg - 1) / 14) * 100}%` }}
                onChange={e => setCfg(+e.target.value)}
                className="cfg-slider"
              />
              <div className="cfg-footer">
                <span>Imaginative</span>
                <span>Precise</span>
              </div>
            </div>

            {/* Author + Actions */}
            <div className="card">
              <span className="card-label">👤 Creator Name</span>
              <input
                type="text"
                placeholder="e.g. Aria Nova"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className="author-input"
              />

              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`btn-generate ${loading ? "loading" : ""}`}
              >
                {loading ? (
                  <>
                    <span className="loading-dots-container">
                      {[1, 2, 3].map(i => <span key={i} className={`dot dot-${i}`} />)}
                    </span>
                    <span className="loading-msg">{loadMsg}</span>
                  </>
                ) : "✦ Generate Masterpiece"}
              </button>

              {image && (
                <button
                  onClick={handlePost}
                  disabled={posting}
                  className={`btn-post ${posting ? "posting" : ""}`}
                >
                  {posting ? "⏳ Posting…" : "↑ Share to Community Feed"}
                </button>
              )}

              <p className="disclaimer">
                <span>ℹ</span> Generation may take 10–30 seconds.
              </p>
            </div>
          </div>

          {/* ══════ RIGHT: CANVAS ══════ */}
          <div className="canvas-panel">
            <div className="card canvas-card">
              {/* Canvas header bar */}
              <div className="canvas-header">
                <div className="mac-dots">
                  <span className="mac-dot red" />
                  <span className="mac-dot yellow" />
                  <span className="mac-dot green" />
                  <span className="canvas-title">canvas.output</span>
                </div>
                {image && (
                  <div className="canvas-actions">
                    <button onClick={handleCopy} className="action-btn">
                      {copied ? "✓ Copied" : "Copy Prompt"}
                    </button>
                    <button onClick={handleDownload} className="action-btn">
                      ↓ Download
                    </button>
                  </div>
                )}
              </div>

              {/* Canvas area */}
              <div className={`canvas-area ${loading ? "glow-border" : ""}`}>
                {image ? (
                  <img src={image} alt="Generated" className="generated-img" />
                ) : loading ? (
                  <div className="loading-state">
                    <div className="spinner-container">
                      <div className="spinner-ring ring-1 spin" />
                      <div className="spinner-ring ring-2 spin" />
                      <div className="spinner-center">✦</div>
                    </div>
                    <p className="loading-title">{loadMsg}</p>
                    <p className="loading-subtitle">AI is painting your vision…</p>
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">🖼️</div>
                    <p className="empty-title">Your canvas awaits</p>
                    <p className="empty-subtitle">Write a prompt, choose a style, and hit Generate to create your masterpiece.</p>
                  </div>
                )}
              </div>

              {/* Prompt readout */}
              {image && prompt && (
                <div className="prompt-readout">
                  <p className="readout-label">Prompt Used</p>
                  <p className="readout-text">"{finalPrompt()}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .create-container {
          min-height: 100vh; background: #030712;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding-top: 60px; /* matches navbar height */
        }
        
        /* Toast */
        .toast-notification {
          position: fixed; bottom: 20px; right: 20px; z-index: 9999;
          padding: 12px 16px; border-radius: 12px;
          font-size: 13px; font-weight: 600;
          display: flex; align-items: center; gap: 8px;
          backdrop-filter: blur(12px); animation: fadeUp 0.3s ease;
          max-width: calc(100vw - 40px); box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        }
        .toast-icon { font-size: 15px; }
        .toast-close { margin-left: auto; background: none; border: none; color: inherit; cursor: pointer; opacity: 0.7; font-size: 16px; }

        /* Header */
        .create-header {
          text-align: center; padding: 32px 16px 24px; position: relative;
        }
        .header-blob {
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 100%; max-width: 600px; height: 200px;
          background: radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .header-content { position: relative; z-index: 1; }
        .badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.28);
          border-radius: 99px; padding: 4px 12px;
          font-size: 10px; font-weight: 800; color: #818cf8;
          letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px;
        }
        .title {
          font-size: clamp(28px,6vw,52px); font-weight: 900;
          letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 12px;
          background: linear-gradient(135deg,#f8fafc 40%,#818cf8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .subtitle {
          color: #475569; font-size: 14px; max-width: 520px; margin: 0 auto; line-height: 1.5;
        }

        /* Layout */
        .create-layout {
          display: flex; flex-direction: column; gap: 20px;
          max-width: 1100px; margin: 0 auto; padding: 0 16px 40px;
        }
        .controls-panel { display: flex; flex-direction: column; gap: 14px; }
        .canvas-panel { position: relative; }
        
        /* Card Common */
        .card {
          background: #0f172a; border: 1px solid #1e293b;
          border-radius: 16px; padding: 16px;
        }
        .card-label { font-size: 12px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 8px; }
        
        /* Prompt */
        .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .card-header .card-label { margin-bottom: 0; }
        .surprise-btn {
          display: flex; align-items: center; gap: 4px;
          padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;
          background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.3);
          color: #c084fc; cursor: pointer; transition: all 0.2s;
        }
        .prompt-input {
          width: 100%; padding: 12px; border-radius: 12px;
          background: #030712; border: 1px solid #1e293b;
          color: #e2e8f0; font-size: 13px; line-height: 1.5;
          resize: none; outline: none; font-family: inherit; transition: border-color 0.2s;
        }
        .prompt-input:focus { border-color: #6366f1; }
        .char-count { text-align: right; margin-top: 4px; font-size: 10px; color: #334155; }
        
        /* Styles */
        .style-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .style-btn {
          display: flex; flex-direction: column; align-items: center;
          padding: 8px 4px; border-radius: 10px; border: 2px solid #1e293b;
          background: rgba(255,255,255,0.02); cursor: pointer; transition: all 0.2s;
        }
        .style-emoji { font-size: 18px; margin-bottom: 2px; }
        .style-label { font-size: 10px; font-weight: 700; color: #475569; }
        
        /* Ratio */
        .ratio-grid { display: flex; gap: 8px; margin-bottom: 16px; }
        .ratio-btn {
          flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 8px 4px; border-radius: 10px; border: 2px solid #1e293b;
          background: rgba(255,255,255,0.02); cursor: pointer; transition: all 0.2s;
        }
        .ratio-btn.active { border-color: #6366f1; background: rgba(99,102,241,0.1); }
        .ratio-icon { border: 2px solid #334155; border-radius: 3px; transition: border-color 0.2s; }
        .ratio-text-group { text-align: center; }
        .ratio-label { font-size: 11px; font-weight: 700; color: #475569; }
        .ratio-sub { font-size: 9px; color: #334155; }
        
        /* CFG Slider */
        .cfg-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .cfg-label { font-size: 12px; font-weight: 700; color: #94a3b8; }
        .cfg-value { font-size: 13px; font-weight: 800; color: #818cf8; }
        .cfg-slider { width: 100%; margin-bottom: 4px; }
        .cfg-footer { display: flex; justify-content: space-between; font-size: 9px; color: #334155; }
        
        /* Author & Actions */
        .author-input {
          width: 100%; padding: 10px 12px; border-radius: 10px;
          background: #030712; border: 1px solid #1e293b;
          color: #e2e8f0; font-size: 13px; outline: none; margin-bottom: 12px;
          font-family: inherit; transition: border-color 0.2s;
        }
        .author-input:focus { border-color: #6366f1; }
        
        .btn-generate {
          width: 100%; padding: 12px; border-radius: 12px;
          background: linear-gradient(135deg,#6366f1,#a855f7);
          border: none; color: #fff; cursor: pointer;
          font-size: 14px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 0 16px rgba(99,102,241,0.3); transition: all 0.2s; margin-bottom: 10px;
        }
        .btn-generate.loading { opacity: 0.75; }
        .loading-dots-container { display: inline-flex; gap: 3px; }
        .dot { width: 4px; height: 4px; border-radius: 50%; background: #fff; }
        .loading-msg { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; }
        
        .btn-post {
          width: 100%; padding: 10px; border-radius: 10px;
          background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.3);
          color: #34d399; cursor: pointer; font-size: 13px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;
        }
        .btn-post.posting { opacity: 0.7; cursor: not-allowed; }
        
        .disclaimer { margin-top: 10px; font-size: 10px; color: #334155; line-height: 1.4; display: flex; gap: 4px; }
        
        /* Canvas */
        .canvas-card { padding: 12px; display: flex; flex-direction: column; gap: 12px; }
        .canvas-header { display: flex; align-items: center; justify-content: space-between; }
        .mac-dots { display: flex; align-items: center; gap: 4px; }
        .mac-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
        .mac-dot.red { background: #ef4444; }
        .mac-dot.yellow { background: #f59e0b; }
        .mac-dot.green { background: #22c55e; }
        .canvas-title { margin-left: 6px; font-size: 11px; color: #334155; font-weight: 600; }
        
        .canvas-actions { display: flex; gap: 6px; }
        .action-btn {
          padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 700;
          background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.25);
          color: #818cf8; cursor: pointer;
        }
        
        .canvas-area {
          min-height: 300px; border-radius: 12px;
          background: #030712; border: 1px solid #1e293b;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; position: relative;
        }
        .generated-img {
          width: 100%; height: auto; display: block; max-height: 500px; object-fit: contain;
          animation: fadeUp 0.4s ease;
        }
        .loading-state { text-align: center; padding: 24px; }
        .spinner-container { position: relative; width: 60px; height: 60px; margin: 0 auto 16px; }
        .spinner-ring { position: absolute; border-radius: 50%; border: 2px solid transparent; }
        .ring-1 { inset: 2px; border-top-color: #6366f1; border-right-color: #a855f7; }
        .ring-2 { inset: 8px; border-bottom-color: #06b6d4; }
        .spinner-center {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 18px;
        }
        .loading-title {
          font-size: 13px; font-weight: 700; margin-bottom: 4px;
          background: linear-gradient(135deg,#818cf8,#a855f7,#06b6d4);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .loading-subtitle { font-size: 11px; color: #334155; }
        
        .empty-state { text-align: center; padding: 24px 16px; }
        .empty-icon {
          width: 50px; height: 50px; border-radius: 14px;
          background: rgba(99,102,241,0.08); border: 1px dashed rgba(99,102,241,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; margin: 0 auto 12px;
        }
        .empty-title { color: #475569; font-weight: 600; font-size: 13px; margin-bottom: 6px; }
        .empty-subtitle { color: #334155; font-size: 11px; line-height: 1.5; max-width: 200px; margin: 0 auto; }
        
        .prompt-readout {
          padding: 10px; background: rgba(99,102,241,0.06); border-radius: 10px; border: 1px solid rgba(99,102,241,0.12);
        }
        .readout-label { font-size: 9px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
        .readout-text { font-size: 11px; color: #64748b; line-height: 1.5; font-style: italic; }

        /* Media Queries */
        @media (min-width: 576px) {
          .create-layout { padding: 0 24px 40px; }
          .card { padding: 20px; border-radius: 20px; }
          .card-label { font-size: 13px; margin-bottom: 10px; }
          .prompt-input { font-size: 14px; }
          .style-emoji { font-size: 20px; margin-bottom: 4px; }
          .style-label { font-size: 11px; }
          .ratio-label { font-size: 12px; }
          .ratio-sub { font-size: 10px; }
          .btn-generate { padding: 14px; font-size: 15px; }
          .canvas-card { padding: 16px; }
          .canvas-area { min-height: 400px; border-radius: 16px; }
          .toast-notification { bottom: 28px; right: 28px; padding: 14px 20px; font-size: 14px; }
        }
        @media (min-width: 860px) {
          .create-container { padding-top: 66px; }
          .create-header { padding: 48px 32px 36px; }
          .header-blob { height: 300px; }
          .badge { font-size: 11px; padding: 5px 16px; margin-bottom: 18px; }
          .subtitle { font-size: 16px; }
          .create-layout {
            flex-direction: row; align-items: start;
            grid-template-columns: minmax(0, 420px) minmax(0, 1fr); display: grid;
            gap: 24px;
          }
          .canvas-panel { position: sticky; top: 90px; }
          .canvas-area { min-height: 480px; }
          .generated-img { max-height: 660px; }
        }
      `}</style>
    </>
  );
}
