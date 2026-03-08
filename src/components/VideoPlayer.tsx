"use client";

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface VideoPlayerProps {
  videoId: string;
  onTimeUpdate: (time: number) => void;
}

export interface VideoPlayerHandle {
  seekTo: (time: number) => void;
}

let apiLoaded = false;
let apiReady = false;
const readyCallbacks: (() => void)[] = [];

function ensureYouTubeAPI(callback: () => void) {
  if (apiReady) {
    callback();
    return;
  }

  readyCallbacks.push(callback);

  if (!apiLoaded) {
    apiLoaded = true;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      apiReady = true;
      for (const cb of readyCallbacks) cb();
      readyCallbacks.length = 0;
    };
  }
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer({ videoId, onTimeUpdate }, ref) {
    const playerRef = useRef<YT.Player | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const startTracking = useCallback(() => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => {
        if (playerRef.current?.getCurrentTime) {
          onTimeUpdate(playerRef.current.getCurrentTime());
        }
      }, 100);
    }, [onTimeUpdate]);

    const stopTracking = useCallback(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, []);

    useImperativeHandle(ref, () => ({
      seekTo: (time: number) => {
        playerRef.current?.seekTo(time, true);
      },
    }));

    useEffect(() => {
      ensureYouTubeAPI(() => {
        if (!containerRef.current) return;

        if (playerRef.current) {
          playerRef.current.destroy();
          stopTracking();
        }

        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId,
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 0,
            cc_load_policy: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
          },
          events: {
            onStateChange: (event: YT.OnStateChangeEvent) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                startTracking();
              } else {
                stopTracking();
                if (playerRef.current?.getCurrentTime) {
                  onTimeUpdate(playerRef.current.getCurrentTime());
                }
              }
            },
          },
        });
      });

      return () => {
        stopTracking();
        playerRef.current?.destroy();
        playerRef.current = null;
      };
    }, [videoId, startTracking, stopTracking, onTimeUpdate]);

    return (
      <div className="aspect-video w-full bg-black rounded-xl overflow-hidden">
        <div ref={containerRef} className="w-full h-full" />
      </div>
    );
  }
);

export default VideoPlayer;
