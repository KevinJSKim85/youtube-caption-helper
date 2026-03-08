"use client";

import { useEffect, useRef, useMemo } from "react";
import { TranscriptSegment } from "@/lib/types";
import { formatDisplayTime } from "@/lib/subtitle";

interface CaptionPanelProps {
  segments: TranscriptSegment[];
  currentTime: number;
  onSeek: (time: number) => void;
}

export default function CaptionPanel({
  segments,
  currentTime,
  onSeek,
}: CaptionPanelProps) {
  const activeRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeIndex = useMemo(() => {
    for (let i = segments.length - 1; i >= 0; i--) {
      if (currentTime >= segments[i].start) return i;
    }
    return -1;
  }, [segments, currentTime]);

  useEffect(() => {
    if (activeIndex < 0) return;
    const element = activeRef.current;
    const container = containerRef.current;
    if (!element || !container) return;

    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const isVisible =
      elementRect.top >= containerRect.top &&
      elementRect.bottom <= containerRect.bottom;

    if (!isVisible) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeIndex]);

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto h-full space-y-1 p-4 scrollbar-thin"
      role="log"
      aria-label="Caption display"
      aria-live="polite"
    >
      {segments.map((seg, i) => {
        const isActive = i === activeIndex;
        const isPast = i < activeIndex;

        return (
          <button
            type="button"
            key={`${seg.start}`}
            ref={isActive ? activeRef : null}
            onClick={() => onSeek(seg.start)}
            aria-current={isActive ? "true" : undefined}
            className={`
              w-full text-left px-4 py-3 rounded-lg transition-all duration-200
              cursor-pointer block
              ${
                isActive
                  ? "bg-yellow-400/20 border-l-4 border-yellow-400 text-white text-xl font-semibold scale-[1.02]"
                  : isPast
                    ? "text-gray-500 text-base hover:text-gray-300 hover:bg-white/5"
                    : "text-gray-300 text-base hover:text-white hover:bg-white/5"
              }
            `}
          >
            <span
              className={`
              font-mono mr-3 text-xs
              ${isActive ? "text-yellow-400" : "text-gray-600"}
            `}
            >
              {formatDisplayTime(seg.start)}
            </span>
            {seg.text}
          </button>
        );
      })}
    </div>
  );
}
