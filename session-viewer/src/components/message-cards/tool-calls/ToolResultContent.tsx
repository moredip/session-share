import type { ToolResultContentItem } from '../../../domain/transcriptEntry'
import { CodeBlock } from './CodeBlock'

interface ToolResultContentProps {
  content: ToolResultContentItem[]
}

export function ToolResultContent({ content }: ToolResultContentProps) {
  return (
    <>
      {content.map((item, index) => {
        if (item.type === 'text') {
          return <CodeBlock key={index}>{item.text}</CodeBlock>
        }
        if (item.type === 'image') {
          const src = `data:${item.source.media_type};base64,${item.source.data}`
          return (
            <img
              key={index}
              src={src}
              alt="Tool result image"
              className="max-w-full rounded-lg border border-gray-200"
            />
          )
        }
        return null
      })}
    </>
  )
}
