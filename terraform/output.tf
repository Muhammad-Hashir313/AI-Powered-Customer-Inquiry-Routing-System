output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.cdn.domain_name
}

output "api_url" {
  value = aws_apigatewayv2_api.http_api.api_endpoint
}

output "cloudfront_id" {
  value = aws_cloudfront_distribution.cdn.id
}