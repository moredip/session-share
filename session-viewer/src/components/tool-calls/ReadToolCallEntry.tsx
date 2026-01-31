import { Tool } from '@geist-ui/icons'
import type { ReadToolCall } from '../../domain/transcriptEntry'
import { extractFileName } from '../../domain/transcriptEntry'
import { ExpandableMessageCard } from '../ExpandableMessageCard'
import { RawToolResult } from './RawToolResult'

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

interface ReadToolCallEntryProps {
  toolCall: ReadToolCall
  anchorId: string
}

export function ReadToolCallEntry({ toolCall, anchorId }: ReadToolCallEntryProps) {
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
          <div>
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
