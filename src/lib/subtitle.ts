import { TranscriptSegment } from "./types";

function pad(num: number, size: number = 2): string {
  return num.toString().padStart(size, "0");
}

function formatTimeSRT(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const ms = Math.round((totalSeconds % 1) * 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
}

function formatTimeVTT(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const ms = Math.round((totalSeconds % 1) * 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(ms, 3)}`;
}

export function toSRT(segments: TranscriptSegment[]): string {
  return segments
    .map((seg, i) => {
      const start = formatTimeSRT(seg.start);
      const end = formatTimeSRT(seg.start + seg.duration);
      return `${i + 1}\n${start} --> ${end}\n${seg.text}\n`;
    })
    .join("\n");
}

export function toVTT(segments: TranscriptSegment[]): string {
  const header = "WEBVTT\n\n";
  const body = segments
    .map((seg, i) => {
      const start = formatTimeVTT(seg.start);
      const end = formatTimeVTT(seg.start + seg.duration);
      return `${i + 1}\n${start} --> ${end}\n${seg.text}\n`;
    })
    .join("\n");
  return header + body;
}

export function toPlainText(segments: TranscriptSegment[]): string {
  return segments.map((seg) => seg.text).join("\n");
}

export function formatDisplayTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${pad(s)}`;
}
