#!/bin/bash

# Infrastructure Deployment Script using Terraform
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="$(dirname "$SCRIPT_DIR")/terraform"
ENVIRONMENT=${1:-dev}
ACTION=${2:-plan}

echo -e "${GREEN}🏗️  Infrastructure Deployment for Health Platform${NC}"
echo -e "${YELLOW}Environment: $ENVIRONMENT${NC}"
echo -e "${YELLOW}Action: $ACTION${NC}"

# Function to validate environment
validate_environment() {
    case $ENVIRONMENT in
        "dev"|"staging"|"prod")
            echo -e "${GREEN}✅ Valid environment: $ENVIRONMENT${NC}"
            ;;
        *)
            echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
            echo -e "${YELLOW}Valid environments: dev, staging, prod${NC}"
            exit 1
            ;;
    esac
}

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
    
    # Check if Terraform is installed
    if ! command -v terraform &> /dev/null; then
        echo -e "${RED}❌ Terraform not found. Please install Terraform.${NC}"
        exit 1
    fi
    
    # Check Terraform version
    TERRAFORM_VERSION=$(terraform version -json | jq -r '.terraform_version')
    echo -e "${GREEN}✅ Terraform version: $TERRAFORM_VERSION${NC}"
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI not found. Please install AWS CLI.${NC}"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}❌ AWS credentials not configured. Please configure AWS CLI.${NC}"
        exit 1
    fi
    
    AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    AWS_USER=$(aws sts get-caller-identity --query Arn --output text)
    echo -e "${GREEN}✅ AWS Account: $AWS_ACCOUNT${NC}"
    echo -e "${GREEN}✅ AWS User: $USER${NC}"
    
    # Check if jq is installed
    if ! command -v jq &> /dev/null; then
        echo -e "${RED}❌ jq not found. Please install jq for JSON parsing.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
}

# Function to initialize Terraform
terraform_init() {
    echo -e "${YELLOW}🔧 Initializing Terraform...${NC}"
    
    cd "$TERRAFORM_DIR"
    
    # Initialize Terraform
    terraform init -upgrade
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Terraform initialized successfully${NC}"
    else
        echo -e "${RED}❌ Terraform initialization failed${NC}"
        exit 1
    fi
}

# Function to validate Terraform configuration
terraform_validate() {
    echo -e "${YELLOW}🔍 Validating Terraform configuration...${NC}"
    
    cd "$TERRAFORM_DIR"
    
    # Validate configuration
    terraform validate
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Terraform configuration is valid${NC}"
    else
        echo -e "${RED}❌ Terraform configuration validation failed${NC}"
        exit 1
    fi
}

# Function to plan Terraform changes
terraform_plan() {
    echo -e "${YELLOW}📋 Planning Terraform changes...${NC}"
    
    cd "$TERRAFORM_DIR"
    
    # Create plan
    terraform plan \
        -var-file="environments/${ENVIRONMENT}.tfvars" \
        -out="${ENVIRONMENT}.tfplan"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Terraform plan created successfully${NC}"
        echo -e "${BLUE}Plan saved as: ${ENVIRONMENT}.tfplan${NC}"
    else
        echo -e "${RED}❌ Terraform planning failed${NC}"
        exit 1
    fi
}

# Function to apply Terraform changes
terraform_apply() {
    echo -e "${YELLOW}🚀 Applying Terraform changes...${NC}"
    
    cd "$TERRAFORM_DIR"
    
    # Check if plan file exists
    if [ ! -f "${ENVIRONMENT}.tfplan" ]; then
        echo -e "${YELLOW}⚠️  Plan file not found. Creating new plan...${NC}"
        terraform_plan
    fi
    
    # Apply changes
    terraform apply "${ENVIRONMENT}.tfplan"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Terraform apply completed successfully${NC}"
        
        # Clean up plan file
        rm -f "${ENVIRONMENT}.tfplan"
        
        # Show outputs
        echo -e "\n${BLUE}📊 Infrastructure Outputs:${NC}"
        terraform output
    else
        echo -e "${RED}❌ Terraform apply failed${NC}"
        exit 1
    fi
}

# Function to destroy infrastructure
terraform_destroy() {
    echo -e "${RED}💥 Destroying infrastructure...${NC}"
    
    cd "$TERRAFORM_DIR"
    
    # Confirmation for production
    if [ "$ENVIRONMENT" = "prod" ]; then
        echo -e "${RED}⚠️  WARNING: You are about to destroy PRODUCTION infrastructure!${NC}"
        read -p "Type 'yes' to confirm destruction: " confirmation
        if [ "$confirmation" != "yes" ]; then
            echo -e "${YELLOW}Destruction cancelled${NC}"
            exit 0
        fi
    fi
    
    # Destroy infrastructure
    terraform destroy \
        -var-file="environments/${ENVIRONMENT}.tfvars" \
        -auto-approve
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Infrastructure destroyed successfully${NC}"
    else
        echo -e "${RED}❌ Infrastructure destruction failed${NC}"
        exit 1
    fi
}

# Function to show infrastructure status
terraform_status() {
    echo -e "${YELLOW}📊 Infrastructure Status...${NC}"
    
    cd "$TERRAFORM_DIR"
    
    # Show current state
    echo -e "\n${BLUE}Current State:${NC}"
    terraform show -json | jq -r '.values.root_module.resources[] | select(.type == "aws_ecs_service") | "\(.type): \(.values.name) - \(.values.desired_count) tasks"'
    
    # Show outputs
    echo -e "\n${BLUE}Outputs:${NC}"
    terraform output
}

# Function to import existing resources
terraform_import() {
    echo -e "${YELLOW}📥 Importing existing resources...${NC}"
    
    cd "$TERRAFORM_DIR"
    
    # Example imports (customize as needed)
    # terraform import aws_vpc.main vpc-12345678
    # terraform import aws_subnet.public[0] subnet-12345678
    
    echo -e "${GREEN}✅ Resource import completed${NC}"
}

# Function to format Terraform files
terraform_format() {
    echo -e "${YELLOW}🎨 Formatting Terraform files...${NC}"
    
    cd "$TERRAFORM_DIR"
    
    # Format all .tf files
    terraform fmt -recursive
    
    echo -e "${GREEN}✅ Terraform files formatted${NC}"
}

# Function to generate documentation
generate_docs() {
    echo -e "${YELLOW}📚 Generating documentation...${NC}"
    
    cd "$TERRAFORM_DIR"
    
    # Generate README with terraform-docs (if installed)
    if command -v terraform-docs &> /dev/null; then
        terraform-docs markdown table . > README.md
        echo -e "${GREEN}✅ Documentation generated${NC}"
    else
        echo -e "${YELLOW}⚠️  terraform-docs not found. Skipping documentation generation.${NC}"
    fi
}

# Function to backup state
backup_state() {
    echo -e "${YELLOW}💾 Backing up Terraform state...${NC}"
    
    cd "$TERRAFORM_DIR"
    
    # Create backup directory
    mkdir -p backups
    
    # Backup state file
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    terraform state pull > "backups/terraform_${ENVIRONMENT}_${TIMESTAMP}.tfstate"
    
    echo -e "${GREEN}✅ State backed up to: backups/terraform_${ENVIRONMENT}_${TIMESTAMP}.tfstate${NC}"
}

# Function to show help
show_help() {
    echo -e "${BLUE}Usage: $0 <environment> <action>${NC}"
    echo -e ""
    echo -e "${YELLOW}Environments:${NC}"
    echo -e "  dev      - Development environment"
    echo -e "  staging  - Staging environment"
    echo -e "  prod     - Production environment"
    echo -e ""
    echo -e "${YELLOW}Actions:${NC}"
    echo -e "  plan     - Create execution plan"
    echo -e "  apply    - Apply changes"
    echo -e "  destroy  - Destroy infrastructure"
    echo -e "  status   - Show infrastructure status"
    echo -e "  import   - Import existing resources"
    echo -e "  format   - Format Terraform files"
    echo -e "  docs     - Generate documentation"
    echo -e "  backup   - Backup Terraform state"
    echo -e "  help     - Show this help message"
    echo -e ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  $0 dev plan"
    echo -e "  $0 staging apply"
    echo -e "  $0 prod status"
}

# Main execution flow
main() {
    case $ACTION in
        "plan")
            validate_environment
            check_prerequisites
            terraform_init
            terraform_validate
            terraform_plan
            ;;
        "apply")
            validate_environment
            check_prerequisites
            terraform_init
            terraform_validate
            terraform_apply
            ;;
        "destroy")
            validate_environment
            check_prerequisites
            terraform_init
            terraform_destroy
            ;;
        "status")
            validate_environment
            check_prerequisites
            terraform_status
            ;;
        "import")
            validate_environment
            check_prerequisites
            terraform_init
            terraform_import
            ;;
        "format")
            terraform_format
            ;;
        "docs")
            generate_docs
            ;;
        "backup")
            validate_environment
            backup_state
            ;;
        "help")
            show_help
            ;;
        *)
            echo -e "${RED}❌ Invalid action: $ACTION${NC}"
            show_help
            exit 1
            ;;
    esac
}

# Handle script interruption
trap 'echo -e "\n${RED}❌ Script interrupted${NC}"; exit 1' INT TERM

# Run main function
main