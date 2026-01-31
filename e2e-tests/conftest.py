"""Pytest configuration and fixtures for e2e tests."""

import json
import os
import re
import shutil
import subprocess
from pathlib import Path
from typing import Callable
from urllib.parse import urlparse, urlunparse

import pytest
from playwright.sync_api import Page

# Path to the plugin directory
PLUGIN_DIR = Path(__file__).parent.parent / "claude-code-session-share"

# Viewer base URL - can be overridden with VIEWER_BASE_URL env var
# Defaults to local development, set to https://custardseed.com for production testing
VIEWER_BASE_URL = os.environ.get("VIEWER_BASE_URL", "http://localhost:5173")

# Path to the fixtures directory
FIXTURES_DIR = Path(__file__).parent / "fixtures"


def copy_fixtures_to_temp(tmp_path: Path, *fixture_names: str) -> dict[str, Path]:
    """Copy fixture files to a temporary directory.

    This is useful for tests that need to modify files (e.g., Edit tool tests).
    The fixtures remain unchanged and pytest automatically cleans up tmp_path.

    Args:
        tmp_path: Pytest's tmp_path fixture
        *fixture_names: Names of fixture files to copy (e.g., "edit_basic.txt")

    Returns:
        Dictionary mapping fixture names to their temp paths

    Example:
        def test_something(tmp_path):
            files = copy_fixtures_to_temp(tmp_path, "edit_basic.txt", "edit_other.txt")
            # files["edit_basic.txt"] is the path to the temp copy
    """
    result = {}
    for name in fixture_names:
        source = FIXTURES_DIR / name
        dest = tmp_path / name
        shutil.copy(source, dest)
        result[name] = dest
    return result


def run_claude_session(prompt: str) -> str:
    """Run a Claude Code session with the plugin loaded and return the session ID."""
    result = subprocess.run(
        [
            "claude",
            "-p",
            "--model",
            "haiku",
            "--plugin-dir",
            str(PLUGIN_DIR),
            "--output-format",
            "json",
            "--allowedTools=Edit,Read,Bash,Write",
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
            "--model",
            "haiku",
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

        # Rewrite URL to use configured viewer base URL (production or local)
        parsed_url = urlparse(viewer_url)
        parsed_base = urlparse(VIEWER_BASE_URL)
        final_url = urlunparse((
            parsed_base.scheme,
            parsed_base.netloc,
            parsed_url.path,
            parsed_url.params,
            parsed_url.query,
            parsed_url.fragment
        ))

        print(f"\n🔗 Published: {viewer_url}")
        if VIEWER_BASE_URL != "https://custardseed.com":
            print(f"🔗 Viewing at: {final_url}")
        page.goto(final_url)
        page.wait_for_load_state("networkidle")
        return page
    return _create
