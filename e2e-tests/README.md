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

### Testing Against Local Development Server (Default)

By default, tests run against your local development server at http://localhost:5173:

```bash
# First, start the dev server in another terminal
cd session-viewer
npm run dev

# Then run tests
cd ../e2e-tests
uv run pytest -v -s
```

This publishes sessions to GitHub Gists (as normal) but views them on your local development server.

### Testing Against Production

To test the deployed production viewer, set the `VIEWER_BASE_URL` environment variable:

```bash
VIEWER_BASE_URL=https://custardseed.com uv run pytest -v -s
```

### Headed mode
use `--headed` if you want to run playwright in non-headless mode so you can see the tests