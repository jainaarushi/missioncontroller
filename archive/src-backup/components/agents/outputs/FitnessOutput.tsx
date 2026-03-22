"use client";

import { useMemo } from "react";
import { P } from "@/lib/palette";

interface OutputProps {
  output: string;
  agentColor: string;
}

export default function FitnessOutput({ output, agentColor }: OutputProps) {
  const { weekSchedule, sections } = useMemo(() => parseFitnessPlan(output), [output]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Week Grid */}
      {weekSchedule.length > 0 && (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: P.text, margin: "0 0 10px" }}>Weekly Schedule</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
              const schedule = weekSchedule[i];
              const isRest = schedule?.toLowerCase().includes("rest") || !schedule;
              return (
                <div key={day} style={{
                  padding: "10px 8px", borderRadius: 10, textAlign: "center",
                  backgroundColor: isRest ? P.sidebar : agentColor + "10",
                  border: `1.5px solid ${isRest ? P.border : agentColor + "25"}`,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: P.textTer, marginBottom: 4, textTransform: "uppercase" }}>
                    {day}
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 600,
                    color: isRest ? P.textTer : agentColor,
                    lineHeight: 1.3,
                  }}>
                    {schedule || "Rest"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Sections */}
      {sections.map((section, i) => (
        <div key={i}>
          {section.title && (
            <h3 style={{
              fontSize: section.level === 1 ? 17 : 14,
              fontWeight: 700, color: P.text,
              margin: "0 0 8px",
            }}>
              {section.title}
            </h3>
          )}
          {section.exercises.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {section.exercises.map((ex, j) => (
                <ExerciseCard key={j} exercise={ex} color={agentColor} />
              ))}
            </div>
          ) : (
            <div
              style={{ fontSize: 13.5, lineHeight: 1.7, color: P.text }}
              dangerouslySetInnerHTML={{ __html: formatContent(section.content) }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function ExerciseCard({ exercise, color }: { exercise: { name: string; detail: string }; color: string }) {
  return (
    <div style={{
      padding: "10px 14px", borderRadius: 10,
      border: `1.5px solid ${P.border}`, backgroundColor: P.card,
      display: "flex", alignItems: "flex-start", gap: 10,
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: "50%",
        backgroundColor: color, marginTop: 6, flexShrink: 0,
      }} />
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: P.text }}>{exercise.name}</div>
        {exercise.detail && (
          <div style={{ fontSize: 12, color: P.textTer, marginTop: 2 }}>{exercise.detail}</div>
        )}
      </div>
    </div>
  );
}

function formatContent(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li style="margin:3px 0">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li style="margin:3px 0">$1</li>')
    .replace(/\n\n/g, '<br/><br/>');
}

function parseFitnessPlan(output: string) {
  const weekSchedule: string[] = [];
  const sections: Array<{
    title: string;
    level: number;
    content: string;
    exercises: Array<{ name: string; detail: string }>;
  }> = [];

  const lines = output.split("\n");
  let currentTitle = "";
  let currentLevel = 0;
  let currentContent = "";
  const currentExercises: Array<{ name: string; detail: string }> = [];

  // Try to extract week schedule from table or list
  const dayNames = /monday|tuesday|wednesday|thursday|friday|saturday|sunday/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect weekly schedule mentions
    if (dayNames.test(line) && (line.includes(":") || line.includes("|"))) {
      const parts = line.split(/[:|]/).map(p => p.trim());
      if (parts.length >= 2) {
        const dayMatch = parts[0].match(/monday|tuesday|wednesday|thursday|friday|saturday|sunday/i);
        if (dayMatch && weekSchedule.length < 7) {
          weekSchedule.push(parts.slice(1).join(" ").replace(/\*\*/g, "").trim());
        }
      }
    }

    // Detect heading
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      if (currentContent.trim() || currentExercises.length > 0 || currentTitle) {
        sections.push({
          title: currentTitle, level: currentLevel,
          content: currentContent.trim(),
          exercises: [...currentExercises],
        });
        currentExercises.length = 0;
      }
      currentTitle = heading[2].replace(/\*\*/g, "");
      currentLevel = heading[1].length;
      currentContent = "";
      continue;
    }

    // Detect exercise entries (lines with sets/reps/rest patterns)
    if (/\d+\s*(sets?|reps?|x\d|seconds?|minutes?)/i.test(line)) {
      const parts = line.replace(/^[-•*]\s*/, "").split(/[-–:]/);
      const name = (parts[0] || "").replace(/\*\*/g, "").trim();
      const detail = (parts.slice(1).join(" ") || "").replace(/\*\*/g, "").trim();
      if (name) {
        currentExercises.push({ name, detail: detail || line.replace(/^[-•*]\s*/, "").replace(name, "").trim() });
        continue;
      }
    }

    currentContent += line + "\n";
  }

  if (currentContent.trim() || currentExercises.length > 0 || currentTitle) {
    sections.push({
      title: currentTitle, level: currentLevel,
      content: currentContent.trim(),
      exercises: [...currentExercises],
    });
  }

  return { weekSchedule, sections };
}
