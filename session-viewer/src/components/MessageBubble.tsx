import ReactMarkdown from "react-markdown";
import type { DisplayMessage } from "../domain/messages";

interface MessageBubbleProps {
  message: DisplayMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

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
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
