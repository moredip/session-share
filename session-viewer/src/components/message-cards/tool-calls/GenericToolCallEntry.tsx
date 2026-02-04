import { Tool } from '@geist-ui/icons'
import type { GenericToolCall } from '../../../domain/transcriptEntry'
import { ExpandableMessageCard } from '../ExpandableMessageCard'
import { CodeBlock } from './CodeBlock'
import { RawToolResult } from './RawToolResult'
import { ToolResultContent } from './ToolResultContent'

interface GenericToolCallEntryProps {
  toolCall: GenericToolCall
  anchorId: string
}

export function GenericToolCallEntry({ toolCall, anchorId }: GenericToolCallEntryProps) {
  const hasResult = toolCall.result !== undefined

  return (
    <ExpandableMessageCard
      anchorId={anchorId}
      canExpand={hasResult}
      headerContent={
        <span className="flex items-center gap-1.5">
          <Tool size={14} /> {toolCall.name}
        </span>
      }
      alwaysVisibleContent={
        <CodeBlock wrap={false}>{JSON.stringify(toolCall.input, null, 2)}</CodeBlock>
      }
      expandedContent={
        hasResult ? (
          <div>
            <hr className="border-gray-200 my-2" />
            <div className="text-sm font-medium text-gray-600 mb-2">Result:</div>
            <ToolResultContent content={toolCall.result!} />
            <RawToolResult data={toolCall.rawToolUseResult} />
          </div>
        ) : undefined
      }
    />
  )
}
