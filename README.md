# CustardSeed

Instantly share your Claude Code sessions online.

A Claude Code slash command which publishes your session transcripts as a github gist, plus an online viewer so you can share your session via a URL.

## How it works

The system has two parts:

1. **Claude Code plugin** - Publishes your current session transcript to a GitHub Gist (secret by default)
2. **Web viewer** - Renders the transcript stored in any gist in a readable format

GitHub handles storage and access control. The viewer is a static site that fetches transcripts client-side.

## Components

| Directory | Description |
|-----------|-------------|
| [claude-code-session-share](claude-code-session-share/) | Claude Code plugin for publishing sessions |
| [session-viewer](session-viewer/) | React app that renders transcripts |
| [infra](infra/) | Terraform IaC for GCP hosting |
| [docs](docs/) | Architecture and roadmap |

## Current status

Phase 1 (MVP) - Public and unlisted sharing via GitHub Gists. No login required to view or publish (just a logged in `gh` cli, for creating gists).

## License

MIT