import ReactMarkdown from "react-markdown";
import { ThinkingBlock } from "./ThinkingBlock";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  thinkingContent?: string;
}

export function MessageBubble({
  role,
  content,
  thinkingContent,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
        }`}
      >
        <div className="text-xs opacity-60 mb-1">
          {isUser ? "User" : "Assistant"}
        </div>
        {thinkingContent && <ThinkingBlock content={thinkingContent} />}
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
