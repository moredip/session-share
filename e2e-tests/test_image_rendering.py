"""Test that sessions containing images can be published and viewed."""

from playwright.sync_api import expect

from conftest import copy_fixtures_to_temp


def test_session_with_image_can_be_published(create_publish_then_view_session, tmp_path):
    """Publish a session containing an image and verify the viewer loads it."""
    fixtures = copy_fixtures_to_temp(tmp_path, "test_image.png")
    image_path = fixtures["test_image.png"]

    prompt = f"Describe this image briefly: {image_path}"

    page = create_publish_then_view_session(prompt)

    # TODO: verify image renders once image support is implemented
    expect(page.locator("body")).to_be_visible()
