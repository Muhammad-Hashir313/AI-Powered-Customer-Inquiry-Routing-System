# AI-Powered Customer Inquiry System

## What Is This Project?

This is a serverless AI-powered customer inquiry management system built on AWS. It collects customer inquiries through a web form, processes them with AI, and automatically notifies both internal departments and customers via email. The entire infrastructure is managed through Terraform, making it reproducible and version-controlled. The system demonstrates event-driven architecture, service decoupling, and secure private networking using VPC endpoints instead of NAT gateways.

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
| **VPC** | Network isolation with subnets and interface endpoints |
| **VPC Endpoints** | Private connectivity to SQS, SNS, SES, and Bedrock |

## Network Architecture

Lambda functions run in private subnets to access the RDS database securely. They communicate with SQS, SNS, SES, and Bedrock using **VPC Interface Endpoints** instead of traversing the public internet. This approach:
- Keeps all traffic inside the VPC (no public internet exposure)
- Uses private DNS names to resolve AWS service endpoints
- Eliminates the need for NAT Gateways (which are for general outbound internet access)
- Costs per endpoint per availability zone per hour, plus data processing charges

The endpoints are created using `for_each` to loop through services: `sqs`, `sns`, `email`, and `bedrock-runtime`. The current implementation uses a single private subnet for cost optimization, though production deployments may benefit from multi-AZ endpoints to improve availability and reduce cross-AZ data transfer latency.

## Learning & Challenges

### The VPC Connectivity Barrier

Lambda functions placed in private subnets for RDS access faced an isolation problem: they couldn't reach external AWS services like SQS, SES, and Bedrock. While the code could access the database, it had no route to reach the AWS service APIs needed for email sending and AI processing.

### DNS and Route Table Configuration

Simply creating VPC Endpoints wasn't enough. Two critical configurations were required:
- **VPC DNS settings**: `enable_dns_hostnames` and `enable_dns_support` must be enabled on the VPC itself. Without these, the SDKs couldn't resolve private DNS names to endpoints and would attempt to reach services on the public internet.
- **Route table associations**: Each subnet required explicit association with the private route table for routing rules to apply. This was enforced when setting up VPC Endpoint access.

### SQS Visibility Timeout

Lambda's event source mapping from SQS requires careful visibility timeout configuration. The visibility timeout must be ≥ Lambda timeout + buffer for retries. In this project, `processing_lambda` has a 60-second timeout, so SQS visibility was set to 60 seconds. Without this alignment, messages reappear in the queue while Lambda is still processing, causing duplicate processing and error handling complications.

### VPC Endpoint Design Decision

Two approaches exist for VPC Endpoint placement:
- **Cost Optimization** (current): One endpoint per service in a single private subnet. While AWS routes requests across availability zones, this creates a dependency on a single-AZ endpoint, introducing a point of failure if that AZ experiences an outage.
- **High Availability**: Deploy endpoints across multiple availability zones. Eliminates single-AZ dependencies and reduces data transfer latency, but increases ENI and hourly costs.

The current architecture prioritizes cost, though production systems should evaluate multi-AZ endpoints to ensure resilience against single-AZ outages.

## Security Model

The architecture follows AWS security best practices:

- **Private Subnets**: Lambda functions run in private subnets with no direct internet access, preventing unauthorized inbound connections.
- **VPC Endpoints**: Replace public AWS API access with private, service-specific endpoints that never leave the VPC.
- **Security Groups**: Endpoints allow HTTPS (port 443) ingress only from Lambda security group; Lambda has egress-only rules to VPC endpoints.
- **IAM Least Privilege**: Lambda functions assume a role with minimal permissions (SQS, SNS, SES, Bedrock, CloudWatch Logs only).
- **Database Isolation**: RDS runs in private subnets accessible only from Lambda via security group rules.
- **No NAT Gateway**: Eliminates an additional network hop and associated security surface.

## Architecture Overview

```
┌─────────────────────── AWS VPC (10.0.0.0/16) ───────────────────────┐
│                                                                        │
│  ┌──────────────────────── Private Subnets ──────────────────────┐  │
│  │                                                                │  │
│  │  Lambda (Ingestion)  Lambda (Processing)                     │  │
│  │  [inquiry-handler]   [ai-processor]                          │  │
│  │        │                    │                                │  │
│  │        └────────┬───────────┘                                │  │
│  │                 │                                            │  │
│  │           VPC Interface Endpoints                           │  │
│  │   (SQS, SNS, SES, Bedrock-Runtime)                          │  │
│  │           Private DNS enabled                               │  │
│  │                 │                                            │  │
│  │  ┌──────────────────────────────────┐                        │  │
│  │  │   RDS (MySQL Database)           │                        │  │
│  │  │   [10.0.2.0/24, 10.0.3.0/24]     │                        │  │
│  │  └──────────────────────────────────┘                        │  │
│  │                                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────── Public Subnet ─────────────────────────┐  │
│  │  Internet Gateway  EC2 Debug Instance  S3 (CloudFront origin) │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

Flow: Customer → CloudFront → API Gateway → Lambda (Ingestion) → SQS →
      Lambda (Processing) → Bedrock (AI) → SNS/SES → Email
```

## Setup & Deployment

See [SETUP.md](./SETUP.md) for complete setup and deployment instructions.

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
