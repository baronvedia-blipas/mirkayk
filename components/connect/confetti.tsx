"use client";

import { useEffect, useState } from "react";

export function Confetti({ active }: { active: boolean }) {
  const [pieces, setPieces] = useState<{ id: number; left: number; delay: number; color: string; size: number }[]>([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }
    const colors = ["var(--pink-200)", "var(--sage-100)", "var(--pink-100)", "var(--sage-200)", "var(--lavender-100)"];
    const newPieces = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.5,
      color: colors[i % colors.length],
      size: 6 + Math.random() * 8,
    }));
    setPieces(newPieces);
    const timeout = setTimeout(() => setPieces([]), 3500);
    return () => clearTimeout(timeout);
  }, [active]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 rounded-full"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.4,
            backgroundColor: p.color,
            animation: `confetti-fall 2.5s ease-in ${p.delay}s forwards`,
            borderRadius: "50% 50% 50% 0",
          }}
        />
      ))}
    </div>
  );
}
