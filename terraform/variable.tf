variable "aws_region" {
  description = "The AWS region to deploy resources in"
  type        = string
  default     = "us-east-1"
}

variable "aws_key_pair_destination" {
  description = "Path to the public key"
  type        = string
  default     = "./tf-key.pub"
}

variable "aws_db_user" {
  description = "Username and Password of database"

  type = object({
    name     = string
    password = string
  })

  default = {
    name     = "user"
    password = "pass"
  }
}

variable "aws_sns_email" {
  description = "Email address for SNS notifications"
  type        = string
  default     = "email@email.com"
}

variable "aws_ses_email" {
  description = "Email address for SES identity"
  type        = string
  default     = "email@email.com"
}