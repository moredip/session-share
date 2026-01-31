import {
  type TranscriptEntry,
  type MessageEntry,
  type UserStructuredEntry,
  type AssistantStructuredEntry,
  isDisplayableEntry,
} from '../domain/transcriptEntry'
import { UserMessage } from './UserMessage'
import { AssistantMessage } from './AssistantMessage'
import { AssistantThinking } from './AssistantThinking'
import { ToolCallEntry } from './tool-calls/ToolCallEntry'

interface MessageEntryProps {
  entry: MessageEntry & {
    structuredEntry: UserStructuredEntry | AssistantStructuredEntry
  }
  anchorId: string
}

function MessageEntry({ entry, anchorId }: MessageEntryProps) {
  const { structuredEntry } = entry

  if (structuredEntry.kind === 'user') {
    return <UserMessage content={structuredEntry.content} anchorId={anchorId} />
  }

  return (
    <>
      {structuredEntry.thinkingContent && (
        <AssistantThinking
          content={structuredEntry.thinkingContent}
          anchorId={`${anchorId}-thinking`}
        />
      )}
      {structuredEntry.content && (
        <AssistantMessage content={structuredEntry.content} anchorId={anchorId} />
      )}
      {structuredEntry.toolCalls?.map((toolCall) => (
        <ToolCallEntry key={toolCall.id} toolCall={toolCall} anchorId={`msg-${toolCall.id}`} />
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
      {displayableEntries.map((entry) => (
        <MessageEntry key={entry.uuid} entry={entry} anchorId={`msg-${entry.uuid}`} />
      ))}
    </div>
  )
}
