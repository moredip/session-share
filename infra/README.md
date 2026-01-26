# Infrastructure

Terraform configuration for deploying session-viewer to GCP.

## Architecture

```mermaid
flowchart TB
    subgraph Internet
        User([User])
    end

    subgraph DNS["Cloud DNS Zone (custardseed.com)"]
        A_Record["A Record<br/>custardseed.com"]
        CNAME["CNAME Record<br/>www → apex"]
    end

    subgraph LB["Global Load Balancer"]
        IP["Static IP<br/>(session-viewer-ip)"]

        subgraph HTTP["HTTP (port 80)"]
            HTTP_FWD["Forwarding Rule<br/>(session-viewer-http)"]
            HTTP_Proxy["HTTP Target Proxy"]
            HTTP_URLMap["URL Map<br/>(http-redirect)"]
        end

        subgraph HTTPS["HTTPS (port 443)"]
            HTTPS_FWD["Forwarding Rule<br/>(session-viewer-https)"]
            HTTPS_Proxy["HTTPS Target Proxy"]
            SSL["Managed SSL Cert<br/>(custardseed.com,<br/>www.custardseed.com)"]
            URLMap["URL Map<br/>(session-viewer)"]
        end

        Backend["Backend Bucket<br/>(CDN enabled)"]
    end

    subgraph Storage["Cloud Storage"]
        Bucket["GCS Bucket<br/>(custardseed-session-viewer)<br/>Public Access"]
    end

    subgraph TFState["Terraform State"]
        TFBucket["GCS Bucket<br/>(project-id-tfstate)"]
    end

    User --> A_Record
    User --> CNAME
    A_Record --> IP
    CNAME --> IP

    IP --> HTTP_FWD
    IP --> HTTPS_FWD

    HTTP_FWD --> HTTP_Proxy --> HTTP_URLMap
    HTTP_URLMap -->|"301 Redirect"| HTTPS_FWD

    HTTPS_FWD --> HTTPS_Proxy
    HTTPS_Proxy --> SSL
    HTTPS_Proxy --> URLMap

    URLMap -->|"www.custardseed.com"| WWW_Redirect["Redirect to apex"]
    WWW_Redirect -->|"301"| URLMap
    URLMap -->|"custardseed.com"| Backend

    Backend --> Bucket
```

### Traffic Flow

1. **DNS Resolution**: Users access `custardseed.com` or `www.custardseed.com`, which resolves to the static IP via A record or CNAME
2. **HTTP → HTTPS**: Any HTTP traffic on port 80 is automatically redirected to HTTPS
3. **www → apex**: Requests to `www.custardseed.com` are redirected to `custardseed.com`
4. **CDN + Origin**: The backend bucket serves content from GCS with CDN caching enabled

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
