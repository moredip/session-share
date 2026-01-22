import {
  type TranscriptEntry,
  isDisplayableEntry,
} from "../domain/transcriptEntry";
import { MessageBubble } from "./MessageBubble";

interface MessageThreadProps {
  entries: TranscriptEntry[];
}

export function MessageThread({ entries }: MessageThreadProps) {
  const displayableEntries = entries.filter(isDisplayableEntry);

  return (
    <div className="flex flex-col gap-4">
      {displayableEntries.map((entry, index) => {
        const thinkingContent =
          entry.structuredEntry.kind === "assistant"
            ? entry.structuredEntry.thinkingContent
            : undefined;

        return (
          <MessageBubble
            key={entry.uuid ?? index}
            role={entry.structuredEntry.role}
            content={entry.structuredEntry.content}
            thinkingContent={thinkingContent}
          />
        );
      })}
    </div>
  );
}
