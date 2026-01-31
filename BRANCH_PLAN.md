# Branch: feature/edit-tool-rendering

## Goal

Implement special-case rendering for Edit tool invocations in the session viewer.

Currently, tool calls are rendered generically with their input parameters and results. This branch adds custom rendering for Edit tool calls to display them in a more user-friendly way, showing:
- The file path being edited
- A clear indication of what changed (old text → new text)
- Whether it's a single replacement or replace-all operation
- The edit result (success/failure)

## Edit Tool Parameters

The Edit tool accepts these parameters:
- `file_path` (required) - The absolute path to the file being edited
- `old_string` (required) - The exact text to find and replace
- `new_string` (required) - The replacement text
- `replace_all` (optional, default: false) - Whether to replace all occurrences

## Implementation Approach

Following the pattern established in feature/read-tool-rendering:

1. **E2E Tests**: Add test with fixtures covering different Edit scenarios
2. **Understand Rendering Format**: Study how Claude Code renders these tool calls in the VScode extension (this will probably need a human to take a screenshot)
3. **Add Zod Schema**: Create `EditToolInputSchema` for runtime validation
4. **Extend Domain Model**: Add `EditToolCall` interface and extend the discriminated union
5. **Type Guards & Helpers**: Add `isEditToolCall()` guard and `extractFileName()` helper
6. **Custom Renderer**: Create `EditToolCallEntry` component which renders in the format we've planned
7. **Update E2E Tests**: Update e2e tests to confirm things render as expected

## Test Cases

E2E test should exercise different Edit tool scenarios:
- Basic edit (simple string replacement)
- Edit with replace_all=false (single occurrence)
- Edit with replace_all=true (all occurrences)
- Multi-line edit (with preserved indentation)

## Tasks

- [x] Add e2e test for Edit tool variants with fixture files
- [ ] Add EditToolInputSchema to gistGateway.ts with Zod validation
- [ ] Extend ToolCall discriminated union with EditToolCall type in transcriptEntry.ts
- [ ] Add isEditToolCall type guard and helper functions to transcriptEntry.ts
- [ ] Update parseToolCall() in gistGateway.ts to detect and parse Edit tools
- [ ] Implement EditToolCallEntry component in ToolCallEntry.tsx
- [ ] Update e2e tests to verify rendering matches expected format
- [ ] Update TODO.md to mark Edit rendering as complete


## Design Notes

### Rendering Approach

**Header (collapsed state):**
- Display: `Edit filename`
- Format similar to Read tool rendering
- Extract filename from `filePath` using helper function

**Expanded view:**
1. **Diff Visualization** - Use an open-source diff rendering library to display the `structuredPatch`:
   - Show line numbers
   - Red highlighting for removed lines (prefix "-")
   - Green highlighting for added lines (prefix "+")
   - Context lines (prefix " ") with neutral styling

2. **Raw JSON Dump** - Below the diff, display the complete `toolUseResult` object as formatted JSON for debugging/inspection, just as we do for generic tool results

**Library Options:**
- Consider libraries like `react-diff-view`, `diff2html`, or similar for rendering the structured patch. First research online to find the SOTA for react libraries for diff rendering.
- Should support rendering from our existing `structuredPatch` format (unified diff hunks)

## Related

- TODO.md line 33: "perform special-case rendering for internal tool invocation"
- Builds on pattern from feature/read-tool-rendering (commits d406992, 70fdc5a)
- After Edit is done, similar work needed for: Bash, WebFetch, WebSearch, Grep, Glob

## Edit Tool Transcript Schema

Based on actual transcript analysis from session [8871fc0f6a113826235b2428fbb27709](https://custardseed.com/g/8871fc0f6a113826235b2428fbb27709).

### Tool Use (Input)
Located in `message.content[]` where `type === "tool_use"` and `name === "Edit"`:

```typescript
{
  type: "tool_use",
  id: string,  // e.g., "toolu_01PuSafKVHBjyRaTb1NENzmw"
  name: "Edit",
  input: {
    file_path: string,
    old_string: string,     // Can be single or multi-line
    new_string: string,     // Can be single or multi-line
    replace_all: boolean    // Whether to replace all occurrences
  }
}
```

### Tool Result
Located in a subsequent user message with `type === "user"`, containing a `tool_result` and importantly a **`toolUseResult`** object at the top level:

```typescript
{
  type: "user",
  message: {
    role: "user",
    content: [{
      type: "tool_result",
      tool_use_id: string,
      content: string  // Success message text
    }]
  },
  toolUseResult: {
    filePath: string,
    oldString: string,
    newString: string,
    originalFile: string,      // Full file content before edit
    structuredPatch: [{        // Array of unified diff hunks
      oldStart: number,        // Starting line in original
      oldLines: number,        // Number of lines in original hunk
      newStart: number,        // Starting line in new version
      newLines: number,        // Number of lines in new hunk
      lines: string[]          // Diff lines: " " (context), "-" (removed), "+" (added)
    }],
    userModified: boolean,
    replaceAll: boolean
  }
}
```

### Key Observations

1. **The actual diff data lives in `toolUseResult`**, not in `message.content[].content`
2. **`structuredPatch`** contains the unified diff format broken into hunks
3. Each **hunk** contains:
   - Line numbers for both old and new versions
   - An array of diff lines prefixed with " " (unchanged), "-" (removed), or "+" (added)
4. **`originalFile`** provides the complete file content before the edit
5. **`replaceAll`** flag indicates whether all occurrences were replaced
6. The schema is consistent across single-line, multi-line, and replace_all edits

The diff format is essentially a parsed unified diff, similar to what `git diff` produces, just structured as JSON instead of text.
