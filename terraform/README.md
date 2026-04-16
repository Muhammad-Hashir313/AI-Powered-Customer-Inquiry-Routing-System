# AI Project Terraform Setup

## Prerequisites

- Terraform installed (version 1.0 or higher)
- AWS credentials configured
- Git (for cloning the repository)

## Setup Instructions

### 1. Initialize Terraform

```bash
cd terraform/
terraform init
```

This command initializes the Terraform working directory and downloads the necessary provider plugins.

### 2. Review Configuration

Review the configuration files to ensure they match your requirements:

- `provider.tf` - Cloud provider configuration
- `variable.tf` - Input variables
- `main.tf` - Main infrastructure configuration
- `output.tf` - Output values

### 3. Plan Deployment

```bash
terraform plan
```

This command shows what resources will be created or modified.

### 4. Apply Configuration

```bash
terraform apply
```

This command creates the infrastructure as defined in your Terraform files. You'll be prompted to confirm before resources are created.

## Project Structure

```
├── main.tf                 # Main infrastructure configuration
├── provider.tf             # Provider configuration
├── variable.tf             # Input variables
├── output.tf               # Output values
├── terraform.tfstate       # Current state file
├── terraform.tfstate.backup # Backup state file
└── code-files/             # Application code
    ├── index.html
    ├── index.js
    ├── index.template.html
    └── update-api-in-html.sh
```

## State Management

Terraform state files track your deployed infrastructure:

- `terraform.tfstate` - Current state
- `terraform.tfstate.backup` - Automatic backup

## Running Scripts

The `code-files/` directory contains application scripts that need to be executed:

### Make Scripts Executable and Execute

```bash
chmod +x code-files/update-api-in-html.sh
./code-files/update-api-in-html.sh
```

This script updates the API references in the HTML files.

## Cleanup

To destroy all created resources:

```bash
terraform destroy
```

You'll be prompted to confirm before any resources are destroyed.
