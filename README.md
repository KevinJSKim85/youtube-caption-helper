# Caption Helper

YouTube video caption tool for deaf and hard-of-hearing accessibility.

## Features

- **Synced Captions** — Paste a YouTube URL, watch with real-time highlighted captions synced to the video player
- **Subtitle Downloads** — Export captions as SRT, VTT, or TXT files
- **Multi-language** — Supports all available caption tracks (auto-generated and manual)
- **SDH Enhanced Captions** — AI-powered enhanced captions with sound descriptions (`[applause]`, `[music]`), speaker labels (`Host:`, `Narrator:`), and emotional cues (`[whispers]`, `[laughter]`) via Google Gemini

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+ with `youtube-transcript-api` installed:
  ```bash
  pip install youtube-transcript-api
  ```

### Setup

```bash
git clone https://github.com/KevinJSKim85/youtube-caption-helper.git
cd youtube-caption-helper
npm install
```

### SDH Enhanced Captions (Optional)

To enable AI-powered SDH captions, you need a free Gemini API key:

1. Get a key at [https://ai.google.dev](https://ai.google.dev)
2. Create `.env.local` in the project root:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
3. Install the Python dependency:
   ```bash
   pip install google-generativeai
   ```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

1. Enter a YouTube URL
2. Captions are extracted via Python `youtube-transcript-api` (InnerTube API)
3. Watch with synced, highlighted captions — click any line to jump to that point
4. Download subtitle files in SRT/VTT/TXT format
5. (Optional) Click "Generate SDH Captions" to enhance with AI-powered sound descriptions and speaker labels

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **YouTube IFrame Player API**
- **Python** (`youtube-transcript-api`, `google-generativeai`)
- **Google Gemini 2.0 Flash** (SDH caption enhancement)
