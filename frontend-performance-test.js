const puppeteer = require('puppeteer');
const fs = require('fs');

class FrontendPerformanceTest {
  constructor() {
    this.results = [];
  }

  async measurePageLoad(url, testName) {
    console.log(`🔍 ${testName} 페이지 로드 테스트 시작...`);
    
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      
      // 성능 메트릭 수집 시작
      await page.setCacheEnabled(false); // 캐시 비활성화로 실제 로드 시간 측정
      
      const startTime = Date.now();
      
      // 페이지 로드
      const response = await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      const loadTime = Date.now() - startTime;
      
      // 성능 메트릭 수집
      const metrics = await page.metrics();
      
      // Core Web Vitals 측정
      const webVitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const vitals = {};
            
            entries.forEach((entry) => {
              if (entry.entryType === 'navigation') {
                vitals.domContentLoaded = entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
                vitals.loadComplete = entry.loadEventEnd - entry.loadEventStart;
              }
            });
            
            resolve(vitals);
          });
          
          observer.observe({ entryTypes: ['navigation'] });
          
          // 타임아웃 설정
          setTimeout(() => resolve({}), 5000);
        });
      });
      
      // 번들 크기 분석
      const resourceSizes = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource');
        const sizes = {
          totalSize: 0,
          jsSize: 0,
          cssSize: 0,
          imageSize: 0,
          fontSize: 0
        };
        
        resources.forEach(resource => {
          const size = resource.transferSize || 0;
          sizes.totalSize += size;
          
          if (resource.name.includes('.js')) {
            sizes.jsSize += size;
          } else if (resource.name.includes('.css')) {
            sizes.cssSize += size;
          } else if (resource.name.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
            sizes.imageSize += size;
          } else if (resource.name.match(/\.(woff|woff2|ttf|otf)$/i)) {
            sizes.fontSize += size;
          }
        });
        
        return sizes;
      });
      
      const result = {
        testName,
        url,
        success: response.ok(),
        statusCode: response.status(),
        loadTime,
        metrics: {
          jsHeapUsedSize: metrics.JSHeapUsedSize,
          jsHeapTotalSize: metrics.JSHeapTotalSize,
          domNodes: metrics.Nodes,
          documents: metrics.Documents,
          frames: metrics.Frames,
          eventListeners: metrics.JSEventListeners
        },
        webVitals,
        resourceSizes,
        timestamp: new Date().toISOString()
      };
      
      this.results.push(result);
      
      console.log(`✅ ${testName}: ${loadTime}ms`);
      console.log(`   📦 총 리소스 크기: ${(resourceSizes.totalSize / 1024).toFixed(2)}KB`);
      console.log(`   🧠 메모리 사용량: ${(metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)}MB`);
      
      return result;
      
    } catch (error) {
      console.log(`❌ ${testName}: ${error.message}`);
      
      const result = {
        testName,
        url,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      this.results.push(result);
      return result;
      
    } finally {
      await browser.close();
    }
  }

  async runTests() {
    console.log('🚀 프론트엔드 성능 테스트 시작...\n');
    
    const baseUrl = 'http://localhost:5173';
    
    // 메인 페이지 테스트
    await this.measurePageLoad(baseUrl, '메인 페이지');
    
    // 다른 페이지들도 테스트 (실제 라우트가 있다면)
    // await this.measurePageLoad(`${baseUrl}/dashboard`, '대시보드');
    // await this.measurePageLoad(`${baseUrl}/health`, '건강 데이터');
  }

  generateReport() {
    console.log('\n📈 프론트엔드 성능 테스트 결과');
    console.log('=' .repeat(50));
    
    const successfulTests = this.results.filter(r => r.success);
    const failedTests = this.results.filter(r => !r.success);
    
    if (successfulTests.length > 0) {
      const loadTimes = successfulTests.map(r => r.loadTime);
      const avgLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
      const minLoadTime = Math.min(...loadTimes);
      const maxLoadTime = Math.max(...loadTimes);
      
      console.log(`✅ 성공한 테스트: ${successfulTests.length}`);
      console.log(`❌ 실패한 테스트: ${failedTests.length}`);
      console.log(`⏱️  평균 로드 시간: ${avgLoadTime.toFixed(2)}ms`);
      console.log(`🚀 최소 로드 시간: ${minLoadTime}ms`);
      console.log(`🐌 최대 로드 시간: ${maxLoadTime}ms`);
      
      // 리소스 크기 분석
      if (successfulTests[0]?.resourceSizes) {
        const sizes = successfulTests[0].resourceSizes;
        console.log(`\n📦 리소스 분석:`);
        console.log(`   총 크기: ${(sizes.totalSize / 1024).toFixed(2)}KB`);
        console.log(`   JavaScript: ${(sizes.jsSize / 1024).toFixed(2)}KB`);
        console.log(`   CSS: ${(sizes.cssSize / 1024).toFixed(2)}KB`);
        console.log(`   이미지: ${(sizes.imageSize / 1024).toFixed(2)}KB`);
        console.log(`   폰트: ${(sizes.fontSize / 1024).toFixed(2)}KB`);
      }
      
      // 성능 등급 평가
      let grade = 'A';
      if (avgLoadTime > 3000) grade = 'D';
      else if (avgLoadTime > 2000) grade = 'C';
      else if (avgLoadTime > 1000) grade = 'B';
      
      console.log(`\n🏆 성능 등급: ${grade}`);
      
      // 개선 권장사항
      console.log('\n💡 개선 권장사항:');
      if (avgLoadTime > 1000) {
        console.log('- 페이지 로드 시간 최적화 필요 (목표: 1초 이하)');
      }
      if (successfulTests[0]?.resourceSizes?.totalSize > 1024 * 1024) {
        console.log('- 번들 크기 최적화 필요 (목표: 1MB 이하)');
      }
      if (successfulTests[0]?.resourceSizes?.jsSize > 512 * 1024) {
        console.log('- JavaScript 번들 크기 최적화 필요');
      }
      if (failedTests.length > 0) {
        console.log('- 페이지 로드 안정성 개선 필요');
      }
    }
    
    return {
      totalTests: this.results.length,
      successfulTests: successfulTests.length,
      failedTests: failedTests.length,
      avgLoadTime: successfulTests.length > 0 ? 
        successfulTests.reduce((sum, r) => sum + r.loadTime, 0) / successfulTests.length : 0,
      results: this.results
    };
  }
}

// 테스트 실행
async function runFrontendTests() {
  const tester = new FrontendPerformanceTest();
  
  try {
    await tester.runTests();
    const report = tester.generateReport();
    
    // 결과를 파일로 저장
    fs.writeFileSync('frontend-performance-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 상세 결과가 frontend-performance-report.json에 저장되었습니다.');
    
  } catch (error) {
    console.error('❌ 프론트엔드 테스트 실행 중 오류:', error.message);
  }
}

// 스크립트가 직접 실행될 때만 테스트 실행
if (require.main === module) {
  runFrontendTests();
}

module.exports = FrontendPerformanceTest;