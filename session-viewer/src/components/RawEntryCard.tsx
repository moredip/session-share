import { useState, useEffect } from "react";
import type { TranscriptEntry } from "../domain/transcriptEntry";

interface RawEntryCardProps {
  entry: TranscriptEntry;
  defaultExpanded?: boolean;
  forceExpanded?: boolean | null; // null = use local state, true/false = override
  onManualToggle?: () => void; // Called when user manually toggles, to reset forceExpanded
}

const typeColors: Record<string, string> = {
  user: "bg-blue-100 text-blue-800",
  assistant: "bg-green-100 text-green-800",
  progress: "bg-amber-100 text-amber-800",
  system: "bg-gray-100 text-gray-800",
  "file-history-snapshot": "bg-purple-100 text-purple-800",
};

function formatTimestamp(timestamp?: string): string {
  if (!timestamp) return "";
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return timestamp;
  }
}

export function RawEntryCard({
  entry,
  defaultExpanded = false,
  forceExpanded = null,
  onManualToggle,
}: RawEntryCardProps) {
  const [localExpanded, setLocalExpanded] = useState(defaultExpanded);

  useEffect(() => {
    if (forceExpanded !== null) {
      setLocalExpanded(forceExpanded);
    }
  }, [forceExpanded]);

  const expanded = forceExpanded ?? localExpanded;
  const badgeColor = typeColors[entry.type] ?? "bg-gray-100 text-gray-800";

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => {
          onManualToggle?.();
          setLocalExpanded(!expanded);
        }}
        className="w-full flex items-center gap-3 px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium ${badgeColor}`}
        >
          {entry.type}
        </span>
        <span className="text-gray-500 text-sm flex-1">
          {formatTimestamp(entry.timestamp)}
        </span>
        <span className="text-gray-400">{expanded ? "▼" : "▶"}</span>
      </button>
      {expanded && (
        <pre className="p-3 bg-gray-50 text-xs font-mono overflow-x-auto border-t border-gray-200">
          {JSON.stringify(entry.raw, null, 2)}
        </pre>
      )}
    </div>
  );
}
