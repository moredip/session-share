---
name: publish-session
description: Publish the current session transcript to a GitHub Gist
disable-model-invocation: true
allowed-tools: Bash(python3:*)
model: haiku
---

Publish the current session transcript by running:

```bash
python3 ${CLAUDE_PLUGIN_ROOT}/commands/publish/scripts/publish_session.py ${CLAUDE_SESSION_ID}
```

Then check for plugin updates:

```bash
python3 ${CLAUDE_PLUGIN_ROOT}/commands/publish/scripts/check_version.py
```

If there's a new version available, inform the user (they should be able to upgrade by running the /plugin command and then navigating to the Installed tab). Don't say a single thing if the plugin is up-to-date.

