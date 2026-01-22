import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchGistTranscriptFull,
  type TranscriptData,
} from "../lib/gistGateway";
import { MessageThread } from "./MessageThread";
import { RawTranscriptView } from "./RawTranscriptView";
import { ViewToggle, type ViewMode } from "./ViewToggle";

export function TranscriptViewer() {
  const { gistId } = useParams<{ gistId: string }>();
  const [data, setData] = useState<TranscriptData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("conversation");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gistId) return;

    async function loadTranscript() {
      try {
        setLoading(true);
        setError(null);
        const transcriptData = await fetchGistTranscriptFull(gistId!);
        setData(transcriptData);
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

  if (!data) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-gray-700">
          Session Transcript
        </h1>
        <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
      </div>
      {viewMode === "conversation" ? (
        <MessageThread entries={data.entries} />
      ) : (
        <RawTranscriptView entries={data.entries} />
      )}
    </div>
  );
}
