import { MessageCard } from './MessageCard'
import { UserContentBlocks } from './UserContentBlocks'
import type { TextBlock, ImageBlock, UserContentBlock } from '../../domain/transcriptEntry'

interface UserMessageProps {
  content: UserContentBlock[]
  anchorId: string
}

export function UserMessage({ content, anchorId }: UserMessageProps) {
  // Filter out tool results (they're rendered separately as tool call entries)
  // Keep text and images for display in the user message
  const visibleContent = content.filter(
    (block): block is TextBlock | ImageBlock => block.type === 'text' || block.type === 'image'
  )

  if (visibleContent.length === 0) {
    return null
  }

  return (
    <MessageCard anchorId={anchorId} label="user" align="right" variant="sky">
      <UserContentBlocks content={visibleContent} />
    </MessageCard>
  )
}
