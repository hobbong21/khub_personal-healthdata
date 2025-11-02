// 성능 모니터링 유틸리티
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // 페이지 로드 시간 측정
  measurePageLoad(pageName: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
      this.metrics.set(`pageLoad_${pageName}`, loadTime);
      
      // 개발 환경에서만 콘솔 출력
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 ${pageName} 로드 시간: ${loadTime}ms`);
      }
    }
  }

  // API 응답 시간 측정
  measureApiCall(apiName: string, startTime: number): void {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    this.metrics.set(`api_${apiName}`, responseTime);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🌐 ${apiName} API 응답 시간: ${responseTime}ms`);
    }
  }

  // 컴포넌트 렌더링 시간 측정
  measureRender(componentName: string, renderFn: () => void): void {
    const startTime = performance.now();
    renderFn();
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    this.metrics.set(`render_${componentName}`, renderTime);
    
    if (process.env.NODE_ENV === 'development' && renderTime > 16) {
      console.warn(`⚠️ ${componentName} 렌더링 시간이 16ms를 초과했습니다: ${renderTime.toFixed(2)}ms`);
    }
  }

  // Core Web Vitals 측정
  measureWebVitals(): void {
    if (typeof window !== 'undefined') {
      // LCP (Largest Contentful Paint)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.set('LCP', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // FID (First Input Delay)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.set('FID', entry.processingStart - entry.startTime);
        });
      }).observe({ entryTypes: ['first-input'] });

      // CLS (Cumulative Layout Shift)
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.metrics.set('CLS', clsValue);
          }
        });
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }

  // 메트릭 리포트 생성
  generateReport(): Record<string, number> {
    const report: Record<string, number> = {};
    this.metrics.forEach((value, key) => {
      report[key] = value;
    });
    return report;
  }

  // 메트릭 초기화
  clearMetrics(): void {
    this.metrics.clear();
  }
}

// React Hook for performance monitoring
import { useEffect } from 'react';

export const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const monitor = PerformanceMonitor.getInstance();
    monitor.measurePageLoad(componentName);
    monitor.measureWebVitals();
  }, [componentName]);
};