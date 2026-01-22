import { useState } from 'react'

interface AssistantThinkingProps {
  content: string
  defaultExpanded?: boolean
}

export function AssistantThinking({ content, defaultExpanded = false }: AssistantThinkingProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-lg px-4 py-2 bg-indigo-50 text-gray-900 italic">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-xs opacity-60 mb-1 hover:opacity-100 transition-opacity"
        >
          <span>Assistant [thinking]</span>
          <span>{expanded ? '▼' : '▶'}</span>
        </button>
        {expanded && (
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">{content}</div>
        )}
      </div>
    </div>
  )
}
