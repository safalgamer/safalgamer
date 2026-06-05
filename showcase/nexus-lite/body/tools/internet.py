import requests
from bs4 import BeautifulSoup
import urllib.parse

def search(query: str) -> str:
    try:
        encoded = urllib.parse.quote_plus(query)
        url = f"https://html.duckduckgo.com/html/?q={encoded}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                         "AppleWebKit/537.36 (KHTML, like Gecko) "
                         "Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            "Connection": "keep-alive",
        }
        r = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(r.text, "html.parser")
        
        # try multiple selectors because DDG changes their HTML
        snippets = []
        for selector in [".result__snippet", ".result__body", 
                         ".result__text", "a.result__snippet",
                         ".results_links .result__snippet"]:
            found = soup.select(selector)
            if found:
                snippets = [x.get_text(strip=True) for x in found[:3]]
                break
        
        # if still nothing, try getting all text from result divs
        if not snippets:
            result_divs = soup.find_all("div", class_=lambda x: x and "result" in x.lower())
            for div in result_divs[:5]:
                text = div.get_text(strip=True)
                if len(text) > 40 and "DuckDuckGo" not in text[:20]:
                    snippets.append(text[:200])
        
        # absolute last fallback — get all paragraph text
        if not snippets:
            paras = soup.find_all("p")
            for p in paras[:5]:
                text = p.get_text(strip=True)
                if len(text) > 40:
                    snippets.append(text[:200])
        
        result = "\n".join(snippets[:3])
        # if result starts with DuckDuckGo branding, it failed
        if not result or result.strip().startswith("DuckDuckGo") or len(result.strip()) < 20:
            return ""
        return result
        
    except Exception as e:
        return ""

def fetch(url: str) -> str:
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        r = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(r.text, "html.parser")
        # remove scripts and styles
        for tag in soup(["script", "style", "nav", "footer"]):
            tag.decompose()
        text = soup.get_text(separator=" ", strip=True)
        # collapse whitespace
        import re
        text = re.sub(r'\s+', ' ', text)
        return text[:3000]
    except:
        return ""
