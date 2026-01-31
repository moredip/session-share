import { Tool } from '@geist-ui/icons'
import type { ToolCall, ReadToolCall, GenericToolCall } from '../domain/transcriptEntry'
import { isReadToolCall, isEditToolCall, extractFileName } from '../domain/transcriptEntry'
import { ExpandableMessageCard } from './ExpandableMessageCard'

interface ToolCallEntryProps {
  toolCall: ToolCall
  anchorId: string
}

function formatReadToolHeader(toolCall: ReadToolCall): string {
  const fileName = extractFileName(toolCall.input.file_path)
  const { offset, limit } = toolCall.input

  // Format line range notation, reproducing what the CC VS Code extension looks like
  if (offset !== undefined && limit !== undefined) {
    const endLine = offset + limit - 1
    return `Read ${fileName} (lines ${offset}-${endLine})`
  } else if (offset !== undefined) {
    return `Read ${fileName} (from line ${offset})`
  } else if (limit !== undefined) {
    const endLine = limit - 1
    return `Read ${fileName} (lines 0-${endLine})`
  } else {
    return `Read ${fileName}`
  }
}

function ReadToolCallEntry({ toolCall, anchorId }: { toolCall: ReadToolCall; anchorId: string }) {
  const hasResult = toolCall.result !== undefined

  return (
    <ExpandableMessageCard
      anchorId={anchorId}
      canExpand={hasResult}
      headerContent={
        <span className="flex items-center gap-1.5">
          <Tool size={14} /> {formatReadToolHeader(toolCall)}
        </span>
      }
      alwaysVisibleContent={null}
      expandedContent={
        hasResult ? (
          <pre className="text-xs bg-gray-50 p-3 overflow-x-auto border border-gray-200 whitespace-pre-wrap">
            {toolCall.result}
          </pre>
        ) : undefined
      }
    />
  )
}

function GenericToolCallEntry({ toolCall, anchorId }: { toolCall: GenericToolCall; anchorId: string }) {
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
          </div>
        ) : undefined
      }
    />
  )
}

export function ToolCallEntry({ toolCall, anchorId }: ToolCallEntryProps) {
  if (isReadToolCall(toolCall)) {
    return <ReadToolCallEntry toolCall={toolCall} anchorId={anchorId} />
  }

  if (isEditToolCall(toolCall)) {
    // TODO: Implement EditToolCallEntry component
    // For now, render as generic to satisfy TypeScript
    return <GenericToolCallEntry toolCall={toolCall as unknown as GenericToolCall} anchorId={anchorId} />
  }

  return <GenericToolCallEntry toolCall={toolCall} anchorId={anchorId} />
}
