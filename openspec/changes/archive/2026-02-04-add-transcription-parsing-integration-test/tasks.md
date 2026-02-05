## 1. Setup Vitest in session-viewer

- [x] 1.1 Install vitest as a dev dependency in session-viewer
- [x] 1.2 Add vitest config (or extend vite.config.ts) to include test directory
- [x] 1.3 Add `test` script to session-viewer package.json
- [x] 1.4 Create `test/` directory in session-viewer

## 2. Make parseEntries testable

- [x] 2.1 Export `parseEntries` function from gistGateway.ts

## 3. Create happy-path integration test

- [x] 3.1 Create `test/lib/gistGateway.test.ts` with inline JSONL fixture
- [x] 3.2 Test parses a minimal user message into correct UserStructuredEntry
- [x] 3.3 Test parses a minimal assistant message into correct AssistantStructuredEntry
- [x] 3.4 Verify the test passes with `npm run test`

## 4. Add top-level test runner

- [x] 4.1 Create `bin/test` script that runs tests in session-viewer
- [x] 4.2 Make `bin/test` executable

## 5. Integrate tests into pre-commit

- [x] 5.1 Update `bin/pre-commit` to run `npm run test` in session-viewer
