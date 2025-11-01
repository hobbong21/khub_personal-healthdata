# Development Environment Configuration

# Basic Configuration
environment = "dev"
aws_region  = "us-west-2"

# VPC Configuration
vpc_cidr           = "10.0.0.0/16"
availability_zones = 2

# ECS Configuration
frontend_cpu    = 256
frontend_memory = 512
backend_cpu     = 256
backend_memory  = 512

# RDS Configuration
db_instance_class         = "db.t3.micro"
db_allocated_storage      = 20
db_max_allocated_storage  = 50
backup_retention_period   = 1
backup_window            = "03:00-04:00"
maintenance_window       = "sun:04:00-sun:05:00"

# ElastiCache Configuration
redis_node_type        = "cache.t3.micro"
redis_num_cache_nodes  = 1

# Auto Scaling Configuration
min_capacity                = 1
max_capacity                = 3
target_cpu_utilization     = 70

# Monitoring Configuration
enable_monitoring    = true
log_retention_days   = 7

# Domain Configuration (optional for dev)
domain_name     = ""
certificate_arn = ""