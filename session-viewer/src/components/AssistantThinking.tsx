import { BrainIcon } from './icons/BrainIcon'
import { ExpandableMessageCard } from './ExpandableMessageCard'

interface AssistantThinkingProps {
  content: string
  defaultExpanded?: boolean
  anchorId: string
}

export function AssistantThinking({ content, defaultExpanded = false, anchorId }: AssistantThinkingProps) {
  return (
    <ExpandableMessageCard
      anchorId={anchorId}
      defaultExpanded={defaultExpanded}
      headerContent={
        <span className="flex items-center gap-1.5">
          <BrainIcon size={14} /> <em>thinking...</em>
        </span>
      }
      expandedContent={
        <div className="prose prose-sm max-w-none whitespace-pre-wrap italic">{content}</div>
      }
    />
  )
}
