# Setup & Deployment Guide

This guide walks you through deploying the AI-Powered Customer Inquiry System infrastructure.

## Prerequisites

- Terraform installed (version 1.0 or higher)
- AWS credentials configured with `terraform` profile
- SSH key pair at `~/.ssh/tf-key.pub`
- SES email identity verified in AWS

## Deployment Steps

### 1. Initialize Terraform

```bash
cd terraform/
terraform init
```

This initializes the Terraform working directory and downloads required providers.

### 2. Review Configuration (Optional)

```bash
cat variable.tf
```

Check or modify default values for:
- AWS region (default: `us-east-1`)
- Database credentials (default: `hashir` / `hashir313`)
- Email addresses (SNS and SES endpoints)

### 3. Plan Deployment

```bash
terraform plan
```

Review the planned infrastructure changes. This shows all resources that will be created without making any changes.

### 4. Deploy Infrastructure

```bash
terraform apply
```

Type `yes` when prompted. Infrastructure deployment takes 5-10 minutes.

### 5. Retrieve Outputs

```bash
terraform output
```

Save the outputs, especially:
- `api_url` - API Gateway endpoint for customer inquiries
- `cloudfront_domain_name` - Your form URL (customer-facing)

### 6. Update HTML with API Endpoint

```bash
chmod +x code-files/update-api-in-html.sh
./code-files/update-api-in-html.sh
```

This script automatically updates the HTML form to use your deployed API endpoint.

### 7. Verify Email Confirmations

Check the email addresses configured in `variable.tf` for SNS and SES verification links. Click these links to activate email notifications and sending capabilities.

## Cleanup

To destroy all AWS resources and stop incurring charges:

```bash
terraform destroy
```

Type `yes` when prompted to confirm deletion.

**Note**: This will delete all infrastructure, including the RDS database and SQS queues. Ensure you have backups if needed.

## Troubleshooting

**Error: "SQS visibility timeout is less than Lambda timeout"**
- This is handled automatically by the configuration, but if you encounter it, ensure `visibility_timeout_seconds` on the SQS queue is ≥ Lambda timeout + buffer.

**Error: "DNS name resolution failed"**
- Verify that `enable_dns_hostnames` and `enable_dns_support` are enabled on the VPC (should be automatic).

**Lambda cannot connect to RDS/VPC Endpoints**
- Confirm Lambda functions have VPC configuration and correct security groups assigned.

## Post-Deployment

1. Visit your CloudFront domain to test the customer inquiry form
2. Submit a test inquiry
3. Check your email for department notifications and AI-generated response
4. Verify that all emails are being delivered correctly

For architecture details, see [README.md](./README.md).
