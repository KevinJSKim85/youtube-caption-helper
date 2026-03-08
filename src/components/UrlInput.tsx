"use client";

import { useState, FormEvent } from "react";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export default function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 w-full">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="YouTube URL (e.g. https://youtube.com/watch?v=...)"
        disabled={isLoading}
        aria-label="YouTube video URL"
        className="flex-1 px-5 py-4 bg-gray-900 border-2 border-gray-700 rounded-xl text-white text-lg
          placeholder-gray-500 focus:border-yellow-400 focus:outline-none transition-colors
          disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={isLoading || !url.trim()}
        className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-700 disabled:text-gray-500
          text-gray-900 font-bold text-lg rounded-xl transition-colors whitespace-nowrap
          disabled:cursor-not-allowed"
      >
        {isLoading ? "Extracting..." : "Extract Captions"}
      </button>
    </form>
  );
}
