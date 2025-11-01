# Staging Environment Configuration

# Basic Configuration
environment = "staging"
aws_region  = "us-west-2"

# VPC Configuration
vpc_cidr           = "10.1.0.0/16"
availability_zones = 2

# ECS Configuration
frontend_cpu    = 512
frontend_memory = 1024
backend_cpu     = 512
backend_memory  = 1024

# RDS Configuration
db_instance_class         = "db.t3.small"
db_allocated_storage      = 50
db_max_allocated_storage  = 100
backup_retention_period   = 3
backup_window            = "03:00-04:00"
maintenance_window       = "sun:04:00-sun:05:00"

# ElastiCache Configuration
redis_node_type        = "cache.t3.small"
redis_num_cache_nodes  = 1

# Auto Scaling Configuration
min_capacity                = 1
max_capacity                = 5
target_cpu_utilization     = 70

# Monitoring Configuration
enable_monitoring    = true
log_retention_days   = 14

# Domain Configuration
domain_name     = "staging.health-platform.com"
certificate_arn = "arn:aws:acm:us-west-2:123456789012:certificate/12345678-1234-1234-1234-123456789012"