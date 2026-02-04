## Why

The transcript parsing pipeline lacks integration tests. While the pipeline has clear documentation of its behavior (domain model, normalization rules, tool correlation), there's no test that verifies the end-to-end transformation from raw JSONL to domain entities. Adding an initial happy-path test establishes a steel thread for future tests covering edge cases and complex scenarios.

## What Changes

- Add an integration test that exercises the full parsing pipeline with a minimal valid transcript
- Create a simple test fixture (raw JSONL) containing basic message types
- Assert that parsed domain entities match expected structure
- Establish testing patterns (fixture organization, assertion style) for future transcript parsing tests
- Add a top-level script (`npm run test` or similar) that runs all non-e2e tests across the repo
- Update the `check` task (pre-commit hook) to run the new test script, ensuring tests run on every commit

## Capabilities

### New Capabilities
<!-- No new capabilities - this is test infrastructure -->

### Modified Capabilities
<!-- No spec-level changes - implementation/testing only -->

## Impact

- **Code**: New test file(s) in session-viewer test directory
- **Test fixtures**: Minimal JSONL sample file(s) for the happy-path scenario
- **Dependencies**: May need test framework setup if not already present in session-viewer
- **Scripts**: New top-level test runner script in bin/
- **CI/Hooks**: Modified `check` task to include test execution in the pre-commit flow
