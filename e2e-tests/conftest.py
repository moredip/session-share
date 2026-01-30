"""Pytest configuration and fixtures for e2e tests."""

import json
import re
import subprocess
from pathlib import Path
from typing import Callable

import pytest
from playwright.sync_api import Page

# Path to the plugin directory
PLUGIN_DIR = Path(__file__).parent.parent / "claude-code-session-share"


def run_claude_session(prompt: str) -> str:
    """Run a Claude Code session with the plugin loaded and return the session ID."""
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
    return output["session_id"]


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


@pytest.fixture
def create_publish_then_view_session(page: Page) -> Callable[[str], Page]:
    """Fixture factory that runs a Claude session, publishes it, and navigates to the viewer.

    Returns a function that takes a prompt string and returns the page (already at viewer URL).

    Usage:
        def test_something(create_publish_then_view_session):
            page = create_publish_then_view_session("What is 2+2?")
            expect(page.get_by_text("2+2")).to_be_visible()
    """
    def _create(prompt: str) -> Page:
        session_id = run_claude_session(prompt)
        viewer_url = publish_session(session_id)
        print(f"\n🔗 Viewer URL: {viewer_url}")
        page.goto(viewer_url)
        page.wait_for_load_state("networkidle")
        return page
    return _create
