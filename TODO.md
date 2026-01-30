# TODO

## Claude Code Session Share Plugin

- [x] check version of plugin against marketplace, tell the user if it's due for update
- [ ] check for `gh` and auth, fail gracefully with report to user if not available
- [ ] add an arg to the slash command that lets the user specify private or public
  - [ ] if they don't specify, ask them
- [ ] if we publish multiple times, update the existing gist

- [ ] make best-effort attempt to detect secrets (using https://pypi.org/project/detect-secrets/?)

## Session Viewer

- [ ] handle images
    - e.g. https://gist.github.com/moredip/ca8020ccee67d8bd1d8d2243e7ff75f0

- [ ] handle special-case "user" messages
  - [ ] <task-notification>
  - [ ] <ide-file-open>
  - [ ] slash command execution (e.g. https://custardseed.com/g/923d8bd8ab92eb070e35a5d0d4d1dfc2)

- [ ] full-text search within transcript
  - implemented w. fuse? flexsearch?

- [x] for tool calls, include the input in the contracted view, input + results in the expanded view
- [ ] perform special-case rendering for internal tool invocation
  - good example to use
    - https://custardseed.com/g/95599dbc3a863bd0febe19c323b8c24f
    - local session /resume 88f04c6a-d128-40bf-96b3-6b2aa787f62c
  - [ ] Read(XXX)
    - https://custardseed.com/g/e74f702fc43c0cef06b16cd3c5dacb60 shows different Read variants we want to support
  - [ ] Edit(XXX)
  - [ ] Fetch(url)
  - [ ] Web Search(query)
  - [ ] Bash(command)

- [x] anchors, links between messages

- [ ] add some metadata to the top of the session
  - from jabrahms: "I'd also love to know some session information like which repository(?) the session was in and what branch they were on."
  - [ ] claude session id
  - [ ] working/project dir
  - [ ] branch, other git status
  - [ ] (bonus) instructions on how to resume session locally
  - [ ] time the session started
  - [ ] what else can we extract?

- [ ] support subagent transcripts


## BUGS
- https://custardseed.com/g/e192764590e0f0d9bce55596672bbd84
- Parser fails on unknown message types (e.g. `custom-title`) - should skip gracefully
  - repro: https://custardseed.com/g/fab752159c58ba0041bcbbdc500006d9