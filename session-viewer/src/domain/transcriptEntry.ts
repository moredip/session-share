/**
 * Content block types for message entries
 */
export interface TextBlock {
  type: 'text'
  text: string
}

export interface ToolUseBlock {
  type: 'tool_use'
  id: string
  name: string
  input: Record<string, unknown>
}

export interface ThinkingBlock {
  type: 'thinking'
  thinking: string
}

export interface ToolResultBlock {
  type: 'tool_result'
  tool_use_id: string
  content: string | TextBlock[]
}

export type UserContentBlock = TextBlock | ToolResultBlock
export type AssistantContentBlock = TextBlock | ToolUseBlock | ThinkingBlock

/**
 * A tool call paired with its result (if available)
 */
export interface ToolCall {
  id: string
  name: string
  input: Record<string, unknown>
  result?: string
}

/**
 * Structured entry variants for different entry types.
 * Discriminated union on the `kind` field.
 */
export type StructuredEntry =
  | UserStructuredEntry
  | AssistantStructuredEntry
  | ProgressStructuredEntry
  | SystemStructuredEntry
  | FileHistorySnapshotStructuredEntry

export interface UserStructuredEntry {
  kind: 'user'
  role: 'user'
  content: string
  isToolResultOnly?: boolean
}

export interface AssistantStructuredEntry {
  kind: 'assistant'
  role: 'assistant'
  content: string
  thinkingContent?: string
  hasToolUse: boolean
  hasThinking: boolean
  toolCalls?: ToolCall[]
}

export interface ProgressStructuredEntry {
  kind: 'progress'
  progressType: string
  toolUseID?: string
  parentToolUseID?: string
  agentId?: string
}

export interface SystemStructuredEntry {
  kind: 'system'
  subtype: string
  durationMs?: number
}

export interface FileHistorySnapshotStructuredEntry {
  kind: 'file-history-snapshot'
  messageId: string
  isSnapshotUpdate: boolean
}

/**
 * Unified transcript entry - maps 1:1 with JSONL lines
 */
export interface TranscriptEntry {
  /** Unique identifier - optional, some entry types don't have it */
  uuid?: string

  /** ISO timestamp - optional */
  timestamp?: string

  /** Entry type from raw data */
  type: string

  /** The original unparsed JSON object */
  raw: unknown

  /** Parsed structured content, present when the entry type has a known schema */
  structuredEntry?: StructuredEntry
}

/**
 * Type guards for checking structured entry kinds
 */
export function isDisplayableEntry(entry: TranscriptEntry): entry is TranscriptEntry & {
  structuredEntry: UserStructuredEntry | AssistantStructuredEntry
} {
  if (entry.structuredEntry?.kind === 'user') {
    // Skip user messages that only contain tool results
    return !entry.structuredEntry.isToolResultOnly
  }
  return entry.structuredEntry?.kind === 'assistant'
}
