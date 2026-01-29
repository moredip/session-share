"""Pytest configuration and fixtures for e2e tests."""

import json
import re
import subprocess
from dataclasses import dataclass
from pathlib import Path

# Path to the plugin directory
PLUGIN_DIR = Path(__file__).parent.parent / "claude-code-session-share"


@dataclass
class ClaudeSession:
    """Result of running a Claude Code session."""

    session_id: str
    result: str
    raw_output: dict


def run_claude_session(prompt: str) -> ClaudeSession:
    """Run a Claude Code session with the plugin loaded and return the session info."""
    result = subprocess.run(
        [
            "claude",
            "-p",
            "--plugin-dir",
            str(PLUGIN_DIR),
            "--output-format",
            "json",
            prompt,
        ],
        capture_output=True,
        text=True,
        check=True,
    )

    output = json.loads(result.stdout)
    return ClaudeSession(
        session_id=output["session_id"],
        result=output["result"],
        raw_output=output,
    )


def publish_session(session_id: str) -> str:
    """Publish a session using the /publish-session skill and return the viewer URL."""
    result = subprocess.run(
        [
            "claude",
            "-p",
            "--plugin-dir",
            str(PLUGIN_DIR),
            "--resume",
            session_id,
            "--output-format",
            "json",
            "/publish-session",
        ],
        capture_output=True,
        text=True,
        check=True,
    )

    output = json.loads(result.stdout)

    # Parse the viewer URL from the result
    match = re.search(r"https://custardseed\.com/g/\w+", output["result"])
    if not match:
        raise RuntimeError(f"Could not parse viewer URL from: {output['result']}")

    return match.group(0)
