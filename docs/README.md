# Documentation Index

Welcome to the Personal Health Platform documentation. All project documentation is organized in this directory for easy access and maintenance.

## 📁 Documentation Structure

### [Architecture](./architecture/)
System design and architecture documentation
- [System Architecture Analysis](./architecture/SYSTEM_ARCHITECTURE_ANALYSIS.md)

### [API](./api/)
API integration and endpoint documentation
- [API Documentation](./api/API_DOCUMENTATION.md)

### [Deployment](./deployment/)
Build, deployment, and production setup guides
- [Build Optimization Guide](./deployment/BUILD_OPTIMIZATION.md)
- [Deployment Setup Summary](./deployment/DEPLOYMENT_SETUP_SUMMARY.md)

### [Development](./development/)
Development guides, conventions, and best practices
- [HTML to TSX Conversion Guide](./development/HTML_TO_TSX_CONVERSION_GUIDE.md)
- [HTML Prototypes Summary](./development/HTML_PROTOTYPES_SUMMARY.md)
- [Page Design Summary](./development/PAGE_DESIGN_SUMMARY.md)
- [Test Summary](./development/TEST_SUMMARY.md)

### [Features](./features/)
Feature-specific implementation documentation
- [Dashboard Enhancements](./features/dashboard-enhancements.md)
- [Genomics Results Page](./features/genomics-results-page.md)
- [Navigation Implementation](./features/navigation-implementation.md)

### [AI Insights Module](./ai-insights/) ⭐ NEW
Complete AI-powered health insights documentation
- [Documentation Index](./ai-insights/INDEX.md) - Start here
- [Quick Start Guide](./ai-insights/AI_INSIGHTS_QUICKSTART.md)
- [API Documentation](./ai-insights/AI_INSIGHTS_API.md)
- [Deployment Guide](./ai-insights/AI_INSIGHTS_DEPLOYMENT.md)
- [Performance Guide](./ai-insights/AI_INSIGHTS_PERFORMANCE_GUIDE.md)
- [Environment Variables](./ai-insights/ENVIRONMENT_VARIABLES.md)
- [Feature Summary](./ai-insights/AI_INSIGHTS_FEATURE_SUMMARY.md)

## 🔍 Quick Links

### For Developers
- [Project Structure](./PROJECT_STRUCTURE.md) - Understanding the codebase organization
- [Development Guide](./development/) - Getting started with development
- [API Documentation](./api/API_DOCUMENTATION.md) - API integration guide
- [AI Insights API](./ai-insights/AI_INSIGHTS_API.md) - AI Insights endpoints ⭐
- [AI Insights Quick Start](./ai-insights/AI_INSIGHTS_QUICKSTART.md) - Get started in 5 minutes
- [Component Guide](../frontend/src/components/common/README.md) - Component usage

### For DevOps
- [Deployment Guide](./deployment/DEPLOYMENT_SETUP_SUMMARY.md) - Production deployment
- [AI Insights Deployment](./ai-insights/AI_INSIGHTS_DEPLOYMENT.md) - AI module deployment ⭐
- [Environment Variables](./ai-insights/ENVIRONMENT_VARIABLES.md) - Configuration reference
- [AI Performance Guide](./ai-insights/AI_INSIGHTS_PERFORMANCE_GUIDE.md) - Performance tuning
- [Build Optimization](./deployment/BUILD_OPTIMIZATION.md) - Performance optimization
- [Architecture](./architecture/SYSTEM_ARCHITECTURE_ANALYSIS.md) - System overview

### For Designers
- [Page Design Summary](./development/PAGE_DESIGN_SUMMARY.md) - Design specifications
- [HTML Prototypes](../frontend/html-prototypes/) - Design prototypes

## 📝 Documentation Guidelines

### Adding New Documentation

1. **Choose the right directory:**
   - `architecture/` - System design, diagrams, technical architecture
   - `api/` - API specifications, endpoints, integration guides
   - `deployment/` - Build, deployment, infrastructure
   - `development/` - Development guides, conventions, tutorials
   - `features/` - Feature-specific implementation docs

2. **Use consistent formatting:**
   - Use Markdown (.md) format
   - Include a clear title and overview
   - Add table of contents for long documents
   - Use code blocks with language specification
   - Include examples where applicable

3. **Keep it updated:**
   - Update docs when code changes
   - Remove outdated information
   - Link to related documents
   - Add date of last update

### Document Naming

- Use kebab-case: `my-document-name.md`
- Be descriptive: `api-authentication-guide.md` not `auth.md`
- Include version if needed: `api-v2-migration.md`

## 🔄 Migration Notes

All documentation has been reorganized from root-level files into this structured directory. Old file locations:

- Root `*_SUMMARY.md` files → `docs/features/`
- Root `*_GUIDE.md` files → `docs/development/`
- `frontend/API_DOCUMENTATION.md` → `docs/api/`
- `frontend/BUILD_OPTIMIZATION.md` → `docs/deployment/`
- `frontend/TEST_SUMMARY.md` → `docs/development/`

## 📞 Need Help?

- Check the [Project Structure](./PROJECT_STRUCTURE.md) guide
- Review the [Development Guide](./development/)
- Create an issue in the project repository
- Contact the development team

## 🎯 Documentation Goals

1. **Centralized** - All docs in one place
2. **Organized** - Clear categorization
3. **Accessible** - Easy to find and navigate
4. **Up-to-date** - Regularly maintained
5. **Comprehensive** - Covers all aspects of the project

---

Last Updated: 2024-11-08
