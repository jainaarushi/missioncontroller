"use client";

import { motion } from "framer-motion";
import {
  Bot, Sparkles, ArrowRight, ChevronRight, Zap, Brain,
  Layers, BarChart3, MessageSquare, Palette, Shield, Clock,
  Star, Flame, Music, Heart, Briefcase, Code, Dumbbell, Plane,
} from "lucide-react";

const POPULAR_AGENTS = [
  { name: "Roast Master", desc: "Get hilariously roasted", icon: "🔥", bg: "#FFE0E6" },
  { name: "Dream Interpreter", desc: "Decode your dreams", icon: "🌙", bg: "#E8D5F5" },
  { name: "Villain Origin", desc: "Your supervillain backstory", icon: "🦹", bg: "#D5E8F5" },
  { name: "Rap Battle", desc: "AI drops bars", icon: "🎤", bg: "#D5F5E0" },
  { name: "Fortune Teller", desc: "Mystical predictions", icon: "🔮", bg: "#F5E6D5" },
  { name: "Dating Profile", desc: "Swipe-right worthy bios", icon: "💘", bg: "#FFE0E6" },
  { name: "Deep Research", desc: "Multi-source analysis", icon: "🔭", bg: "#E8D5F5" },
  { name: "Content Creator", desc: "Blog, email, social", icon: "✒️", bg: "#D5E8F5" },
  { name: "Data Analyst", desc: "Numbers to insights", icon: "📊", bg: "#D5F5E0" },
  { name: "System Architect", desc: "Design scalable systems", icon: "🏗️", bg: "#F5E6D5" },
  { name: "Startup Ideas", desc: "Million-dollar concepts", icon: "💡", bg: "#FFE0E6" },
  { name: "Song Lyrics", desc: "Write songs in any genre", icon: "🎵", bg: "#E8D5F5" },
];

const FEATURES = [
  { icon: Brain, title: "Every agent you need", desc: "Research, writing, coding, finance, health, fun — all under one roof. No more switching between tools." },
  { icon: Layers, title: "Multi-Agent Pipelines", desc: "Chain agents together. Research → Write → Edit. Drag to reorder the sequence." },
  { icon: MessageSquare, title: "Human Feedback Loop", desc: "Don't like the output? Give feedback and the agent revises — getting better each time." },
  { icon: BarChart3, title: "Track every dollar & token", desc: "Unlike other AI tools that hide usage, AgentStudio shows exactly what each task costs — per agent, per token. Full transparency, one dashboard." },
  { icon: Zap, title: "Replace 10 tools in 10 seconds", desc: "No signup needed to explore. Try any agent free — replace your entire AI toolkit." },
  { icon: Shield, title: "Your Keys, Your Data", desc: "Bring your own API keys. Encrypted with AES-256. We never see or store your keys in plain text." },
];

const STEPS = [
  { num: "1", title: "Pick an Agent", desc: "Browse specialized AI agents. Click one to see what it does — from research to rap battles.", color: "#7C3AED" },
  { num: "2", title: "Describe Your Task", desc: "Type what you need in plain English. The agent understands context, tone, and nuance.", color: "#6366F1" },
  { num: "3", title: "Review & Iterate", desc: "Get polished output in seconds. Not perfect? Add feedback and the agent revises.", color: "#4F46E5" },
];

const STATS = [
  { num: "50+", label: "AI Agents" },
  { num: "20+", label: "Fun Agents" },
  { num: "30+", label: "Pro Agents" },
  { num: "$0", label: "To Start" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "#FAFAF8", color: "#111" }}>

      {/* ─── NAV ─── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        backgroundColor: "rgba(250,250,248,0.85)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto", padding: "0 24px",
          height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 900, color: "#fff",
            }}>A</div>
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.03em" }}>AgentStudio</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <a href="#features" style={{ fontSize: 14, color: "#666", textDecoration: "none" }}>Features</a>
            <a href="#agents" style={{ fontSize: 14, color: "#666", textDecoration: "none" }}>Agents</a>
            <a href="#how-it-works" style={{ fontSize: 14, color: "#666", textDecoration: "none" }}>How It Works</a>
            <a
              href="/today"
              style={{
                padding: "8px 20px", borderRadius: 10,
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none",
                boxShadow: "0 2px 12px rgba(99,102,241,0.3)",
                transition: "all 0.2s",
              }}
            >
              Get Started Free
            </a>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section style={{ position: "relative", paddingTop: 140, paddingBottom: 80 }}>
        {/* Gradient background */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 700,
          background: "linear-gradient(180deg, #EDE9FE 0%, #F3E8FF 25%, #FDF2F8 50%, #FAFAF8 100%)",
          zIndex: 0,
        }} />
        {/* Decorative blobs */}
        <div style={{
          position: "absolute", top: 100, left: "10%", width: 400, height: 400,
          background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
          borderRadius: "50%", zIndex: 0,
        }} />
        <div style={{
          position: "absolute", top: 200, right: "5%", width: 300, height: 300,
          background: "radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)",
          borderRadius: "50%", zIndex: 0,
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          {/* Badge */}
          <motion.div initial={fadeUp.hidden} animate={fadeUp.show}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 16px", borderRadius: 50,
              backgroundColor: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)",
              fontSize: 13, fontWeight: 600, color: "#6366F1",
            }}>
              <Sparkles size={14} /> One Workspace. Every AI Agent.
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{
              fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 900,
              letterSpacing: "-0.04em", lineHeight: 1.08,
              margin: "28px 0 20px", color: "#111",
            }}
          >
            All your AI agents.
            <br />
            <span style={{
              background: "linear-gradient(135deg, #4F46E5, #7C3AED, #EC4899)",
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
            style={{ fontSize: 19, color: "#666", maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.6 }}
          >
            Stop juggling ChatGPT, Jasper, Copy.ai, and 10 other tools. AgentStudio brings every specialized agent into one clean workspace — research, write, code, analyze, and create without switching tabs.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}
          >
            <a
              href="/today"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 32px", borderRadius: 14,
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                color: "#fff", fontSize: 16, fontWeight: 700, textDecoration: "none",
                boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
                transition: "all 0.2s",
              }}
            >
              Start Creating <ArrowRight size={18} />
            </a>
            <a
              href="#agents"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 32px", borderRadius: 14,
                backgroundColor: "#fff", color: "#333",
                fontSize: 16, fontWeight: 600, textDecoration: "none",
                border: "1.5px solid #E5E5E5",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                transition: "all 0.2s",
              }}
            >
              Explore Agents
            </a>
          </motion.div>

          {/* Hero image */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{ marginTop: 60, position: "relative" }}
          >
            <div style={{
              position: "absolute", inset: -20,
              background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(236,72,153,0.04))",
              borderRadius: 28, filter: "blur(30px)",
            }} />
            <div style={{
              position: "relative", borderRadius: 20, overflow: "hidden",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)",
            }}>
              <img src="/hero-dashboard.png" alt="AgentStudio workspace" style={{ width: "100%", display: "block" }} />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(250,250,248,0.4) 0%, transparent 30%)",
              }} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section style={{ padding: "0 24px", marginTop: -40, position: "relative", zIndex: 2 }}>
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }}
          variants={fadeUp}
          style={{
            maxWidth: 800, margin: "0 auto",
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0,
            backgroundColor: "#fff", borderRadius: 20, overflow: "hidden",
            border: "1px solid #EBEBEB",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              padding: "24px 0", textAlign: "center",
              borderRight: i < 3 ? "1px solid #F0F0F0" : "none",
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#4F46E5", letterSpacing: "-0.03em" }}>{s.num}</div>
              <div style={{ fontSize: 13, color: "#888", fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ─── PROBLEM → SOLUTION ─── */}
      <section style={{ padding: "80px 24px 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 12 }}>
              Too many AI tools. One simple fix.
            </h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
            style={{
              display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 24, alignItems: "center",
            }}
          >
            {/* Before */}
            <div style={{
              padding: "28px 24px", borderRadius: 18,
              backgroundColor: "#FEF2F2", border: "1px solid #FECACA",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#DC2626", marginBottom: 10, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Before</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {["10+ tabs open", "Different logins", "Scattered outputs", "No cost tracking"].map((t) => (
                  <li key={t} style={{ fontSize: 15, color: "#666", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#DC2626", fontWeight: 700 }}>✗</span> {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Arrow */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ArrowRight size={28} color="#7C3AED" />
            </div>

            {/* After */}
            <div style={{
              padding: "28px 24px", borderRadius: 18,
              backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#16A34A", marginBottom: 10, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>After</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {["One workspace", "Every agent you need", "All tasks tracked", "Every dollar & token visible"].map((t) => (
                  <li key={t} style={{ fontSize: 15, color: "#666", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#16A34A", fontWeight: 700 }}>✓</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Unlike Other Tools callout */}
          <motion.div
            initial={fadeUp.hidden} whileInView={fadeUp.show} viewport={{ once: true }}
            style={{
              marginTop: 40, padding: "24px 28px", borderRadius: 16,
              background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(124,58,237,0.06))",
              border: "1px solid rgba(99,102,241,0.12)",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 16, color: "#444", lineHeight: 1.7, maxWidth: 640, margin: "0 auto" }}>
              <span style={{ fontWeight: 700, color: "#4F46E5" }}>Other AI tools hide your costs.</span>{" "}
              AgentStudio shows you exactly what every task costs — per agent, per token, in real time. No surprises on your bill.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── AGENTS SHOWCASE ─── */}
      <section id="agents" style={{ padding: "100px 0 80px" }}>
        <div style={{ maxWidth: "100%", margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} style={{ textAlign: "center", marginBottom: 48, padding: "0 24px" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#7C3AED", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>Meet Your Agents</span>
            <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-0.03em", marginTop: 8, marginBottom: 12 }}>
              Pick an agent. Describe your task. Ship it.
            </h2>
            <p style={{ fontSize: 17, color: "#666", maxWidth: 520, margin: "0 auto" }}>
              Everything you used to need 10 different tools for — research, writing, coding, strategy, and even fun — all in one place.
            </p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            style={{ display: "flex", overflowX: "auto", gap: 8, padding: "0", scrollbarWidth: "none" }}
          >
            {[...POPULAR_AGENTS, ...POPULAR_AGENTS, ...POPULAR_AGENTS].map((agent, i) => (
              <motion.a
                key={`${agent.name}-${i}`}
                href="/today"
                variants={item}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "7px 10px", borderRadius: 9,
                  backgroundColor: agent.bg,
                  textDecoration: "none", color: "#111",
                  transition: "box-shadow 0.3s",
                  cursor: "pointer",
                  flexShrink: 0, minWidth: 140,
                }}
              >
                <span style={{ fontSize: 15, flexShrink: 0 }}>{agent.icon}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{agent.name}</div>
                  <div style={{ fontSize: 9, color: "#666", marginTop: 1 }}>{agent.desc}</div>
                </div>
              </motion.a>
            ))}
          </motion.div>

          <motion.div initial={fadeUp.hidden} whileInView={fadeUp.show} viewport={{ once: true }} style={{ textAlign: "center", marginTop: 32 }}>
            <a href="/today" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 15, fontWeight: 600, color: "#7C3AED", textDecoration: "none",
            }}>
              See all agents <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" style={{ padding: "80px 24px", backgroundColor: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#7C3AED", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>Features</span>
            <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-0.03em", marginTop: 8, marginBottom: 12 }}>
              Everything you need to orchestrate AI
            </h2>
            <p style={{ fontSize: 17, color: "#666", maxWidth: 500, margin: "0 auto" }}>
              A complete workspace for humans and AI to collaborate — beautifully.
            </p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}
          >
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={item}
                style={{
                  padding: "28px 24px", borderRadius: 18,
                  border: "1px solid #F0F0F0", backgroundColor: "#FAFAF8",
                  transition: "all 0.2s",
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  backgroundColor: "rgba(99,102,241,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16,
                }}>
                  <f.icon size={22} color="#6366F1" strokeWidth={1.8} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, letterSpacing: "-0.01em" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#7C3AED", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>How It Works</span>
            <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-0.03em", marginTop: 8 }}>
              Three steps. That{"'"}s it.
            </h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={stagger} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {STEPS.map((s) => (
              <motion.div
                key={s.num}
                variants={item}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 24,
                  padding: "28px 28px", borderRadius: 20,
                  backgroundColor: "#fff", border: "1px solid #F0F0F0",
                  transition: "all 0.2s",
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `linear-gradient(135deg, ${s.color}, ${s.color}90)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, fontWeight: 900, color: "#fff", flexShrink: 0,
                }}>
                  {s.num}
                </div>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, letterSpacing: "-0.01em" }}>{s.title}</h3>
                  <p style={{ fontSize: 15, color: "#666", lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ padding: "60px 24px 100px" }}>
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
          style={{
            maxWidth: 800, margin: "0 auto", textAlign: "center",
            padding: "60px 40px", borderRadius: 28,
            background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
            position: "relative", overflow: "hidden",
            boxShadow: "0 20px 60px rgba(99,102,241,0.25)",
          }}
        >
          {/* Decorative circles */}
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.05)" }} />
          <div style={{ position: "absolute", bottom: -60, left: -30, width: 300, height: 300, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.03)" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", marginBottom: 12 }}>
              Replace your AI toolkit today
            </h2>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.75)", marginBottom: 32, maxWidth: 440, margin: "0 auto 32px" }}>
              One workspace. Every agent. Zero tab-switching. Free to start.
            </p>
            <a
              href="/today"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 36px", borderRadius: 14,
                backgroundColor: "#fff", color: "#4F46E5",
                fontSize: 16, fontWeight: 700, textDecoration: "none",
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                transition: "all 0.2s",
              }}
            >
              Get Started Free <ChevronRight size={18} />
            </a>
          </div>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ borderTop: "1px solid #F0F0F0", padding: "24px" }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontSize: 13, color: "#999",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 7,
              background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 900, color: "#fff",
            }}>A</div>
            <span style={{ fontWeight: 700, color: "#333" }}>AgentStudio</span>
          </div>
          <p>&copy; {new Date().getFullYear()} AgentStudio. All rights reserved.</p>
          <a href="/login" style={{ color: "#7C3AED", textDecoration: "none", fontWeight: 600 }}>
            Sign Up &rarr;
          </a>
        </div>
      </footer>
    </div>
  );
}
