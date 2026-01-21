#!/usr/bin/env python3
"""Capture session info at start and persist to env file."""
import json
import os
import sys


def main():
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        sys.exit(0)

    session_id = input_data.get("session_id", "")

    # DEBUGGING OUTPUT - only shown if you run `claude --debug`
    print(f"  session_id: {session_id}")

    env_file = os.environ.get("CLAUDE_ENV_FILE")
    if env_file and session_id:
        with open(env_file, "a") as f:
            f.write(f'export SESSION_SHARE_SESSION_ID="{session_id}"\n')

    sys.exit(0)


if __name__ == "__main__":
    main()
