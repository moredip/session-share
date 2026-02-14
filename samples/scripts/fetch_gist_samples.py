#!/usr/bin/env python3
"""Fetch and index CustardSeed transcript gists from GitHub."""
import json
import os
import subprocess
import sys
from datetime import datetime, timezone


GIST_SAMPLES_DIR = os.path.join(os.path.dirname(__file__), "..", "gist-samples")
DESCRIPTION_MARKER = "Claude Code session transcript:"


def run_gh(args: list[str]) -> str:
    result = subprocess.run(["gh", *args], capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"gh {' '.join(args)} failed: {result.stderr}")
    return result.stdout


def discover_gists() -> list[dict]:
    """Return all gists whose description contains the CustardSeed marker."""
    raw = run_gh(["api", "/gists", "--paginate"])
    all_gists = json.loads(raw)
    return [g for g in all_gists if DESCRIPTION_MARKER in (g.get("description") or "")]


def download_gist(gist_id: str, dest_dir: str) -> list[str]:
    """Download all files in a gist to dest_dir. Returns list of downloaded file paths."""
    os.makedirs(dest_dir, exist_ok=True)
    raw = run_gh(["api", f"/gists/{gist_id}"])
    gist_data = json.loads(raw)
    files = gist_data.get("files", {})
    written = []
    for filename, file_info in files.items():
        content = file_info.get("content", "")
        path = os.path.join(dest_dir, filename)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        written.append(path)
    return written


def analyze_transcript(path: str) -> dict:
    """Parse a JSONL transcript and return analysis metadata."""
    entry_type_counts: dict[str, int] = {}
    content_block_counts: dict[str, int] = {}
    tools_used: set[str] = set()
    has_thinking = False
    has_images = False
    total_entries = 0

    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue

            total_entries += 1
            entry_type = entry.get("type", "unknown")
            entry_type_counts[entry_type] = entry_type_counts.get(entry_type, 0) + 1

            # Inspect content blocks in user/assistant messages
            message = entry.get("message", {})
            content = message.get("content", [])
            if isinstance(content, list):
                for block in content:
                    if not isinstance(block, dict):
                        continue
                    block_type = block.get("type", "")
                    content_block_counts[block_type] = content_block_counts.get(block_type, 0) + 1
                    if block_type == "tool_use":
                        tool_name = block.get("name")
                        if tool_name:
                            tools_used.add(tool_name)
                    elif block_type == "thinking":
                        has_thinking = True
                    elif block_type == "image":
                        has_images = True
                    elif block_type == "tool_result":
                        # tool_result content can itself be a list of blocks
                        inner = block.get("content", [])
                        if isinstance(inner, list):
                            for inner_block in inner:
                                if isinstance(inner_block, dict):
                                    inner_type = inner_block.get("type", "")
                                    if inner_type == "image":
                                        has_images = True

    return {
        "entry_type_counts": entry_type_counts,
        "content_block_counts": content_block_counts,
        "tools_used": sorted(tools_used),
        "has_thinking": has_thinking,
        "has_images": has_images,
        "total_entries": total_entries,
    }


def process_gist(gist_id: str) -> dict:
    dest_dir = os.path.join(GIST_SAMPLES_DIR, gist_id)
    print(f"  Downloading {gist_id}...", end=" ", flush=True)
    file_paths = download_gist(gist_id, dest_dir)
    print(f"{len(file_paths)} file(s)")

    jsonl_files = [p for p in file_paths if p.endswith(".jsonl")]

    # Separate main transcript from subagent transcripts
    # Main transcript: the one whose filename looks like a session UUID (no "agent-" prefix)
    main_files = [p for p in jsonl_files if not os.path.basename(p).startswith("agent-")]
    agent_files = [p for p in jsonl_files if os.path.basename(p).startswith("agent-")]

    main_transcript = None
    if main_files:
        path = main_files[0]
        analysis = analyze_transcript(path)
        analysis["filename"] = os.path.basename(path)
        main_transcript = analysis

    subagent_transcripts = []
    for path in agent_files:
        analysis = analyze_transcript(path)
        analysis["filename"] = os.path.basename(path)
        subagent_transcripts.append(analysis)

    return {
        "gist_id": gist_id,
        "viewer_url": f"https://custardseed.com/g/{gist_id}",
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "main_transcript": main_transcript,
        "subagent_transcripts": subagent_transcripts,
        "has_subagents": len(agent_files) > 0,
    }


def build_index_md(entries: list[dict]) -> str:
    lines = [
        "# CustardSeed Gist Sample Index",
        "",
        f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}  ",
        f"Total gists: {len(entries)}",
        "",
        "| Gist ID | Entries | Tools | Subagents | Thinking | Images | Viewer |",
        "|---------|---------|-------|-----------|----------|--------|--------|",
    ]

    for entry in entries:
        gist_id = entry["gist_id"]
        viewer_url = entry["viewer_url"]
        mt = entry.get("main_transcript") or {}
        total = mt.get("total_entries", "?")
        tools = ", ".join(mt.get("tools_used", []))[:40] or "-"
        subagents = "yes" if entry.get("has_subagents") else "no"
        thinking = "yes" if mt.get("has_thinking") else "no"
        images = "yes" if mt.get("has_images") else "no"
        short_id = gist_id[:12]
        lines.append(
            f"| `{short_id}` | {total} | {tools} | {subagents} | {thinking} | {images} | [view]({viewer_url}) |"
        )

    lines.append("")
    return "\n".join(lines)


def main():
    os.makedirs(GIST_SAMPLES_DIR, exist_ok=True)

    print("Discovering CustardSeed transcript gists...")
    gists = discover_gists()
    print(f"Found {len(gists)} gist(s)")

    if not gists:
        print("No matching gists found. Make sure 'gh auth login' has been run.")
        sys.exit(1)

    index = []
    for gist in gists:
        gist_id = gist["id"]
        try:
            entry = process_gist(gist_id)
            index.append(entry)
        except Exception as e:
            print(f"  ERROR processing {gist_id}: {e}", file=sys.stderr)

    index_json_path = os.path.join(GIST_SAMPLES_DIR, "index.json")
    with open(index_json_path, "w", encoding="utf-8") as f:
        json.dump(index, f, indent=2)
    print(f"\nWrote {index_json_path}")

    index_md_path = os.path.join(GIST_SAMPLES_DIR, "index.md")
    with open(index_md_path, "w", encoding="utf-8") as f:
        f.write(build_index_md(index))
    print(f"Wrote {index_md_path}")


if __name__ == "__main__":
    main()
