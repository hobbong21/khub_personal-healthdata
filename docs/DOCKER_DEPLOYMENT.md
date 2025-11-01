# Docker Deployment Guide

This guide covers containerization and deployment of the Personal Health Platform using Docker and Docker Compose.

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0+
- Git
- OpenSSL (for SSL certificates)

## Quick Start

### Development Environment

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd personal-health-platform
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env.development
   # Edit .env.development with your configuration
   ```

3. **Deploy with PowerShell** (Windows):
   ```powershell
   .\scripts\docker-deploy.ps1 -Environment development
   ```

4. **Deploy with Bash** (Linux/Mac):
   ```bash
   ./scripts/docker-deploy.sh development
   ```

5. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - Health Check: http://localhost:5000/health

### Production Environment

1. **Configure production environment**:
   ```bash
   cp .env.example .env.production
   # Edit .env.production with production values
   ```

2. **Deploy to production**:
   ```powershell
   .\scripts\docker-deploy.ps1 -Environment production
   ```

3. **Access the application**:
   - Frontend: https://localhost
   - Backend API: https://localhost/api

## Architecture Overview

### Services

- **Frontend**: React + TypeScript application served by Nginx
- **Backend**: Node.js + Express API server
- **PostgreSQL**: Primary database
- **Redis**: Caching and session storage
- **Nginx**: Load balancer and reverse proxy (production only)

### Network Architecture

```
Internet → Nginx (Load Balancer) → Frontend/Backend Services
                                 ↓
                              PostgreSQL + Redis
```

## Environment Configurations

### Development (`docker-compose.dev.yml`)

- Hot reload enabled for both frontend and backend
- Direct port exposure for debugging
- Development database with sample data
- Relaxed security settings

### Staging (`docker-compose.yml`)

- Production-like environment for testing
- Basic load balancing
- SSL termination
- Performance monitoring

### Production (`docker-compose.prod.yml`)

- Multi-replica deployment
- Advanced load balancing with health checks
- SSL/TLS encryption
- Resource limits and monitoring
- Automated backups

## Configuration Files

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | development | Yes |
| `POSTGRES_DB` | Database name | health_platform | Yes |
| `POSTGRES_USER` | Database user | postgres | Yes |
| `POSTGRES_PASSWORD` | Database password | password | Yes |
| `REDIS_PASSWORD` | Redis password | - | No |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `GOOGLE_CLOUD_PROJECT_ID` | Google Cloud project | - | No |
| `OPENAI_API_KEY` | OpenAI API key | - | No |

### Docker Compose Files

- `docker-compose.dev.yml`: Development environment
- `docker-compose.yml`: Staging environment  
- `docker-compose.prod.yml`: Production environment

## Build Process

### Multi-stage Builds

Both frontend and backend use multi-stage Docker builds for optimization:

1. **Dependencies stage**: Install only production dependencies
2. **Build stage**: Compile TypeScript and build assets
3. **Runtime stage**: Minimal runtime image with built artifacts

### Build Commands

```bash
# Build all images
./scripts/docker-build.sh latest production

# Build specific service
docker build -f backend/Dockerfile -t health-platform-backend:latest backend/
```

## Deployment Commands

### Basic Commands

```bash
# Start all services
docker-compose -f docker-compose.yml up -d

# Stop all services
docker-compose -f docker-compose.yml down

# View logs
docker-compose -f docker-compose.yml logs -f

# Scale services
docker-compose -f docker-compose.yml up -d --scale backend=3
```

### Database Management

```bash
# Run migrations
docker-compose exec backend npm run db:migrate

# Seed database
docker-compose exec backend npm run db:seed

# Database backup
docker-compose exec postgres pg_dump -U postgres health_platform > backup.sql

# Database restore
docker-compose exec -T postgres psql -U postgres health_platform < backup.sql
```

## Monitoring and Logging

### Health Checks

All services include health checks:

- **Frontend**: HTTP GET to `/health`
- **Backend**: HTTP GET to `/health`
- **PostgreSQL**: `pg_isready` command
- **Redis**: Redis ping command

### Log Management

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Log rotation (production)
docker-compose logs --tail=1000 -f
```

### Performance Monitoring

Production deployment includes:

- Resource usage monitoring
- Application performance metrics
- Database query performance
- Redis cache hit rates

## Security Considerations

### Container Security

- Non-root user execution
- Minimal base images (Alpine Linux)
- Security headers in Nginx
- Network isolation
- Secret management via environment variables

### SSL/TLS Configuration

Production deployment includes:

- SSL certificate management
- TLS 1.2+ enforcement
- HSTS headers
- Secure cipher suites

### Network Security

- Internal network isolation
- Rate limiting
- CORS configuration
- API authentication

## Troubleshooting

### Common Issues

1. **Port conflicts**:
   ```bash
   # Check port usage
   netstat -tulpn | grep :3000
   
   # Change ports in docker-compose.yml
   ports:
     - "3001:3000"
   ```

2. **Database connection issues**:
   ```bash
   # Check database logs
   docker-compose logs postgres
   
   # Test connection
   docker-compose exec backend npm run db:check
   ```

3. **Memory issues**:
   ```bash
   # Check resource usage
   docker stats
   
   # Increase memory limits in docker-compose.yml
   deploy:
     resources:
       limits:
         memory: 2G
   ```

### Debug Mode

Enable debug logging:

```bash
# Set debug environment
export DEBUG=*
docker-compose up
```

## Backup and Recovery

### Automated Backups

Production setup includes automated backups:

```bash
# Database backup script
./scripts/backup-database.sh

# File backup
./scripts/backup-uploads.sh
```

### Disaster Recovery

1. **Database recovery**:
   ```bash
   # Stop services
   docker-compose down
   
   # Restore database
   docker-compose up -d postgres
   docker-compose exec -T postgres psql -U postgres health_platform < backup.sql
   
   # Start all services
   docker-compose up -d
   ```

2. **Complete system recovery**:
   ```bash
   # Restore from backup
   ./scripts/restore-system.sh backup-2024-01-01.tar.gz
   ```

## Performance Optimization

### Production Optimizations

- Nginx gzip compression
- Static asset caching
- Database connection pooling
- Redis caching strategy
- Image optimization
- Resource limits

### Scaling

```bash
# Horizontal scaling
docker-compose up -d --scale backend=3 --scale frontend=2

# Load balancer configuration
# Edit nginx/nginx.conf for upstream servers
```

## Maintenance

### Updates

```bash
# Update images
docker-compose pull

# Rebuild and deploy
./scripts/docker-deploy.sh production

# Rolling update (zero downtime)
./scripts/rolling-update.sh
```

### Cleanup

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Complete cleanup
docker system prune -a --volumes
```

## Support

For deployment issues:

1. Check logs: `docker-compose logs -f`
2. Verify configuration: `docker-compose config`
3. Test connectivity: `docker-compose exec backend npm run db:check`
4. Review resource usage: `docker stats`

## Next Steps

After successful deployment:

1. Configure monitoring and alerting
2. Set up automated backups
3. Configure CI/CD pipeline
4. Implement log aggregation
5. Set up SSL certificates for production domain