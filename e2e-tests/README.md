# End-to-End Tests

These tests exercise the full CustardSeed system:
1. Run a real Claude Code session via the CLI
2. Publish the transcript using the `/publish-session` skill
3. Verify that the transcript is displayed in the session-viewer correctly

## Setup

```bash
cd e2e-tests
uv sync
uv run playwright install chromium
```

## Running Tests

```bash
uv run pytest -v -s
```
