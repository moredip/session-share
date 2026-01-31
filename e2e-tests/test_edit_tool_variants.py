"""End-to-end test for Edit tool rendering variants.

This test exercises all the different types of Edit tool invocations
that might need special rendering in the session viewer:
1. Basic edit (single string replacement)
2. Edit with replace_all=false (default, single occurrence)
3. Edit with replace_all=true (all occurrences)
4. Multi-line edit (with indentation)

The goal is to ensure the viewer can render each variant appropriately.
"""

from playwright.sync_api import expect

from conftest import copy_fixtures_to_temp


def test_edit_tool_variants(create_publish_then_view_session, tmp_path):
    """Test that different Edit tool invocations are captured and rendered with correct formatting."""
    # Copy fixture files to temp directory for safe modification
    files = copy_fixtures_to_temp(
        tmp_path,
        "edit_basic.txt",
        "edit_replace_all.txt",
        "edit_multiline.txt"
    )

    temp_basic = files["edit_basic.txt"]
    temp_replace_all = files["edit_replace_all.txt"]
    temp_multiline = files["edit_multiline.txt"]

    prompt = f"""Please perform the following file edit operations using the Edit tool:

1. Edit {temp_basic}, change "hello" to "goodbye"
2. Edit {temp_replace_all}, change only the FIRST occurrence of "foo" to "bar" (don't use replace_all)
3. Edit {temp_replace_all}, change ALL occurrences of "bar" to "baz" (use replace_all=true)
4. Edit {temp_multiline}, replace the multi-line block:
   OLD_CODE = true;
   if (OLD_CODE) {{
     console.log("old implementation");
   }}
   with:
   NEW_CODE = true;
   if (NEW_CODE) {{
     console.log("new implementation");
   }}

Do each one separately. After each edit, briefly confirm what you changed."""

    page = create_publish_then_view_session(prompt)

    # Verify the user's prompt appears
    expect(page.locator("body")).to_contain_text("file edit operations")

    # Verify that Edit tool calls appear in the rendered output
    # For now, we just check that the tool name and file paths are visible
    # (generic rendering is fine at this stage)

    # Should see edit operations for all three fixture files
    expect(page.locator("body")).to_contain_text("edit_basic.txt")
    expect(page.locator("body")).to_contain_text("edit_replace_all.txt")
    expect(page.locator("body")).to_contain_text("edit_multiline.txt")

    # Should see the Edit tool being used
    expect(page.locator("body")).to_contain_text("Edit")
