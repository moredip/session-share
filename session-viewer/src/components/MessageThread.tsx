import { type TranscriptEntry, isDisplayableEntry } from '../domain/transcriptEntry'
import { MessageEntry } from './MessageEntry'

interface MessageThreadProps {
  entries: TranscriptEntry[]
}

export function MessageThread({ entries }: MessageThreadProps) {
  const displayableEntries = entries.filter(isDisplayableEntry)

  return (
    <div className="flex flex-col gap-4">
      {displayableEntries.map((entry, index) => (
        <MessageEntry key={entry.uuid ?? index} entry={entry} />
      ))}
    </div>
  )
}
