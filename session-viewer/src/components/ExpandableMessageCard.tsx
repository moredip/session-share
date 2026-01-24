import { useState } from 'react'
import { ChevronUp, ChevronDown } from '@geist-ui/icons'
import { AnchorLink } from './AnchorLink'

interface ExpandableMessageCardProps {
  anchorId: string
  headerContent: React.ReactNode
  defaultExpanded?: boolean
  canExpand?: boolean
  alwaysVisibleContent?: React.ReactNode
  expandedContent?: React.ReactNode
}

export function ExpandableMessageCard({
  anchorId,
  headerContent,
  defaultExpanded = false,
  canExpand = true,
  alwaysVisibleContent,
  expandedContent,
}: ExpandableMessageCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const showChevron = canExpand && expandedContent !== undefined

  const hasVisibleContent = alwaysVisibleContent || (expanded && expandedContent)

  return (
    <div id={anchorId} className="group flex justify-start items-start gap-2">
      <AnchorLink anchorId={anchorId} />
      <div className="w-[80%] border border-gray-300 overflow-hidden shadow-sm">
        <button
          onClick={() => canExpand && setExpanded(!expanded)}
          className={`w-full bg-gray-500 text-white px-4 py-1.5 font-medium flex items-center justify-between transition-colors ${canExpand ? 'hover:bg-gray-600 cursor-pointer' : 'cursor-default'}`}
          aria-label={showChevron ? (expanded ? 'Collapse' : 'Expand') : undefined}
        >
          {headerContent}
          {showChevron && (expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
        </button>
        {hasVisibleContent && (
          <div className="bg-white px-6 py-4 space-y-4">
            {alwaysVisibleContent}
            {expanded && expandedContent}
          </div>
        )}
      </div>
    </div>
  )
}
