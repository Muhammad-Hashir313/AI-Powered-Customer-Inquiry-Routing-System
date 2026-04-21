# AI-Powered Customer Inquiry System

## What Is This Project?

This is a serverless AI-powered customer inquiry management system built on AWS. It collects customer inquiries through a web form, processes them with AI, and automatically notifies both internal departments and customers via email. The entire infrastructure is managed through Terraform, making it reproducible and version-controlled.

## Problem It Solves

- **Manual inquiry handling**: Automates customer inquiry collection and response
- **Slow response times**: AI processes inquiries asynchronously without blocking users
- **Department coordination**: SNS automatically alerts departments about new inquiries
- **Email notifications**: Customers receive AI-generated responses automatically via SES
- **Infrastructure complexity**: Terraform ensures consistent, repeatable infrastructure deployments

## How The Flow Works

1. **Customer Submits Inquiry**: User fills out a form on the website and submits their question
2. **Ingestion Lambda**: Receives the request via API Gateway, stores customer data and inquiry in MySQL database
3. **SQS Queuing**: Inquiry is added to an SQS queue for asynchronous processing (immediate response to user)
4. **Processing Lambda**: Triggered by SQS message, invokes Claude AI via AWS Bedrock to generate a response
5. **Department Alert**: System publishes notification to SNS topic (departments receive email alert)
6. **Customer Response**: AI-generated response is sent to customer via SES email
7. **Database Update**: Inquiry record is updated with the AI response in MySQL

## Services Used

| Service | Purpose |
|---------|---------|
| **Lambda** | Serverless compute for inquiry handling and AI processing |
| **API Gateway** | HTTP endpoint for receiving customer inquiries |
| **RDS (MySQL)** | Stores customers and inquiries |
| **SQS** | Message queue for decoupling ingestion from processing |
| **SNS** | Internal notifications to departments |
| **SES** | Email service for customer responses |
| **Bedrock** | Claude AI model invocation |
| **S3** | Hosts inquiry form HTML |
| **CloudFront** | CDN for form distribution |
| **EC2** | Debug instance for database initialization |
| **VPC** | Network isolation with subnets |

## Setup Instructions

### Prerequisites

- Terraform installed (version 1.0 or higher)
- AWS credentials configured with `terraform` profile
- SSH key pair at `~/.ssh/tf-key.pub`
- SES email identity verified in AWS

### 1. Initialize Terraform

```bash
cd terraform/
terraform init
```

### 2. Review and Customize (Optional)

```bash
cat variable.tf  # Check or modify defaults like region and database credentials
```

### 3. Plan and Review

```bash
terraform plan
```

### 4. Deploy Infrastructure

```bash
terraform apply
```

Type `yes` when prompted. This creates all AWS resources (5-10 minutes).

### 5. Get Deployment Outputs

```bash
terraform output
```

Save the outputs, especially:
- `api_url` - Use this for the next step
- `cloudfront_domain_name` - Your form URL

### 6. Update HTML with API Endpoint

```bash
chmod +x code-files/update-api-in-html.sh
./code-files/update-api-in-html.sh
```

This script updates the HTML form to use your API endpoint.

## Project Structure

```
terraform/
├── main.tf                  # Infrastructure resources
├── provider.tf              # AWS provider config
├── variable.tf              # Input variables
├── output.tf                # Output values
├── terraform.tfstate        # Current state
└── code-files/
    ├── index.html           # Customer inquiry form
    ├── index.template.html  # HTML template
    ├── mysql-server-setup.sh
    ├── update-api-in-html.sh
    ├── ingestion-lambda/    # Inquiry handler
    └── processing-lambda/   # AI processor
```

## Cleanup

To destroy all resources:

```bash
terraform destroy
```
