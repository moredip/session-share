import { z } from 'zod'
import type { TranscriptEntry, StructuredEntry, TextBlock } from '../domain/transcriptEntry'

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

const FileHistorySnapshotEntrySchema = z.object({
  type: z.literal('file-history-snapshot'),
  messageId: z.string(),
  isSnapshotUpdate: z.boolean(),
})

export interface TranscriptData {
  entries: TranscriptEntry[]
}

/**
 * Parse a user message entry into a structured entry
 */
function parseUserStructuredEntry(parsed: unknown): StructuredEntry | undefined {
  const result = UserMessageEntrySchema.safeParse(parsed)
  if (!result.success) return undefined

  const entry = result.data
  const content =
    typeof entry.message.content === 'string'
      ? entry.message.content
      : entry.message.content
          .filter((block): block is TextBlock => block.type === 'text')
          .map((block) => block.text)
          .join('\n')

  return {
    kind: 'user',
    role: 'user',
    content,
  }
}

function parseAssistantStructuredEntry(parsed: unknown): StructuredEntry | undefined {
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

  const hasToolUse = entry.message.content.some((block) => block.type === 'tool_use')
  const hasThinking = entry.message.content.some((block) => block.type === 'thinking')

  return {
    kind: 'assistant',
    role: 'assistant',
    content: textContent,
    thinkingContent: hasThinking ? thinkingContent : undefined,
    hasToolUse,
    hasThinking,
  }
}

function parseProgressStructuredEntry(parsed: unknown): StructuredEntry | undefined {
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

function parseSystemStructuredEntry(parsed: unknown): StructuredEntry | undefined {
  const result = SystemEntrySchema.safeParse(parsed)
  if (!result.success) return undefined

  const entry = result.data

  return {
    kind: 'system',
    subtype: entry.subtype,
    durationMs: entry.durationMs,
  }
}

function parseFileHistorySnapshotStructuredEntry(parsed: unknown): StructuredEntry | undefined {
  const result = FileHistorySnapshotEntrySchema.safeParse(parsed)
  if (!result.success) return undefined

  const entry = result.data

  return {
    kind: 'file-history-snapshot',
    messageId: entry.messageId,
    isSnapshotUpdate: entry.isSnapshotUpdate,
  }
}

function parseStructuredEntry(parsed: unknown, type: string): StructuredEntry | undefined {
  switch (type) {
    case 'user':
      return parseUserStructuredEntry(parsed)
    case 'assistant':
      return parseAssistantStructuredEntry(parsed)
    case 'progress':
      return parseProgressStructuredEntry(parsed)
    case 'system':
      return parseSystemStructuredEntry(parsed)
    case 'file-history-snapshot':
      return parseFileHistorySnapshotStructuredEntry(parsed)
    default:
      return undefined
  }
}

function parseEntries(jsonlContent: string): TranscriptEntry[] {
  const lines = jsonlContent.trim().split('\n')
  const entries: TranscriptEntry[] = []

  for (const line of lines) {
    if (!line.trim()) continue

    const parsed = JSON.parse(line)
    const type = parsed.type ?? 'unknown'

    entries.push({
      uuid: parsed.uuid,
      timestamp: parsed.timestamp,
      type,
      raw: parsed,
      structuredEntry: parseStructuredEntry(parsed, type),
    })
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
