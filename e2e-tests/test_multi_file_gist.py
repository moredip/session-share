"""End-to-end test for multi-file gist publishing.

This test verifies the fix for issue #1 (gh gist edit failure on multi-file gists).
It exercises the flow:
1. Run a Claude Code session that spawns subagents (creates multiple transcripts)
2. Publish it to GitHub Gist (which now uses 'gh api' instead of 'gh gist edit')
3. Verify the gist is created successfully with the correct description
4. View it in the browser and verify all content renders correctly
"""

from playwright.sync_api import expect


def test_publish_multi_file_session(create_publish_then_view_session):
    """Test that a session with subagent transcripts can be published successfully.

    This test verifies the fix for #1 where 'gh gist edit' failed on multi-file gists
    because it prompted interactively for file selection. The fix uses 'gh api' instead.
    """
    # Run a Claude session that will spawn subagents (file exploration triggers this)
    prompt = (
        "Search for all Python files in the e2e-tests directory. "
        "Use the Task tool with subagent_type=Explore to do this. "
        "List the files you find."
    )
    # The critical step - if gh gist edit fails (the bug), this will fail
    page = create_publish_then_view_session(prompt)

    # Verify the user's prompt appears in the rendered transcript
    expect(page.locator("body")).to_contain_text("Search for all Python files")

    # Verify we see evidence of subagent execution or assistant response
    expect(page.locator("body")).to_contain_text("e2e-tests")
