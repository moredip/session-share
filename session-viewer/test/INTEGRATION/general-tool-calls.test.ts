import { describe, it, expect, assert, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { parseEntries } from '../../src/lib/gistGateway'
import { isAssistantEntry, isGenericToolCall } from '../../src/domain/transcriptEntry'
import type { TranscriptEntry } from '../../src/domain/transcriptEntry'

const fixture = readFileSync(join(__dirname, 'fixtures/general-tool-calls.jsonl'), 'utf-8')

describe('general tool calls', () => {
  let entries: TranscriptEntry[]

  beforeAll(() => {
    entries = parseEntries(fixture)
  })

  it('parses the full session without errors', () => {
    // 560 = one entry per non-comment line in the fixture
    expect(entries.length).toBe(560)
  })

  it('parses WebSearch as a generic tool call with result', () => {
    // entry[7]: assistant with WebSearch tool call
    const entry = entries[7]
    assert(isAssistantEntry(entry))
    expect(entry.structuredEntry.hasToolUse).toBe(true)

    const call = entry.structuredEntry.toolCalls![0]
    assert(isGenericToolCall(call))
    expect(call.name).toBe('WebSearch')
    expect(call.input).toEqual({
      query: 'Claude Code plugin development hooks custom commands 2026',
    })
    expect(call.result).toBeDefined()
  })

  it('parses WebFetch as a generic tool call with result', () => {
    // entry[13]: assistant with WebFetch tool call
    const entry = entries[13]
    assert(isAssistantEntry(entry))
    expect(entry.structuredEntry.hasToolUse).toBe(true)

    const call = entry.structuredEntry.toolCalls![0]
    assert(isGenericToolCall(call))
    expect(call.name).toBe('WebFetch')
    expect(call.input).toMatchObject({ url: 'https://code.claude.com/docs/en/plugins' })
    expect(call.result).toBeDefined()
  })

  it('parses Glob as a generic tool call with result', () => {
    // entry[41]: assistant with Glob tool call
    const entry = entries[41]
    assert(isAssistantEntry(entry))
    expect(entry.structuredEntry.hasToolUse).toBe(true)

    const call = entry.structuredEntry.toolCalls![0]
    assert(isGenericToolCall(call))
    expect(call.name).toBe('Glob')
    expect(call.input).toEqual({
      pattern: '**/*.json',
      path: '/Users/pete/git/moredip/claude-code-sessions',
    })
    expect(call.result).toBeDefined()
  })

  it('parses Bash as a generic tool call with result', () => {
    // entry[50]: assistant with Bash tool call
    const entry = entries[50]
    assert(isAssistantEntry(entry))
    expect(entry.structuredEntry.hasToolUse).toBe(true)

    const call = entry.structuredEntry.toolCalls![0]
    assert(isGenericToolCall(call))
    expect(call.name).toBe('Bash')
    expect(call.input).toMatchObject({ command: 'ls -la /Users/pete/git/moredip/session-share/' })
    expect(call.result).toBeDefined()
  })
})
