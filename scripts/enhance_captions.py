import sys
import json
import os
import google.generativeai as genai

SYSTEM_PROMPT = """You are an SDH (Subtitles for the Deaf and Hard of Hearing) caption specialist.

Your job: take existing video captions and enhance them for deaf/hard-of-hearing viewers.

ADD these annotations where appropriate:
- [music playing], [upbeat music], [dramatic music], [music stops] for background music
- [applause], [laughter], [cheering] for audience/crowd sounds
- [door slams], [footsteps], [splash], [explosion] etc. for sound effects
- [whispers], [shouts], [crying], [sighs] for vocal tones/emotions
- [silence], [static], [beeping] for notable audio states
- Speaker labels (e.g., "Host:", "Man:", "Woman:", "Narrator:") when speaker changes

RULES:
1. Keep ALL original caption text exactly as-is — never delete or rephrase dialogue
2. Add sound descriptions in square brackets [] BEFORE or BETWEEN existing captions
3. Each output line must be valid JSON: {"start": <seconds>, "duration": <seconds>, "text": "<text>"}
4. Sound-only annotations get their own entry with appropriate start time and short duration (1-2 sec)
5. Speaker labels are prepended to the dialogue text (e.g., "Host: Take off your blindfolds.")
6. Use the video content to identify sounds that are NOT obvious from dialogue alone
7. Output ONLY a JSON array of caption objects, nothing else
8. Respond with the COMPLETE enhanced caption list — do not truncate or summarize"""


def main():
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        print(json.dumps({"error": "GEMINI_API_KEY environment variable is not set. Get a free key at https://ai.google.dev"}))
        sys.exit(1)

    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: enhance_captions.py <video_id> <captions_json>"}))
        sys.exit(1)

    video_id = sys.argv[1]
    captions = json.loads(sys.argv[2])

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash")

    captions_text = json.dumps(captions[:200], ensure_ascii=False)

    prompt = f"""Analyze this YouTube video: https://www.youtube.com/watch?v={video_id}

Here are the existing captions (first 200 segments):
{captions_text}

Enhance these captions following the SDH rules. Add sound effect descriptions, speaker labels, and audio context annotations. Output the enhanced captions as a JSON array."""

    try:
        response = model.generate_content(
            [SYSTEM_PROMPT, prompt],
            generation_config=genai.types.GenerationConfig(
                temperature=0.3,
                max_output_tokens=8192,
            ),
        )

        result_text = response.text.strip()
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.startswith("```"):
            result_text = result_text[3:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]
        result_text = result_text.strip()

        enhanced = json.loads(result_text)

        if not isinstance(enhanced, list):
            raise ValueError("Expected JSON array")

        print(json.dumps({"segments": enhanced}))

    except json.JSONDecodeError:
        print(json.dumps({"error": "AI returned invalid JSON. Please try again."}))
        sys.exit(1)
    except Exception as e:
        error_msg = str(e)
        if "API_KEY" in error_msg or "403" in error_msg:
            error_msg = "Invalid Gemini API key. Get a free key at https://ai.google.dev"
        print(json.dumps({"error": error_msg}))
        sys.exit(1)


if __name__ == "__main__":
    main()
