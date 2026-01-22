import type {
  TranscriptEntry,
  UserStructuredEntry,
  AssistantStructuredEntry,
} from '../domain/transcriptEntry'
import { UserMessage } from './UserMessage'
import { AssistantMessage } from './AssistantMessage'
import { AssistantThinking } from './AssistantThinking'

interface MessageEntryProps {
  entry: TranscriptEntry & {
    structuredEntry: UserStructuredEntry | AssistantStructuredEntry
  }
}

export function MessageEntry({ entry }: MessageEntryProps) {
  const { structuredEntry } = entry

  if (structuredEntry.kind === 'user') {
    return <UserMessage content={structuredEntry.content} />
  }

  return (
    <>
      {structuredEntry.thinkingContent && (
        <AssistantThinking content={structuredEntry.thinkingContent} />
      )}
      {structuredEntry.content && <AssistantMessage content={structuredEntry.content} />}
    </>
  )
}
