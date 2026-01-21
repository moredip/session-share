# Session Viewer - Technical Design

## Overview

Static single-page application that renders Claude Code session transcripts. Fetches JSONL data directly from GitHub Gists, parses it client-side, and renders a readable conversation view.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: react-router-dom
- **Build**: Vite
- **Markdown**: react-markdown (for rendering message content)

## Architecture

### Data Flow

```
URL (/g/:gistId)
    ↓
Fetch raw JSONL from raw.githubusercontent.com/gist/...
    ↓
Parse JSONL lines into message objects
    ↓
Build tree structure from uuid/parentUuid
    ↓
Render conversation thread
```

### Directory Structure

```
session-viewer/
├── src/
│   ├── components/
│   │   ├── TranscriptViewer.tsx   # Main container, data fetching
│   │   ├── MessageThread.tsx      # Recursive message tree
│   │   ├── MessageBubble.tsx      # User/assistant message display
│   │   ├── ToolUseBlock.tsx       # Tool call rendering
│   │   └── ThinkingBlock.tsx      # Collapsible thinking content
│   ├── lib/
│   │   ├── parser.ts              # JSONL parsing logic
│   │   ├── fetcher.ts             # Gist fetching utilities
│   │   └── types.ts               # TypeScript interfaces
│   ├── App.tsx                    # Router setup
│   └── main.tsx                   # Entry point
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

### Key Types (from JSONL analysis)

```typescript
type MessageType = 'user' | 'assistant' | 'progress' | 'system' | 'file-history-snapshot';

interface BaseMessage {
  uuid: string;
  parentUuid: string | null;
  type: MessageType;
  timestamp: string;
  sessionId: string;
}

interface UserMessage extends BaseMessage {
  type: 'user';
  message: { role: 'user'; content: string };
}

interface AssistantMessage extends BaseMessage {
  type: 'assistant';
  message: {
    role: 'assistant';
    content: Array<TextBlock | ToolUseBlock | ThinkingBlock>;
  };
}

interface ToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}

interface ThinkingBlock {
  type: 'thinking';
  thinking: string;
}
```

### Routing

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `LandingPage` | Minimal landing (can add later) |
| `/g/:gistId` | `TranscriptViewer` | Main transcript view |

### Gist URL Construction

```typescript
// Input: gist ID (e.g., "abc123")
// Output: raw content URL

const getRawGistUrl = async (gistId: string): Promise<string> => {
  const response = await fetch(`https://api.github.com/gists/${gistId}`);
  const gist = await response.json();
  // Find the .jsonl file and get its raw_url
  const jsonlFile = Object.values(gist.files).find(f => f.filename.endsWith('.jsonl'));
  return jsonlFile.raw_url;
};
```

### Component Responsibilities

**TranscriptViewer**: Fetches gist data, manages loading/error states, passes parsed messages to children.

**MessageThread**: Receives flat message array, builds tree using parentUuid, renders recursively.

**MessageBubble**: Displays a single message. Different styling for user vs assistant. Handles markdown content.

**ToolUseBlock**: Shows tool name and collapsible input/output. Visual indicator for tool type.

**ThinkingBlock**: Collapsed by default. Expandable to show Claude's reasoning.

## Out of Scope

- Subagent transcript rendering

## Phase 1 Constraints

- No authentication (public/unlisted gists only)
- No server-side rendering
- No database
- Static hosting compatible (Vercel, Netlify, GitHub Pages)
