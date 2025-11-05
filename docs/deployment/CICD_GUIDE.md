# CI/CD Pipeline Guide

## 📋 Overview

This project uses GitHub Actions for continuous integration and continuous deployment (CI/CD). The pipeline automatically tests, builds, and deploys code changes.

## 🔄 Workflows

### 1. CI - Test and Build (`ci.yml`)

**Triggers:**
- Push to `master`, `main`, or `develop` branches
- Pull requests to these branches

**Jobs:**
- **Frontend CI**
  - Runs on Node.js 18.x and 20.x
  - Linting
  - Type checking
  - Unit tests with coverage
  - Build verification
  - Bundle size check
  
- **Backend CI**
  - Runs on Node.js 18.x and 20.x
  - PostgreSQL and Redis services
  - Linting
  - Type checking
  - Unit tests
  - Build verification

- **Security Scan**
  - Trivy vulnerability scanner
  - npm audit for dependencies

### 2. CD - Deploy Frontend (`cd-frontend.yml`)

**Triggers:**
- Push to `master`/`main` with frontend changes
- Manual workflow dispatch

**Deployment Targets:**
- **Vercel** (Primary)
  - Automatic deployment
  - Preview URLs for PRs
  - Production deployment on merge

- **Netlify** (Alternative, disabled by default)
  - Can be enabled if needed

**Post-Deployment:**
- Lighthouse performance audit
- Deployment summary

### 3. CD - Deploy Backend (`cd-backend.yml`)

**Triggers:**
- Push to `master`/`main` with backend changes
- Manual workflow dispatch

**Jobs:**
- Build Docker image
- Push to Docker Hub
- Deploy to cloud (placeholder)

### 4. PR Checks (`pr-checks.yml`)

**Triggers:**
- Pull request opened, synchronized, or reopened

**Checks:**
- PR information (changed files, size)
- Code quality checks
- Preview deployment
- Automated comments with preview URL

### 5. Scheduled Tasks (`scheduled-tasks.yml`)

**Schedule:**
- Every Monday at 9 AM UTC

**Tasks:**
- Dependency updates check
- Security audit
- Cleanup old artifacts

## 🔐 Required Secrets

### GitHub Secrets

Configure these in: `Settings > Secrets and variables > Actions`

#### Vercel Deployment
```
VERCEL_TOKEN          # Vercel authentication token
VERCEL_ORG_ID         # Vercel organization ID
VERCEL_PROJECT_ID     # Vercel project ID
```

#### Netlify Deployment (Optional)
```
NETLIFY_AUTH_TOKEN    # Netlify authentication token
NETLIFY_SITE_ID       # Netlify site ID
```

#### Docker Hub
```
DOCKER_USERNAME       # Docker Hub username
DOCKER_PASSWORD       # Docker Hub password or access token
```

#### Application
```
VITE_API_BASE_URL     # API base URL for frontend
```

## 🚀 Setup Instructions

### 1. Vercel Setup

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login and link project:**
   ```bash
   cd frontend
   vercel login
   vercel link
   ```

3. **Get tokens:**
   ```bash
   # Get Vercel token from: https://vercel.com/account/tokens
   # Get Org ID and Project ID from .vercel/project.json
   ```

4. **Add secrets to GitHub:**
   - Go to repository Settings > Secrets
   - Add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

### 2. Docker Hub Setup

1. **Create Docker Hub account:**
   - Visit https://hub.docker.com/

2. **Create access token:**
   - Account Settings > Security > New Access Token

3. **Add secrets to GitHub:**
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your access token

### 3. Enable Workflows

1. **Go to Actions tab** in your repository

2. **Enable workflows** if disabled

3. **Test workflows:**
   ```bash
   # Create a test branch
   git checkout -b test/ci-cd
   
   # Make a small change
   echo "# Test" >> README.md
   
   # Commit and push
   git add .
   git commit -m "test: CI/CD pipeline"
   git push origin test/ci-cd
   
   # Create PR and watch workflows run
   ```

## 📊 Workflow Status Badges

Add these to your README.md:

```markdown
![CI](https://github.com/hobbong21/khub_personal-healthdata/workflows/CI%20-%20Test%20and%20Build/badge.svg)
![CD Frontend](https://github.com/hobbong21/khub_personal-healthdata/workflows/CD%20-%20Deploy%20Frontend/badge.svg)
![CD Backend](https://github.com/hobbong21/khub_personal-healthdata/workflows/CD%20-%20Deploy%20Backend/badge.svg)
```

## 🔍 Monitoring

### GitHub Actions Dashboard

- **Actions tab**: View all workflow runs
- **Insights > Dependency graph**: View dependencies
- **Security > Code scanning**: View security alerts

### Deployment Monitoring

**Vercel:**
- Dashboard: https://vercel.com/dashboard
- Deployments: View all deployments and logs
- Analytics: Performance metrics

**Docker Hub:**
- Dashboard: https://hub.docker.com/
- Repositories: View images and tags

## 🐛 Troubleshooting

### Common Issues

#### 1. Workflow fails with "Resource not accessible by integration"

**Solution:**
- Go to Settings > Actions > General
- Set "Workflow permissions" to "Read and write permissions"

#### 2. Vercel deployment fails

**Solution:**
- Check Vercel token is valid
- Verify Org ID and Project ID are correct
- Check build logs in Vercel dashboard

#### 3. Tests fail in CI but pass locally

**Solution:**
- Check Node.js version matches
- Verify environment variables
- Check for timezone/locale issues

#### 4. Docker build fails

**Solution:**
- Test build locally: `docker build -t test ./backend`
- Check Dockerfile syntax
- Verify all dependencies are in package.json

### Debug Mode

Enable debug logging:

1. Go to Settings > Secrets
2. Add secret: `ACTIONS_STEP_DEBUG` = `true`
3. Re-run workflow

## 📈 Performance Optimization

### Cache Strategy

**Node modules caching:**
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
    cache-dependency-path: frontend/package-lock.json
```

**Docker layer caching:**
```yaml
- uses: docker/build-push-action@v5
  with:
    cache-from: type=registry,ref=user/app:buildcache
    cache-to: type=registry,ref=user/app:buildcache,mode=max
```

### Parallel Jobs

Jobs run in parallel by default. Use `needs:` to create dependencies:

```yaml
deploy:
  needs: [test, build]  # Runs after test and build complete
```

## 🔄 Workflow Customization

### Add New Environment

1. **Create environment in GitHub:**
   - Settings > Environments > New environment
   - Add environment-specific secrets

2. **Update workflow:**
   ```yaml
   environment:
     name: staging
     url: ${{ steps.deploy.outputs.url }}
   ```

### Add Slack Notifications

```yaml
- name: Slack Notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment completed!'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
  if: always()
```

### Add Email Notifications

```yaml
- name: Send email
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: Build ${{ job.status }}
    body: Build completed with status ${{ job.status }}
    to: team@example.com
```

## 📝 Best Practices

### 1. Branch Protection

Enable branch protection rules:
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date

### 2. Semantic Versioning

Use semantic commit messages:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `chore:` - Maintenance
- `test:` - Tests

### 3. Environment Variables

- Never commit secrets
- Use GitHub Secrets for sensitive data
- Use environment-specific configurations

### 4. Testing

- Write tests for critical paths
- Maintain >80% code coverage
- Run tests before deployment

### 5. Monitoring

- Set up error tracking (Sentry)
- Monitor deployment metrics
- Set up alerts for failures

## 🎯 Next Steps

1. **Configure secrets** in GitHub repository
2. **Test workflows** with a PR
3. **Monitor first deployment**
4. **Set up notifications**
5. **Add status badges** to README
6. **Configure branch protection**
7. **Set up monitoring tools**

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment](https://vercel.com/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

**Last Updated:** 2024-11-05  
**Maintained By:** DevOps Team
