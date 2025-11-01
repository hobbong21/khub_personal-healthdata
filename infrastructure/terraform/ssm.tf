# SSM Parameter Store Configuration

# JWT Secret
resource "random_password" "jwt_secret" {
  length  = 64
  special = true
}

resource "aws_ssm_parameter" "jwt_secret" {
  name  = "/${var.project_name}/${var.environment}/jwt/secret"
  type  = "SecureString"
  value = random_password.jwt_secret.result

  tags = local.common_tags
}

# Application Configuration Parameters
resource "aws_ssm_parameter" "app_config" {
  for_each = {
    "app/name"        = var.project_name
    "app/environment" = var.environment
    "app/region"      = var.aws_region
    "app/domain"      = var.domain_name
  }

  name  = "/${var.project_name}/${var.environment}/${each.key}"
  type  = "String"
  value = each.value

  tags = local.common_tags
}

# External API Keys (placeholders - set actual values manually)
resource "aws_ssm_parameter" "external_api_keys" {
  for_each = {
    "google/cloud/project_id"     = "your-google-cloud-project-id"
    "openai/api_key"             = "your-openai-api-key"
    "google/vision/api_key"      = "your-google-vision-api-key"
    "sendgrid/api_key"           = "your-sendgrid-api-key"
    "stripe/secret_key"          = "your-stripe-secret-key"
    "apple/health/client_id"     = "your-apple-health-client-id"
    "google/fit/client_id"       = "your-google-fit-client-id"
  }

  name  = "/${var.project_name}/${var.environment}/external/${each.key}"
  type  = "SecureString"
  value = each.value

  tags = merge(local.common_tags, {
    Description = "External API key - update with actual value"
  })

  lifecycle {
    ignore_changes = [value]
  }
}

# Feature Flags
resource "aws_ssm_parameter" "feature_flags" {
  for_each = {
    "genomics/enabled"           = "true"
    "ai_insights/enabled"        = "true"
    "telehealth/enabled"         = "true"
    "wearable_integration/enabled" = "true"
    "research_participation/enabled" = "false"
    "advanced_analytics/enabled" = var.environment == "prod" ? "true" : "false"
  }

  name  = "/${var.project_name}/${var.environment}/features/${each.key}"
  type  = "String"
  value = each.value

  tags = local.common_tags
}

# Security Configuration
resource "aws_ssm_parameter" "security_config" {
  for_each = {
    "bcrypt/rounds"              = "12"
    "rate_limit/window_ms"       = "900000"
    "rate_limit/max_requests"    = "100"
    "session/timeout_minutes"    = "60"
    "password/min_length"        = "8"
    "mfa/enabled"               = var.environment == "prod" ? "true" : "false"
  }

  name  = "/${var.project_name}/${var.environment}/security/${each.key}"
  type  = "String"
  value = each.value

  tags = local.common_tags
}

# Monitoring Configuration
resource "aws_ssm_parameter" "monitoring_config" {
  for_each = {
    "log_level"                  = var.environment == "prod" ? "info" : "debug"
    "metrics/enabled"            = "true"
    "tracing/enabled"            = var.environment == "prod" ? "true" : "false"
    "health_check/interval"      = "30"
    "alert/email"               = "alerts@yourdomain.com"
  }

  name  = "/${var.project_name}/${var.environment}/monitoring/${each.key}"
  type  = "String"
  value = each.value

  tags = local.common_tags
}

# Database Configuration (non-sensitive)
resource "aws_ssm_parameter" "database_config" {
  for_each = {
    "connection_pool/min"        = "5"
    "connection_pool/max"        = "20"
    "query_timeout"             = "30000"
    "statement_timeout"         = "60000"
    "idle_timeout"              = "300000"
  }

  name  = "/${var.project_name}/${var.environment}/database/${each.key}"
  type  = "String"
  value = each.value

  tags = local.common_tags
}

# Cache Configuration
resource "aws_ssm_parameter" "cache_config" {
  for_each = {
    "default_ttl"               = "3600"
    "session_ttl"               = "86400"
    "api_cache_ttl"             = "300"
    "static_cache_ttl"          = "604800"
  }

  name  = "/${var.project_name}/${var.environment}/cache/${each.key}"
  type  = "String"
  value = each.value

  tags = local.common_tags
}

# File Upload Configuration
resource "aws_ssm_parameter" "upload_config" {
  for_each = {
    "max_file_size"             = "10485760"
    "allowed_types"             = "image/jpeg,image/png,image/gif,application/pdf,text/plain"
    "virus_scan/enabled"        = var.environment == "prod" ? "true" : "false"
  }

  name  = "/${var.project_name}/${var.environment}/uploads/${each.key}"
  type  = "String"
  value = each.value

  tags = local.common_tags
}

# Email Configuration
resource "aws_ssm_parameter" "email_config" {
  for_each = {
    "from_address"              = "noreply@yourdomain.com"
    "from_name"                 = "Health Platform"
    "template/welcome"          = "welcome-template-id"
    "template/password_reset"   = "password-reset-template-id"
    "template/appointment_reminder" = "appointment-reminder-template-id"
  }

  name  = "/${var.project_name}/${var.environment}/email/${each.key}"
  type  = "String"
  value = each.value

  tags = local.common_tags
}

# AI/ML Configuration
resource "aws_ssm_parameter" "ai_config" {
  for_each = {
    "model/version"             = "1.0.0"
    "prediction/confidence_threshold" = "0.8"
    "batch_size"               = "32"
    "max_tokens"               = "2048"
  }

  name  = "/${var.project_name}/${var.environment}/ai/${each.key}"
  type  = "String"
  value = each.value

  tags = local.common_tags
}