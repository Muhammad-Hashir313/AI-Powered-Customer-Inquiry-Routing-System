#!/bin/bash

set -e

echo "Starting deployment..."

# 1. Get API URL from Terraform
API_URL=$(terraform output -raw api_url)/prod/inquiry

# 2. Get CloudFront ID from Terraform (BEST WAY)
DIST_ID=$(terraform output -raw cloudfront_id)

echo "API: $API_URL"
echo "CloudFront ID: $DIST_ID"

# 3. Inject API into HTML
sed "s|__API_URL__|$API_URL|g" ./code-files/index.template.html > ./code-files/index.html

# 4. Upload to S3
aws s3 cp ./code-files/index.html \
  --profile terraform \
  s3://ai-powered-customer-inquiry-system-bucket/index.html \
  --content-type "text/html"

# 5. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --profile terraform \
  --distribution-id "$DIST_ID" \
  --paths "/*"

echo "Deployment complete"