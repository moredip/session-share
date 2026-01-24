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
 * Structured entry variants for message types.
 * Discriminated union on the `kind` field.
 */
export type MessageStructuredEntry =
  | UserStructuredEntry
  | AssistantStructuredEntry
  | ProgressStructuredEntry
  | SystemStructuredEntry

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


/** Message types that represent actual conversation content */
export type MessageType = 'user' | 'assistant' | 'progress' | 'system'

/** Meta types that represent bookkeeping/internal state */
export type MetaType = 'file-history-snapshot' | 'queue-operation' | 'summary'

/**
 * Message entry - actual conversation content, always has uuid, timestamp, and parsed structure
 */
export interface MessageEntry {
  uuid: string
  timestamp: string
  type: MessageType
  raw: unknown
  structuredEntry: MessageStructuredEntry
}

/**
 * Meta entry - bookkeeping/snapshots, no uuid
 */
export interface MetaEntry {
  timestamp?: string
  type: MetaType
  raw: unknown
}

/**
 * Unified transcript entry - maps 1:1 with JSONL lines
 */
export type TranscriptEntry = MessageEntry | MetaEntry

/**
 * Type guard for message entries (vs meta entries)
 */
export function isMessageEntry(entry: TranscriptEntry): entry is MessageEntry {
  return 'uuid' in entry
}

/**
 * Type guard for displayable entries (user/assistant messages)
 */
export function isDisplayableEntry(entry: TranscriptEntry): entry is MessageEntry & {
  structuredEntry: UserStructuredEntry | AssistantStructuredEntry
} {
  if (!isMessageEntry(entry)) return false
  if (entry.structuredEntry.kind === 'user') {
    // Skip user messages that only contain tool results
    return !entry.structuredEntry.isToolResultOnly
  }
  return entry.structuredEntry.kind === 'assistant'
}
