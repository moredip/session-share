import ReactMarkdown from 'react-markdown'
import { MessageCard } from './MessageCard'

interface AssistantMessageProps {
  content: string
  anchorId: string
}

export function AssistantMessage({ content, anchorId }: AssistantMessageProps) {
  return (
    <MessageCard anchorId={anchorId} label="assistant" align="left" variant="custard">
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </MessageCard>
  )
}
