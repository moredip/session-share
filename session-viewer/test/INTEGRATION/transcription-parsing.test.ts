import { describe, it, expect } from 'vitest'
import { parseEntries } from '../../src/lib/gistGateway'
import type {
  TranscriptEntry,
  MessageEntry,
  UserStructuredEntry,
  AssistantStructuredEntry,
} from '../../src/domain/transcriptEntry'

function assertIsMessageEntry(entry: TranscriptEntry): asserts entry is MessageEntry {
  expect(entry).toHaveProperty('uuid')
}

function assertIsUserStructured(
  entry: MessageEntry
): asserts entry is MessageEntry & { structuredEntry: UserStructuredEntry } {
  expect(entry.type).toBe('user')
  expect(entry.structuredEntry.kind).toBe('user')
}

function assertIsAssistantStructured(
  entry: MessageEntry
): asserts entry is MessageEntry & { structuredEntry: AssistantStructuredEntry } {
  expect(entry.type).toBe('assistant')
  expect(entry.structuredEntry.kind).toBe('assistant')
}

describe('transcription parsing integration', () => {
  it('parses a complete conversation with user and assistant messages', () => {
    const userMessage = {
      uuid: 'user-123',
      parentUuid: null,
      type: 'user',
      timestamp: '2026-02-04T10:00:00.000Z',
      sessionId: 'session-abc',
      message: {
        role: 'user',
        content: 'Hello, Claude!',
      },
    }

    const assistantMessage = {
      uuid: 'assistant-456',
      parentUuid: 'user-123',
      type: 'assistant',
      timestamp: '2026-02-04T10:00:01.000Z',
      sessionId: 'session-abc',
      message: {
        role: 'assistant',
        content: [{ type: 'text', text: 'Hello! How can I help you today?' }],
      },
    }

    const jsonl = [JSON.stringify(userMessage), JSON.stringify(assistantMessage)].join('\n')

    const entries = parseEntries(jsonl)

    expect(entries).toHaveLength(2)

    // --- First entry: User message ---
    const userEntry = entries[0]
    assertIsMessageEntry(userEntry)
    assertIsUserStructured(userEntry)

    expect(userEntry.uuid).toBe('user-123')
    expect(userEntry.timestamp).toBe('2026-02-04T10:00:00.000Z')
    expect(userEntry.raw).toEqual(userMessage)

    expect(userEntry.structuredEntry.role).toBe('user')
    expect(userEntry.structuredEntry.isToolResultOnly).toBe(false)
    expect(userEntry.structuredEntry.content).toHaveLength(1)
    expect(userEntry.structuredEntry.content[0]).toEqual({
      type: 'text',
      text: 'Hello, Claude!',
    })

    // --- Second entry: Assistant message ---
    const assistantEntry = entries[1]
    assertIsMessageEntry(assistantEntry)
    assertIsAssistantStructured(assistantEntry)

    expect(assistantEntry.uuid).toBe('assistant-456')
    expect(assistantEntry.timestamp).toBe('2026-02-04T10:00:01.000Z')
    expect(assistantEntry.raw).toEqual(assistantMessage)

    expect(assistantEntry.structuredEntry.role).toBe('assistant')
    expect(assistantEntry.structuredEntry.content).toBe('Hello! How can I help you today?')
    expect(assistantEntry.structuredEntry.hasToolUse).toBe(false)
    expect(assistantEntry.structuredEntry.hasThinking).toBe(false)
    expect(assistantEntry.structuredEntry.thinkingContent).toBeUndefined()
    expect(assistantEntry.structuredEntry.toolCalls).toBeUndefined()
  })
})
