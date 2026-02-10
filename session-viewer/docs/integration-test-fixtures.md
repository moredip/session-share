# Integration Test Fixtures Plan

## Overview

We're building comprehensive integration tests (in test/INTEGRATION) for the transcript parser by creating snapshot tests based on real-world examples. Rather than mining transcripts automatically, we're manually extracting minimal examples from known gists that demonstrate specific use cases.

## Approach

Each test case will consist of:
- A `.jsonl` fixture file with a minimal example
- A corresponding `.test.ts` file with snapshot assertions
- 1:1 correspondence between fixture and test file

## potential Test Cases from TODO.md

NOTE: these aren't all necessarily a high priority

### Tool Rendering Patterns

**Read tool variants**
- Gist: https://custardseed.com/g/e74f702fc43c0cef06b16cd3c5dacb60
- Demonstrates: Different variations of Read tool calls and results

**Edit tool variants**
- Gist: https://custardseed.com/g/8871fc0f6a113826235b2428fbb27709
- Demonstrates: Different variations of Edit tool calls with patches

**General tool calls**
- Gist: https://custardseed.com/g/95599dbc3a863bd0febe19c323b8c24f
- Demonstrates: Complex tool usage patterns

### Content Variety

**Images in tool results** ✅ Working
- Gist: https://gist.github.com/moredip/ca8020ccee67d8bd1d8d2243e7ff75f0
- Demonstrates: Tool results containing base64-encoded images

**Images in user messages**
- Gist: http://localhost:5173/g/46faec66d8f1536834cfbcd7905683a4
- Demonstrates: User messages with embedded images

### Special Message Types

**Slash command execution**
- Gist: https://custardseed.com/g/923d8bd8ab92eb070e35a5d0d4d1dfc2
- Demonstrates: How slash commands appear in transcripts

### Bugs & Edge Cases

**Unknown message types (custom-title)**
- Gist: https://custardseed.com/g/fab752159c58ba0041bcbbdc500006d9
- Demonstrates: Parser should skip unknown message types gracefully

