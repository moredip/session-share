## Context

The transcript parser (`session-viewer/src/lib/gistGateway.parseEntries`) transforms raw JSONL transcripts into structured entries for rendering. Currently, there's one integration test covering basic user/assistant messages, but no coverage for real-world complexity like tool calls, images, slash commands, or edge cases.

The existing test pattern (in `test/INTEGRATION/transcription-parsing.test.ts`) constructs raw transcript objects inline and uses explicit assertions with `toEqual` to verify parsed output. This approach provides clear, maintainable tests that fail with specific error messages.

## Goals / Non-Goals

**Goals:**
- Add comprehensive integration test coverage for parser edge cases using real-world examples
- Use explicit assertions following the existing test pattern
- Create minimal fixtures that clearly demonstrate specific parser behaviors
- Cover tool rendering, content variety, special messages, and edge cases

**Non-Goals:**
- Snapshot testing (explicitly rejected by user preference)
- Testing every possible transcript variation (focus on representative examples)
- Modifying the parser behavior itself (tests only, no parser changes)
- Automated fixture extraction from gists (manual extraction preferred for clarity)

## Decisions

### Decision: Inline fixture construction vs external .jsonl files
**Chosen**: External `.jsonl` fixture files in `test/INTEGRATION/fixtures/`

**Rationale**:
- Real-world transcripts are complex; inline construction would clutter test files
- Fixtures can be extracted directly from known gists, preserving authenticity
- Easier to review and edit fixtures separately from test logic
- Matches the user's plan document which explicitly calls for `.jsonl` fixture files

**Alternative considered**: Inline construction (like the existing test) - rejected because real-world tool calls and image data are too verbose.

### Decision: Fixture size and editing
**Chosen**: Start with minimal extracted examples; expand only if needed

**Rationale**:
- Minimal examples are easier to understand and maintain
- Focus tests on specific parser behaviors rather than kitchen-sink scenarios
- Can be adjusted during implementation if more context is needed

**Alternative considered**: Use complete gist transcripts - rejected because it obscures what the test is validating.

### Decision: Test structure
**Chosen**: Follow existing pattern - one describe block per category, explicit `toEqual` assertions

**Rationale**:
- Consistency with existing test
- Explicit assertions make test intent clear and provide useful failure messages
- User explicitly requested explicit assertions over snapshot testing

**Alternative considered**: Separate test files per fixture - rejected for simplicity; grouping by category is more maintainable.

## Risks / Trade-offs

**[Risk]**: Fixtures may be too minimal and miss important context
**Mitigation**: Start minimal; expand fixtures during implementation if tests reveal gaps

**[Risk]**: Manual fixture extraction is time-consuming
**Mitigation**: Reference the user's plan document which already lists specific gists to use

**[Trade-off]**: External fixtures add indirection vs inline data
**Benefit**: Much cleaner test files; easier to see test intent vs fixture noise

## Migration Plan

N/A - This is additive test coverage with no production code changes.
