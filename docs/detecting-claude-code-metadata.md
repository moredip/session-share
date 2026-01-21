# Detecting Claude Code Metadata at Runtime

This document describes how a Claude Code plugin can determine metadata about the Claude Code instance that is currently running.

## Environment Variables

Claude Code sets several environment variables that plugins can use to detect runtime context:

| Variable | Example Value | Description |
|----------|---------------|-------------|
| `CLAUDECODE` | `1` | Flag indicating Claude Code is running |
| `CLAUDE_CODE_ENTRYPOINT` | `claude-vscode` | How CC was launched (`claude-vscode` or `cli`) |
| `CLAUDE_AGENT_SDK_VERSION` | `0.2.11` | The Agent SDK version |

**Note**: There is no `CLAUDE_CODE_VERSION` env var. To get the exact Claude Code version, use the process inspection approach below.

### Quick detection

To check if running under Claude Code:

```bash
[ -n "$CLAUDECODE" ] && echo "Running under Claude Code"
```

To check if running in VSCode vs CLI:

```bash
if [ "$CLAUDE_CODE_ENTRYPOINT" = "claude-vscode" ]; then
    echo "Running in VSCode extension"
else
    echo "Running in CLI"
fi
```

## Version Detection via Process Inspection

### Step 1: Find the Claude Code executable path

Use `ps` to find Claude processes and extract the executable path:

```bash
ps auxww | grep -i claude | grep -v grep
```

This returns output like:

```
pete  35484  4.3  1.6 508969536 391728  ??  S  7:22AM  0:01.34 /Users/pete/.vscode/extensions/anthropic.claude-code-2.1.11-darwin-arm64/resources/native-binary/claude --output-format stream-json ...
```

The executable path follows the pattern:
- **VSCode extension**: `~/.vscode/extensions/anthropic.claude-code-{VERSION}-{PLATFORM}/resources/native-binary/claude`
- **Standalone CLI**: typically in PATH as `claude`

### Step 2: Query the executable version

Run `--version` on the discovered executable:

```bash
/path/to/claude --version
```

Returns:
```
2.1.11 (Claude Code)
```

## Implementation Notes

### Parsing the version string

The version output format is: `{VERSION} (Claude Code)`

A simple regex to extract the version: `^(\d+\.\d+\.\d+)`

### Platform considerations

The VSCode extension path includes platform identifiers:
- `darwin-arm64` - macOS Apple Silicon
- `darwin-x64` - macOS Intel
- `linux-x64` - Linux
- `win32-x64` - Windows

### Known issues

**Version mismatch (observed in 2.0.75)**: In some releases, the version reported by `--version` may differ from the folder name. For example, extension folder `2.0.75-darwin-arm64` contained a binary reporting `2.0.74`. This appears to have been fixed in later versions (2.1.11 matches correctly). Plugins should prefer the `--version` output as the authoritative source.

## Alternative: Parse from extension folder path

If the executable path is known, the version can be extracted from the folder path itself using a pattern like `claude-code-(\d+\.\d+\.\d+)`.

**Caveat**: As noted above, folder version may not always match binary version. Use `--version` for accuracy.
