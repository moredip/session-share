import type { DisplayMessage } from "../domain/messages";
import { MessageBubble } from "./MessageBubble";

interface MessageThreadProps {
  messages: DisplayMessage[];
}

export function MessageThread({ messages }: MessageThreadProps) {
  return (
    <div className="flex flex-col gap-4">
      {messages.map((message) => (
        <MessageBubble key={message.uuid} message={message} />
      ))}
    </div>
  );
}
