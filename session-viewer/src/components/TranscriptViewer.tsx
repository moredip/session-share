import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchGistTranscript } from "../lib/gistGateway";
import type { DisplayMessage } from "../domain/messages";
import { MessageThread } from "./MessageThread";

export function TranscriptViewer() {
  const { gistId } = useParams<{ gistId: string }>();
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gistId) return;

    async function loadTranscript() {
      try {
        setLoading(true);
        setError(null);
        const messages = await fetchGistTranscript(gistId!);
        setMessages(messages);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load transcript",
        );
      } finally {
        setLoading(false);
      }
    }

    loadTranscript();
  }, [gistId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading transcript...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4 text-gray-700">
        Session Transcript
      </h1>
      <MessageThread messages={messages} />
    </div>
  );
}
