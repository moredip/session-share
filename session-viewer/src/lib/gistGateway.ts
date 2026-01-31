import { z } from 'zod'
import type {
  TranscriptEntry,
  MessageEntry,
  MetaEntry,
  MessageStructuredEntry,
  TextBlock,
  ToolCall,
  AssistantStructuredEntry,
  UserStructuredEntry,
} from '../domain/transcriptEntry'

interface GistFile {
  filename: string
  raw_url: string
}

interface GistResponse {
  files: Record<string, GistFile>
}

// Zod schemas for validation
const TextBlockSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
})

const ToolUseBlockSchema = z.object({
  type: z.literal('tool_use'),
  id: z.string(),
  name: z.string(),
  input: z.record(z.unknown()),
})

const ThinkingBlockSchema = z.object({
  type: z.literal('thinking'),
  thinking: z.string(),
})

const ToolResultBlockSchema = z.object({
  type: z.literal('tool_result'),
  tool_use_id: z.string(),
  content: z.union([z.string(), z.array(TextBlockSchema)]),
})

const ReadToolInputSchema = z.object({
  file_path: z.string(),
  offset: z.number().optional(),
  limit: z.number().optional(),
})

const EditToolInputSchema = z.object({
  file_path: z.string(),
  old_string: z.string(),
  new_string: z.string(),
  replace_all: z.boolean(),
})

const AssistantContentBlockSchema = z.discriminatedUnion('type', [
  TextBlockSchema,
  ToolUseBlockSchema,
  ThinkingBlockSchema,
])

const UserContentBlockSchema = z.discriminatedUnion('type', [
  TextBlockSchema,
  ToolResultBlockSchema,
])

const UserContentSchema = z.union([z.string(), z.array(UserContentBlockSchema)])

const UserMessageEntrySchema = z.object({
  uuid: z.string(),
  parentUuid: z.string().nullable(),
  type: z.literal('user'),
  timestamp: z.string(),
  sessionId: z.string(),
  message: z.object({
    role: z.literal('user'),
    content: UserContentSchema,
  }),
})

const AssistantMessageEntrySchema = z.object({
  uuid: z.string(),
  parentUuid: z.string().nullable(),
  type: z.literal('assistant'),
  timestamp: z.string(),
  sessionId: z.string().optional(),
  message: z.object({
    role: z.literal('assistant'),
    content: z.array(AssistantContentBlockSchema),
  }),
})

const ProgressEntrySchema = z.object({
  uuid: z.string(),
  type: z.literal('progress'),
  timestamp: z.string(),
  data: z
    .object({
      type: z.string(),
    })
    .passthrough(),
  toolUseID: z.string().optional(),
  parentToolUseID: z.string().optional(),
})

const SystemEntrySchema = z.object({
  uuid: z.string(),
  type: z.literal('system'),
  timestamp: z.string(),
  subtype: z.string(),
  durationMs: z.number().optional(),
})

/** Meta entry types - no structured parsing needed */
const META_TYPES = ['file-history-snapshot', 'queue-operation', 'summary'] as const

export interface TranscriptData {
  entries: TranscriptEntry[]
}

/** Extracted tool result for correlation */
interface ExtractedToolResult {
  toolUseId: string
  content: string
}

function parseToolCall(block: z.infer<typeof ToolUseBlockSchema>): ToolCall {
  if (block.name === 'Read') {
    const result = ReadToolInputSchema.safeParse(block.input)
    if (result.success) {
      return {
        kind: 'read',
        id: block.id,
        name: 'Read',
        input: result.data,
      }
    }
    // Invalid Read tool input - log warning and fall back to generic
    console.warn(
      `Read tool call has invalid input (id: ${block.id}):`,
      result.error.format(),
      block.input
    )
  }

  if (block.name === 'Edit') {
    const result = EditToolInputSchema.safeParse(block.input)
    if (result.success) {
      return {
        kind: 'edit',
        id: block.id,
        name: 'Edit',
        input: result.data,
      }
    }
    // Invalid Edit tool input - log warning and fall back to generic
    console.warn(
      `Edit tool call has invalid input (id: ${block.id}):`,
      result.error.format(),
      block.input
    )
  }

  return {
    kind: 'generic',
    id: block.id,
    name: block.name,
    input: block.input,
  }
}

/**
 * Parse a user message entry into a structured entry
 */
function parseUserStructuredEntry(parsed: unknown):
  | {
      entry: UserStructuredEntry
      toolResults: ExtractedToolResult[]
    }
  | undefined {
  const result = UserMessageEntrySchema.safeParse(parsed)
  if (!result.success) return undefined

  const entryData = result.data
  const toolResults: ExtractedToolResult[] = []

  if (typeof entryData.message.content === 'string') {
    return {
      entry: {
        kind: 'user',
        role: 'user',
        content: entryData.message.content,
      },
      toolResults: [],
    }
  }

  // Extract text content
  const textBlocks = entryData.message.content.filter(
    (block): block is TextBlock => block.type === 'text'
  )
  const content = textBlocks.map((block) => block.text).join('\n')

  // Extract tool results
  const toolResultBlocks = entryData.message.content.filter(
    (block): block is z.infer<typeof ToolResultBlockSchema> => block.type === 'tool_result'
  )

  for (const block of toolResultBlocks) {
    const resultContent =
      typeof block.content === 'string'
        ? block.content
        : block.content.map((tb) => tb.text).join('\n')
    toolResults.push({
      toolUseId: block.tool_use_id,
      content: resultContent,
    })
  }

  // Determine if this is a tool-result-only message (no text content)
  const isToolResultOnly = textBlocks.length === 0 && toolResultBlocks.length > 0

  return {
    entry: {
      kind: 'user',
      role: 'user',
      content,
      isToolResultOnly,
    },
    toolResults,
  }
}

function parseAssistantStructuredEntry(parsed: unknown): AssistantStructuredEntry | undefined {
  const result = AssistantMessageEntrySchema.safeParse(parsed)
  if (!result.success) return undefined

  const entry = result.data
  const textContent = entry.message.content
    .filter((block): block is z.infer<typeof TextBlockSchema> => block.type === 'text')
    .map((block) => block.text)
    .join('\n')

  const thinkingContent = entry.message.content
    .filter((block): block is z.infer<typeof ThinkingBlockSchema> => block.type === 'thinking')
    .map((block) => block.thinking)
    .join('\n')

  const toolUseBlocks = entry.message.content.filter(
    (block): block is z.infer<typeof ToolUseBlockSchema> => block.type === 'tool_use'
  )

  const hasToolUse = toolUseBlocks.length > 0
  const hasThinking = entry.message.content.some((block) => block.type === 'thinking')

  // Extract tool calls (results will be attached in correlation pass)
  const toolCalls: ToolCall[] = toolUseBlocks.map(parseToolCall)

  return {
    kind: 'assistant',
    role: 'assistant',
    content: textContent,
    thinkingContent: hasThinking ? thinkingContent : undefined,
    hasToolUse,
    hasThinking,
    toolCalls: hasToolUse ? toolCalls : undefined,
  }
}

function parseProgressStructuredEntry(parsed: unknown): MessageStructuredEntry | undefined {
  const result = ProgressEntrySchema.safeParse(parsed)
  if (!result.success) return undefined

  const entry = result.data
  const data = entry.data as { type: string; agentId?: string }

  return {
    kind: 'progress',
    progressType: data.type,
    toolUseID: entry.toolUseID,
    parentToolUseID: entry.parentToolUseID,
    agentId: data.agentId,
  }
}

function parseSystemStructuredEntry(parsed: unknown): MessageStructuredEntry | undefined {
  const result = SystemEntrySchema.safeParse(parsed)
  if (!result.success) return undefined

  const entry = result.data

  return {
    kind: 'system',
    subtype: entry.subtype,
    durationMs: entry.durationMs,
  }
}

function parseStructuredEntry(parsed: unknown, type: string): MessageStructuredEntry | undefined {
  switch (type) {
    case 'user': {
      const result = parseUserStructuredEntry(parsed)
      return result?.entry
    }
    case 'assistant':
      return parseAssistantStructuredEntry(parsed)
    case 'progress':
      return parseProgressStructuredEntry(parsed)
    case 'system':
      return parseSystemStructuredEntry(parsed)
    default:
      return undefined
  }
}

function isMetaType(type: string): type is (typeof META_TYPES)[number] {
  return META_TYPES.includes(type as (typeof META_TYPES)[number])
}

function parseEntries(jsonlContent: string): TranscriptEntry[] {
  const lines = jsonlContent.trim().split('\n')
  const entries: TranscriptEntry[] = []

  // Map of tool_use_id → ToolCall reference for correlation
  const toolCallMap = new Map<string, ToolCall>()

  for (const line of lines) {
    if (!line.trim()) continue

    const parsed = JSON.parse(line)
    const type = parsed.type ?? 'unknown'

    // Meta entries - no uuid, no structured parsing
    if (isMetaType(type)) {
      const metaEntry: MetaEntry = {
        timestamp: parsed.timestamp,
        type,
        raw: parsed,
      }
      entries.push(metaEntry)
      continue
    }

    // Message entries - have uuid and must parse successfully
    let structuredEntry: MessageStructuredEntry | undefined

    if (type === 'user') {
      const result = parseUserStructuredEntry(parsed)
      if (result) {
        structuredEntry = result.entry
        // Correlate tool results to their calls
        for (const toolResult of result.toolResults) {
          const toolCall = toolCallMap.get(toolResult.toolUseId)
          if (toolCall) {
            toolCall.result = toolResult.content
          }
        }
      }
    } else if (type === 'assistant') {
      const assistantEntry = parseAssistantStructuredEntry(parsed)
      structuredEntry = assistantEntry
      // Register tool calls for later correlation
      if (assistantEntry?.toolCalls) {
        for (const toolCall of assistantEntry.toolCalls) {
          toolCallMap.set(toolCall.id, toolCall)
        }
      }
    } else {
      structuredEntry = parseStructuredEntry(parsed, type)
    }

    if (!structuredEntry) {
      throw new Error(`Failed to parse message entry of type "${type}": ${JSON.stringify(parsed)}`)
    }

    const messageEntry: MessageEntry = {
      uuid: parsed.uuid,
      timestamp: parsed.timestamp,
      type: type as MessageEntry['type'],
      raw: parsed,
      structuredEntry,
    }
    entries.push(messageEntry)
  }

  return entries
}

export async function fetchGistTranscriptFull(gistId: string): Promise<TranscriptData> {
  const metaResponse = await fetch(`https://api.github.com/gists/${gistId}`)
  if (!metaResponse.ok) {
    throw new Error(`Failed to fetch gist metadata: ${metaResponse.status}`)
  }

  const gist: GistResponse = await metaResponse.json()

  const jsonlFile = Object.values(gist.files).find((f) => f.filename.endsWith('.jsonl'))

  if (!jsonlFile) {
    throw new Error('No .jsonl file found in gist')
  }

  const contentResponse = await fetch(jsonlFile.raw_url)
  if (!contentResponse.ok) {
    throw new Error(`Failed to fetch transcript content: ${contentResponse.status}`)
  }

  const content = await contentResponse.text()
  return {
    entries: parseEntries(content),
  }
}
