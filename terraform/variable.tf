variable "aws_region" {
  description = "The AWS region to deploy resources in"
  type        = string
  default     = "us-east-1"
}

variable "aws_key_pair_destination" {
  description = "Path to the public key"
  type        = string
  default     = "/home/hashir/.ssh/tf-key.pub"
}