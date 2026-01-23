output "tfstate_bucket" {
  value       = google_storage_bucket.tf_state.name
  description = "Bucket for Terraform remote state"
}
