## Why

The transcript parser currently lacks comprehensive integration tests covering real-world edge cases and variations. We need tests with explicit assertions using minimal examples from actual gists to ensure the parser correctly handles various tool calls, content types, and special message patterns encountered in production.

## What Changes

- Add integration test fixtures (`.jsonl` files) extracted from known gists to `session-viewer/test/INTEGRATION/`
  - Fixtures may be edited down to minimal examples focusing on specific parser behaviors, or may use larger transcript chunks - to be decided during implementation
- Add corresponding integration tests (`.test.ts` files) for each fixture with 1:1 correspondence using explicit assertions - use the existing test as a template.
- Cover multiple categories:
  - Tool rendering patterns (Read tool variants, Edit tool variants, general tool calls)
  - Content variety (images in tool results, images in user messages)
  - Special message types (slash command execution)
  - Bugs & edge cases (unknown message types like custom-title)
- Use explicit assertions to validate specific aspects of parser output (e.g., element presence, content structure, attributes)

## Capabilities

### New Capabilities
- `parser-integration-tests`: Comprehensive integration test suite for transcript parser validation using real-world examples

### Modified Capabilities
<!-- None - this change adds tests without modifying existing spec requirements -->

## Impact

- `session-viewer/test/INTEGRATION/` directory - new test fixtures and test files
- Improved confidence in parser correctness across real-world scenarios
- Easier regression detection when parser logic changes
- Documentation of supported transcript patterns through test examples
