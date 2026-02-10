import { describe, it, expect, assert } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { parseEntries } from '../../src/lib/gistGateway'
import { isAssistantEntry, isReadToolCall } from '../../src/domain/transcriptEntry'

const fixture = readFileSync(join(__dirname, 'fixtures/read-tool-variants.jsonl'), 'utf-8')

describe('Read tool variants', () => {
  it('parses all four Read tool input variants and correlates results', () => {
    const entries = parseEntries(fixture)

    const toolCallEntries = entries
      .filter(isAssistantEntry)
      .filter((e) => e.structuredEntry.hasToolUse)
      .map((e) => e.structuredEntry)

    expect(toolCallEntries).toHaveLength(4)

    const expectedFilePath = '/Users/pete/git/moredip/session-share/e2e-tests/conftest.py'

    // 1. Read with file_path only
    const callBasic = toolCallEntries[0].toolCalls![0]
    assert(isReadToolCall(callBasic))
    expect(callBasic.input).toEqual({ file_path: expectedFilePath })
    expect(callBasic.result).toBeDefined()

    // 2. Read with file_path + limit
    const callLimit = toolCallEntries[1].toolCalls![0]
    assert(isReadToolCall(callLimit))
    expect(callLimit.input).toEqual({ file_path: expectedFilePath, limit: 10 })
    expect(callLimit.result).toBeDefined()

    // 3. Read with file_path + offset
    const callOffset = toolCallEntries[2].toolCalls![0]
    assert(isReadToolCall(callOffset))
    expect(callOffset.input).toEqual({ file_path: expectedFilePath, offset: 20 })
    expect(callOffset.result).toBeDefined()

    // 4. Read with file_path + offset + limit
    const callBoth = toolCallEntries[3].toolCalls![0]
    assert(isReadToolCall(callBoth))
    expect(callBoth.input).toEqual({ file_path: expectedFilePath, offset: 15, limit: 5 })
    expect(callBoth.result).toBeDefined()
  })
})
