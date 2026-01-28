import { Tool } from '@geist-ui/icons'
import type { ToolCall } from '../domain/transcriptEntry'
import { ExpandableMessageCard } from './ExpandableMessageCard'

/**
 * Generate a TUI-style summary for the Read tool
 * Examples: "Read(/path/to/file)" or "Read(/path/to/file:10-30)"
 */
function getReadSummary(input: Record<string, unknown>): string {
  const filePath = input.file_path as string | undefined
  if (!filePath) return 'Read(?)'

  const offset = input.offset as number | undefined
  const limit = input.limit as number | undefined

  if (offset !== undefined && limit !== undefined) {
    const startLine = offset
    const endLine = offset + limit - 1
    return `Read(${filePath}:${startLine}-${endLine})`
  } else if (limit !== undefined) {
    return `Read(${filePath}:1-${limit})`
  }

  return `Read(${filePath})`
}

/**
 * Generate a TUI-style summary string for a tool call
 * Returns the tool name with relevant parameters in parentheses
 */
function getToolSummary(toolCall: ToolCall): string {
  switch (toolCall.name) {
    case 'Read':
      return getReadSummary(toolCall.input)
    default:
      // Fallback: just show tool name
      return toolCall.name
  }
}

interface ToolCallEntryProps {
  toolCall: ToolCall
  anchorId: string
}

export function ToolCallEntry({ toolCall, anchorId }: ToolCallEntryProps) {
  const hasResult = toolCall.result !== undefined
  const summary = getToolSummary(toolCall)
  const hasSpecialRendering = toolCall.name === 'Read'

  return (
    <ExpandableMessageCard
      anchorId={anchorId}
      canExpand={true}
      defaultExpanded={false}
      headerContent={
        <span className="flex items-center gap-1.5 font-mono text-sm">
          <Tool size={14} /> {summary}
        </span>
      }
      expandedContent={
        <div className="space-y-3">
          {!hasSpecialRendering && (
            <>
              <div className="text-sm font-medium text-gray-600">Input:</div>
              <pre className="text-xs bg-gray-50 p-3 overflow-x-auto border border-gray-200">
                {JSON.stringify(toolCall.input, null, 2)}
              </pre>
            </>
          )}
          {hasResult && (
            <>
              <div className="text-sm font-medium text-gray-600">Result:</div>
              <pre className="text-xs bg-gray-50 p-3 overflow-x-auto border border-gray-200 whitespace-pre-wrap">
                {toolCall.result}
              </pre>
            </>
          )}
        </div>
      }
    />
  )
}
