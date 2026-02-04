/**
 * Content block types for message entries
 */
export interface TextBlock {
  type: 'text'
  text: string
}

export interface ImageSource {
  type: 'base64'
  media_type: string
  data: string
}

export interface ImageBlock {
  type: 'image'
  source: ImageSource
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

export type ToolResultContentItem = TextBlock | ImageBlock

export interface ToolResultBlock {
  type: 'tool_result'
  tool_use_id: string
  content: ToolResultContentItem[]
}

export type UserContentBlock = TextBlock | ImageBlock | ToolResultBlock
export type AssistantContentBlock = TextBlock | ToolUseBlock | ThinkingBlock

/**
 * A tool call paired with its result (if available)
 */

export interface BaseToolCall {
  id: string
  name: string
  result?: ToolResultContentItem[]
  rawToolUseResult?: unknown
}

export interface GenericToolCall extends BaseToolCall {
  kind: 'generic'
  input: Record<string, unknown>
}

export interface ReadToolInput {
  file_path: string
  offset?: number
  limit?: number
}

export interface ReadToolCall extends BaseToolCall {
  kind: 'read'
  name: 'Read'
  input: ReadToolInput
}

export interface EditToolInput {
  file_path: string
  old_string: string
  new_string: string
  replace_all: boolean
}

export interface EditToolPatchHunk {
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  lines: string[]
}

export interface EditToolResult {
  filePath: string
  oldString: string
  newString: string
  originalFile: string
  structuredPatch: EditToolPatchHunk[]
  userModified: boolean
  replaceAll: boolean
}

export interface EditToolCall extends BaseToolCall {
  kind: 'edit'
  name: 'Edit'
  input: EditToolInput
  toolUseResult?: EditToolResult
}

// Discriminated union (extensible for future tools)
export type ToolCall = GenericToolCall | ReadToolCall | EditToolCall

export function isReadToolCall(toolCall: ToolCall): toolCall is ReadToolCall {
  return toolCall.kind === 'read'
}

export function isEditToolCall(toolCall: ToolCall): toolCall is EditToolCall {
  return toolCall.kind === 'edit'
}

export function extractFileName(filePath: string): string {
  return filePath.split('/').pop() ?? filePath
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
  content: UserContentBlock[]
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

export interface MessageEntry {
  uuid: string
  timestamp: string
  type: MessageType
  raw: unknown
  structuredEntry: MessageStructuredEntry
}

export interface MetaEntry {
  timestamp?: string
  type: MetaType
  raw: unknown
}

/**
 * Unified transcript entry - maps 1:1 with JSONL lines
 */
export type TranscriptEntry = MessageEntry | MetaEntry

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
