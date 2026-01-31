import { Tool } from '@geist-ui/icons'
import type { EditToolCall } from '../../../domain/transcriptEntry'
import { extractFileName } from '../../../domain/transcriptEntry'
import { ExpandableMessageCard } from '../ExpandableMessageCard'
import { RawToolResult } from './RawToolResult'
import { parseDiff, Diff, Hunk } from 'react-diff-view'
import 'react-diff-view/style/index.css'

interface EditToolCallEntryProps {
  toolCall: EditToolCall
  anchorId: string
}

export function EditToolCallEntry({ toolCall, anchorId }: EditToolCallEntryProps) {
  const fileName = extractFileName(toolCall.input.file_path)
  const hasResult = toolCall.result !== undefined
  const hasDiffData = toolCall.toolUseResult?.structuredPatch !== undefined

  const generateUnifiedDiff = () => {
    if (!toolCall.toolUseResult) return ''

    const { filePath, structuredPatch } = toolCall.toolUseResult
    let diff = `--- a/${filePath}\n+++ b/${filePath}\n`

    for (const hunk of structuredPatch) {
      diff += `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@\n`
      diff += hunk.lines.join('\n') + '\n'
    }

    return diff
  }

  const renderDiff = () => {
    if (!hasDiffData) return null

    const unifiedDiff = generateUnifiedDiff()
    const [diffFile] = parseDiff(unifiedDiff)

    if (!diffFile) return null

    return (
      <div className="mb-4">
        <Diff viewType="unified" diffType={diffFile.type} hunks={diffFile.hunks}>
          {(hunks) => hunks.map((hunk) => <Hunk key={hunk.content} hunk={hunk} />)}
        </Diff>
      </div>
    )
  }

  return (
    <ExpandableMessageCard
      anchorId={anchorId}
      canExpand={hasResult}
      headerContent={
        <span className="flex items-center gap-1.5">
          <Tool size={14} /> Edit {fileName}
        </span>
      }
      alwaysVisibleContent={null}
      expandedContent={
        hasResult ? (
          <div>
            {renderDiff()}
            <RawToolResult data={toolCall.rawToolUseResult || toolCall.input} />
          </div>
        ) : undefined
      }
    />
  )
}
