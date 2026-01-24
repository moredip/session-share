import { useState } from 'react'
import { ChevronUp, ChevronDown, Tool } from '@geist-ui/icons'
import type { ToolCall } from '../domain/transcriptEntry'

interface ToolCallEntryProps {
  toolCall: ToolCall
}

export function ToolCallEntry({ toolCall }: ToolCallEntryProps) {
  const [expanded, setExpanded] = useState(false)
  const hasResult = toolCall.result !== undefined

  return (
    <div className="flex justify-start">
      <div className="w-[80%] border border-gray-300 overflow-hidden shadow-sm">
        <button
          onClick={() => hasResult && setExpanded(!expanded)}
          className={`w-full bg-gray-500 text-white px-4 py-1.5 font-medium flex items-center justify-between transition-colors ${hasResult ? 'hover:bg-gray-600 cursor-pointer' : 'cursor-default'}`}
          aria-label={hasResult ? (expanded ? 'Collapse result' : 'Expand result') : undefined}
        >
          <span className="flex items-center gap-1.5">
            <Tool size={14} /> {toolCall.name}
          </span>
          {hasResult && (expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
        </button>
        <div className="bg-white px-6 py-4 space-y-4">
          <pre className="text-xs bg-gray-50 p-3 overflow-x-auto border border-gray-200">
            {JSON.stringify(toolCall.input, null, 2)}
          </pre>
          {expanded && hasResult && (
            <div>
              <hr className="border-gray-200 my-2" />
              <div className="text-sm font-medium text-gray-600 mb-2">Result:</div>
              <pre className="text-xs bg-gray-50 p-3 overflow-x-auto border border-gray-200 whitespace-pre-wrap">
                {toolCall.result}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
