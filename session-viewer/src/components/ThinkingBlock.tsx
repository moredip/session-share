import { useState } from "react";

interface ThinkingBlockProps {
  content: string;
  defaultExpanded?: boolean;
}

export function ThinkingBlock({
  content,
  defaultExpanded = false,
}: ThinkingBlockProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="mb-2 border-l-4 border-indigo-300 bg-indigo-50 rounded-r-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-indigo-100 transition-colors"
      >
        <span className="text-indigo-600 text-sm font-medium">Thinking</span>
        <span className="text-indigo-400 text-xs">{expanded ? "▼" : "▶"}</span>
      </button>
      {expanded && (
        <div className="px-3 pb-3 text-sm text-indigo-900 whitespace-pre-wrap">
          {content}
        </div>
      )}
    </div>
  );
}
