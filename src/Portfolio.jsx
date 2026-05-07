import { useState, useEffect, useRef, useCallback } from "react";

// ── Utility: clamp
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ── Star canvas (dark mode)
function StarCanvas() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const starsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Init stars
    const N = 180;
    starsRef.current = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.4 + 0.08,
      opacity: Math.random() * 0.8 + 0.2,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
    }));

    // Shooting stars
    const shooters = [];
    const addShooter = () => {
      shooters.push({
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height * 0.5),
        len: Math.random() * 120 + 60,
        speed: Math.random() * 6 + 4,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.4,
        life: 1,
        decay: Math.random() * 0.015 + 0.01,
      });
    };
    const shootInterval = setInterval(addShooter, 3000);

    const draw = () => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Stars
      starsRef.current.forEach((s) => {
        s.y += s.speed;
        s.twinkle += s.twinkleSpeed;
        if (s.y > h) { s.y = 0; s.x = Math.random() * w; }
        const alpha = s.opacity * (0.6 + 0.4 * Math.sin(s.twinkle));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 210, 255, ${alpha})`;
        ctx.fill();
      });

      // Shooting stars
      for (let i = shooters.length - 1; i >= 0; i--) {
        const sh = shooters[i];
        sh.x += Math.cos(sh.angle) * sh.speed;
        sh.y += Math.sin(sh.angle) * sh.speed;
        sh.life -= sh.decay;
        if (sh.life <= 0) { shooters.splice(i, 1); continue; }
        const grad = ctx.createLinearGradient(
          sh.x, sh.y,
          sh.x - Math.cos(sh.angle) * sh.len,
          sh.y - Math.sin(sh.angle) * sh.len
        );
        grad.addColorStop(0, `rgba(200, 200, 255, ${sh.life * 0.9})`);
        grad.addColorStop(1, "rgba(200, 200, 255, 0)");
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(sh.x - Math.cos(sh.angle) * sh.len, sh.y - Math.sin(sh.angle) * sh.len);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      clearInterval(shootInterval);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}
    />
  );
}

// ── Leaf canvas (light mode)
function LeafCanvas() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const LEAF_COLORS = ["#A0C878", "#B8D98E", "#88B464", "#C8E6A0", "#7BA05B", "#D4EDAA", "#6B9E4D"];
    const N = 40;

    const makeLeaf = () => ({
      x: Math.random() * (canvas.width + 200) - 100,
      y: -60,
      size: Math.random() * 18 + 10,
      speedX: (Math.random() - 0.5) * 1.2,
      speedY: Math.random() * 1.5 + 0.6,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
      opacity: Math.random() * 0.5 + 0.35,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.005,
    });

    let leaves = Array.from({ length: N }, makeLeaf).map(l => ({
      ...l,
      y: Math.random() * canvas.height,
    }));

    // Dandelion seeds
    const seeds = Array.from({ length: 25 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: -(Math.random() * 0.8 + 0.2),
      r: Math.random() * 3 + 2,
      stemLen: Math.random() * 10 + 8,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    const drawLeaf = (ctx, x, y, size, rot, color, opacity) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-size * 0.5, -size * 0.3, -size * 0.4, -size, 0, -size);
      ctx.bezierCurveTo(size * 0.4, -size, size * 0.5, -size * 0.3, 0, 0);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -size);
      ctx.strokeStyle = "rgba(80,120,50,0.3)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();
    };

    const drawSeed = (ctx, x, y, r, stemLen, opacity) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(180,180,180,0.6)";
      ctx.fill();
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * stemLen, y + Math.sin(angle) * stemLen);
      ctx.strokeStyle = "rgba(150,150,150,0.5)";
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.restore();
    };

    const tick = () => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      leaves.forEach(l => {
        l.wobble += l.wobbleSpeed;
        l.x += l.speedX + Math.sin(l.wobble) * 0.6;
        l.y += l.speedY;
        l.rot += l.rotSpeed;
        drawLeaf(ctx, l.x, l.y, l.size, l.rot, l.color, l.opacity);
        if (l.y > h + 60) Object.assign(l, makeLeaf());
      });

      seeds.forEach(s => {
        s.x += s.speedX;
        s.y += s.speedY;
        if (s.y < -20 || s.x < -20 || s.x > w + 20) {
          s.x = Math.random() * w;
          s.y = h + 20;
          s.speedY = -(Math.random() * 0.8 + 0.2);
        }
        drawSeed(ctx, s.x, s.y, s.r, s.stemLen, s.opacity);
      });

      animRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(animRef.current); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}
    />
  );
}

// ── Bento Card with hover glow
function Card({ children, className = "", style = {}, dark }) {
  const [hovered, setHovered] = useState(false);
  const bg = dark ? "rgba(35,37,52,0.65)" : "rgba(255,255,255,0.62)";
  const border = hovered
    ? dark ? "1.5px solid rgba(164,149,255,0.7)" : "1.5px solid rgba(164,149,255,0.6)"
    : dark ? "1px solid rgba(164,149,255,0.18)" : "1px solid rgba(164,149,255,0.22)";
  const boxShadow = hovered
    ? dark ? "0 0 28px rgba(164,149,255,0.22), 0 8px 32px rgba(0,0,0,0.4)" : "0 0 28px rgba(164,149,255,0.18), 0 8px 32px rgba(0,0,0,0.08)"
    : dark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)";

  return (
    <div
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: bg,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderRadius: 20,
        border,
        boxShadow,
        transform: hovered ? "scale(1.025)" : "scale(1)",
        transition: "all 0.28s cubic-bezier(0.34,1.56,0.64,1)",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Contact form
function ContactForm({ dark }) {
  const [form, setForm] = useState({ name: "", email: "", msg: "" });
  const [sent, setSent] = useState(false);
  const accent = "#A495FF";
  const textCol = dark ? "#e8e6ff" : "#1a1730";
  const subCol = dark ? "#b0a8d8" : "#6b64a0";
  const inputBg = dark ? "rgba(30,28,50,0.7)" : "rgba(245,243,255,0.8)";

  const handle = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3500);
    setForm({ name: "", email: "", msg: "" });
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 10,
    border: `1px solid rgba(164,149,255,0.3)`, background: inputBg,
    color: textCol, fontSize: 14, outline: "none",
    fontFamily: "inherit", marginBottom: 10,
    transition: "border 0.2s",
  };

  return (
    <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <input
        style={inputStyle} placeholder="Your name" value={form.name}
        onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
      />
      <input
        style={inputStyle} type="email" placeholder="Your email" value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
      />
      <textarea
        style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
        placeholder="Your message…" value={form.msg}
        onChange={e => setForm(f => ({ ...f, msg: e.target.value }))} required
      />
      <button type="submit" style={{
        background: accent, color: "#fff", border: "none", borderRadius: 10,
        padding: "10px 24px", fontWeight: 600, fontSize: 15, cursor: "pointer",
        letterSpacing: 0.5, transition: "opacity 0.2s",
      }}>
        {sent ? "✓ Sent!" : "Send Message"}
      </button>
    </form>
  );
}

// ── Main Portfolio
export default function Portfolio() {
  const [dark, setDark] = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  const toggleTheme = () => {
    setTransitioning(true);
    setTimeout(() => { setDark(d => !d); setTransitioning(false); }, 320);
  };

  const accent = "#A495FF";
  const bg = dark ? "#12131C" : "#F0F2F8";
  const textCol = dark ? "#E8E6FF" : "#1a1730";
  const subCol = dark ? "#A09AC8" : "#6b64a0";
  const cardText = dark ? "#e0dcff" : "#1a1730";

  const styles = {
    page: {
      minHeight: "100vh",
      background: bg,
      transition: "background 0.5s ease",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      position: "relative",
      zIndex: 1,
    },
    wrap: { maxWidth: 1100, margin: "0 auto", padding: "0 18px 60px" },
    label: { fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: accent, marginBottom: 6 },
    h2: { fontSize: 20, fontWeight: 700, color: cardText, margin: "0 0 8px" },
    body: { fontSize: 14.5, lineHeight: 1.7, color: subCol },
    pill: {
      display: "inline-block", padding: "4px 13px", borderRadius: 999,
      background: dark ? "rgba(164,149,255,0.18)" : "rgba(164,149,255,0.14)",
      color: accent, fontSize: 13, fontWeight: 600, margin: "3px 4px 3px 0",
      border: `1px solid rgba(164,149,255,0.3)`,
    },
    certBadge: {
      display: "flex", alignItems: "center", gap: 10,
      padding: "9px 12px", borderRadius: 10, marginBottom: 8,
      background: dark ? "rgba(164,149,255,0.1)" : "rgba(164,149,255,0.08)",
      border: `1px solid rgba(164,149,255,0.18)`,
    },
  };

  const overlayStyle = {
    position: "fixed", inset: 0, background: dark ? "#12131C" : "#F0F2F8",
    opacity: transitioning ? 1 : 0, zIndex: 200,
    transition: "opacity 0.32s", pointerEvents: "none",
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Syne:wght@600;800&display=swap" rel="stylesheet" />
      <div style={overlayStyle} />
      {dark ? <StarCanvas /> : <LeafCanvas />}

      <div style={styles.page}>
        {/* ── HEADER ── */}
        <header style={{
          position: "sticky", top: 0, zIndex: 100,
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          background: dark ? "rgba(18,19,28,0.82)" : "rgba(240,242,248,0.82)",
          borderBottom: `1px solid rgba(164,149,255,${dark ? 0.15 : 0.2})`,
          padding: "14px 0",
        }}>
          <div style={{ ...styles.wrap, display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 0, paddingBottom: 0 }}>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: textCol, letterSpacing: -0.5 }}>
                Sriram <span style={{ color: accent }}>Ponnaganti</span>
              </div>
              <div style={{ fontSize: 12.5, color: subCol, fontWeight: 500, letterSpacing: 0.5 }}>CSE-AI/ML · Developer · Builder</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <a
                href="#"
                style={{
                  background: accent, color: "#fff", textDecoration: "none",
                  borderRadius: 10, padding: "8px 18px", fontSize: 13.5, fontWeight: 700,
                  boxShadow: "0 4px 18px rgba(164,149,255,0.35)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => e.target.style.opacity = "0.85"}
                onMouseLeave={e => e.target.style.opacity = "1"}
              >
                ↓ Download CV
              </a>
              <button
                onClick={toggleTheme}
                style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: dark ? "rgba(164,149,255,0.15)" : "rgba(164,149,255,0.12)",
                  border: `1px solid rgba(164,149,255,0.3)`,
                  cursor: "pointer", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >
                {dark ? "☀️" : "🌙"}
              </button>
            </div>
          </div>
        </header>

        <div style={styles.wrap}>
          {/* ── HERO ── */}
          <div style={{ textAlign: "center", padding: "68px 0 48px" }}>
            <div style={{
              display: "inline-block", padding: "4px 16px", borderRadius: 999,
              background: dark ? "rgba(164,149,255,0.15)" : "rgba(164,149,255,0.12)",
              border: `1px solid rgba(164,149,255,0.35)`,
              fontSize: 13, color: accent, fontWeight: 700, letterSpacing: 1.5, marginBottom: 20,
            }}>
              AVAILABLE FOR OPPORTUNITIES
            </div>
            <h1 style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: "clamp(40px, 7vw, 72px)", color: textCol, margin: "0 0 12px",
              lineHeight: 1.08, letterSpacing: -2,
            }}>
              Hi, I'm <span style={{ color: accent }}>Sriram</span> 👋
            </h1>
            <p style={{ fontSize: "clamp(16px,2vw,20px)", color: subCol, maxWidth: 560, margin: "0 auto 28px", lineHeight: 1.6, fontWeight: 400 }}>
              CSE-AI/ML student crafting intelligent systems & clean interfaces. Passionate about ML, NLP, and turning data into decisions.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="https://github.com/sriram-ponnaganti" target="_blank" rel="noopener" style={{
                padding: "10px 22px", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 14,
                background: dark ? "rgba(164,149,255,0.15)" : "rgba(164,149,255,0.12)",
                color: accent, border: `1px solid rgba(164,149,255,0.35)`,
                transition: "all 0.2s",
              }}>
                GitHub ↗
              </a>
              <a href="https://linkedin.com/in/Sriram-Ponnaganti" target="_blank" rel="noopener" style={{
                padding: "10px 22px", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 14,
                background: accent, color: "#fff",
                boxShadow: "0 4px 14px rgba(164,149,255,0.35)",
                transition: "all 0.2s",
              }}>
                LinkedIn ↗
              </a>
            </div>
          </div>

          {/* ── BENTO GRID ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 16, alignItems: "start" }}>

            {/* About Me — spans 7 cols */}
            <Card dark={dark} style={{ gridColumn: "span 7", padding: 28 }}>
              <div style={styles.label}>About Me</div>
              <h2 style={styles.h2}>Who I Am</h2>
              <p style={styles.body}>
                I'm a highly motivated CSE-AI/ML student passionate about contributing to innovative projects and learning from industry leaders. When I'm not coding or training AI models, you can usually find me playing football or cricket, or experimenting with ultra-realistic cinematic AI image generation.
              </p>
              <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {["⚽ Football", "🏏 Cricket", "🎨 AI Art", "🤖 ML Enthusiast"].map(t => (
                  <span key={t} style={styles.pill}>{t}</span>
                ))}
              </div>
            </Card>

            {/* Experience — spans 5 cols */}
            <Card dark={dark} style={{ gridColumn: "span 5", padding: 28 }}>
              <div style={styles.label}>Experience</div>
              <h2 style={styles.h2}>AI/ML Intern</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: accent, fontWeight: 700 }}>APSSDC</span>
                <span style={{ color: subCol, fontSize: 13 }}>· May–Jun 2024</span>
              </div>
              <ul style={{ margin: 0, padding: "0 0 0 16px", listStyle: "disc" }}>
                <li style={{ ...styles.body, marginBottom: 6 }}>Built an NLP sentiment analysis model to classify restaurant reviews as positive, negative, or neutral.</li>
                <li style={styles.body}>Deployed visualization pipeline to analyze customer sentiment trends for actionable insights.</li>
              </ul>
            </Card>

            {/* Project 1 — spans 6 */}
            <Card dark={dark} style={{ gridColumn: "span 6", padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={styles.label}>Project</div>
                <span style={{ fontSize: 22 }}>📈</span>
              </div>
              <h2 style={{ ...styles.h2, marginBottom: 6 }}>AI Stock Analyst Agent</h2>
              <p style={styles.body}>
                Developed a machine learning–based system using historical stock data to predict market trends. Delivers real-time predictions and interactive visualizations via a Streamlit web app.
              </p>
              <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["VSCode", "Streamlit", "ML"].map(t => <span key={t} style={styles.pill}>{t}</span>)}
              </div>
              <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14, fontSize: 13.5, fontWeight: 700, color: accent, textDecoration: "none" }}>
                View on GitHub ↗
              </a>
            </Card>

            {/* Project 2 — spans 6 */}
            <Card dark={dark} style={{ gridColumn: "span 6", padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={styles.label}>Project</div>
                <span style={{ fontSize: 22 }}>🤖</span>
              </div>
              <h2 style={{ ...styles.h2, marginBottom: 6 }}>TechAssist AI</h2>
              <p style={styles.body}>
                An AI-driven support bot using NLP to understand user intent, provide instant technical solutions, and automatically detect customer frustration to trigger human-agent handoffs.
              </p>
              <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["Python", "Sentence-Transformers", "Streamlit", "Pandas"].map(t => <span key={t} style={styles.pill}>{t}</span>)}
              </div>
              <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14, fontSize: 13.5, fontWeight: 700, color: accent, textDecoration: "none" }}>
                View on GitHub ↗
              </a>
            </Card>

            {/* Skills — spans 7 */}
            <Card dark={dark} style={{ gridColumn: "span 7", padding: 28 }}>
              <div style={styles.label}>Skills</div>
              <h2 style={{ ...styles.h2, marginBottom: 16 }}>Tech Stack</h2>
              <div>
                <div style={{ fontSize: 12, color: subCol, fontWeight: 700, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>Languages</div>
                <div style={{ marginBottom: 14 }}>
                  {["Python", "Java", "C", "R", "SQL", "JavaScript"].map(s => <span key={s} style={styles.pill}>{s}</span>)}
                </div>
                <div style={{ fontSize: 12, color: subCol, fontWeight: 700, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>Libraries & Frameworks</div>
                <div style={{ marginBottom: 14 }}>
                  {["NumPy", "Pandas", "Scikit-learn", "Matplotlib"].map(s => <span key={s} style={styles.pill}>{s}</span>)}
                </div>
                <div style={{ fontSize: 12, color: subCol, fontWeight: 700, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>Tools & Databases</div>
                <div>
                  {["Git/GitHub", "VS Code", "Google Colab", "MySQL", "Anaconda"].map(s => <span key={s} style={styles.pill}>{s}</span>)}
                </div>
              </div>
            </Card>

            {/* Certifications — spans 5 */}
            <Card dark={dark} style={{ gridColumn: "span 5", padding: 28 }}>
              <div style={styles.label}>Certifications</div>
              <h2 style={{ ...styles.h2, marginBottom: 16 }}>Credentials</h2>
              {[
                { name: "Cloud Computing", org: "IIT Kharagpur", icon: "☁️" },
                { name: "Deep Learning", org: "IIT Ropar", icon: "🧠" },
                { name: "Generative AI", org: "IBM", icon: "✨" },
                { name: "Data Analytics", org: "Deloitte", icon: "📊" },
              ].map(c => (
                <div key={c.name} style={styles.certBadge}>
                  <span style={{ fontSize: 20 }}>{c.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: cardText, margin: 0 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: accent, fontWeight: 600 }}>{c.org}</div>
                  </div>
                </div>
              ))}
            </Card>

            {/* Education — spans 12 */}
            <Card dark={dark} style={{ gridColumn: "span 12", padding: 28 }}>
              <div style={styles.label}>Education</div>
              <h2 style={{ ...styles.h2, marginBottom: 20 }}>Academic Background</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                {[
                  { degree: "B.Tech — CSE AI & ML", inst: "Aditya College of Engineering & Technology, Surampalem", year: "2022–2026", score: "GPA: 7.27", icon: "🎓" },
                  { degree: "Intermediate", inst: "Sri Chaitanya Junior College, Kakinada", year: "2020–2022", score: "63.5%", icon: "📚" },
                  { degree: "SSC", inst: "Z.P.P. High School, Kajuluru", year: "—", score: "98%", icon: "🏫" },
                ].map(e => (
                  <div key={e.degree} style={{
                    padding: "16px 18px", borderRadius: 12,
                    background: dark ? "rgba(164,149,255,0.07)" : "rgba(164,149,255,0.07)",
                    border: `1px solid rgba(164,149,255,0.2)`,
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{e.icon}</div>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: cardText, marginBottom: 2 }}>{e.degree}</div>
                    <div style={{ fontSize: 12.5, color: subCol, marginBottom: 6 }}>{e.inst}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: subCol }}>{e.year}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>{e.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Contact form — spans 6 */}
            <Card dark={dark} style={{ gridColumn: "span 6", padding: 28 }}>
              <div style={styles.label}>Contact</div>
              <h2 style={{ ...styles.h2, marginBottom: 16 }}>Get in Touch</h2>
              <ContactForm dark={dark} />
            </Card>

            {/* Direct contact info — spans 6 */}
            <Card dark={dark} style={{ gridColumn: "span 6", padding: 28 }}>
              <div style={styles.label}>Reach Out</div>
              <h2 style={{ ...styles.h2, marginBottom: 18 }}>Direct Contact</h2>
              {[
                { icon: "✉️", label: "Email", val: "bunny135159@gmail.com", href: "mailto:bunny135159@gmail.com" },
                { icon: "📱", label: "Phone", val: "+91 82477 22876", href: "tel:+918247722876" },
                { icon: "🐙", label: "GitHub", val: "sriram-ponnaganti", href: "https://github.com/sriram-ponnaganti" },
                { icon: "💼", label: "LinkedIn", val: "Sriram-Ponnaganti", href: "https://linkedin.com/in/Sriram-Ponnaganti" },
              ].map(r => (
                <a key={r.label} href={r.href} target="_blank" rel="noopener" style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
                  borderRadius: 10, marginBottom: 8, textDecoration: "none",
                  background: dark ? "rgba(164,149,255,0.08)" : "rgba(164,149,255,0.07)",
                  border: `1px solid rgba(164,149,255,0.18)`,
                  transition: "all 0.2s",
                }}>
                  <span style={{ fontSize: 20 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontSize: 11.5, color: subCol, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>{r.label}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: accent }}>{r.val}</div>
                  </div>
                </a>
              ))}
            </Card>

          </div>

          {/* ── FOOTER ── */}
          <div style={{
            marginTop: 40, borderRadius: 20, background: "#A495FF",
            padding: "32px 36px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16,
          }}>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: "#fff", marginBottom: 4 }}>
                Sriram Ponnaganti
              </div>
              <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
                CSE-AI/ML Student · Open to Opportunities
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { label: "GitHub", href: "https://github.com/sriram-ponnaganti" },
                { label: "LinkedIn", href: "https://linkedin.com/in/Sriram-Ponnaganti" },
                { label: "Email", href: "mailto:bunny135159@gmail.com" },
              ].map(l => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener" style={{
                  padding: "8px 18px", borderRadius: 10, background: "rgba(255,255,255,0.2)",
                  color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 13.5,
                  border: "1px solid rgba(255,255,255,0.35)", transition: "all 0.2s",
                }}>
                  {l.label} ↗
                </a>
              ))}
            </div>
          </div>
          <div style={{ textAlign: "center", padding: "18px 0 0", fontSize: 12.5, color: subCol }}>
            © 2025 Sriram Ponnaganti · Built with React & 💜
          </div>
        </div>
      </div>

     <style>{`
        * { box-sizing: border-box; }
        
        /* THIS IS THE FIX FOR THE WHITE BORDER */
        html, body { 
          margin: 0; 
          padding: 0; 
          width: 100%; 
          overflow-x: hidden; 
        }

        html { scroll-behavior: smooth; }
        @media (max-width: 700px) {
          [style*="gridColumn: span 7"], [style*="gridColumn: span 5"],
          [style*="gridColumn: span 6"], [style*="gridColumn: span 12"] {
            grid-column: span 12 !important;
          }
        }
      `}</style>
    </>
  );
}
