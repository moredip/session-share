# Branch: feature/read-tool-rendering

## Goal

Implement special-case rendering for Read tool invocations in the session viewer.

Currently, tool calls are rendered generically with their input parameters and results. This branch adds custom rendering for Read tool calls to display them in a more user-friendly way, showing:
- The file path being read
- Line range information (offset/limit) when applicable
- The file contents in a syntax-highlighted code block

## Read Tool Parameters

The Read tool accepts these parameters:
- `file_path` (required) - The absolute path to the file
- `offset` (optional) - Line number to start reading from
- `limit` (optional) - Number of lines to read

## Test Cases

We have an e2e test that exercises all parameter combinations:
- Basic read (file_path only)
- Read with limit
- Read with offset
- Read with offset and limit

Example session: https://custardseed.com/g/e74f702fc43c0cef06b16cd3c5dacb60

## Tasks

- [x] Add e2e test for Read tool variants
- [ ] Implement Read tool renderer component in session-viewer
- [ ] Add syntax highlighting based on file extension
- [ ] Handle edge cases (binary files, images, very long files)
- [ ] Update e2e test with visual assertions

## Related

- TODO.md item: "perform special-case rendering for internal tool invocation"
- After Read is done, similar work needed for: Edit, Fetch, WebSearch, Bash
