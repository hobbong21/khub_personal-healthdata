import React from 'react';

/**
 * Performance monitoring utilities for dashboard optimization
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'development' || 
                     localStorage.getItem('enablePerformanceMonitoring') === 'true';
  }

  /**
   * Start measuring performance for a given operation
   */
  start(name: string): void {
    if (!this.isEnabled) return;

    this.metrics.set(name, {
      name,
      startTime: performance.now()
    });
  }

  /**
   * End measuring performance and log the result
   */
  end(name: string): number | null {
    if (!this.isEnabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" was not started`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    // Log slow operations
    if (duration > 100) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    } else if (duration > 16.67) { // More than one frame at 60fps
      console.log(`${name} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * Measure a function execution time
   */
  measure<T>(name: string, fn: () => T): T {
    this.start(name);
    try {
      const result = fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Measure an async function execution time
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values()).filter(m => m.duration !== undefined);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Get performance summary
   */
  getSummary(): { total: number; average: number; slowest: PerformanceMetric | null } {
    const completedMetrics = this.getMetrics();
    
    if (completedMetrics.length === 0) {
      return { total: 0, average: 0, slowest: null };
    }

    const total = completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    const average = total / completedMetrics.length;
    const slowest = completedMetrics.reduce((prev, current) => 
      (current.duration || 0) > (prev.duration || 0) ? current : prev
    );

    return { total, average, slowest };
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Debounce function to limit the rate of function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function to limit the rate of function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Memoization function for expensive calculations
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    // Limit cache size to prevent memory leaks
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }
    
    return result;
  }) as T;
}

/**
 * Lazy loading utility for components
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = React.lazy(importFunc);
  
  return (props: React.ComponentProps<T>) => 
    React.createElement(
      React.Suspense,
      { 
        fallback: fallback 
          ? React.createElement(fallback) 
          : React.createElement('div', null, 'Loading...')
      },
      React.createElement(LazyComponent, props)
    );
}

/**
 * Virtual scrolling utility for large lists
 */
export class VirtualScroller {
  private _container: HTMLElement;
  private itemHeight: number;
  private visibleCount: number;
  private totalCount: number;
  private scrollTop: number = 0;

  constructor(
    container: HTMLElement,
    itemHeight: number,
    totalCount: number
  ) {
    this._container = container;
    this.itemHeight = itemHeight;
    this.totalCount = totalCount;
    this.visibleCount = Math.ceil(this._container.clientHeight / itemHeight) + 2; // Buffer
  }

  getVisibleRange(): { start: number; end: number } {
    const start = Math.floor(this.scrollTop / this.itemHeight);
    const end = Math.min(start + this.visibleCount, this.totalCount);
    
    return { start: Math.max(0, start), end };
  }

  updateScrollTop(scrollTop: number): void {
    this.scrollTop = scrollTop;
  }

  getTotalHeight(): number {
    return this.totalCount * this.itemHeight;
  }

  getOffsetY(index: number): number {
    return index * this.itemHeight;
  }
}

/**
 * Image lazy loading utility
 */
export function createImageLazyLoader() {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  });

  return {
    observe: (img: HTMLImageElement) => imageObserver.observe(img),
    unobserve: (img: HTMLImageElement) => imageObserver.unobserve(img),
    disconnect: () => imageObserver.disconnect()
  };
}

export default performanceMonitor;