import { Tool } from '@geist-ui/icons'
import type { GenericToolCall } from '../../../domain/transcriptEntry'
import { ExpandableMessageCard } from '../ExpandableMessageCard'
import { RawToolResult } from './RawToolResult'

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
        <pre className="text-xs bg-gray-50 p-3 overflow-x-auto border border-gray-200">
          {JSON.stringify(toolCall.input, null, 2)}
        </pre>
      }
      expandedContent={
        hasResult ? (
          <div>
            <hr className="border-gray-200 my-2" />
            <div className="text-sm font-medium text-gray-600 mb-2">Result:</div>
            <pre className="text-xs bg-gray-50 p-3 overflow-x-auto border border-gray-200 whitespace-pre-wrap">
              {toolCall.result}
            </pre>
            <RawToolResult data={toolCall.rawToolUseResult} />
          </div>
        ) : undefined
      }
    />
  )
}
