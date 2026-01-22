import { useState } from "react";
import type { RawTranscriptEntry } from "../domain/rawEntry";
import { RawEntryCard } from "./RawEntryCard";

interface RawTranscriptViewProps {
  entries: RawTranscriptEntry[];
}

export function RawTranscriptView({ entries }: RawTranscriptViewProps) {
  const [forceExpanded, setForceExpanded] = useState<boolean | null>(null);

  const handleExpandAll = () => setForceExpanded(true);
  const handleCollapseAll = () => setForceExpanded(false);
  const handleManualToggle = () => setForceExpanded(null);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 mb-2">
        <button
          onClick={handleExpandAll}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          Expand All
        </button>
        <button
          onClick={handleCollapseAll}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          Collapse All
        </button>
      </div>
      {entries.map((entry) => (
        <RawEntryCard
          key={entry.uuid}
          entry={entry}
          forceExpanded={forceExpanded}
          onManualToggle={handleManualToggle}
        />
      ))}
    </div>
  );
}
