"use client";

import { useState, useCallback, useRef } from "react";
import UrlInput from "@/components/UrlInput";
import VideoPlayer, { VideoPlayerHandle } from "@/components/VideoPlayer";
import CaptionPanel from "@/components/CaptionPanel";
import DownloadPanel from "@/components/DownloadPanel";
import { TranscriptSegment, CaptionTrack } from "@/lib/types";

interface TranscriptState {
  videoId: string;
  title: string;
  segments: TranscriptSegment[];
  availableTracks: CaptionTrack[];
  selectedTrack: CaptionTrack;
}

export default function Home() {
  const [transcript, setTranscript] = useState<TranscriptState | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState("");
  const playerRef = useRef<VideoPlayerHandle>(null);

  const fetchCaptions = useCallback(async (url: string, lang?: string) => {
    setIsLoading(true);
    setError(null);
    setInputUrl(url);

    try {
      const params = new URLSearchParams({ url });
      if (lang) params.set("lang", lang);

      const response = await fetch(`/api/transcript?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract captions");
      }

      setTranscript({
        videoId: data.videoId,
        title: data.title,
        segments: data.segments,
        availableTracks: data.availableTracks,
        selectedTrack: data.selectedTrack,
      });
      setCurrentTime(0);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      setTranscript(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSeek = useCallback((time: number) => {
    playerRef.current?.seekTo(time);
  }, []);

  const handleLanguageChange = useCallback(
    (lang: string) => {
      fetchCaptions(inputUrl, lang);
    },
    [inputUrl, fetchCaptions]
  );

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center text-gray-900 font-bold text-lg">
              CC
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Caption Helper</h1>
              <p className="text-sm text-gray-400">
                YouTube video captions for accessibility
              </p>
            </div>
          </div>
          <UrlInput
            onSubmit={(url) => fetchCaptions(url)}
            isLoading={isLoading}
          />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div
            className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-xl text-red-300"
            role="alert"
          >
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 text-lg">Extracting captions...</p>
            </div>
          </div>
        )}

        {transcript && !isLoading && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-300 truncate">
              {transcript.title}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <VideoPlayer
                ref={playerRef}
                videoId={transcript.videoId}
                onTimeUpdate={setCurrentTime}
              />

              <div className="bg-gray-900 rounded-xl border border-gray-800 h-[360px] lg:h-auto lg:max-h-[480px]">
                <CaptionPanel
                  segments={transcript.segments}
                  currentTime={currentTime}
                  onSeek={handleSeek}
                />
              </div>
            </div>

            <DownloadPanel
              segments={transcript.segments}
              videoId={transcript.videoId}
              availableTracks={transcript.availableTracks}
              selectedTrack={transcript.selectedTrack}
              onLanguageChange={handleLanguageChange}
            />
          </div>
        )}

        {!transcript && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-4xl">CC</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-300 mb-3">
              Paste a YouTube URL to start
            </h2>
            <p className="text-gray-500 max-w-md text-lg leading-relaxed">
              Extract captions from any YouTube video. Watch with synced
              subtitles or download caption files (SRT, VTT) for your own
              videos.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
