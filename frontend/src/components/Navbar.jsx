import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          {/* Logo */}
          <NavLink to="/" className="logo">
            <div className="logo-icon">✦</div>
            <span className="logo-text">HeyAI Studio</span>
          </NavLink>

          {/* Links */}
          <div className="nav-links">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <span className="nav-icon">⊞</span>
              <span className="nav-text">Explore</span>
            </NavLink>
            <NavLink to="/create" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <span className="nav-icon">⚡</span>
              <span className="nav-text">Create</span>
            </NavLink>
          </div>

          {/* CTA */}
          <button className="nav-cta hidden-mobile" onClick={() => navigate("/create")}>
            ✦ Generate
          </button>
        </div>
      </nav>

      <style>{`
        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 999;
          height: 60px;
          display: flex;
          align-items: center;
          background: rgba(3,7,18,0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(99,102,241,0.08);
          transition: all 0.3s ease;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .navbar.scrolled {
          background: rgba(3,7,18,0.95);
          border-bottom: 1px solid rgba(99,102,241,0.25);
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .nav-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }
        .logo-icon {
          width: 32px; height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg,#6366f1,#a855f7);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 14px rgba(99,102,241,0.4);
          font-size: 16px; color: #fff;
        }
        .logo-text {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg,#e2e8f0,#a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 10px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          color: #94a3b8;
          transition: all 0.2s;
        }
        .nav-link.active {
          background: rgba(99,102,241,0.15);
          color: #a5b4fc;
        }
        .nav-cta {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 10px;
          background: linear-gradient(135deg,#6366f1,#a855f7);
          border: none; color: #fff; cursor: pointer;
          font-size: 13px; font-weight: 700;
          box-shadow: 0 0 14px rgba(99,102,241,0.3);
          transition: all 0.2s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .nav-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 20px rgba(99,102,241,0.5);
        }
        
        @media (min-width: 768px) {
          .navbar { height: 66px; }
          .nav-container { padding: 0 32px; }
          .logo-text { font-size: 19px; }
          .logo-icon { width: 36px; height: 36px; font-size: 18px; }
          .nav-link { padding: 8px 16px; }
          .nav-cta { padding: 9px 20px; font-size: 14px; }
          .nav-links { margin-right: 16px; margin-left: auto; }
        }
        
        @media (max-width: 480px) {
          .logo-text { display: none; }
          .nav-text { display: none; }
          .nav-link { padding: 8px; }
          .nav-icon { font-size: 18px; }
        }
      `}</style>
    </>
  );
}
