"""Test that sessions containing images can be published and viewed."""

from playwright.sync_api import expect

from conftest import copy_fixtures_to_temp


def test_session_with_image_can_be_published(create_publish_then_view_session, tmp_path):
    """Publish a session containing an image and verify the viewer loads it."""
    fixtures = copy_fixtures_to_temp(tmp_path, "test_image.png")
    image_path = fixtures["test_image.png"]

    prompt = f"Describe this image briefly: {image_path}"

    page = create_publish_then_view_session(prompt)

    # Find and expand the Read tool call that contains the image
    read_tool_header = page.get_by_text("Read test_image.png")
    expect(read_tool_header).to_be_visible()
    read_tool_header.click()

    # Verify the image is rendered in the expanded tool result
    img_locator = page.locator("img[alt='Tool result image']")
    expect(img_locator).to_be_visible()

    # Verify the image src is a proper data URI
    src = img_locator.get_attribute("src")
    assert src is not None and src.startswith("data:image/"), (
        f"Expected image src to be a data URI, got: {src[:100] if src else None}"
    )
