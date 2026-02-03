# Feature Branch Plan: Handle Images

**Branch:** `feature/handle-images`
**TODO item:** `- [ ] handle images`

## Overview

Claude Code sessions can include images in user messages (e.g., screenshots, uploaded images). Currently, the session-viewer does not recognize or render image content blocks, causing them to be silently dropped.

## Current Architecture

The parsing/rendering pipeline:

1. **JSONL parsing** (`lib/gistGateway.ts`) - Zod schemas validate content blocks
2. **Domain types** (`domain/transcriptEntry.ts`) - TypeScript interfaces define block types
3. **Structured entries** - Content extracted into `UserStructuredEntry.content` (text only)
4. **Rendering** (`components/MessageThread.tsx` → `UserMessage.tsx`) - ReactMarkdown renders text

Currently supported block types:
- `TextBlock`: `{ type: 'text', text: string }`
- `ToolResultBlock`: `{ type: 'tool_result', ... }`
- `ToolUseBlock`: `{ type: 'tool_use', ... }`
- `ThinkingBlock`: `{ type: 'thinking', ... }`

**Gap:** No `ImageBlock` type exists.

## Actual Schema (from real transcript)

Images appear inside `tool_result` content blocks when Claude reads an image file. Sample gist: `08fab1ce0966bd32a2b3ec7a02287119`

### User message entry containing an image:
```json
{
  "type": "user",
  "message": {
    "role": "user",
    "content": [
      {
        "tool_use_id": "toolu_011DwFwQM9jBf7vUEqpy6Mry",
        "type": "tool_result",
        "content": [
          {
            "type": "image",
            "source": {
              "type": "base64",
              "data": "iVBORw0KGgoAAAANSUhEUgAAAGQAAABk...",
              "media_type": "image/png"
            }
          }
        ]
      }
    ]
  },
  "toolUseResult": {
    "type": "image",
    "file": {
      "base64": "...",
      "type": "image/png",
      "originalSize": 1280,
      "dimensions": {
        "originalWidth": 100,
        "originalHeight": 100,
        "displayWidth": 100,
        "displayHeight": 100
      }
    }
  },
  "sourceToolAssistantUUID": "8ea9032e-2ac0-49e8-a50c-36dd9a5592b3"
}
```

### Key observations:
1. Images appear as content items inside `tool_result` blocks (not standalone)
2. The `ImageBlock` schema is: `{ type: 'image', source: { type: 'base64', data: string, media_type: string } }`
3. Additional metadata exists in top-level `toolUseResult.file` with dimensions
4. This happens when Claude uses the Read tool on an image file

## Implementation Plan

### Phase 1: Create Sample Session with Image (E2E Test) ✅

Create an e2e test that runs a Claude session with an image and publishes it. This serves two purposes:
1. Creates a real sample transcript containing an image block
2. Becomes our verification test once image rendering is implemented

**File:** `e2e-tests/test_image_rendering.py`

### Phase 2: Add ImageBlock Domain Type ✅

**File:** `session-viewer/src/domain/transcriptEntry.ts`

```typescript
export interface ImageSource {
  type: 'base64'
  media_type: string
  data: string
}

export interface ImageBlock {
  type: 'image'
  source: ImageSource
}

// Content items inside tool_result blocks
export type ToolResultContentItem = TextBlock | ImageBlock

// ToolResultBlock.content is always normalized to an array
export interface ToolResultBlock {
  type: 'tool_result'
  tool_use_id: string
  content: ToolResultContentItem[]
}

// Tool calls store results as content item arrays
export interface BaseToolCall {
  id: string
  name: string
  result?: ToolResultContentItem[]
  rawToolUseResult?: unknown
}
```

### Phase 3: Update Zod Schema for Parsing ✅

**File:** `session-viewer/src/lib/gistGateway.ts`

```typescript
const Base64SourceSchema = z.object({
  type: z.literal('base64'),
  media_type: z.string(),
  data: z.string(),
})

const ImageBlockSchema = z.object({
  type: z.literal('image'),
  source: Base64SourceSchema,
})

const ToolResultContentItemSchema = z.discriminatedUnion('type', [
  TextBlockSchema,
  ImageBlockSchema,
])

// Zod schema accepts string | array (matching JSON), normalization happens in parsing
const ToolResultBlockSchema = z.object({
  type: z.literal('tool_result'),
  tool_use_id: z.string(),
  content: z.union([z.string(), z.array(ToolResultContentItemSchema)]),
})
```

### Phase 4: Normalize and Correlate Tool Results ✅

**File:** `session-viewer/src/lib/gistGateway.ts`

Tool result content is normalized from `string | array` to `ToolResultContentItem[]` during parsing, then correlated to tool calls:

```typescript
for (const block of toolResultBlocks) {
  // Normalize string content to TextBlock array for consistent domain representation
  const content =
    typeof block.content === 'string'
      ? [{ type: 'text' as const, text: block.content }]
      : block.content

  toolResults.push({
    toolUseId: block.tool_use_id,
    content,
  })
}

// Later, correlate to tool calls:
toolCall.result = toolResult.content
```

### Phase 5: Create Tool Result Rendering Component ✅

**File:** `session-viewer/src/components/message-cards/tool-calls/ToolResultContent.tsx`

```typescript
interface ToolResultContentProps {
  content: ToolResultContentItem[]
}

export function ToolResultContent({ content }: ToolResultContentProps) {
  return (
    <>
      {content.map((item, index) => {
        if (item.type === 'text') {
          return <CodeBlock key={index}>{item.text}</CodeBlock>
        }
        if (item.type === 'image') {
          const src = `data:${item.source.media_type};base64,${item.source.data}`
          return (
            <img
              key={index}
              src={src}
              alt="Tool result image"
              className="max-w-full rounded-lg border border-gray-200"
            />
          )
        }
        return null
      })}
    </>
  )
}
```

### Phase 6: Update Tool Call Entries to Render Results ✅

**Files:**
- `session-viewer/src/components/message-cards/tool-calls/GenericToolCallEntry.tsx`
- `session-viewer/src/components/message-cards/tool-calls/ReadToolCallEntry.tsx`

Replace `<CodeBlock>{toolCall.result}</CodeBlock>` with `<ToolResultContent content={toolCall.result!} />`.

### Phase 7: Add Rendering Verification to E2E Test ✅

Update the e2e test to verify the image is rendered:

```python
def test_session_with_image_can_be_published(create_publish_then_view_session, tmp_path):
    """Publish a session containing an image and verify the viewer loads it."""
    fixtures = copy_fixtures_to_temp(tmp_path, "test_image.png")
    image_path = fixtures["test_image.png"]

    prompt = f"Describe this image briefly: {image_path}"

    page = create_publish_then_view_session(prompt)

    # Find and expand the Read tool call that contains the image
    read_tool_header = page.get_by_text("Read test_image.png")
    expect(read_tool_header).to_be_visible()
    read_tool_header.click()

    # Verify the image is rendered in the expanded tool result
    img_locator = page.locator("img[alt='Tool result image']")
    expect(img_locator).to_be_visible()

    # Verify the image src is a proper data URI
    src = img_locator.get_attribute("src")
    assert src is not None and src.startswith("data:image/"), (
        f"Expected image src to be a data URI, got: {src[:100] if src else None}"
    )
```

## File Summary

| File | Change |
|------|--------|
| `e2e-tests/test_image_rendering.py` | E2E test for sessions with images |
| `e2e-tests/fixtures/test_image.png` | Small test image for e2e tests |
| `domain/transcriptEntry.ts` | Add `ImageBlock`, `ImageSource`, `ToolResultContentItem` types |
| `lib/gistGateway.ts` | Add Zod schemas; normalize content in parser |
| `components/message-cards/tool-calls/ToolResultContent.tsx` | New component for rendering tool results |
| `components/message-cards/tool-calls/GenericToolCallEntry.tsx` | Use ToolResultContent |
| `components/message-cards/tool-calls/ReadToolCallEntry.tsx` | Use ToolResultContent |

## Testing Strategy

1. **E2E test (Phase 1):** Creates a real session with an image, publishes it
2. **E2E test (Phase 7):** Add rendering verification to the same test
3. **Manual test:** View the published gist locally during development

## Risks & Considerations

- **Large images:** Base64 data can be large. Consider lazy loading or size limits.
- **Security:** Images are user-provided. Use appropriate CSP headers.
- **Performance:** Many images could slow rendering. Consider virtualization later.
- **Accessibility:** Add meaningful alt text (currently using generic placeholder).

## Out of Scope

- Image zoom/lightbox functionality
- Image download
- Image thumbnails
- Images in assistant messages (Claude doesn't generate images)
