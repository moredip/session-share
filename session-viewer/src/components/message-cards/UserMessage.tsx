import { MessageCard } from './MessageCard'
import { UserContentBlocks } from './UserContentBlocks'
import type { TextBlock, UserContentBlock } from '../../domain/transcriptEntry'

interface UserMessageProps {
  content: UserContentBlock[]
  anchorId: string
}

export function UserMessage({ content, anchorId }: UserMessageProps) {
  // Filter to only text blocks (tool results are rendered separately as tool call entries)
  const visibleContent = content.filter((block): block is TextBlock => block.type === 'text')

  if (visibleContent.length === 0) {
    return null
  }

  return (
    <MessageCard anchorId={anchorId} label="user" align="right" variant="sky">
      <UserContentBlocks content={visibleContent} />
    </MessageCard>
  )
}
