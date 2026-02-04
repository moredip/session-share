import ReactMarkdown from 'react-markdown'
import type { TextBlock, ImageBlock } from '../../domain/transcriptEntry'
import { Base64Image } from './Base64Image'

interface UserContentBlocksProps {
  content: (TextBlock | ImageBlock)[]
}

export function UserContentBlocks({ content }: UserContentBlocksProps) {
  return (
    <div className="divide-y divide-gray-300 space-y-3">
      {content.map((block, index) => {
        if (block.type === 'text') {
          return (
            <div key={index} className="prose prose-sm max-w-none pt-3 first:pt-0">
              <ReactMarkdown>{block.text}</ReactMarkdown>
            </div>
          )
        }

        if (block.type === 'image') {
          return <Base64Image key={index} source={block.source} alt="User uploaded image" />
        }

        return null
      })}
    </div>
  )
}
