import { useState } from 'react'
import { ChevronUp, ChevronDown } from '@geist-ui/icons'
import { AnchorLink } from './AnchorLink'

type ColorVariant = 'sky' | 'custard' | 'gray'

const variantStyles: Record<ColorVariant, { header: string; headerHover: string; border: string; body: string }> = {
  sky: {
    header: 'bg-sky-500 text-white',
    headerHover: 'hover:bg-sky-600',
    border: 'border-sky-300',
    body: 'bg-sky-50',
  },
  custard: {
    header: 'bg-custard-500 text-white',
    headerHover: 'hover:bg-custard-600',
    border: 'border-custard-300',
    body: 'bg-custard-50',
  },
  gray: {
    header: 'bg-custard-200 text-custard-700',
    headerHover: 'hover:bg-custard-300',
    border: 'border-custard-100',
    body: 'bg-custard-50/50',
  },
}

interface ExpandableMessageCardProps {
  anchorId: string
  headerContent: React.ReactNode
  defaultExpanded?: boolean
  canExpand?: boolean
  variant?: ColorVariant
  alwaysVisibleContent?: React.ReactNode
  expandedContent?: React.ReactNode
}

export function ExpandableMessageCard({
  anchorId,
  headerContent,
  defaultExpanded = false,
  canExpand = true,
  variant = 'gray',
  alwaysVisibleContent,
  expandedContent,
}: ExpandableMessageCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const showChevron = canExpand && expandedContent !== undefined
  const styles = variantStyles[variant]

  const hasVisibleContent = alwaysVisibleContent || (expanded && expandedContent)

  return (
    <div id={anchorId} className="group flex justify-start items-start gap-2">
      <AnchorLink anchorId={anchorId} />
      <div className={`w-[80%] border ${styles.border} overflow-hidden shadow-sm`}>
        <button
          onClick={() => canExpand && setExpanded(!expanded)}
          className={`w-full ${styles.header} px-4 py-1.5 font-medium flex items-center justify-between transition-colors ${canExpand ? `${styles.headerHover} cursor-pointer` : 'cursor-default'}`}
          aria-label={showChevron ? (expanded ? 'Collapse' : 'Expand') : undefined}
        >
          {headerContent}
          {showChevron && (expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
        </button>
        {hasVisibleContent && (
          <div className={`${styles.body} px-6 py-4 space-y-4`}>
            {alwaysVisibleContent}
            {expanded && expandedContent}
          </div>
        )}
      </div>
    </div>
  )
}
