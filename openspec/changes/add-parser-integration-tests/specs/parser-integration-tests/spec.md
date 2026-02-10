## ADDED Requirements

### Requirement: Integration test coverage for tool rendering patterns
The test suite SHALL include integration tests that validate the parser's handling of various tool call patterns, including Read tool variants, Edit tool variants, and general tool usage.

#### Scenario: Read tool variants are parsed correctly
- **WHEN** the parser processes a transcript containing different Read tool call variations
- **THEN** the parser output contains the expected elements and structure for each Read tool variant

#### Scenario: Edit tool variants are parsed correctly
- **WHEN** the parser processes a transcript containing different Edit tool call variations with patches
- **THEN** the parser output contains the expected elements and structure for each Edit tool variant

#### Scenario: General tool calls are parsed correctly
- **WHEN** the parser processes a transcript containing complex tool usage patterns
- **THEN** the parser output contains the expected elements and structure for the tool interactions

### Requirement: Integration test coverage for content variety
The test suite SHALL include integration tests that validate the parser's handling of various content types, including images in tool results and images in user messages.

#### Scenario: Images in tool results are parsed correctly
- **WHEN** the parser processes a transcript containing tool results with base64-encoded images
- **THEN** the parser output contains the expected image elements with correct attributes

#### Scenario: Images in user messages are parsed correctly
- **WHEN** the parser processes a transcript containing user messages with embedded images
- **THEN** the parser output contains the expected image elements with correct attributes

### Requirement: Integration test coverage for special message types
The test suite SHALL include integration tests that validate the parser's handling of special message types, including slash command execution.

#### Scenario: Slash command execution is parsed correctly
- **WHEN** the parser processes a transcript containing slash command invocations
- **THEN** the parser output contains the expected elements and structure for slash commands

### Requirement: Integration test coverage for edge cases
The test suite SHALL include integration tests that validate the parser's handling of edge cases and unknown message types.

#### Scenario: Unknown message types are handled gracefully
- **WHEN** the parser processes a transcript containing unknown message types (e.g., custom-title)
- **THEN** the parser skips the unknown message type without errors and continues processing

### Requirement: Test fixtures and test structure
Each integration test SHALL follow a consistent structure with a `.jsonl` fixture file and a corresponding `.test.ts` test file using explicit assertions.

#### Scenario: Test fixture provides minimal example
- **WHEN** a new integration test is created
- **THEN** the test includes a `.jsonl` fixture file containing a minimal or representative example from a real gist

#### Scenario: Test uses explicit assertions
- **WHEN** a test validates parser output
- **THEN** the test uses explicit assertions checking for specific elements, content structure, or attributes (not snapshot testing)

#### Scenario: Test follows existing template
- **WHEN** a new integration test is created
- **THEN** the test structure follows the pattern of existing integration tests
