const fs = require('fs');
const path = require('path');

class FrontendOptimizer {
  constructor() {
    this.frontendPath = './frontend';
    this.optimizations = [];
  }

  // Vite 설정 최적화
  optimizeViteConfig() {
    console.log('🔧 Vite 설정 최적화 중...');
    
    const viteConfigPath = path.join(this.frontendPath, 'vite.config.ts');
    
    const optimizedConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 번들 크기 최적화
    rollupOptions: {
      output: {
        manualChunks: {
          // 벤더 라이브러리 분리
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          charts: ['recharts'],
          ui: ['lucide-react', 'clsx', 'tailwind-merge'],
          utils: ['date-fns', 'moment']
        }
      }
    },
    // 압축 최적화
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 프로덕션에서 console.log 제거
        drop_debugger: true
      }
    },
    // 청크 크기 경고 임계값 조정
    chunkSizeWarningLimit: 1000
  },
  // 개발 서버 최적화
  server: {
    hmr: {
      overlay: false
    }
  },
  // 의존성 사전 번들링 최적화
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'recharts',
      'date-fns',
      'moment'
    ]
  }
})`;

    try {
      fs.writeFileSync(viteConfigPath, optimizedConfig);
      this.optimizations.push('✅ Vite 설정 최적화 완료');
      console.log('✅ Vite 설정 최적화 완료');
    } catch (error) {
      console.log('❌ Vite 설정 최적화 실패:', error.message);
    }
  }

  // 코드 스플리팅을 위한 라우터 최적화
  optimizeRouting() {
    console.log('🔧 라우터 코드 스플리팅 최적화 중...');
    
    const appPath = path.join(this.frontendPath, 'src', 'App.tsx');
    
    const optimizedApp = `import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { HealthDataProvider } from './contexts/HealthDataContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import './App.css';

// 지연 로딩을 위한 컴포넌트들
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const HealthDataPage = lazy(() => import('./pages/HealthDataPage'));
const MedicalRecordsPage = lazy(() => import('./pages/MedicalRecordsPage'));
const MedicationPage = lazy(() => import('./pages/MedicationPage'));
const GenomicsPage = lazy(() => import('./pages/GenomicsPage'));
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

function App() {
  return (
    <AuthProvider>
      <HealthDataProvider>
        <Router>
          <div className="App">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/health" element={
                  <ProtectedRoute>
                    <HealthDataPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/medical-records" element={
                  <ProtectedRoute>
                    <MedicalRecordsPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/medications" element={
                  <ProtectedRoute>
                    <MedicationPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/genomics" element={
                  <ProtectedRoute>
                    <GenomicsPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/recommendations" element={
                  <ProtectedRoute>
                    <RecommendationsPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </HealthDataProvider>
    </AuthProvider>
  );
}

export default App;`;

    try {
      if (fs.existsSync(appPath)) {
        fs.writeFileSync(appPath, optimizedApp);
        this.optimizations.push('✅ 라우터 코드 스플리팅 최적화 완료');
        console.log('✅ 라우터 코드 스플리팅 최적화 완료');
      }
    } catch (error) {
      console.log('❌ 라우터 최적화 실패:', error.message);
    }
  }

  // 이미지 최적화를 위한 설정
  optimizeImages() {
    console.log('🔧 이미지 최적화 설정 중...');
    
    const imageOptimizationGuide = `# 이미지 최적화 가이드

## 권장사항
1. WebP 형식 사용
2. 이미지 크기 최적화 (적절한 해상도)
3. 지연 로딩 구현
4. 이미지 압축

## 구현 예시
\`\`\`jsx
// 지연 로딩 이미지 컴포넌트
const LazyImage = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={className}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          style={{ opacity: isLoaded ? 1 : 0 }}
        />
      )}
    </div>
  );
};
\`\`\`
`;

    try {
      fs.writeFileSync('image-optimization-guide.md', imageOptimizationGuide);
      this.optimizations.push('✅ 이미지 최적화 가이드 생성 완료');
      console.log('✅ 이미지 최적화 가이드 생성 완료');
    } catch (error) {
      console.log('❌ 이미지 최적화 설정 실패:', error.message);
    }
  }

  // 캐싱 전략 최적화
  optimizeCaching() {
    console.log('🔧 캐싱 전략 최적화 중...');
    
    const serviceWorkerPath = path.join(this.frontendPath, 'public', 'sw.js');
    
    const serviceWorker = `// 서비스 워커 - 캐싱 전략
const CACHE_NAME = 'health-platform-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// 설치 이벤트
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// 페치 이벤트 - 캐시 우선 전략
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 캐시에서 찾으면 반환
        if (response) {
          return response;
        }
        
        // 네트워크에서 가져오기
        return fetch(event.request).then((response) => {
          // 유효한 응답인지 확인
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // 응답 복사 후 캐시에 저장
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
  );
});

// 활성화 이벤트 - 오래된 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});`;

    try {
      const publicDir = path.join(this.frontendPath, 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      
      fs.writeFileSync(serviceWorkerPath, serviceWorker);
      this.optimizations.push('✅ 서비스 워커 캐싱 전략 설정 완료');
      console.log('✅ 서비스 워커 캐싱 전략 설정 완료');
    } catch (error) {
      console.log('❌ 캐싱 전략 설정 실패:', error.message);
    }
  }

  // 번들 분석을 위한 설정
  setupBundleAnalysis() {
    console.log('🔧 번들 분석 도구 설정 중...');
    
    const packageJsonPath = path.join(this.frontendPath, 'package.json');
    
    try {
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // 번들 분석 스크립트 추가
        packageJson.scripts = packageJson.scripts || {};
        packageJson.scripts['analyze'] = 'vite-bundle-analyzer dist';
        packageJson.scripts['build:analyze'] = 'npm run build && npm run analyze';
        
        // 개발 의존성 추가 (실제로는 npm install로 설치해야 함)
        packageJson.devDependencies = packageJson.devDependencies || {};
        packageJson.devDependencies['vite-bundle-analyzer'] = '^0.7.0';
        
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        this.optimizations.push('✅ 번들 분석 도구 설정 완료');
        console.log('✅ 번들 분석 도구 설정 완료');
      }
    } catch (error) {
      console.log('❌ 번들 분석 도구 설정 실패:', error.message);
    }
  }

  // 성능 모니터링 코드 추가
  addPerformanceMonitoring() {
    console.log('🔧 성능 모니터링 코드 추가 중...');
    
    const performanceMonitorPath = path.join(this.frontendPath, 'src', 'utils', 'performanceMonitor.ts');
    
    const performanceMonitor = `// 성능 모니터링 유틸리티
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
      this.metrics.set(\`pageLoad_\${pageName}\`, loadTime);
      
      // 개발 환경에서만 콘솔 출력
      if (process.env.NODE_ENV === 'development') {
        console.log(\`📊 \${pageName} 로드 시간: \${loadTime}ms\`);
      }
    }
  }

  // API 응답 시간 측정
  measureApiCall(apiName: string, startTime: number): void {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    this.metrics.set(\`api_\${apiName}\`, responseTime);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(\`🌐 \${apiName} API 응답 시간: \${responseTime}ms\`);
    }
  }

  // 컴포넌트 렌더링 시간 측정
  measureRender(componentName: string, renderFn: () => void): void {
    const startTime = performance.now();
    renderFn();
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    this.metrics.set(\`render_\${componentName}\`, renderTime);
    
    if (process.env.NODE_ENV === 'development' && renderTime > 16) {
      console.warn(\`⚠️ \${componentName} 렌더링 시간이 16ms를 초과했습니다: \${renderTime.toFixed(2)}ms\`);
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
};`;

    try {
      const utilsDir = path.join(this.frontendPath, 'src', 'utils');
      if (!fs.existsSync(utilsDir)) {
        fs.mkdirSync(utilsDir, { recursive: true });
      }
      
      fs.writeFileSync(performanceMonitorPath, performanceMonitor);
      this.optimizations.push('✅ 성능 모니터링 코드 추가 완료');
      console.log('✅ 성능 모니터링 코드 추가 완료');
    } catch (error) {
      console.log('❌ 성능 모니터링 코드 추가 실패:', error.message);
    }
  }

  // 모든 최적화 실행
  async runAllOptimizations() {
    console.log('🚀 프론트엔드 성능 최적화 시작...\n');
    
    this.optimizeViteConfig();
    this.optimizeRouting();
    this.optimizeImages();
    this.optimizeCaching();
    this.setupBundleAnalysis();
    this.addPerformanceMonitoring();
    
    console.log('\n📈 최적화 완료 요약:');
    this.optimizations.forEach(opt => console.log(opt));
    
    console.log('\n💡 추가 권장사항:');
    console.log('1. npm install vite-bundle-analyzer --save-dev');
    console.log('2. npm run build:analyze로 번들 크기 분석');
    console.log('3. 이미지를 WebP 형식으로 변환');
    console.log('4. 불필요한 의존성 제거');
    console.log('5. Tree shaking 확인');
    
    return this.optimizations;
  }
}

// 스크립트 실행
if (require.main === module) {
  const optimizer = new FrontendOptimizer();
  optimizer.runAllOptimizations();
}

module.exports = FrontendOptimizer;