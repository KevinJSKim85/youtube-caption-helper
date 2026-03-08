"use client";

import { useEffect, useRef, useMemo, ReactNode } from "react";
import { TranscriptSegment } from "@/lib/types";
import { formatDisplayTime } from "@/lib/subtitle";

interface CaptionPanelProps {
  segments: TranscriptSegment[];
  currentTime: number;
  onSeek: (time: number) => void;
  isEnhanced?: boolean;
}

function renderSDHText(text: string, isActive: boolean): ReactNode {
  const parts: ReactNode[] = [];
  const bracketRegex = /\[([^\]]+)\]/g;
  const speakerRegex = /^([A-Z][a-zA-Z\s]*?):\s*/;

  let remaining = text;
  const speakerMatch = remaining.match(speakerRegex);
  if (speakerMatch) {
    parts.push(
      <span
        key="speaker"
        className={`font-bold ${isActive ? "text-cyan-300" : "text-cyan-500"}`}
      >
        {speakerMatch[1]}:
      </span>,
      " "
    );
    remaining = remaining.slice(speakerMatch[0].length);
  }

  let lastIndex = 0;
  let bracketIdx = 0;
  let match: RegExpExecArray | null = bracketRegex.exec(remaining);
  while (match !== null) {
    if (match.index > lastIndex) {
      parts.push(remaining.slice(lastIndex, match.index));
    }
    parts.push(
      <span
        key={`b-${bracketIdx}`}
        className={`italic text-sm ${isActive ? "text-purple-300" : "text-purple-400"}`}
      >
        [{match[1]}]
      </span>
    );
    bracketIdx += 1;
    lastIndex = match.index + match[0].length;
    match = bracketRegex.exec(remaining);
  }
  if (lastIndex < remaining.length) {
    parts.push(remaining.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export default function CaptionPanel({
  segments,
  currentTime,
  onSeek,
  isEnhanced = false,
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
      {isEnhanced && (
        <div className="flex items-center gap-2 px-4 py-2 mb-2 bg-purple-900/20 border border-purple-800/50 rounded-lg text-xs text-purple-300">
          <span className="font-medium">SDH Enhanced</span>
          <span className="text-purple-500">|</span>
          <span className="italic text-purple-400">[sounds]</span>
          <span className="font-bold text-cyan-500">Speaker:</span>
        </div>
      )}
      {segments.map((seg, i) => {
        const isActive = i === activeIndex;
        const isPast = i < activeIndex;

        return (
          <button
            type="button"
            key={`${seg.start}-${seg.text.slice(0, 20)}`}
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
            {isEnhanced ? renderSDHText(seg.text, isActive) : seg.text}
          </button>
        );
      })}
    </div>
  );
}
