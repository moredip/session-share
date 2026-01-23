import { useState } from 'react'
import type { ToolCall } from '../domain/transcriptEntry'

interface ToolCallEntryProps {
  toolCall: ToolCall
}

export function ToolCallEntry({ toolCall }: ToolCallEntryProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-lg px-4 py-2 bg-amber-50 border border-amber-200 text-gray-900">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-xs hover:opacity-80 transition-opacity w-full"
        >
          <span className="opacity-60">{expanded ? '▼' : '▶'}</span>
          <span className="font-medium text-amber-700">🔧 {toolCall.name} tool</span>
          {toolCall.result !== undefined && (
            <span className="ml-auto text-green-600 text-xs">✓ completed</span>
          )}
        </button>
        {expanded && (
          <div className="mt-2 space-y-2">
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">Input:</div>
              <pre className="text-xs bg-white rounded p-2 overflow-x-auto border border-amber-100">
                {JSON.stringify(toolCall.input, null, 2)}
              </pre>
            </div>
            {toolCall.result !== undefined && (
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Result:</div>
                <pre className="text-xs bg-white rounded p-2 overflow-x-auto border border-amber-100 whitespace-pre-wrap">
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
