"""End-to-end test for Read tool rendering variants.

This test exercises all the different types of Read tool invocations
that might need special rendering in the session viewer:
1. Basic read (file_path only)
2. Read with limit (file_path + limit)
3. Read with offset (file_path + offset)
4. Read with offset and limit (file_path + offset + limit)

The goal is to ensure the viewer can render each variant appropriately.
"""

from playwright.sync_api import expect


def test_read_tool_variants(create_publish_then_view_session):
    """Test that different Read tool invocations are captured and rendered with correct formatting."""
    prompt = """Please perform the following file read operations using the Read tool (NOT cat or other bash commands):

1. Read e2e-tests/fixtures/sample_basic.txt (entire file, just file_path parameter)
2. Read e2e-tests/fixtures/sample_with_limit.txt with limit=10
3. Read e2e-tests/fixtures/sample_with_offset.txt with offset=10
4. Read e2e-tests/fixtures/sample_with_both.txt with offset=5 and limit=5

Do each one separately. After each read, briefly confirm what you read."""

    page = create_publish_then_view_session(prompt)

    # Verify the user's prompt appears
    expect(page.locator("body")).to_contain_text("file read operations")

    # Test variant 1: Basic read (file_path only)
    expect(page.get_by_text("Read sample_basic.txt", exact=True)).to_be_visible()

    # Test variant 2: Read with limit=10
    expect(page.get_by_text("Read sample_with_limit.txt (lines 0-9)")).to_be_visible()

    # Test variant 3: Read with offset=10
    expect(page.get_by_text("Read sample_with_offset.txt (from line 10)")).to_be_visible()

    # Test variant 4: Read with offset=5, limit=5
    expect(page.get_by_text("Read sample_with_both.txt (lines 5-9)")).to_be_visible()
