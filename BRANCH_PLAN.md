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

- [ ] Add e2e test for Edit tool variants with fixture files
- [ ] Study Claude Code rendering format for Edit tools (human screenshot needed)
- [ ] Add EditToolInputSchema to gistGateway.ts with Zod validation
- [ ] Extend ToolCall discriminated union with EditToolCall type in transcriptEntry.ts
- [ ] Add isEditToolCall type guard and helper functions to transcriptEntry.ts
- [ ] Update parseToolCall() in gistGateway.ts to detect and parse Edit tools
- [ ] Implement EditToolCallEntry component in ToolCallEntry.tsx
- [ ] Update e2e tests to verify rendering matches expected format
- [ ] Update TODO.md to mark Edit rendering as complete


## Design Notes

TBD

## Related

- TODO.md line 33: "perform special-case rendering for internal tool invocation"
- Builds on pattern from feature/read-tool-rendering (commits d406992, 70fdc5a)
- After Edit is done, similar work needed for: Bash, WebFetch, WebSearch, Grep, Glob
