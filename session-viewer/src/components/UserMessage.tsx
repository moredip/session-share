import ReactMarkdown from 'react-markdown'
import { MessageCard } from './MessageCard'

interface UserMessageProps {
  content: string
  anchorId: string
}

export function UserMessage({ content, anchorId }: UserMessageProps) {
  return (
    <MessageCard anchorId={anchorId} label="user" align="right">
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </MessageCard>
  )
}
