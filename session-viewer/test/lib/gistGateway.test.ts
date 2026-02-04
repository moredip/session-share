import { describe, it, expect } from 'vitest'
import { parseEntries } from '../../src/lib/gistGateway'
import type { MessageEntry, UserStructuredEntry, AssistantStructuredEntry } from '../../src/domain/transcriptEntry'

describe('parseEntries', () => {
  it('parses a minimal user message into correct UserStructuredEntry', () => {
    const jsonl = JSON.stringify({
      uuid: 'user-123',
      parentUuid: null,
      type: 'user',
      timestamp: '2026-02-04T10:00:00.000Z',
      sessionId: 'session-abc',
      message: {
        role: 'user',
        content: 'Hello, Claude!',
      },
    })

    const entries = parseEntries(jsonl)

    expect(entries).toHaveLength(1)
    const entry = entries[0] as MessageEntry
    expect(entry.uuid).toBe('user-123')
    expect(entry.type).toBe('user')

    const structured = entry.structuredEntry as UserStructuredEntry
    expect(structured.kind).toBe('user')
    expect(structured.role).toBe('user')
    expect(structured.content).toEqual([{ type: 'text', text: 'Hello, Claude!' }])
    expect(structured.isToolResultOnly).toBe(false)
  })

  it('parses a minimal assistant message into correct AssistantStructuredEntry', () => {
    const jsonl = JSON.stringify({
      uuid: 'assistant-456',
      parentUuid: 'user-123',
      type: 'assistant',
      timestamp: '2026-02-04T10:00:01.000Z',
      sessionId: 'session-abc',
      message: {
        role: 'assistant',
        content: [{ type: 'text', text: 'Hello! How can I help you today?' }],
      },
    })

    const entries = parseEntries(jsonl)

    expect(entries).toHaveLength(1)
    const entry = entries[0] as MessageEntry
    expect(entry.uuid).toBe('assistant-456')
    expect(entry.type).toBe('assistant')

    const structured = entry.structuredEntry as AssistantStructuredEntry
    expect(structured.kind).toBe('assistant')
    expect(structured.role).toBe('assistant')
    expect(structured.content).toBe('Hello! How can I help you today?')
    expect(structured.hasToolUse).toBe(false)
    expect(structured.hasThinking).toBe(false)
    expect(structured.toolCalls).toBeUndefined()
  })

  it('parses multiple entries in JSONL format', () => {
    const lines = [
      JSON.stringify({
        uuid: 'user-123',
        parentUuid: null,
        type: 'user',
        timestamp: '2026-02-04T10:00:00.000Z',
        sessionId: 'session-abc',
        message: { role: 'user', content: 'Hello' },
      }),
      JSON.stringify({
        uuid: 'assistant-456',
        parentUuid: 'user-123',
        type: 'assistant',
        timestamp: '2026-02-04T10:00:01.000Z',
        message: { role: 'assistant', content: [{ type: 'text', text: 'Hi there!' }] },
      }),
    ]

    const entries = parseEntries(lines.join('\n'))

    expect(entries).toHaveLength(2)
    expect((entries[0] as MessageEntry).uuid).toBe('user-123')
    expect((entries[1] as MessageEntry).uuid).toBe('assistant-456')
  })
})
