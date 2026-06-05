import os
import random
from pathlib import Path

SKIP_DIRS = {
    'AppData', 'node_modules', '.git', '__pycache__', 'venv',
    '.rustup', '.cargo', 'rust', 'Rust', '.vscode', 'vscode',
    'extensions', 'generated', 'docs', 'doc', 'target',
    'dist', 'build', 'cache', 'Cache', 'temp', 'Temp', 'tmp',
    'site-packages', 'Lib', 'lib', 'Include', 'Scripts',
    'x86_64', 'x86', 'aarch64', 'loongarch64', 'arm',
    'node', 'npm', 'yarn', 'pip', 'wheel',
    '.npm', '.yarn', '.pip', 'miniconda', 'anaconda',
    'WindowsApps', 'MicrosoftEdge', 'Windows',
}

SKIP_EXTENSIONS = {
    '.html', '.htm', '.pdb', '.lib', '.dll', '.exe', '.so',
    '.dylib', '.rlib', '.rmeta', '.d', '.pyi', '.tga', '.png',
    '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2',
    '.ttf', '.eot', '.map', '.lock', '.toml', '.pbtxt',
    '.dtd', '.xsd', '.rs', '.cs', '.cpp', '.c', '.h',
}

ALLOWED_EXTENSIONS = {
    '.txt', '.md', '.py', '.js', '.json', '.log', '.csv', '.yml', '.env', '.bat', '.cfg', '.ini', '.sh'
}

PRIORITY_DIRS = os.getenv('NEXUS_PRIORITY_DIRS', 'Desktop,Documents,Downloads,projects').split(',')
PRIORITY_DIRS = [os.path.join(os.getenv('USERPROFILE', os.getenv('HOME', '')), d.strip()) for d in PRIORITY_DIRS if d.strip()]

# Keep track of visited files
visited_files = set()

def _is_allowed_file(filepath: str) -> bool:
    """Check if a file should be read."""
    ext = os.path.splitext(filepath)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False
    
    # Check file size - max 30KB
    try:
        if os.path.getsize(filepath) > 30 * 1024:
            return False
    except:
        return False
    
    return True

def _is_html_content(content_snippet: str) -> bool:
    """Check if content looks like HTML."""
    if not content_snippet:
        return False
    stripped = content_snippet.strip()
    if stripped.startswith('<!DOCTYPE') or \
       stripped.startswith('<html') or \
       stripped.startswith('<?xml') or \
       '<meta' in stripped[:100] or \
       '<head>' in stripped[:100]:
        return True
    return False

def read_random_file() -> tuple:
    """
    Read a random personal file from priority directories.
    Returns: (filename, file_content_preview, full_path)
    """
    # First, try priority directories
    for priority_dir in PRIORITY_DIRS:
        if not os.path.exists(priority_dir):
            continue
        
        try:
            candidates = []
            for root, dirs, files in os.walk(priority_dir):
                # Remove skip dirs in-place to prevent descending
                dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
                
                for filename in files:
                    filepath = os.path.join(root, filename)
                    
                    # Skip if already visited
                    if filepath in visited_files:
                        continue
                    
                    # Check if file is allowed
                    if _is_allowed_file(filepath):
                        candidates.append(filepath)
            
            if candidates:
                filepath = random.choice(candidates)
                visited_files.add(filepath)
                
                # Read content
                try:
                    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    
                    # Skip HTML content
                    if _is_html_content(content):
                        return None
                    
                    # Get preview (first 200 chars)
                    preview = content[:200].replace('\n', ' ')
                    filename = os.path.basename(filepath)
                    
                    return (filename, preview, filepath)
                except:
                    pass
        except:
            pass
    
    return None

def get_visited_count() -> int:
    """Get count of files we've already visited."""
    return len(visited_files)
