#!/usr/bin/env python3
"""Publish current Claude Code session transcript to GitHub Gist using gh CLI."""
import os
import subprocess
import sys


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
    transcript_path = os.environ.get("SESSION_SHARE_TRANSCRIPT_PATH")

    if not transcript_path:
        print("Error: Session info not available. Was the plugin installed correctly?")
        sys.exit(1)

    if not os.path.exists(transcript_path):
        print(f"Error: Transcript file not found: {transcript_path}")
        sys.exit(1)

    description = "Claude Code session transcript"
    url = create_gist(transcript_path, description)
    print(f"Session published: {url}")


if __name__ == "__main__":
    main()
