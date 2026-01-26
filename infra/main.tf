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
    not_found_page   = "app.html"
  }
}

# Make bucket publicly readable
resource "google_storage_bucket_iam_member" "session_viewer_public" {
  bucket = google_storage_bucket.session_viewer.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# Reserve a global static IP
resource "google_compute_global_address" "session_viewer" {
  name = "session-viewer-ip"
}

# Backend bucket for CDN
resource "google_compute_backend_bucket" "session_viewer" {
  name        = "session-viewer-backend"
  bucket_name = google_storage_bucket.session_viewer.name
  enable_cdn  = true
}

# URL map for routing (serves apex, redirects www to apex)
resource "google_compute_url_map" "session_viewer" {
  name            = "session-viewer-url-map"
  default_service = google_compute_backend_bucket.session_viewer.id

  # Redirect www to apex
  host_rule {
    hosts        = ["www.custardseed.com"]
    path_matcher = "www-redirect"
  }

  path_matcher {
    name = "www-redirect"
    default_url_redirect {
      host_redirect  = "custardseed.com"
      https_redirect = true
      strip_query    = false
    }
  }
}

# Google-managed SSL certificate
resource "google_compute_managed_ssl_certificate" "session_viewer" {
  name = "session-viewer-cert-v2"

  managed {
    domains = ["custardseed.com", "www.custardseed.com"]
  }

  lifecycle {
    create_before_destroy = true
  }
}

# HTTPS target proxy
resource "google_compute_target_https_proxy" "session_viewer" {
  name             = "session-viewer-https-proxy"
  url_map          = google_compute_url_map.session_viewer.id
  ssl_certificates = [google_compute_managed_ssl_certificate.session_viewer.id]
}

# HTTPS forwarding rule
resource "google_compute_global_forwarding_rule" "session_viewer_https" {
  name       = "session-viewer-https"
  target     = google_compute_target_https_proxy.session_viewer.id
  port_range = "443"
  ip_address = google_compute_global_address.session_viewer.address
}

# HTTP to HTTPS redirect
resource "google_compute_url_map" "session_viewer_redirect" {
  name = "session-viewer-http-redirect"

  default_url_redirect {
    https_redirect = true
    strip_query    = false
  }
}

resource "google_compute_target_http_proxy" "session_viewer_redirect" {
  name    = "session-viewer-http-proxy"
  url_map = google_compute_url_map.session_viewer_redirect.id
}

resource "google_compute_global_forwarding_rule" "session_viewer_http" {
  name       = "session-viewer-http"
  target     = google_compute_target_http_proxy.session_viewer_redirect.id
  port_range = "80"
  ip_address = google_compute_global_address.session_viewer.address
}

# DNS A record pointing to the load balancer
resource "google_dns_record_set" "custardseed_a" {
  name         = "custardseed.com."
  managed_zone = google_dns_managed_zone.custardseed.name
  type         = "A"
  ttl          = 300
  rrdatas      = [google_compute_global_address.session_viewer.address]
}

# DNS CNAME for www -> apex
resource "google_dns_record_set" "custardseed_www" {
  name         = "www.custardseed.com."
  managed_zone = google_dns_managed_zone.custardseed.name
  type         = "CNAME"
  ttl          = 300
  rrdatas      = ["custardseed.com."]
}
