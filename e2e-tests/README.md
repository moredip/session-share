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

### Testing Against Production (Default)

By default, tests run against the production viewer at custardseed.com:

```bash
uv run pytest -v -s
```

### Testing Against Local Development Server

To test your local changes before deploying, set the `VIEWER_BASE_URL` environment variable:

```bash
# First, start the dev server in another terminal
cd session-viewer
npm run dev

# Then run tests against localhost
cd ../e2e-tests
VIEWER_BASE_URL=http://localhost:5173 uv run pytest -v -s
```

This publishes sessions to GitHub Gists (as normal) but views them on your local development server.
