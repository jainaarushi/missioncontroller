interface AgentAvatarProps {
  icon: string;
  color: string;
  gradient?: string;
  size?: "sm" | "md" | "lg" | number;
}

export function AgentAvatar({ icon, color, gradient, size = "md" }: AgentAvatarProps) {
  const s = typeof size === "number"
    ? { wh: size, radius: size > 32 ? 14 : 8, fontSize: size * 0.5 }
    : size === "sm"
      ? { wh: 24, radius: 8, fontSize: 12 }
      : size === "lg"
        ? { wh: 44, radius: 14, fontSize: 22 }
        : { wh: 28, radius: 8, fontSize: 14 };

  return (
    <div
      style={{
        width: s.wh,
        height: s.wh,
        borderRadius: s.radius,
        background: gradient || color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: s.fontSize,
        flexShrink: 0,
        boxShadow: `0 3px 10px ${color}30`,
      }}
    >
      {icon}
    </div>
  );
}
