#!/usr/bin/env python3
"""Check if a newer version of the session-share plugin is available."""

import json
import urllib.request
import urllib.error
from pathlib import Path

GITHUB_RAW_URL = "https://raw.githubusercontent.com/moredip/session-share/main/claude-code-session-share/.claude-plugin/plugin.json"


class LocalVersionError(Exception):
    """Raised when local version cannot be read."""
    pass


def get_plugin_root() -> Path:
    """Derive the plugin root from this script's location."""
    # Script is at: commands/publish/scripts/check_version.py
    # Plugin root is 3 directories up
    return Path(__file__).resolve().parent.parent.parent.parent


def get_local_version() -> str:
    """Read the local plugin version from plugin.json. Raises LocalVersionError on failure."""
    plugin_root = get_plugin_root()
    plugin_json_path = plugin_root / ".claude-plugin" / "plugin.json"
    try:
        version = json.loads(plugin_json_path.read_text()).get("version", None)
        if version is None:
            raise LocalVersionError(f"No 'version' field in {plugin_json_path}")
        return version
    except OSError as e:
        raise LocalVersionError(f"Could not read {plugin_json_path}: {e}") from e
    except json.JSONDecodeError as e:
        raise LocalVersionError(f"Invalid JSON in {plugin_json_path}: {e}") from e


class VersionParseError(Exception):
    """Raised when a version string cannot be parsed."""
    pass


def parse_version(version_str: str) -> tuple[int, ...]:
    """Parse version string into comparable tuple. Raises VersionParseError if unparsable."""
    try:
        return tuple(int(x) for x in version_str.split("."))
    except ValueError as e:
        raise VersionParseError(f"Invalid version format: {version_str}") from e


def check_for_update() -> str | None:
    """Check if a newer version is available. Returns message or None."""
    try:
        try:
            local_version = get_local_version()
        except LocalVersionError as e:
            return f"Warning: Could not read local plugin version: {e}"

        try:
            local_parsed = parse_version(local_version)
        except VersionParseError:
            return f"Warning: Could not parse local plugin version (got: {local_version})"

        with urllib.request.urlopen(GITHUB_RAW_URL, timeout=5) as response:
            remote_version = json.loads(response.read().decode()).get("version", None)

        if remote_version is None:
            return "Warning: Could not determine remote plugin version"

        try:
            remote_parsed = parse_version(remote_version)
        except VersionParseError:
            return f"Warning: Could not determine remote plugin version (got: {remote_version})"

        if remote_parsed > local_parsed:
            return f"Plugin update available! You're using v{local_version}, the latest is v{remote_version}."
        return None
    except (urllib.error.URLError, urllib.error.HTTPError, json.JSONDecodeError, OSError, TimeoutError):
        return None


def main():
    message = check_for_update()
    if message:
        print(f"\n{message}")


if __name__ == "__main__":
    main()
