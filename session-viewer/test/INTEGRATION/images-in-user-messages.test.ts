import { describe, it, expect, assert, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { parseEntries } from '../../src/lib/gistGateway'
import { isMessageEntry } from '../../src/domain/transcriptEntry'
import type { UserStructuredEntry, ImageBlock, TranscriptEntry } from '../../src/domain/transcriptEntry'

const fixture = readFileSync(join(__dirname, 'fixtures/images-in-user-messages.jsonl'), 'utf-8')

describe('images in user messages', () => {
  let entries: TranscriptEntry[]

  beforeAll(() => {
    entries = parseEntries(fixture)
  })

  it('parses all 26 entries without errors', () => {
    // 26 entries total: meta entries + message entries (comment lines skipped)
    expect(entries.length).toBe(26)
  })

  it('parses user message with mixed text and image content (entry[2])', () => {
    // entry[2] is user message with [text, image, text]
    const entry = entries[2]
    assert(isMessageEntry(entry))
    expect(entry.structuredEntry.kind).toBe('user')

    const userEntry = entry.structuredEntry as UserStructuredEntry
    expect(userEntry.isToolResultOnly).toBe(false)
    expect(userEntry.content).toHaveLength(3)

    expect(userEntry.content[0].type).toBe('text')

    const imageBlock = userEntry.content[1] as ImageBlock
    expect(imageBlock.type).toBe('image')
    expect(imageBlock.source.type).toBe('base64')
    expect(imageBlock.source.media_type).toBe('image/png')
    expect(imageBlock.source.data.length).toBeGreaterThan(0)

    expect(userEntry.content[2].type).toBe('text')
  })

  it('parses user message that contains only an image (entry[9])', () => {
    // entry[9] is user message that is just an image block
    const entry = entries[9]
    assert(isMessageEntry(entry))
    expect(entry.structuredEntry.kind).toBe('user')

    const userEntry = entry.structuredEntry as UserStructuredEntry
    expect(userEntry.content).toHaveLength(1)

    const imageBlock = userEntry.content[0] as ImageBlock
    expect(imageBlock.type).toBe('image')
    expect(imageBlock.source.type).toBe('base64')
    expect(imageBlock.source.media_type).toBe('image/png')
    expect(imageBlock.source.data.length).toBeGreaterThan(0)
  })
})
