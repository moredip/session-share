import {
  type TranscriptEntry,
  type UserStructuredEntry,
  type AssistantStructuredEntry,
  isDisplayableEntry,
} from '../domain/transcriptEntry';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';
import { AssistantThinking } from './AssistantThinking';

interface MessageEntryProps {
  entry: TranscriptEntry & {
    structuredEntry: UserStructuredEntry | AssistantStructuredEntry;
  };
}

function MessageEntry({ entry }: MessageEntryProps) {
  const { structuredEntry } = entry;

  if (structuredEntry.kind === 'user') {
    return <UserMessage content={structuredEntry.content} />;
  }

  return (
    <>
      {structuredEntry.thinkingContent && (
        <AssistantThinking content={structuredEntry.thinkingContent} />
      )}
      {structuredEntry.content && <AssistantMessage content={structuredEntry.content} />}
    </>
  );
}

interface MessageThreadProps {
  entries: TranscriptEntry[];
}

export function MessageThread({ entries }: MessageThreadProps) {
  const displayableEntries = entries.filter(isDisplayableEntry);

  return (
    <div className="flex flex-col gap-4">
      {displayableEntries.map((entry, index) => (
        <MessageEntry key={entry.uuid ?? index} entry={entry} />
      ))}
    </div>
  );
}
