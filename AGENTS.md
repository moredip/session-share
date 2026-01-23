## Repo layout
- /claude-code-session-share is a Claude Code plugin responsible for pushing the current CC session's transcript to remote storage (gist for now)
- /session-viewer is the SPA viewer that fetches a remote transcript and renders it to pretty HTML for viewing
- /docs project documentation
- /samples/claude-code-projects
  - examples of raw claude code transcript files (JSONL, with subagents)
- /infra - Terraform IaC for deploying to GCP
  - uses Docker wrapper (`bin/dterraform`) to run Terraform without local install

## general guidance
- whenever you're asked to make a commit that includes changes to a Claude Code plugin, also update the teeny part of that plugin's version number in plugin.json
- You have playwright available for testing your changes in a browser. Use it after you've made meaningful changes to a UI.