## Repo layout
- /claude-code-session-share is a Claude Code plugin responsible for pushing the current CC session's transcript to remote storage (gist for now)
- /session-viewer is the SPA viewer that fetches a remote transcript and renders it to pretty HTML for viewing
- /docs project documentation
- /samples/claude-code-projects
  - examples of raw claude code transcript files (JSONL, with subagents)

## general rules
- whenever you're asked to make a commit that includes changes to a Claude Code plugin, also update the teeny part of that plugin's version number in plugin.json