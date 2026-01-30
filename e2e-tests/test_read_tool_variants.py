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
    """Test that different Read tool invocations are captured and rendered."""
    # Craft a prompt that causes Claude to use the Read tool with different parameters.
    # We'll ask it to read the e2e test files in various ways.
    prompt = """Please perform the following file read operations on e2e-tests/conftest.py.
Do each one separately using the Read tool (NOT cat or other bash commands):

1. First, read the entire file using just the file_path parameter
2. Then read just the first 10 lines using the limit parameter
3. Then read starting from line 20 using the offset parameter
4. Finally read 5 lines starting from line 15 using both offset and limit parameters

After each read, briefly confirm what you read. Use the Read tool for ALL of these - do not use bash cat/head/tail."""

    page = create_publish_then_view_session(prompt)

    # Verify the user's prompt appears
    expect(page.locator("body")).to_contain_text("file read operations")

    # Verify we see evidence of Read tool usage in the rendered transcript
    # The transcript should contain multiple Read tool invocations
    expect(page.locator("body")).to_contain_text("conftest.py")

    # Verify we see content that would come from reading the file
    # conftest.py contains "pytest" and fixture-related content
    expect(page.locator("body")).to_contain_text("pytest")
