import { describe, it, expect, assert } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { parseEntries } from '../../src/lib/gistGateway'
import { isAssistantEntry, isEditToolCall } from '../../src/domain/transcriptEntry'

const fixture = readFileSync(join(__dirname, 'fixtures/edit-tool-variants.jsonl'), 'utf-8')

const testDir =
  '/private/var/folders/jv/1nszcffd0x74lysjsn_btj6w0000gn/T/pytest-of-pete/pytest-1/test_edit_tool_variants_chromi0'

describe('Edit tool variants', () => {
  it('parses all four Edit tool variants and correlates structured results', () => {
    const entries = parseEntries(fixture)

    const toolCallEntries = entries
      .filter(isAssistantEntry)
      .filter((e) => e.structuredEntry.hasToolUse)
      .map((e) => e.structuredEntry)

    expect(toolCallEntries).toHaveLength(4)

    // 1. Basic edit: single replacement
    const call1 = toolCallEntries[0].toolCalls![0]
    assert(isEditToolCall(call1))
    expect(call1.input).toEqual({
      file_path: `${testDir}/edit_basic.txt`,
      old_string: 'It contains the word hello in the middle.',
      new_string: 'It contains the word goodbye in the middle.',
      replace_all: false,
    })
    expect(call1.result).toBeDefined()
    expect(call1.toolUseResult).toBeDefined()
    expect(call1.toolUseResult!.filePath).toBe(`${testDir}/edit_basic.txt`)
    expect(call1.toolUseResult!.replaceAll).toBe(false)
    expect(call1.toolUseResult!.structuredPatch).toHaveLength(1)

    // 2. Replace first occurrence only (replace_all: false)
    const call2 = toolCallEntries[1].toolCalls![0]
    assert(isEditToolCall(call2))
    expect(call2.input).toEqual({
      file_path: `${testDir}/edit_replace_all.txt`,
      old_string: 'This file has foo repeated several times.',
      new_string: 'This file has bar repeated several times.',
      replace_all: false,
    })
    expect(call2.result).toBeDefined()
    expect(call2.toolUseResult).toBeDefined()
    expect(call2.toolUseResult!.replaceAll).toBe(false)

    // 3. Replace all occurrences (replace_all: true)
    const call3 = toolCallEntries[2].toolCalls![0]
    assert(isEditToolCall(call3))
    expect(call3.input).toEqual({
      file_path: `${testDir}/edit_replace_all.txt`,
      old_string: 'bar',
      new_string: 'baz',
      replace_all: true,
    })
    expect(call3.result).toBeDefined()
    expect(call3.toolUseResult).toBeDefined()
    expect(call3.toolUseResult!.replaceAll).toBe(true)

    // 4. Multiline edit
    const call4 = toolCallEntries[3].toolCalls![0]
    assert(isEditToolCall(call4))
    expect(call4.input).toEqual({
      file_path: `${testDir}/edit_multiline.txt`,
      old_string: '  const OLD_CODE = true;\n  if (OLD_CODE) {\n    console.log("old implementation");\n  }',
      new_string: '  const NEW_CODE = true;\n  if (NEW_CODE) {\n    console.log("new implementation");\n  }',
      replace_all: false,
    })
    expect(call4.result).toBeDefined()
    expect(call4.toolUseResult).toBeDefined()
    expect(call4.toolUseResult!.structuredPatch).toHaveLength(1)
    expect(call4.toolUseResult!.structuredPatch[0].lines).toContain('-  const OLD_CODE = true;')
    expect(call4.toolUseResult!.structuredPatch[0].lines).toContain('+  const NEW_CODE = true;')
  })
})
