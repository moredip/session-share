#!/usr/bin/env python3
"""Publish current Claude Code session transcript to GitHub Gist using gh CLI."""
import glob
import os
import subprocess
import sys


def find_transcript_paths(session_id: str) -> list[str]:
    """Find the main transcript and any subagent transcripts for a session ID."""
    claude_dir = os.path.expanduser("~/.claude")

    # Find main transcript
    main_pattern = os.path.join(claude_dir, "projects", "*", f"{session_id}.jsonl")
    main_matches = glob.glob(main_pattern)

    if not main_matches:
        return []

    main_transcript = main_matches[0]
    transcripts = [main_transcript]

    # Find any additional files in <session_id>/ directory
    sessions_dir = os.path.dirname(main_transcript)
    session_dir = os.path.join(sessions_dir, session_id)
    additional_files = glob.glob(os.path.join(session_dir, "**", "*"), recursive=True)
    transcripts.extend(f for f in additional_files if os.path.isfile(f))

    return transcripts


def create_gist(filepaths: list[str], description: str) -> str:
    """Create a GitHub Gist using gh CLI and return its URL."""
    result = subprocess.run(
        ["gh", "gist", "create", *filepaths, "--desc", description],
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
    if len(sys.argv) < 2 or not sys.argv[1]:
        print("Error: Session ID not provided.")
        sys.exit(1)

    session_id = sys.argv[1]

    transcript_paths = find_transcript_paths(session_id)

    if not transcript_paths:
        print(f"Error: Transcripts not found for session: {session_id}")
        sys.exit(1)

    description = "Claude Code session transcript"
    url = create_gist(transcript_paths, description)

    file_count = len(transcript_paths)
    subagent_count = file_count - 1
    if subagent_count > 0:
        print(f"Session published ({subagent_count} subagent transcript(s) included): {url}")
    else:
        print(f"Session published: {url}")


if __name__ == "__main__":
    main()
