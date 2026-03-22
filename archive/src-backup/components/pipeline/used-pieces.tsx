"use client";

import type { PieceInfo } from "@/lib/ai/nodes/types";

interface UsedPiecesProps {
  pieces: PieceInfo[];
}

export default function UsedPieces({ pieces }: UsedPiecesProps) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {pieces.map((piece) => (
        <div
          key={piece.name}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            padding: "10px 14px",
            borderRadius: 10,
            background: `${piece.color}08`,
            border: `1px solid ${piece.color}22`,
            minWidth: 64,
          }}
        >
          <span style={{ fontSize: 18 }}>{piece.icon}</span>
          <span
            style={{
              fontSize: 9,
              color: piece.color,
              fontWeight: 600,
              textAlign: "center",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
            }}
          >
            {piece.name}
          </span>
        </div>
      ))}
    </div>
  );
}
