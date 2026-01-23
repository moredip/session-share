# Session Share Plugin for Claude Code

Publish your Claude Code session transcripts to GitHub Gists with a single command.

## Installation

```bash
claude --plugin-dir /path/to/claude-code-session-share
```

## Prerequisites

- [GitHub CLI](https://cli.github.com/) (`gh`) must be installed and authenticated:
  ```bash
  gh auth login
  ```

## Usage

During any Claude Code session, run:

```
/publish-session
```

This creates an unlisted GitHub Gist containing your session transcript and returns the URL.

## How It Works

The plugin captures your session information when Claude Code starts, then uses the `gh` CLI to create a gist when you run the publish command. Gists are unlisted by default (accessible only via URL).
