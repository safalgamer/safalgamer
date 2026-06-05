import requests
import time
from config import GROQ_API_KEY, GROQ_MODEL

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


def call_groq(system_prompt, user_prompt, max_retries=3):
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.85,
        "max_tokens": 2048,
        "top_p": 0.9
    }

    for attempt in range(max_retries):
        try:
            resp = requests.post(GROQ_URL, headers=headers, json=payload, timeout=60)

            if resp.status_code == 429:
                wait = min(2 ** attempt * 5, 30)
                print(f"  [Rate limited] Waiting {wait}s...")
                time.sleep(wait)
                continue

            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"].strip()

        except requests.exceptions.RequestException as e:
            if attempt < max_retries - 1:
                time.sleep(2)
            else:
                return f"[API Error: {e}]"

    return "[Failed after retries]"
