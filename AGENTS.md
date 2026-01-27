## Overview
This project is called CustardSeed. It's a system to let you publish your Claude Code sessions online, so you can share them with others.

The system has two parts:

1. **Claude Code plugin** - Defines a Skill which publishes your current session transcript as a GitHub Gist 
2. **Web viewer** - Renders the transcript stored in any gist in a readable format

## Repo layout
- /claude-code-session-share is a Claude Code plugin responsible for pushing the current CC session's transcript to remote storage (gist for now)
- /session-viewer is the SPA viewer that fetches a remote transcript and renders it to pretty HTML for viewing
- /session-viewer/index.html is the marketing homepage for the project
- /docs project documentation
- /samples/claude-code-projects
  - examples of raw claude code transcript files (JSONL, with subagents)
- /infra - Terraform IaC for deploying to GCP
  - uses Docker wrapper (`bin/dterraform`) to run Terraform without local install

## general guidance
- whenever you're asked to make a commit that includes changes to a Claude Code plugin, also update the teeny part of that plugin's version number in plugin.json
- You have playwright available for testing your changes in a browser. Use it after you've made meaningful changes to a UI.
- if you attempt to run a local server and the port is in use, assume someone else is already running it for you