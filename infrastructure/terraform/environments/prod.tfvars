# Production Environment Configuration

# Basic Configuration
environment = "prod"
aws_region  = "us-west-2"

# VPC Configuration
vpc_cidr           = "10.2.0.0/16"
availability_zones = 3

# ECS Configuration
frontend_cpu    = 1024
frontend_memory = 2048
backend_cpu     = 1024
backend_memory  = 2048

# RDS Configuration
db_instance_class         = "db.r6g.large"
db_allocated_storage      = 100
db_max_allocated_storage  = 1000
backup_retention_period   = 30
backup_window            = "03:00-04:00"
maintenance_window       = "sun:04:00-sun:05:00"

# ElastiCache Configuration
redis_node_type        = "cache.r6g.large"
redis_num_cache_nodes  = 2

# Auto Scaling Configuration
min_capacity                = 2
max_capacity                = 20
target_cpu_utilization     = 60

# Monitoring Configuration
enable_monitoring    = true
log_retention_days   = 90

# Domain Configuration
domain_name     = "health-platform.com"
certificate_arn = "arn:aws:acm:us-west-2:123456789012:certificate/12345678-1234-1234-1234-123456789012"