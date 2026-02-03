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

export type ImageSource =
  | { type: 'base64'; media_type: string; data: string }
  | { type: 'url'; url: string }

export type UserContentBlock = TextBlock | ToolResultBlock | ImageBlock
```

### Phase 3: Update Zod Schema for Parsing

**File:** `session-viewer/src/lib/gistGateway.ts`

```typescript
const ImageSourceSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('base64'),
    media_type: z.string(),
    data: z.string(),
  }),
  z.object({
    type: z.literal('url'),
    url: z.string(),
  }),
])

const ImageBlockSchema = z.object({
  type: z.literal('image'),
  source: ImageSourceSchema,
})

const UserContentBlockSchema = z.discriminatedUnion('type', [
  TextBlockSchema,
  ToolResultBlockSchema,
  ImageBlockSchema,  // Add this
])
```

### Phase 4: Update Structured Entry to Include Images

**File:** `session-viewer/src/domain/transcriptEntry.ts`

Modify `UserStructuredEntry` to carry image data:

```typescript
export interface UserStructuredEntry {
  kind: 'user'
  role: 'user'
  content: string
  images?: ImageBlock[]  // Add this
  isToolResultOnly?: boolean
}
```

**File:** `session-viewer/src/lib/gistGateway.ts`

In `parseUserStructuredEntry`, extract image blocks alongside text:

```typescript
const imageBlocks = entryData.message.content.filter(
  (block): block is ImageBlock => block.type === 'image'
)
// Include in returned entry
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
- Images in tool results (separate concern)
