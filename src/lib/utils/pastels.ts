// Shared pastel color map for agent cards
export const PASTEL_MAP: Record<string, { bg: string; shape1: string; shape2: string }> = {
  "#6366F1": { bg: "#EDE9FE", shape1: "#DDD6FE", shape2: "#C4B5FD60" },
  "#EC4899": { bg: "#FCE7F3", shape1: "#F9A8D4", shape2: "#F472B660" },
  "#10B981": { bg: "#ECFDF5", shape1: "#A7F3D0", shape2: "#6EE7B760" },
  "#F59E0B": { bg: "#FEF3C7", shape1: "#FCD34D", shape2: "#FBBF2460" },
  "#0EA5E9": { bg: "#E0F2FE", shape1: "#7DD3FC", shape2: "#38BDF860" },
  "#059669": { bg: "#ECFDF5", shape1: "#6EE7B7", shape2: "#34D39960" },
  "#7C3AED": { bg: "#EDE9FE", shape1: "#C4B5FD", shape2: "#A78BFA60" },
  "#D946EF": { bg: "#FAE8FF", shape1: "#E879F9", shape2: "#D946EF60" },
  "#DC2626": { bg: "#FEF2F2", shape1: "#FECACA", shape2: "#F8717160" },
  "#F97316": { bg: "#FFF7ED", shape1: "#FED7AA", shape2: "#FDBA7460" },
  "#14B8A6": { bg: "#F0FDFA", shape1: "#99F6E4", shape2: "#5EEAD460" },
  "#1D4ED8": { bg: "#EFF6FF", shape1: "#93C5FD", shape2: "#60A5FA60" },
};

export function getPastel(color: string) {
  return PASTEL_MAP[color] || { bg: "#F5F3FF", shape1: "#DDD6FE", shape2: "#C4B5FD60" };
}
