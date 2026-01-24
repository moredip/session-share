import { useState } from 'react'
import { ChevronUp, ChevronDown } from '@geist-ui/icons'
import { BrainIcon } from './icons/BrainIcon'
import { AnchorLink } from './AnchorLink'

interface AssistantThinkingProps {
  content: string
  defaultExpanded?: boolean
  anchorId: string
}

export function AssistantThinking({ content, defaultExpanded = false, anchorId }: AssistantThinkingProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div id={anchorId} className="group flex justify-start items-start gap-2">
      <AnchorLink anchorId={anchorId} />
      <div className="w-[80%] border border-gray-300 overflow-hidden shadow-sm">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full bg-gray-500 text-white px-4 py-1.5 font-medium hover:bg-gray-600 transition-colors flex items-center justify-between"
        >
          <span className="flex items-center gap-1.5">
            <BrainIcon size={14} /> <em>thinking...</em>
          </span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expanded && (
          <div className="bg-white px-6 py-4">
            <div className="prose prose-sm max-w-none whitespace-pre-wrap italic">{content}</div>
          </div>
        )}
      </div>
    </div>
  )
}
