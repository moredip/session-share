import type { ToolResultContentItem } from '../../../domain/transcriptEntry'
import { CodeBlock } from './CodeBlock'
import { Base64Image } from '../Base64Image'

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
          return <Base64Image key={index} source={item.source} alt="Tool result image" />
        }
        return null
      })}
    </>
  )
}
