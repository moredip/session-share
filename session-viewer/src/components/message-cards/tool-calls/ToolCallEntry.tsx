import type { ToolCall } from '../../../domain/transcriptEntry'
import { isReadToolCall, isEditToolCall } from '../../../domain/transcriptEntry'
import { ReadToolCallEntry } from './ReadToolCallEntry'
import { EditToolCallEntry } from './EditToolCallEntry'
import { GenericToolCallEntry } from './GenericToolCallEntry'

interface ToolCallEntryProps {
  toolCall: ToolCall
  anchorId: string
}

export function ToolCallEntry({ toolCall, anchorId }: ToolCallEntryProps) {
  if (isReadToolCall(toolCall)) {
    return <ReadToolCallEntry toolCall={toolCall} anchorId={anchorId} />
  }

  if (isEditToolCall(toolCall)) {
    return <EditToolCallEntry toolCall={toolCall} anchorId={anchorId} />
  }

  return <GenericToolCallEntry toolCall={toolCall} anchorId={anchorId} />
}
