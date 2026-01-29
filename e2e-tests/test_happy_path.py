"""End-to-end happy path test for the CustardSeed session sharing system.

This test exercises the complete flow:
1. Run a real Claude Code session via the CLI
2. Publish it to GitHub Gist using the publish script
3. View it in the browser and verify it renders correctly
"""

from playwright.sync_api import Page, expect

from conftest import publish_session, run_claude_session


def test_publish_and_view_session(page: Page):
    """Test that a real Claude session can be published and viewed."""
    # Arrange & Act: Run a real Claude session with a simple prompt
    prompt = "What is the capital of France? Reply in exactly one sentence."
    session = run_claude_session(prompt)

    # Publish the session to a gist
    viewer_url = publish_session(session.session_id)
    print(f"\nPublished session: {viewer_url}")

    # Navigate to the viewer
    page.goto(viewer_url)

    # Assert: The page loads and shows our content
    # Wait for content to load (the viewer fetches from GitHub API)
    page.wait_for_load_state("networkidle")

    # Verify the user's prompt appears
    expect(page.get_by_text(prompt)).to_be_visible()

    # Verify the assistant's response appears (should mention Paris)
    expect(page.get_by_text("Paris")).to_be_visible()
