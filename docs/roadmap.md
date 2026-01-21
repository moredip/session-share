# Claude Code Transcript Sharing

## Product Roadmap

### Vision

Enable Claude Code users to publish and share session transcripts with a simple command. Support both public sharing (Twitter, blog posts, team showcases) and private sharing within organizations.

The system stores raw JSONL transcripts in GitHub infrastructure and provides a web viewer that fetches and renders them client-side. GitHub handles authentication and authorization—we don't build our own user system.

### Phase 1: Public & Unlisted Sharing (MVP)

**Goal**: Ship the simplest useful thing. A user publishes a session, gets a link, shares it.

**Scope**:
- Claude Code plugin to publish transcripts to GitHub Gists
- Web viewer that renders any gist-based transcript
- Two visibility modes:
  - **Public**: Listed on user's gist profile, discoverable
  - **Unlisted**: Accessible only if you have the URL (GitHub calls these "secret" gists)

**Non-goals for Phase 1**:
- No login required to view transcripts
- No login required to publish (user provides GitHub token to plugin)
- No access control beyond URL obscurity for unlisted transcripts

**Key limitation to communicate clearly**: Unlisted gists are NOT private. Anyone with the URL can view them. They're just not indexed or listed publicly. This is fine for most "share with a friend" use cases but insufficient for sensitive org content.

### Phase 2: Organization-Internal Sharing

**Goal**: Enable teams to share transcripts privately within their GitHub organization.

**Scope**:
- Transcripts stored in a private GitHub repository owned by the org
- Viewers must authenticate via GitHub OAuth
- Access controlled by GitHub's existing org/team permissions
- Admin can configure a designated transcript repository for their org

**What changes from Phase 1**:
- New storage backend (private repo instead of gist)
- Authentication required to view private transcripts
- Server-side proxy layer to handle auth and fetch private content
- Org setup/onboarding flow

---

## Architecture Overview

### Core Principle

GitHub is the storage layer AND the auth layer. We build a thin viewer on top.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Claude Code │────▶│   GitHub    │◀────│  Web Viewer │
│  (plugin)   │     │ (gist/repo) │     │  (render)   │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Phase 1 Architecture

**Publishing**: Plugin creates a gist via GitHub API using user's personal access token.

**Viewing**: Pure client-side. The viewer fetches the gist's raw content URL directly from the browser. GitHub's raw content endpoints support CORS, so no server needed.

```
Browser → fetch(raw.githubusercontent.com/gist/...) → parse JSONL → render
```

**URL format**: `https://viewer.example.com/g/{gist_id}`

The viewer extracts the gist ID, constructs the raw URL, fetches, and renders. Zero server infrastructure beyond static hosting.

### Phase 2 Architecture

**Problem**: Private GitHub content doesn't support CORS. Browsers cannot fetch from private repos directly.

**Solution**: Add a lightweight server proxy that:
1. Authenticates user via GitHub OAuth
2. Verifies user has access to the org/repo
3. Fetches transcript from private repo using server-side credentials
4. Returns content to browser

```
Browser → Server Proxy → GitHub API (with auth) → Private Repo
            ↓
       Validates user's
       GitHub org membership
```

**Publishing**: Plugin commits transcript file to the org's designated private repository.

**URL format**: `https://viewer.example.com/o/{org}/{transcript_id}`

The `/o/` prefix signals this is org-scoped content requiring authentication.

### What Stays The Same Across Phases

- JSONL as the canonical transcript format
- Client-side rendering logic (parsing, UI components)
- Plugin-based publishing flow
- GitHub as the source of truth for both storage and identity

### What Changes in Phase 2

| Component | Phase 1 | Phase 2 |
|-----------|---------|---------|
| Storage | GitHub Gists | GitHub Gists (public) + Private Repos (org) |
| Auth to view | None | GitHub OAuth for org content |
| Server infra | Static hosting only | Static hosting + serverless proxy |
| Access control | URL obscurity | GitHub org/repo permissions |

### Key Technical Constraints

**Gists cannot do real access control.** They're either public or "secret" (unlisted). There's no way to say "only members of org X can view this gist." This is why Phase 2 requires private repos.

**Private repos require a server proxy.** GitHub doesn't set CORS headers on private content. The browser cannot fetch it directly, even with a valid token. A server must sit in between.

**GitHub OAuth requires a backend for token exchange.** The OAuth client secret cannot be exposed in browser code. A serverless function handles the code→token exchange.