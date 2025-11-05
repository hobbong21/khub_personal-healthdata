# Project Structure

## Overview

This document describes the standardized project structure for the Personal Health Platform.

## Directory Structure

```
personal-health-platform/
├── .github/                    # GitHub workflows and configurations
├── .kiro/                      # Kiro IDE specifications
│   └── specs/                  # Feature specifications
├── backend/                    # Backend API service
├── docs/                       # Project documentation (centralized)
│   ├── architecture/          # Architecture documents
│   ├── api/                   # API documentation
│   ├── deployment/            # Deployment guides
│   ├── development/           # Development guides
│   └── features/              # Feature documentation
├── e2e-tests/                 # End-to-end tests
├── frontend/                  # Frontend React application
│   ├── .vscode/              # VS Code settings
│   ├── html-prototypes/      # HTML prototypes (reference only)
│   ├── public/               # Static assets
│   ├── src/                  # Source code
│   │   ├── components/       # React components
│   │   ├── config/           # Configuration files
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── styles/           # Global styles
│   │   ├── test/             # Test utilities
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Utility functions
│   ├── .env                  # Development environment variables
│   ├── .env.example          # Environment variables template
│   ├── .env.production       # Production environment variables
│   ├── .gitignore            # Git ignore rules
│   ├── package.json          # Dependencies and scripts
│   ├── tsconfig.json         # TypeScript configuration
│   └── vite.config.ts        # Vite configuration
├── infrastructure/            # Infrastructure as code
├── nginx/                     # Nginx configuration
├── performance-tests/         # Performance testing
├── scripts/                   # Build and deployment scripts
├── .gitignore                # Root git ignore
├── docker-compose.yml        # Docker compose configuration
├── Makefile                  # Build automation
├── package.json              # Root package configuration
└── README.md                 # Project overview
```

## Documentation Organization

All documentation is now centralized in the `docs/` directory:

### docs/architecture/
- System architecture diagrams
- Component architecture
- Database schema
- API architecture

### docs/api/
- API documentation
- API endpoints reference
- Authentication guide
- Rate limiting

### docs/deployment/
- Deployment guides
- Environment setup
- Build optimization
- CI/CD configuration

### docs/development/
- Development setup
- Coding standards
- Component guidelines
- Testing guidelines

### docs/features/
- Feature specifications
- Implementation summaries
- User guides
- Feature documentation

## Frontend Structure

### src/components/
Component organization by feature:

```
components/
├── common/              # Shared components
│   ├── Button/
│   ├── Navigation/
│   ├── Footer/
│   └── ...
├── dashboard/           # Dashboard-specific components
├── genomics/            # Genomics-specific components
└── layout/              # Layout components
```

### src/pages/
Page components for routing:

```
pages/
├── Dashboard/
├── GenomicsPage/
└── ...
```

### src/services/
API service layer:

```
services/
├── api.ts              # Axios instance
├── healthDataApi.ts    # Health data endpoints
├── genomicsApi.ts      # Genomics endpoints
└── ...
```

### src/hooks/
Custom React hooks:

```
hooks/
├── useHealthData.ts
├── useChartData.ts
├── useAuth.ts
└── ...
```

### src/types/
TypeScript type definitions:

```
types/
├── health.types.ts
├── genomics.types.ts
├── common.types.ts
└── ...
```

## File Naming Conventions

### Components
- Component files: `ComponentName.tsx`
- Style files: `ComponentName.module.css`
- Type files: `ComponentName.types.ts`
- Test files: `ComponentName.test.tsx`

### Services
- Service files: `serviceName.ts` or `serviceNameApi.ts`
- Test files: `serviceName.test.ts`

### Hooks
- Hook files: `useHookName.ts`
- Test files: `useHookName.test.ts`

### Types
- Type files: `category.types.ts`

## Import Path Aliases

Use path aliases for cleaner imports:

```typescript
import { Button } from '@components/common/Button/Button';
import { useHealthData } from '@hooks/useHealthData';
import { HealthData } from '@types/health.types';
import { formatDate } from '@utils/formatters';
import { env } from '@config/env';
```

## Documentation Files

### Root Level
- `README.md` - Project overview and quick start

### Frontend Level
- `README.md` - Frontend-specific documentation
- `API_DOCUMENTATION.md` - API integration guide
- `BUILD_OPTIMIZATION.md` - Build optimization guide
- `TEST_SUMMARY.md` - Testing guide

### Docs Directory
All detailed documentation should be in `docs/` subdirectories

## Deprecated Files

The following files are deprecated and should not be used:

- Root-level summary files (moved to `docs/features/`)
- Duplicate HTML files in `public/` (use `html-prototypes/` as reference)
- Old configuration files (replaced by new structure)

## Migration Notes

When moving files:
1. Update all import paths
2. Update documentation references
3. Update build scripts if needed
4. Test thoroughly after migration
5. Remove old files only after verification

## Best Practices

1. **Keep documentation close to code**: Component-specific docs in component folders
2. **Centralize general docs**: Project-wide docs in `docs/` directory
3. **Use consistent naming**: Follow naming conventions strictly
4. **Maintain structure**: Don't create ad-hoc directories
5. **Update this document**: When structure changes, update this file
