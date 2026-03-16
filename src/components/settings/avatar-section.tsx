"use client";

import { useState, useRef, useCallback } from "react";
import { P } from "@/lib/palette";
import { useAvatars } from "@/lib/hooks/use-avatars";
import { AVATAR_PROMPTS } from "@/lib/ai/avatar-prompts";
import { AGENT_CATEGORIES } from "@/lib/agent-categories";

const CATEGORY_COLORS: Record<string, string> = {
  product: "#6366F1",
  research: "#0EA5E9",
  sales: "#10B981",
  marketing: "#F43F5E",
  operations: "#F59E0B",
  lifestyle: "#EC4899",
  creative: "#8B5CF6",
};

interface AvatarSectionProps {
  hasGeminiKey: boolean;
}

export function AvatarSection({ hasGeminiKey }: AvatarSectionProps) {
  const { avatars, hasFace, mutate } = useAvatars();
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [facePreview, setFacePreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<Record<string, "loading" | "done" | "error">>({});
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const hasAvatars = Object.keys(avatars).length > 0;

  const handleFile = useCallback((file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please upload a JPG, PNG, or WEBP image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }
    setError(null);
    setFaceFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setFacePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  async function handleGenerate() {
    if (!faceFile || generating) return;
    setGenerating(true);
    setError(null);

    // Initialize progress — only "creative" for testing
    setProgress({ creative: "loading" });

    try {
      // Convert file to base64 and send as JSON (avoids FormData issues)
      const buffer = await faceFile.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce((s, b) => s + String.fromCharCode(b), ""),
      );

      console.log("[avatar] sending request, file size:", faceFile.size, "type:", faceFile.type);

      const res = await fetch("/api/user/avatar/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          face: base64,
          faceType: faceFile.type,
        }),
      });

      console.log("[avatar] response status:", res.status);

      const text = await res.text();
      console.log("[avatar] response body:", text.slice(0, 500));

      if (res.status === 401) {
        setError("Sign in to generate avatars");
        setGenerating(false);
        return;
      }
      if (res.status === 402) {
        setError("Add your Gemini API key first");
        setGenerating(false);
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setError(`Server returned invalid response: ${text.slice(0, 200)}`);
        setGenerating(false);
        return;
      }

      if (!res.ok) {
        setError(data.error || "Generation failed");
        setGenerating(false);
        return;
      }

      // Update progress based on results
      const finalProgress: Record<string, "loading" | "done" | "error"> = {};
      for (const cat of AVATAR_PROMPTS) {
        finalProgress[cat.id] = data.avatars[cat.id] ? "done" : "error";
      }
      setProgress(finalProgress);
      await mutate();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(`Generation failed: ${msg}. Check console for details.`);
      console.error("Avatar generation error:", err);
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    try {
      await fetch("/api/user/avatar", { method: "DELETE" });
      setFaceFile(null);
      setFacePreview(null);
      setProgress({});
      await mutate();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div style={{
      padding: "22px 24px", backgroundColor: P.card, borderRadius: 16,
      border: `1.5px solid ${P.border}`, boxShadow: P.shadow, marginBottom: 16,
      animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.12s both",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 18 }}>🎨</span>
        <div style={{ fontSize: 16, fontWeight: 700, color: P.text }}>My AI Avatars</div>
        <span style={{
          fontSize: 9, fontWeight: 700, color: "#fff",
          backgroundColor: "#8B5CF6", padding: "2px 6px", borderRadius: 4,
        }}>
          Ghibli Style
        </span>
      </div>
      <p style={{ fontSize: 12, color: P.textSec, marginBottom: 18, lineHeight: 1.5 }}>
        Upload your face to generate personalized Ghibli-style avatars for each agent category.
        Uses your Gemini key (free).
      </p>

      {/* Face Upload */}
      {!hasAvatars && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? "#8B5CF6" : P.border}`,
            borderRadius: 14,
            padding: facePreview ? "12px" : "28px 20px",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s",
            backgroundColor: dragOver ? "rgba(139,92,246,0.08)" : facePreview ? P.card : P.bg3,
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 16,
            justifyContent: facePreview ? "flex-start" : "center",
            flexDirection: facePreview ? "row" : "column",
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          {facePreview ? (
            <>
              <img
                src={facePreview}
                alt="Your face"
                style={{
                  width: 64, height: 64, borderRadius: 14,
                  objectFit: "cover", border: `2px solid ${P.border}`,
                }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: P.text }}>
                  {faceFile?.name}
                </div>
                <div style={{ fontSize: 11, color: P.textSec }}>
                  Click to change photo
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 28, marginBottom: 4 }}>📸</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: P.text }}>
                Drop your photo here or click to upload
              </div>
              <div style={{ fontSize: 11, color: P.textTer }}>
                JPG, PNG, or WEBP under 5MB
              </div>
            </>
          )}
        </div>
      )}

      {/* Generate Button */}
      {!hasAvatars && (
        <button
          onClick={handleGenerate}
          disabled={!faceFile || generating || !hasGeminiKey}
          style={{
            width: "100%",
            padding: "12px 20px",
            borderRadius: 12,
            border: "none",
            background: (!faceFile || !hasGeminiKey)
              ? P.border
              : "linear-gradient(135deg, #8B5CF6, #6366F1)",
            color: (!faceFile || !hasGeminiKey) ? P.textTer : "#fff",
            fontSize: 14,
            fontWeight: 700,
            cursor: (!faceFile || generating || !hasGeminiKey) ? "default" : "pointer",
            fontFamily: "inherit",
            transition: "all 0.2s",
            marginBottom: 4,
          }}
        >
          {generating
            ? "Generating avatars..."
            : !hasGeminiKey
              ? "Add Gemini key to generate"
              : "Generate My Ghibli Avatars"}
        </button>
      )}

      {!hasGeminiKey && !hasAvatars && (
        <div style={{ fontSize: 11, color: P.textTer, textAlign: "center", marginTop: 4, marginBottom: 8 }}>
          Requires a Gemini API key (set above)
        </div>
      )}

      {error && (
        <div style={{
          marginTop: 8, padding: "8px 12px", borderRadius: 8,
          backgroundColor: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)",
          fontSize: 12, color: "#F87171",
        }}>
          {error}
        </div>
      )}

      {/* Avatar Grid */}
      {(hasAvatars || generating) && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: 12,
          marginTop: hasAvatars ? 0 : 16,
        }}>
          {AVATAR_PROMPTS.map((cat) => {
            const url = avatars[cat.id];
            const status = progress[cat.id];
            const catInfo = AGENT_CATEGORIES.find((c) => c.id === cat.id);
            const color = CATEGORY_COLORS[cat.id] || "#8B5CF6";

            return (
              <div key={cat.id} style={{
                borderRadius: 14,
                overflow: "hidden",
                border: `1.5px solid ${url ? color + "30" : P.border}`,
                backgroundColor: url ? "transparent" : P.bg3,
                transition: "all 0.3s",
              }}>
                <div style={{
                  width: "100%",
                  aspectRatio: "1",
                  position: "relative",
                  overflow: "hidden",
                  backgroundColor: url ? "transparent" : color + "08",
                }}>
                  {url ? (
                    <img
                      src={url}
                      alt={cat.label}
                      style={{
                        width: "100%", height: "100%",
                        objectFit: "cover", display: "block",
                      }}
                    />
                  ) : status === "loading" ? (
                    <div style={{
                      width: "100%", height: "100%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: `linear-gradient(135deg, ${color}10, ${color}05)`,
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        border: `3px solid ${color}30`,
                        borderTopColor: color,
                        animation: "spin 0.8s linear infinite",
                      }} />
                    </div>
                  ) : status === "error" ? (
                    <div style={{
                      width: "100%", height: "100%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#DC2626", fontSize: 11, textAlign: "center", padding: 8,
                    }}>
                      Failed
                    </div>
                  ) : (
                    <div style={{
                      width: "100%", height: "100%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 28, opacity: 0.3,
                    }}>
                      {catInfo?.icon === "rocket" ? "🚀" :
                       catInfo?.icon === "search" ? "🔍" :
                       catInfo?.icon === "chart" ? "📈" :
                       catInfo?.icon === "megaphone" ? "📣" :
                       catInfo?.icon === "gear" ? "⚙️" :
                       catInfo?.icon === "heart" ? "💖" : "✨"}
                    </div>
                  )}
                </div>
                <div style={{
                  padding: "6px 8px",
                  fontSize: 10,
                  fontWeight: 700,
                  color: color,
                  textAlign: "center",
                  backgroundColor: color + "06",
                }}>
                  {catInfo?.name?.split(" ")[0] || cat.label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      {hasAvatars && (
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button
            onClick={() => {
              setFaceFile(null);
              setFacePreview(null);
              setProgress({});
              // Reset to show upload UI by clearing avatars temporarily
              handleDelete().then(() => {
                // User can re-upload after delete
              });
            }}
            disabled={deleting}
            style={{
              flex: 1, padding: "10px 16px", borderRadius: 10,
              border: `1.5px solid ${P.border}`, backgroundColor: P.card,
              fontSize: 12, fontWeight: 600, color: P.textSec,
              cursor: deleting ? "default" : "pointer",
              fontFamily: "inherit", transition: "all 0.2s",
            }}
          >
            {deleting ? "Deleting..." : "Delete Avatars"}
          </button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
