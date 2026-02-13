import {
  type TranscriptEntry,
  type MessageEntry,
  type UserStructuredEntry,
  type AssistantStructuredEntry,
  type UnsupportedStructuredEntry,
  isDisplayableEntry,
} from '../domain/transcriptEntry'
import { UserMessage } from './message-cards/UserMessage'
import { AssistantMessage } from './message-cards/AssistantMessage'
import { AssistantThinking } from './message-cards/AssistantThinking'
import { ToolCallEntry } from './message-cards/tool-calls/ToolCallEntry'
import { UnsupportedMessage } from './message-cards/UnsupportedMessage'

interface MessageEntryProps {
  entry: MessageEntry & {
    structuredEntry: UserStructuredEntry | AssistantStructuredEntry | UnsupportedStructuredEntry
  }
  anchorId: string
}

function MessageEntry({ entry, anchorId }: MessageEntryProps) {
  const { structuredEntry } = entry

  if (structuredEntry.kind === 'user') {
    return <UserMessage content={structuredEntry.content} anchorId={anchorId} />
  }

  if (structuredEntry.kind === 'unsupported') {
    return (
      <UnsupportedMessage
        originalType={structuredEntry.originalType}
        raw={entry.raw}
        anchorId={anchorId}
      />
    )
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
