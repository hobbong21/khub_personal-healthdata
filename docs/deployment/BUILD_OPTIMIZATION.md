# Build Optimization Guide

## Overview

This document describes the build optimization strategies implemented in the project to ensure optimal performance and bundle size.

## Build Configuration

### Vite Configuration

The project uses Vite as the build tool with the following optimizations:

#### 1. Code Splitting

**Manual Chunks Strategy:**
- `vendor-react`: React and React DOM
- `vendor-router`: React Router
- `vendor-charts`: Chart libraries (Recharts, Chart.js)
- `vendor-query`: TanStack Query
- `vendor-http`: Axios
- `vendor-ui`: UI utilities (Lucide, clsx, tailwind-merge)
- `vendor-utils`: Date utilities (date-fns, moment)
- `components-dashboard`: Dashboard components
- `components-genomics`: Genomics components
- `components-common`: Common/shared components
- `pages`: All page components

**Benefits:**
- Better caching: Vendor code changes less frequently
- Parallel loading: Multiple chunks can be loaded simultaneously
- Smaller initial bundle: Only load what's needed

#### 2. Minification

**Terser Configuration:**
```javascript
{
  compress: {
    drop_console: true,        // Remove console.log in production
    drop_debugger: true,        // Remove debugger statements
    pure_funcs: ['console.log'], // Remove specific functions
    passes: 2                   // Multiple compression passes
  },
  mangle: {
    safari10: true              // Safari 10 compatibility
  }
}
```

#### 3. Asset Optimization

**File Naming Strategy:**
- Images: `assets/images/[name]-[hash][extname]`
- Fonts: `assets/fonts/[name]-[hash][extname]`
- JS: `js/[name]-[hash].js`
- CSS: Automatic code splitting enabled

#### 4. Dependency Pre-bundling

Pre-bundled dependencies for faster dev server startup:
- react, react-dom
- react-router-dom
- recharts, chart.js
- @tanstack/react-query
- axios
- date-fns, moment
- lucide-react, clsx, tailwind-merge

## Build Scripts

### Available Commands

```bash
# Development build
npm run dev

# Production build with type checking
npm run build

# Production build (explicit)
npm run build:prod

# Build with bundle analysis
npm run build:analyze

# Preview production build
npm run preview

# Type checking only
npm run type-check

# Clean build artifacts
npm run clean
```

## Bundle Analysis

### Running Bundle Analyzer

```bash
npm run build:analyze
```

This will:
1. Build the production bundle
2. Generate a visual report of bundle composition
3. Open the report in your browser

### Interpreting Results

**Target Sizes:**
- Initial bundle: < 200KB (gzipped)
- Vendor chunks: < 150KB each (gzipped)
- Component chunks: < 50KB each (gzipped)
- Total bundle: < 1MB (gzipped)

**Red Flags:**
- Single chunk > 500KB
- Duplicate dependencies
- Unused code in bundles

## Performance Targets

### Load Time Goals

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Total Blocking Time (TBT)**: < 300ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### Bundle Size Goals

- **Initial JS**: < 200KB (gzipped)
- **Initial CSS**: < 50KB (gzipped)
- **Total Assets**: < 1MB (gzipped)

## Optimization Checklist

### Before Production Deploy

- [ ] Run `npm run build:analyze` to check bundle sizes
- [ ] Verify no console.log statements in production
- [ ] Check that sourcemaps are disabled (or properly configured)
- [ ] Test production build locally with `npm run preview`
- [ ] Verify environment variables are set correctly
- [ ] Run lighthouse audit on production build
- [ ] Check for unused dependencies with `npm prune`
- [ ] Verify all images are optimized
- [ ] Test on slow 3G network simulation

### Continuous Optimization

1. **Monitor Bundle Size:**
   - Set up CI/CD to track bundle size changes
   - Alert on significant size increases (>10%)

2. **Regular Audits:**
   - Run Lighthouse monthly
   - Review bundle composition quarterly
   - Update dependencies regularly

3. **Code Review:**
   - Check for large imports
   - Prefer named imports over default imports
   - Use dynamic imports for large components

## Common Issues and Solutions

### Issue: Large Bundle Size

**Solutions:**
1. Use dynamic imports for routes
2. Lazy load heavy components
3. Remove unused dependencies
4. Use tree-shaking friendly libraries

### Issue: Slow Build Time

**Solutions:**
1. Enable persistent caching
2. Reduce TypeScript strictness during dev
3. Use `esbuild` for faster transpilation
4. Limit source map generation

### Issue: Duplicate Dependencies

**Solutions:**
1. Check `package-lock.json` for duplicates
2. Use `npm dedupe` to flatten dependencies
3. Specify exact versions in package.json
4. Use peer dependencies where appropriate

## Advanced Optimizations

### 1. Preload Critical Resources

```html
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
```

### 2. Use Web Workers for Heavy Computation

```typescript
// For genomics data processing
const worker = new Worker('/workers/genomics.worker.js');
```

### 3. Implement Service Worker for Caching

```typescript
// Progressive Web App capabilities
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### 4. Image Optimization

- Use WebP format with fallbacks
- Implement lazy loading for images
- Use responsive images with srcset
- Compress images before deployment

## Monitoring

### Tools

1. **Lighthouse CI**: Automated performance testing
2. **Bundle Analyzer**: Visual bundle composition
3. **Chrome DevTools**: Performance profiling
4. **WebPageTest**: Real-world performance testing

### Metrics to Track

- Bundle size over time
- Load time percentiles (p50, p75, p95)
- Core Web Vitals
- Error rates
- Cache hit rates

## Resources

- [Vite Build Optimization](https://vitejs.dev/guide/build.html)
- [Web.dev Performance](https://web.dev/performance/)
- [Bundle Size Optimization](https://web.dev/reduce-javascript-payloads-with-code-splitting/)
- [Core Web Vitals](https://web.dev/vitals/)
