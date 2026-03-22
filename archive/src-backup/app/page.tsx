"use client";

import { motion } from "framer-motion";
import {
  Sparkles, ArrowRight, ChevronRight, Zap, Brain,
  Layers, BarChart3, MessageSquare, Shield,
} from "lucide-react";
import { P } from "@/lib/palette";

const POPULAR_AGENTS = [
  { name: "Roast Master", desc: "Get hilariously roasted", icon: "\u{1F525}", grad: "linear-gradient(135deg, #FF3399, #FF6B35)" },
  { name: "Dream Interpreter", desc: "Decode your dreams", icon: "\u{1F319}", grad: "linear-gradient(135deg, #8B3DFF, #FF3399)" },
  { name: "Villain Origin", desc: "Your supervillain backstory", icon: "\u{1F9B9}", grad: "linear-gradient(135deg, #667eea, #764ba2)" },
  { name: "Rap Battle", desc: "AI drops bars", icon: "\u{1F3A4}", grad: "linear-gradient(135deg, #00C4CC, #667eea)" },
  { name: "Fortune Teller", desc: "Mystical predictions", icon: "\u{1F52E}", grad: "linear-gradient(135deg, #764ba2, #FF3399)" },
  { name: "Dating Profile", desc: "Swipe-right worthy bios", icon: "\u{1F498}", grad: "linear-gradient(135deg, #FF3399, #f093fb)" },
  { name: "Deep Research", desc: "Multi-source analysis", icon: "\u{1F52D}", grad: "linear-gradient(135deg, #4facfe, #00f2fe)" },
  { name: "Content Creator", desc: "Blog, email, social", icon: "\u{2712}\u{FE0F}", grad: "linear-gradient(135deg, #8B3DFF, #4facfe)" },
  { name: "Data Analyst", desc: "Numbers to insights", icon: "\u{1F4CA}", grad: "linear-gradient(135deg, #00C4CC, #10B981)" },
  { name: "System Architect", desc: "Design scalable systems", icon: "\u{1F3D7}\u{FE0F}", grad: "linear-gradient(135deg, #FF6B35, #fa709a)" },
  { name: "Startup Ideas", desc: "Million-dollar concepts", icon: "\u{1F4A1}", grad: "linear-gradient(135deg, #fee140, #FF6B35)" },
  { name: "Song Lyrics", desc: "Write songs in any genre", icon: "\u{1F3B5}", grad: "linear-gradient(135deg, #f093fb, #8B3DFF)" },
];

const FEATURES = [
  { icon: Brain, title: "Every agent you need", desc: "Research, writing, coding, finance, health, fun \u2014 all under one roof. No more switching between tools.", accent: P.lime },
  { icon: Layers, title: "Multi-Agent Pipelines", desc: "Chain agents together. Research \u2192 Write \u2192 Edit. Drag to reorder the sequence.", accent: P.violet },
  { icon: MessageSquare, title: "Human Feedback Loop", desc: "Don't like the output? Give feedback and the agent revises \u2014 getting better each time.", accent: P.amber },
  { icon: BarChart3, title: "Track every dollar & token", desc: "Unlike other AI tools that hide usage, AgentStudio shows exactly what each task costs \u2014 per agent, per token. Full transparency, one dashboard.", accent: P.lime },
  { icon: Zap, title: "Replace 10 tools in 10 seconds", desc: "No signup needed to explore. Try any agent free \u2014 replace your entire AI toolkit.", accent: P.violet },
  { icon: Shield, title: "Your Keys, Your Data", desc: "Bring your own API keys. Encrypted with AES-256. We never see or store your keys in plain text.", accent: P.teal },
];

const STEPS = [
  { num: "1", title: "Pick an Agent", desc: "Browse specialized AI agents. Click one to see what it does \u2014 from research to rap battles.", grad: "linear-gradient(135deg, #1e8e3e, #423ff7)" },
  { num: "2", title: "Describe Your Task", desc: "Type what you need in plain English. The agent understands context, tone, and nuance.", grad: "linear-gradient(135deg, #15e11e, #1e8e3e)" },
  { num: "3", title: "Review & Iterate", desc: "Get polished output in seconds. Not perfect? Add feedback and the agent revises.", grad: "linear-gradient(135deg, #423ff7, #1e8e3e)" },
];

const STATS = [
  { num: "50+", label: "AI Agents" },
  { num: "20+", label: "Fun Agents" },
  { num: "30+", label: "Pro Agents" },
  { num: "$0", label: "To Start" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: P.bg, color: P.text }}>
      <style>{`
        @media (max-width: 768px) {
          .landing-nav-links { display: none !important; }
          .landing-mobile-cta { display: inline-flex !important; }
          .landing-hero { padding-top: 100px !important; padding-bottom: 40px !important; }
          .landing-hero h1 { font-size: 32px !important; }
          .landing-hero p { font-size: 15px !important; max-width: 100% !important; }
          .landing-hero-img { margin-top: 32px !important; }
          .landing-hero-blobs { display: none !important; }
          .landing-stats { grid-template-columns: repeat(2, 1fr) !important; border-radius: 14px !important; }
          .landing-features-grid { grid-template-columns: 1fr !important; }
          .landing-steps-wrapper { padding: 40px 16px !important; }
          .landing-step-card { padding: 18px 16px !important; gap: 14px !important; }
          .landing-cta-box { padding: 36px 20px !important; }
          .landing-cta-box h2 { font-size: 24px !important; }
          .landing-problem-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
          .landing-problem-arrow { display: none !important; }
          .landing-problem-section { padding: 40px 16px 0 !important; }
          .landing-agents-section { padding: 60px 0 40px !important; }
          .landing-agents-grid { gap: 10px !important; padding: 0 12px !important; }
          .landing-agents-grid > * { min-width: 160px !important; padding: 14px 16px !important; border-radius: 14px !important; }
          .landing-features-section { padding: 40px 16px !important; }
          .landing-footer { flex-direction: column !important; gap: 12px !important; text-align: center; }
          .landing-callout { margin: 24px 16px !important; padding: 16px 18px !important; }
        }
      `}</style>

      {/* --- NAV (Frosted Glass) --- */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto", padding: "0 24px",
          height: 68, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/logo.png" alt="AgentStudio" style={{
              width: 34, height: 34, borderRadius: 10, objectFit: "cover",
            }} />
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em", color: P.text }}>AgentStudio</span>
          </div>
          <a className="landing-mobile-cta" href="/today" style={{
            display: "none", alignItems: "center",
            padding: "10px 20px", borderRadius: 12,
            background: "linear-gradient(135deg, #1e8e3e, #15e11e)",
            color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none",
          }}>Get Started</a>
          <div className="landing-nav-links" style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <a href="#features" style={{ fontSize: 14, color: P.textSec, textDecoration: "none", transition: "color 0.2s" }}>Features</a>
            <a href="#agents" style={{ fontSize: 14, color: P.textSec, textDecoration: "none", transition: "color 0.2s" }}>Agents</a>
            <a href="#how-it-works" style={{ fontSize: 14, color: P.textSec, textDecoration: "none", transition: "color 0.2s" }}>How It Works</a>
            <a
              href="/today"
              style={{
                padding: "10px 24px", borderRadius: 12,
                background: "linear-gradient(135deg, #1e8e3e, #15e11e)",
                color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none",
                boxShadow: "0 4px 20px rgba(30,142,62,0.3)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              Get Started Free
            </a>
          </div>
        </div>
      </nav>

      {/* --- DARK HERO --- */}
      <section className="landing-hero" style={{
        position: "relative", paddingTop: 160, paddingBottom: 100,
        background: "linear-gradient(180deg, #f9f9f9 0%, #f3f3f3 40%, #eef7f0 70%, #f9f9f9 100%)",
        overflow: "hidden",
      }}>
        {/* Animated gradient orbs */}
        <div className="landing-hero-blobs" style={{
          position: "absolute", top: 60, left: "5%", width: 500, height: 500,
          background: "radial-gradient(circle, rgba(30,142,62,0.12) 0%, transparent 70%)",
          borderRadius: "50%", zIndex: 0, filter: "blur(60px)",
        }} />
        <div className="landing-hero-blobs" style={{
          position: "absolute", top: 120, right: "5%", width: 400, height: 400,
          background: "radial-gradient(circle, rgba(21,225,30,0.08) 0%, transparent 70%)",
          borderRadius: "50%", zIndex: 0, filter: "blur(60px)",
        }} />
        <div className="landing-hero-blobs" style={{
          position: "absolute", top: 300, left: "40%", width: 350, height: 350,
          background: "radial-gradient(circle, rgba(66,63,247,0.06) 0%, transparent 70%)",
          borderRadius: "50%", zIndex: 0, filter: "blur(50px)",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          {/* Badge */}
          <motion.div initial={fadeUp.hidden} animate={fadeUp.show}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "8px 20px", borderRadius: 50,
              backgroundColor: "rgba(30,142,62,0.10)", border: "1px solid rgba(30,142,62,0.25)",
              fontSize: 13, fontWeight: 700, color: "#1e8e3e",
            }}>
              <Sparkles size={14} /> Think Canva, but for AI Agents
            </span>
          </motion.div>

          {/* Headline with gradient text */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
            style={{
              fontSize: "clamp(42px, 6.5vw, 78px)", fontWeight: 900,
              letterSpacing: "-0.04em", lineHeight: 1.06,
              margin: "32px 0 24px", color: P.text,
            }}
          >
            All your AI agents.
            <br />
            <span style={{
              background: `linear-gradient(135deg, #1e8e3e, #423ff7)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              One workspace.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            style={{ fontSize: 20, color: P.textSec, maxWidth: 580, margin: "0 auto 40px", lineHeight: 1.65 }}
          >
            Stop juggling ChatGPT, Jasper, Copy.ai, and 10 other tools. AgentStudio brings every specialized agent into one clean workspace — research, write, code, analyze, and create without switching tabs.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}
          >
            <a
              href="/today"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "16px 36px", borderRadius: 16, height: 54,
                background: "linear-gradient(135deg, #1e8e3e, #15e11e)",
                color: "#fff", fontSize: 17, fontWeight: 700, textDecoration: "none",
                boxShadow: "0 8px 32px rgba(30,142,62,0.3)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              Start Creating <ArrowRight size={18} />
            </a>
            <a
              href="#agents"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "16px 36px", borderRadius: 16, height: 54,
                backgroundColor: "rgba(0,0,0,0.04)", color: P.text,
                fontSize: 17, fontWeight: 600, textDecoration: "none",
                border: "1.5px solid rgba(0,0,0,0.10)",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              Explore Agents
            </a>
          </motion.div>

          {/* Hero image */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
            className="landing-hero-img"
            style={{ marginTop: 72, position: "relative" }}
          >
            <div style={{
              position: "absolute", inset: -30,
              background: `linear-gradient(135deg, rgba(30,142,62,0.08), rgba(21,225,30,0.05), rgba(66,63,247,0.04))`,
              borderRadius: 36, filter: "blur(40px)",
            }} />
            <div style={{
              position: "relative", borderRadius: 24, overflow: "hidden",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: P.shadowFloat,
            }}>
              <img src="/hero-dashboard.png" alt="AgentStudio workspace" style={{ width: "100%", display: "block" }} />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(249,249,249,0.5) 0%, transparent 40%)",
              }} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- STATS BAR (Gradient Numbers) --- */}
      <section style={{ padding: "0 24px", marginTop: -50, position: "relative", zIndex: 2 }}>
        <motion.div
          className="landing-stats"
          initial="hidden" whileInView="show" viewport={{ once: true }}
          variants={fadeUp}
          style={{
            maxWidth: 860, margin: "0 auto",
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0,
            backgroundColor: P.card, borderRadius: 24, overflow: "hidden",
            border: `1px solid ${P.border}`,
            boxShadow: P.shadowFloat,
          }}
        >
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              padding: "30px 0", textAlign: "center",
              borderRight: i < 3 ? `1px solid ${P.border}` : "none",
            }}>
              <div style={{
                fontSize: 34, fontWeight: 900, letterSpacing: "-0.03em",
                background: `linear-gradient(135deg, #1e8e3e, #423ff7)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>{s.num}</div>
              <div style={{ fontSize: 13, color: P.textSec, fontWeight: 600, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* --- PROBLEM -> SOLUTION --- */}
      <section className="landing-problem-section" style={{ padding: "100px 24px 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(26px, 5vw, 40px)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 12, color: P.text }}>
              Too many AI tools. One simple fix.
            </h2>
          </motion.div>

          <motion.div
            className="landing-problem-grid"
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
            style={{
              display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 24, alignItems: "center",
            }}
          >
            {/* Before */}
            <div style={{
              padding: "32px 28px", borderRadius: 20,
              backgroundColor: "#FEF2F2", border: "1px solid #FECACA",
              boxShadow: P.shadow,
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#DC2626", marginBottom: 12, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Before</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {["10+ tabs open", "Different logins", "Scattered outputs", "No cost tracking"].map((t) => (
                  <li key={t} style={{ fontSize: 15, color: P.textSec, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#DC2626", fontWeight: 700, fontSize: 16 }}>\u2717</span> {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Arrow */}
            <div className="landing-problem-arrow" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: "linear-gradient(135deg, #1e8e3e, #15e11e)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 16px rgba(30,142,62,0.3)",
              }}>
                <ArrowRight size={24} color="#fff" />
              </div>
            </div>

            {/* After */}
            <div style={{
              padding: "32px 28px", borderRadius: 20,
              backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0",
              boxShadow: P.shadow,
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#16A34A", marginBottom: 12, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>After</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {["One workspace", "Every agent you need", "All tasks tracked", "Every dollar & token visible"].map((t) => (
                  <li key={t} style={{ fontSize: 15, color: P.textSec, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#16A34A", fontWeight: 700, fontSize: 16 }}>\u2713</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Callout */}
          <motion.div
            className="landing-callout"
            initial={fadeUp.hidden} whileInView={fadeUp.show} viewport={{ once: true }}
            style={{
              marginTop: 48, padding: "28px 32px", borderRadius: 20,
              background: `linear-gradient(135deg, rgba(30,142,62,0.06), rgba(66,63,247,0.04))`,
              border: "1px solid rgba(30,142,62,0.12)",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 16, color: P.textSec, lineHeight: 1.7, maxWidth: 640, margin: "0 auto" }}>
              <span style={{ fontWeight: 700, color: P.lime }}>Other AI tools hide your costs.</span>{" "}
              AgentStudio shows you exactly what every task costs — per agent, per token, in real time. No surprises on your bill.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- AGENTS SHOWCASE (Gradient Cards) --- */}
      <section id="agents" className="landing-agents-section" style={{ padding: "120px 0 80px" }}>
        <div style={{ maxWidth: "100%", margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} style={{ textAlign: "center", marginBottom: 56, padding: "0 24px" }}>
            <span style={{
              fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const,
              background: `linear-gradient(135deg, #1e8e3e, #423ff7)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>Meet Your Agents</span>
            <h2 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 900, letterSpacing: "-0.03em", marginTop: 10, marginBottom: 14, color: P.text }}>
              Pick an agent. Describe your task. Ship it.
            </h2>
            <p style={{ fontSize: 18, color: P.textSec, maxWidth: 540, margin: "0 auto" }}>
              Everything you used to need 10 different tools for — research, writing, coding, strategy, and even fun — all in one place.
            </p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="landing-agents-grid"
            style={{ display: "flex", overflowX: "auto", gap: 12, padding: "0 24px", scrollbarWidth: "none" }}
          >
            {[...POPULAR_AGENTS, ...POPULAR_AGENTS, ...POPULAR_AGENTS].map((agent, i) => (
              <motion.a
                key={`${agent.name}-${i}`}
                href="/today"
                variants={item}
                whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "16px 18px", borderRadius: 16,
                  background: agent.grad,
                  textDecoration: "none", color: "#fff",
                  transition: "box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  flexShrink: 0, minWidth: 180,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                }}
              >
                <span style={{ fontSize: 20, flexShrink: 0, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}>{agent.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>{agent.name}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>{agent.desc}</div>
                </div>
              </motion.a>
            ))}
          </motion.div>

          <motion.div initial={fadeUp.hidden} whileInView={fadeUp.show} viewport={{ once: true }} style={{ textAlign: "center", marginTop: 40 }}>
            <a href="/today" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: 16, fontWeight: 700, textDecoration: "none",
              background: `linear-gradient(135deg, #1e8e3e, #423ff7)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              See all agents <ArrowRight size={16} style={{ color: "#1e8e3e" }} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* --- FEATURES (White Cards with Strong Shadows) --- */}
      <section id="features" className="landing-features-section" style={{ padding: "100px 24px", backgroundColor: P.bg }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} style={{ textAlign: "center", marginBottom: 64 }}>
            <span style={{
              fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const,
              background: `linear-gradient(135deg, #1e8e3e, #423ff7)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>Features</span>
            <h2 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 900, letterSpacing: "-0.03em", marginTop: 10, marginBottom: 14, color: P.text }}>
              Everything you need to orchestrate AI
            </h2>
            <p style={{ fontSize: 18, color: P.textSec, maxWidth: 520, margin: "0 auto" }}>
              A complete workspace for humans and AI to collaborate — beautifully.
            </p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="landing-features-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}
          >
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={item}
                whileHover={{ y: -6, scale: 1.03, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } }}
                style={{
                  padding: "32px 28px", borderRadius: 20,
                  border: `1px solid ${P.border}`, backgroundColor: P.card,
                  boxShadow: P.shadow,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "default",
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: `${f.accent}15`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 20,
                }}>
                  <f.icon size={24} color={f.accent} strokeWidth={1.8} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em", color: P.text }}>{f.title}</h3>
                <p style={{ fontSize: 15, color: P.textSec, lineHeight: 1.65 }}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="how-it-works" className="landing-steps-wrapper" style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} style={{ textAlign: "center", marginBottom: 64 }}>
            <span style={{
              fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const,
              background: `linear-gradient(135deg, #1e8e3e, #15e11e)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>How It Works</span>
            <h2 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 900, letterSpacing: "-0.03em", marginTop: 10, color: P.text }}>
              Three steps. That{"'"}s it.
            </h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={stagger} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {STEPS.map((s) => (
              <motion.div
                key={s.num}
                variants={item}
                whileHover={{ scale: 1.02, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } }}
                className="landing-step-card"
                style={{
                  display: "flex", alignItems: "flex-start", gap: 24,
                  padding: "32px 32px", borderRadius: 24,
                  backgroundColor: P.card, border: `1px solid ${P.border}`,
                  boxShadow: P.shadow,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: 18,
                  background: s.grad,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, fontWeight: 900, color: "#fff", flexShrink: 0,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                }}>
                  {s.num}
                </div>
                <div>
                  <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em", color: P.text }}>{s.title}</h3>
                  <p style={{ fontSize: 16, color: P.textSec, lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- DARK GRADIENT CTA --- */}
      <section style={{ padding: "60px 24px 120px" }}>
        <motion.div
          className="landing-cta-box"
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
          style={{
            maxWidth: 900, margin: "0 auto", textAlign: "center" as const,
            padding: "72px 48px", borderRadius: 32,
            background: "linear-gradient(135deg, #0d3b1a, #1e8e3e, #156d2e)",
            position: "relative", overflow: "hidden",
            boxShadow: "0 24px 80px rgba(30,142,62,0.2)",
          }}
        >
          {/* Decorative gradient orbs */}
          <div style={{ position: "absolute", top: -80, right: -60, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, rgba(21,225,30,0.2), transparent 70%)`, filter: "blur(40px)" }} />
          <div style={{ position: "absolute", bottom: -80, left: -40, width: 350, height: 350, borderRadius: "50%", background: `radial-gradient(circle, rgba(30,142,62,0.15), transparent 70%)`, filter: "blur(40px)" }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, rgba(66,63,247,0.1), transparent 70%)`, filter: "blur(50px)" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{
              fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 16,
              background: `linear-gradient(135deg, #fff, rgba(255,255,255,0.8))`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Replace your AI toolkit today
            </h2>
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.55)", marginBottom: 40, maxWidth: 480, margin: "0 auto 40px", lineHeight: 1.6 }}>
              One workspace. Every agent. Zero tab-switching. Free to start.
            </p>
            <a
              href="/today"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "16px 40px", borderRadius: 16, height: 56,
                background: "linear-gradient(135deg, #15e11e, #1e8e3e)",
                color: "#fff",
                fontSize: 17, fontWeight: 700, textDecoration: "none",
                boxShadow: "0 8px 32px rgba(21,225,30,0.3)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              Get Started Free <ChevronRight size={18} />
            </a>
          </div>
        </motion.div>
      </section>

      {/* --- FOOTER --- */}
      <footer style={{ borderTop: `1px solid ${P.border}`, padding: "28px 24px", backgroundColor: P.card }}>
        <div className="landing-footer" style={{
          maxWidth: 1200, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontSize: 13, color: P.textTer,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src="/logo.png" alt="AgentStudio" style={{
              width: 24, height: 24, borderRadius: 7, objectFit: "cover",
            }} />
            <span style={{ fontWeight: 700, color: P.text }}>AgentStudio</span>
          </div>
          <p>&copy; {new Date().getFullYear()} AgentStudio. All rights reserved.</p>
          <a href="/login" style={{
            color: P.lime, textDecoration: "none", fontWeight: 700,
            transition: "opacity 0.2s",
          }}>
            Sign Up &rarr;
          </a>
        </div>
      </footer>
    </div>
  );
}
