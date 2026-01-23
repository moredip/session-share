# GCS bucket for Terraform state
resource "google_storage_bucket" "tf_state" {
  name     = "${var.project_id}-tfstate"
  location = var.region

  versioning {
    enabled = true
  }

  uniform_bucket_level_access = true
}

# Cloud DNS zone for custardseed.com
resource "google_dns_managed_zone" "custardseed" {
  name        = "custardseed-com"
  dns_name    = "custardseed.com."
  description = "DNS zone for custardseed.com"
}

# GCS bucket for session-viewer static site
resource "google_storage_bucket" "session_viewer" {
  name     = "custardseed-session-viewer"
  location = var.region

  uniform_bucket_level_access = true

  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }
}

# Make bucket publicly readable
resource "google_storage_bucket_iam_member" "session_viewer_public" {
  bucket = google_storage_bucket.session_viewer.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}
