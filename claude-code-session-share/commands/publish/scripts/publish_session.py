#!/usr/bin/env python3
"""Publish current Claude Code session transcript to GitHub Gist using gh CLI."""
import glob
import os
import subprocess
import sys


def find_transcript_path(session_id: str) -> str | None:
    """Find the transcript file for a given session ID."""
    claude_dir = os.path.expanduser("~/.claude")
    pattern = os.path.join(claude_dir, "projects", "*", "sessions", f"{session_id}.jsonl")
    matches = glob.glob(pattern)
    return matches[0] if matches else None


def create_gist(filepath: str, description: str) -> str:
    """Create a GitHub Gist using gh CLI and return its URL."""
    result = subprocess.run(
        ["gh", "gist", "create", filepath, "--desc", description],
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        if "gh auth login" in result.stderr:
            raise RuntimeError("Not authenticated. Run 'gh auth login' first.")
        raise RuntimeError(f"gh gist create failed: {result.stderr}")

    # gh outputs the gist URL on stdout
    return result.stdout.strip()


def main():
    session_id = os.environ.get("SESSION_SHARE_SESSION_ID")

    if not session_id:
        print("Error: Session ID not available. Was the plugin installed correctly?")
        sys.exit(1)

    transcript_path = find_transcript_path(session_id)

    if not transcript_path:
        print(f"Error: Transcripts not found for session: {session_id}")
        sys.exit(1)

    description = "Claude Code session transcript"
    url = create_gist(transcript_path, description)
    print(f"Session published: {url}")


if __name__ == "__main__":
    main()
