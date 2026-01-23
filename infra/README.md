# Infrastructure

Terraform configuration for deploying session-viewer to GCP.

## Resources

- **Cloud DNS** - Zone for custardseed.com
- **GCS Bucket** - Static site hosting for session-viewer
- **Load Balancer** - Global HTTPS with CDN
- **SSL Certificate** - Google-managed cert for custardseed.com and www

## Usage

```bash
# Run Terraform (uses Docker wrapper, no local install needed)
./bin/dterraform plan
./bin/dterraform apply
