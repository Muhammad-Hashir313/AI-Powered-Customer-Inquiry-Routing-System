output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.cdn.domain_name
}

output "api_url" {
  value = aws_apigatewayv2_api.http_api.api_endpoint
}

output "cloudfront_id" {
  value = aws_cloudfront_distribution.cdn.id
}

output "db_host" {
  value = aws_db_instance.my-db.address
}

output "db_port" {
  value = aws_db_instance.my-db.port
}

output "debug_instance_public_ip" {
  value = aws_instance.debug_instance.public_ip
}