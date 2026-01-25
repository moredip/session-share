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
    - http://localhost:5173/g/95599dbc3a863bd0febe19c323b8c24f
    - local session /resume 88f04c6a-d128-40bf-96b3-6b2aa787f62c
  - [ ] Read(XXX)
  - [ ] Edit(XXX)
  - [ ] Fetch(url)
  - [ ] Web Search(query)
  - [ ] Bash(command)
  
- [x] anchors, links between messages

- [ ] add some metadata to the top of the session
  - [ ] claude session id 
  - [ ] working/project dir
  - [ ] (bonus) instructions on how to resume session locally
  - [ ] time the session started
  - [ ] what else can we extract?