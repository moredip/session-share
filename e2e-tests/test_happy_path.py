"""End-to-end happy path test for the CustardSeed session sharing system.

This test exercises the complete flow:
1. Run a real Claude Code session via the CLI
2. Publish it to GitHub Gist using the publish script
3. View it in the browser and verify it renders correctly
"""

from playwright.sync_api import expect


def test_publish_and_view_session(create_publish_then_view_session):
    """Test that a real Claude session can be published and viewed."""
    prompt = "What is the capital of France? Reply in exactly one sentence."
    page = create_publish_then_view_session(prompt)

    # Verify the user's prompt and assistant's response appear
    expect(page.get_by_text(prompt)).to_be_visible()
    expect(page.get_by_text("Paris")).to_be_visible()
