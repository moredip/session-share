import { describe, it, expect } from 'vitest'
import { parseEntries } from '../../src/lib/gistGateway'

describe('transcription parsing integration', () => {
  it('parses a complete conversation with user and assistant messages', () => {
    const userMessage = {
      uuid: 'user-123',
      parentUuid: null,
      type: 'user',
      timestamp: '2026-02-04T10:00:00.000Z',
      sessionId: 'blah',
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
      sessionId: 'blah',
      message: {
        role: 'assistant',
        content: [{ type: 'text', text: 'Hello! How can I help you today?' }],
      },
    }

    const jsonl = [JSON.stringify(userMessage), JSON.stringify(assistantMessage)].join('\n')

    const entries = parseEntries(jsonl)

    expect(entries).toHaveLength(2)

    expect(entries[0]).toEqual({
      uuid: 'user-123',
      type: 'user',
      timestamp: '2026-02-04T10:00:00.000Z',
      raw: userMessage,
      structuredEntry: {
        kind: 'user',
        role: 'user',
        isToolResultOnly: false,
        content: [{ type: 'text', text: 'Hello, Claude!' }],
      },
    })

    expect(entries[1]).toEqual({
      uuid: 'assistant-456',
      type: 'assistant',
      timestamp: '2026-02-04T10:00:01.000Z',
      raw: assistantMessage,
      structuredEntry: {
        kind: 'assistant',
        role: 'assistant',
        content: 'Hello! How can I help you today?',
        hasToolUse: false,
        hasThinking: false,
        thinkingContent: undefined,
        toolCalls: undefined,
      },
    })
  })
})
