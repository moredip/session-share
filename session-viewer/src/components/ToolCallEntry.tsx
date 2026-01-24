import { useState } from 'react'
import { ChevronUp, ChevronDown, Tool } from '@geist-ui/icons'
import type { ToolCall } from '../domain/transcriptEntry'

interface ToolCallEntryProps {
  toolCall: ToolCall
}

export function ToolCallEntry({ toolCall }: ToolCallEntryProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="flex justify-start">
      <div className="w-[80%] border border-gray-300 overflow-hidden shadow-sm">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full bg-gray-500 text-white px-4 py-1.5 font-medium hover:bg-gray-600 transition-colors flex items-center justify-between"
        >
          <span className="flex items-center gap-1.5">
            <Tool size={14} /> {toolCall.name}
          </span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expanded && (
          <div className="bg-white px-6 py-4 space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">Input:</div>
              <pre className="text-xs bg-gray-50 p-3 overflow-x-auto border border-gray-200">
                {JSON.stringify(toolCall.input, null, 2)}
              </pre>
            </div>
            {toolCall.result !== undefined && (
              <div>
                <div className="text-sm font-medium text-gray-600 mb-2">Result:</div>
                <pre className="text-xs bg-gray-50 p-3 overflow-x-auto border border-gray-200 whitespace-pre-wrap">
                  {toolCall.result}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
