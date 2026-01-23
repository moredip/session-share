output "tfstate_bucket" {
  value       = google_storage_bucket.tf_state.name
  description = "Bucket for Terraform remote state"
}

output "dns_nameservers" {
  value       = google_dns_managed_zone.custardseed.name_servers
  description = "Nameservers to configure at Namecheap for custardseed.com"
}

output "session_viewer_bucket" {
  value       = google_storage_bucket.session_viewer.name
  description = "GCS bucket for session-viewer static site"
}

output "session_viewer_url" {
  value       = "https://storage.googleapis.com/${google_storage_bucket.session_viewer.name}/index.html"
  description = "Direct GCS URL for session-viewer (use CDN URL in production)"
}
