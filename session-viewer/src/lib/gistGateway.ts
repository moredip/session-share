import { z } from "zod";
import type { DisplayMessage } from "../domain/messages";

interface GistFile {
  filename: string;
  raw_url: string;
}

interface GistResponse {
  files: Record<string, GistFile>;
}

const TextBlockSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
});

const ToolUseBlockSchema = z.object({
  type: z.literal("tool_use"),
  id: z.string(),
  name: z.string(),
  input: z.record(z.unknown()),
});

const ThinkingBlockSchema = z.object({
  type: z.literal("thinking"),
  thinking: z.string(),
});

const ToolResultBlockSchema = z.object({
  type: z.literal("tool_result"),
  tool_use_id: z.string(),
  content: z.union([z.string(), z.array(TextBlockSchema)]),
});

const AssistantContentBlockSchema = z.discriminatedUnion("type", [
  TextBlockSchema,
  ToolUseBlockSchema,
  ThinkingBlockSchema,
]);

const UserContentBlockSchema = z.discriminatedUnion("type", [
  TextBlockSchema,
  ToolResultBlockSchema,
]);

const UserContentSchema = z.union([
  z.string(),
  z.array(UserContentBlockSchema),
]);

const UserMessageEntrySchema = z.object({
  uuid: z.string(),
  parentUuid: z.string().nullable(),
  type: z.literal("user"),
  timestamp: z.string(),
  sessionId: z.string(),
  message: z.object({
    role: z.literal("user"),
    content: UserContentSchema,
  }),
});

const AssistantMessageEntrySchema = z.object({
  uuid: z.string(),
  parentUuid: z.string().nullable(),
  type: z.literal("assistant"),
  timestamp: z.string(),
  sessionId: z.string().optional(),
  message: z.object({
    role: z.literal("assistant"),
    content: z.array(AssistantContentBlockSchema),
  }),
});

const MessageEntrySchema = z.discriminatedUnion("type", [
  UserMessageEntrySchema,
  AssistantMessageEntrySchema,
]);

type TextBlock = z.infer<typeof TextBlockSchema>;

function parseTranscript(jsonlContent: string): DisplayMessage[] {
  const lines = jsonlContent.trim().split("\n");
  const messages: DisplayMessage[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const parsed = JSON.parse(line);

    if (parsed.type !== "user" && parsed.type !== "assistant") {
      console.log("skipping unhandled message type:", parsed.type);
      continue;
    }

    const entry = MessageEntrySchema.parse(parsed);

    if (entry.type === "user") {
      const content =
        typeof entry.message.content === "string"
          ? entry.message.content
          : entry.message.content
              .filter(
                (block): block is z.infer<typeof TextBlockSchema> =>
                  block.type === "text",
              )
              .map((block) => block.text)
              .join("\n");
      if (content.trim()) {
        messages.push({
          uuid: entry.uuid,
          role: "user",
          content,
          timestamp: entry.timestamp,
        });
      }
    } else if (entry.type === "assistant") {
      const textContent = entry.message.content
        .filter((block): block is TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("\n");

      if (textContent.trim()) {
        messages.push({
          uuid: entry.uuid,
          role: "assistant",
          content: textContent,
          timestamp: entry.timestamp,
        });
      }
    }
  }

  return messages;
}

export async function fetchGistTranscript(
  gistId: string,
): Promise<DisplayMessage[]> {
  const metaResponse = await fetch(`https://api.github.com/gists/${gistId}`);
  if (!metaResponse.ok) {
    throw new Error(`Failed to fetch gist metadata: ${metaResponse.status}`);
  }

  const gist: GistResponse = await metaResponse.json();

  const jsonlFile = Object.values(gist.files).find((f) =>
    f.filename.endsWith(".jsonl"),
  );

  if (!jsonlFile) {
    throw new Error("No .jsonl file found in gist");
  }

  const contentResponse = await fetch(jsonlFile.raw_url);
  if (!contentResponse.ok) {
    throw new Error(
      `Failed to fetch transcript content: ${contentResponse.status}`,
    );
  }

  const content = await contentResponse.text();
  return parseTranscript(content);
}
