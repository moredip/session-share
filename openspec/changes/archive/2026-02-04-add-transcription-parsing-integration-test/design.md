## Context

The transcript parsing pipeline lives in `session-viewer/src/lib/gistGateway.ts`. The core function `parseEntries(jsonlContent: string)` transforms raw JSONL into `TranscriptEntry[]` domain objects. Currently there are no tests for this parsing logic.

The repo has no root `package.json`—each subproject (session-viewer, claude-code-session-share) is independent. The `bin/pre-commit` script runs `npm run check` in session-viewer, which currently runs tsc, eslint, and prettier but not tests.

## Goals / Non-Goals

**Goals:**
- Add a test framework to session-viewer that can run integration tests for the parsing pipeline
- Create a minimal happy-path test as a steel thread for future test coverage
- Add a top-level script to run all non-e2e tests
- Integrate tests into the pre-commit check flow

**Non-Goals:**
- Exhaustive test coverage of all parsing edge cases (future work)
- Testing the gist-fetching logic (network layer)
- E2E test changes (separate test suite using pytest/playwright)

## Decisions

### Test Framework: Vitest

Use Vitest for testing session-viewer.

**Rationale:**
- Already using Vite for bundling—Vitest is the natural companion
- Zero-config with existing vite.config.ts
- Fast, modern, good TypeScript support
- Alternatives: Jest (heavier, more config), node:test (no Vite integration)

### Test File Location: Separate test directory

Place test files in a dedicated `test/` directory at the session-viewer root, mirroring the source structure.

**Rationale:**
- Clear separation between production code and test code
- Keeps `src/` focused on application code
- Test files use `*.test.ts` naming convention

### Test Fixture Strategy: Inline JSON strings

For the initial happy-path test, use inline JSONL strings in the test file rather than external fixture files.

**Rationale:**
- Keeps the test self-contained and readable
- Fixture is minimal (just a few lines)
- Future edge-case tests can add fixture files if they get complex

### parseEntries Extraction

Extract `parseEntries` as a named export from gistGateway.ts to make it testable without mocking fetch.

**Rationale:**
- Currently `parseEntries` is a private function
- Exporting it allows direct unit/integration testing of parsing logic
- No architectural change—just exposing an existing function

### Top-Level Test Script: bin/test

Create `bin/test` shell script that runs tests across all subprojects.

**Rationale:**
- Follows existing pattern (`bin/pre-commit`, `bin/prod-deploy-session-viewer`)
- Simple shell script, no additional tooling
- Can be extended as more subprojects add tests

### Pre-Commit Integration

Update `bin/pre-commit` to run `npm run test` in session-viewer.

**Rationale:**
- Tests run on every commit, catching regressions early
- Mirrors how `npm run check` already runs linting

## Risks / Trade-offs

**Risk: Test speed impacts commit flow**
→ Mitigation: Vitest is fast; initial test is minimal. Monitor as tests grow.

**Risk: parseEntries export leaks implementation detail**
→ Mitigation: It's already a well-defined function with clear input/output. Could add `@internal` JSDoc if desired.
