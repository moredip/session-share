import ReactMarkdown from 'react-markdown'
import type { TextBlock } from '../../domain/transcriptEntry'

interface UserContentBlocksProps {
  content: TextBlock[]
}

export function UserContentBlocks({ content }: UserContentBlocksProps) {
  return (
    <div className="space-y-2">
      {content.map((block, index) => (
        <div key={index} className="prose prose-sm max-w-none">
          <ReactMarkdown>{block.text}</ReactMarkdown>
        </div>
      ))}
    </div>
  )
}
