import { describe, it, expect, assert, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { parseEntries } from '../../src/lib/gistGateway'
import { isAssistantEntry, isGenericToolCall, isMessageEntry } from '../../src/domain/transcriptEntry'
import type { ToolResultBlock, ImageBlock, TranscriptEntry } from '../../src/domain/transcriptEntry'

const fixture = readFileSync(join(__dirname, 'fixtures/images-in-tool-results.jsonl'), 'utf-8')

describe('images in tool results', () => {
  let entries: TranscriptEntry[]

  beforeAll(() => {
    entries = parseEntries(fixture)
  })

  it('parses the fixture without errors', () => {
    // 2 entries: 1 assistant (screenshot tool call) + 1 user (tool result with image)
    expect(entries.length).toBe(2)
  })

  it('parses screenshot tool call and correlates image result', () => {
    const entry = entries[0]
    assert(isAssistantEntry(entry))
    expect(entry.structuredEntry.hasToolUse).toBe(true)

    const call = entry.structuredEntry.toolCalls![0]
    assert(isGenericToolCall(call))

    expect(call.result).toBeDefined()
    expect(call.result).toHaveLength(2)

    const textBlock = call.result![0]
    expect(textBlock.type).toBe('text')

    const imageBlock = call.result![1] as ImageBlock
    expect(imageBlock.type).toBe('image')
    expect(imageBlock.source.type).toBe('base64')
    expect(imageBlock.source.media_type).toBe('image/png')
    expect(imageBlock.source.data.length).toBeGreaterThan(0)
  })

  it('parses user tool result entry with image content block', () => {
    const entry = entries[1]
    assert(isMessageEntry(entry))
    expect(entry.structuredEntry.kind).toBe('user')

    const userEntry = entry.structuredEntry as { kind: 'user'; content: unknown[]; isToolResultOnly?: boolean }
    expect(userEntry.isToolResultOnly).toBe(true)
    expect(userEntry.content).toHaveLength(1)

    const toolResultBlock = userEntry.content[0] as ToolResultBlock
    expect(toolResultBlock.type).toBe('tool_result')
    expect(toolResultBlock.tool_use_id).toBe('toolu_01Q6S4AwiiLp5gTueKaT4FdC')
    expect(toolResultBlock.content).toHaveLength(2)

    const imageBlock = toolResultBlock.content[1] as ImageBlock
    expect(imageBlock.type).toBe('image')
    expect(imageBlock.source.media_type).toBe('image/png')
    expect(imageBlock.source.data.length).toBeGreaterThan(0)
  })
})
