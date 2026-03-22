"use client";

interface ConfettiProps {
  show: boolean;
}

export function Confetti({ show }: ConfettiProps) {
  if (!show) return null;

  const particles = Array.from({ length: 20 }, (_, i) => ({
    x: Math.random() * 100,
    delay: Math.random() * 0.3,
    color: ["#1e8e3e", "#15e11e", "#423ff7", "#f5a623", "#ffffff"][i % 5],
    size: 4 + Math.random() * 4,
    isRound: Math.random() > 0.5,
  }));

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999 }}>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: "40%",
            width: p.size,
            height: p.size,
            borderRadius: p.isRound ? "50%" : 2,
            backgroundColor: p.color,
            animation: `confettiFall 1.2s cubic-bezier(0.2,0,0.8,1) ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
