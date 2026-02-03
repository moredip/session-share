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

### Phase 1: Create Sample Session with Image (E2E Test)

Create an e2e test that runs a Claude session with an image and publishes it. This serves two purposes:
1. Creates a real sample transcript containing an image block
2. Becomes our verification test once image rendering is implemented

**File:** `e2e-tests/test_image_rendering.py`

```python
def test_session_with_image_can_be_published(tmp_path):
    """Create and publish a session containing an image."""
    # Copy a small test image to tmp_path
    # Run claude with: "What do you see in this image? [path]"
    # Publish the session
    # (No rendering verification yet - just confirms the session can be created)
```

The published gist from this test provides a real sample with image data that we can use for local development.

### Phase 2: Add ImageBlock Domain Type

**File:** `session-viewer/src/domain/transcriptEntry.ts`

```typescript
export interface ImageBlock {
  type: 'image'
  source: ImageSource
}

export type ImageSource = {
  type: 'base64'
  media_type: string
  data: string
}

// ImageBlock appears inside ToolResultBlock.content
export type ToolResultContentItem = string | ImageBlock
```

### Phase 3: Update Zod Schema for Parsing

**File:** `session-viewer/src/lib/gistGateway.ts`

```typescript
const ImageSourceSchema = z.object({
  type: z.literal('base64'),
  media_type: z.string(),
  data: z.string(),
})

const ImageBlockSchema = z.object({
  type: z.literal('image'),
  source: ImageSourceSchema,
})

// tool_result content can contain images
const ToolResultContentItemSchema = z.union([
  z.string(),
  ImageBlockSchema,
])

// Update ToolResultBlockSchema to parse content array with images
```

### Phase 4: Extract Images from Tool Results

**File:** `session-viewer/src/lib/gistGateway.ts`

Images live inside `tool_result` content arrays. When parsing user entries, extract images from tool results:

```typescript
// In parseUserStructuredEntry or similar:
const images: ImageBlock[] = []
for (const block of entryData.message.content) {
  if (block.type === 'tool_result' && Array.isArray(block.content)) {
    for (const item of block.content) {
      if (typeof item === 'object' && item.type === 'image') {
        images.push(item)
      }
    }
  }
}
```

### Phase 5: Create Image Rendering Component

**File:** `session-viewer/src/components/message-cards/ImageBlock.tsx`

```typescript
interface ImageBlockProps {
  source: ImageSource
}

export function ImageBlockDisplay({ source }: ImageBlockProps) {
  const src = source.type === 'base64'
    ? `data:${source.media_type};base64,${source.data}`
    : source.url

  return (
    <img
      src={src}
      alt="User-provided image"
      className="max-w-full rounded-lg border border-gray-200"
    />
  )
}
```

### Phase 6: Update UserMessage to Render Images

**File:** `session-viewer/src/components/message-cards/UserMessage.tsx`

```typescript
interface UserMessageProps {
  content: string
  images?: ImageBlock[]
  anchorId: string
}

export function UserMessage({ content, images, anchorId }: UserMessageProps) {
  return (
    <MessageCard anchorId={anchorId} label="user" align="right" variant="sky">
      {images?.map((img, i) => (
        <ImageBlockDisplay key={i} source={img.source} />
      ))}
      {content && (
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </MessageCard>
  )
}
```

### Phase 7: Update MessageThread to Pass Images

**File:** `session-viewer/src/components/MessageThread.tsx`

Pass `images` prop from `UserStructuredEntry` to `UserMessage`.

### Phase 8: Add Rendering Verification to E2E Test

Update the Phase 1 test to verify the image is rendered:

```python
def test_session_with_image_renders_correctly(create_publish_then_view_session, tmp_path):
    """Create, publish, and view a session containing an image."""
    # ... existing setup ...
    # Navigate to the published session
    # Verify <img> tag appears with correct src attribute
    expect(page.locator("img[alt='User-provided image']")).to_be_visible()
```

## File Summary

| File | Change |
|------|--------|
| `e2e-tests/test_image_rendering.py` | New test file (creates sample session with image) |
| `e2e-tests/fixtures/test_image.png` | Small test image for e2e tests |
| `domain/transcriptEntry.ts` | Add `ImageBlock`, `ImageSource` types; extend `UserStructuredEntry` |
| `lib/gistGateway.ts` | Add Zod schemas; extract images in parser |
| `components/message-cards/ImageBlock.tsx` | New component for rendering images |
| `components/message-cards/UserMessage.tsx` | Accept and render images |
| `components/MessageThread.tsx` | Pass images to UserMessage |

## Testing Strategy

1. **E2E test (Phase 1):** Creates a real session with an image, publishes it
2. **E2E test (Phase 8):** Add rendering verification to the same test
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
