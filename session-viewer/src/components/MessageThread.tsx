import {
  type TranscriptEntry,
  type UserStructuredEntry,
  type AssistantStructuredEntry,
  isDisplayableEntry,
} from '../domain/transcriptEntry'
import { UserMessage } from './UserMessage'
import { AssistantMessage } from './AssistantMessage'
import { AssistantThinking } from './AssistantThinking'
import { ToolCallEntry } from './ToolCallEntry'

interface MessageEntryProps {
  entry: TranscriptEntry & {
    structuredEntry: UserStructuredEntry | AssistantStructuredEntry
  }
}

function MessageEntry({ entry }: MessageEntryProps) {
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
      {structuredEntry.toolCalls?.map((toolCall) => (
        <ToolCallEntry key={toolCall.id} toolCall={toolCall} />
      ))}
    </>
  )
}

interface MessageThreadProps {
  entries: TranscriptEntry[]
}

export function MessageThread({ entries }: MessageThreadProps) {
  const displayableEntries = entries.filter(isDisplayableEntry)

  return (
    <div className="flex flex-col gap-6">
      {displayableEntries.map((entry, index) => (
        <MessageEntry key={entry.uuid ?? index} entry={entry} />
      ))}
    </div>
  )
}
