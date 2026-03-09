"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface OutputDisplayProps {
  content: string;
}

export function OutputDisplay({ content }: OutputDisplayProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-ink-secondary">Output</p>
        <button
          onClick={handleCopy}
          className="text-[11px] text-ink-tertiary hover:text-ink-secondary transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="bg-cream/50 rounded-lg p-4 prose text-sm max-h-96 overflow-y-auto">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
