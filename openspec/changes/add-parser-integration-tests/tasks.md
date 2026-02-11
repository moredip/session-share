## 1. Setup

- [x] 1.1 Create fixtures directory at `session-viewer/test/INTEGRATION/fixtures/`
- [x] 1.2 Review existing test pattern in `transcription-parsing.test.ts`

## 2. Tool Rendering Pattern Tests

- [x] 2.1 Extract Read tool variants fixture from gist e74f702fc43c0cef06b16cd3c5dacb60
- [x] 2.2 Create `read-tool-variants.test.ts` with explicit assertions for Read tool parsing
- [x] 2.3 Extract Edit tool variants fixture from gist 8871fc0f6a113826235b2428fbb27709
- [x] 2.4 Create `edit-tool-variants.test.ts` with explicit assertions for Edit tool parsing
- [ ] 2.5 Extract general tool calls fixture from gist 95599dbc3a863bd0febe19c323b8c24f
- [ ] 2.6 Create `general-tool-calls.test.ts` with explicit assertions for complex tool patterns

## 3. Content Variety Tests

- [ ] 3.1 Extract images in tool results fixture from gist ca8020ccee67d8bd1d8d2243e7ff75f0
- [ ] 3.2 Create `images-in-tool-results.test.ts` with explicit assertions for image element validation
- [ ] 3.3 Extract images in user messages fixture from local gist 46faec66d8f1536834cfbcd7905683a4
- [ ] 3.4 Create `images-in-user-messages.test.ts` with explicit assertions for user message images

## 4. Special Message Type Tests

- [ ] 4.1 Extract slash command fixture from gist 923d8bd8ab92eb070e35a5d0d4d1dfc2
- [ ] 4.2 Create `slash-commands.test.ts` with explicit assertions for slash command structure

## 5. Edge Case Tests

- [ ] 5.1 Extract unknown message type fixture from gist fab752159c58ba0041bcbbdc500006d9
- [ ] 5.2 Create `unknown-message-types.test.ts` with explicit assertions verifying graceful handling

## 6. Verification

- [ ] 6.1 Run all integration tests to verify they pass
- [ ] 6.2 Review test coverage to ensure all spec requirements are met
