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
- [x] Use the claude code CLI's `/export` command to dump that session out to text, and update this PLAN with a detailed report of how the CLI renders these different variations of Read Tool calls
- [x] Implement Read tool renderer component in session-viewer
  - [x] we'll do this by adding domain types which understand Read tool calls specifically,
  - [x]  and then modifying the JSX with a custom renderer for that specific subtype
- [ ] Update e2e test with visual assertions

## CLI Rendering Analysis

Based on the screenshot in [samples/read examples.png](samples/read examples.png), here's how the Claude Code CLI displays Read tool calls:

### Compact Tool Call Display

The CLI shows Read tool calls in a compact format with a green bullet point:

**1. Basic Read (file_path only)**
```
● Read conftest.py
```

**2. Read with Limit**
```
● Read conftest.py
```
(Same compact format - limit doesn't show in the tool call summary)

**3. Read with Offset**
```
● Read conftest.py (from line 21)
```

**4. Read with Offset and Limit**
```
● Read conftest.py (lines 16-20)
```

### Display Rules

- **Tool name**: Shows "Read" in the tool name
- **File name only**: Displays just the filename, not the full path (e.g., `conftest.py` not `/Users/pete/.../conftest.py`)
- **Line range notation**:
  - Offset + limit: `(lines N-M)`
  - limit only: `(lines 0-M)`
  - Offset only: `(from line N)`
  - No offset/limit: No parenthetical notation


## Related

- TODO.md item: "perform special-case rendering for internal tool invocation"
- After Read is done, similar work needed for: Edit, Fetch, WebSearch, Bash
