const axios = require('axios');

// 성능 테스트 스크립트
class PerformanceTest {
  constructor(baseUrl = 'http://localhost:5001') {
    this.baseUrl = baseUrl;
    this.results = [];
  }

  async measureApiResponse(endpoint, method = 'GET', data = null) {
    const startTime = Date.now();
    
    try {
      const config = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        timeout: 5000
      };
      
      if (data && (method === 'POST' || method === 'PUT')) {
        config.data = data;
        config.headers = { 'Content-Type': 'application/json' };
      }
      
      const response = await axios(config);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      const result = {
        endpoint,
        method,
        status: response.status,
        responseTime,
        success: true,
        timestamp: new Date().toISOString()
      };
      
      this.results.push(result);
      console.log(`✅ ${method} ${endpoint}: ${responseTime}ms`);
      return result;
      
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      const result = {
        endpoint,
        method,
        status: error.response?.status || 0,
        responseTime,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      this.results.push(result);
      console.log(`❌ ${method} ${endpoint}: ${responseTime}ms - ${error.message}`);
      return result;
    }
  }

  async runBasicTests() {
    console.log('🚀 기본 API 성능 테스트 시작...\n');
    
    // 헬스 체크
    await this.measureApiResponse('/health');
    
    // 인증 테스트
    await this.measureApiResponse('/api/auth/login', 'POST', {
      email: 'test@example.com',
      password: 'password'
    });
    
    // 건강 데이터 조회
    await this.measureApiResponse('/api/health/records');
    await this.measureApiResponse('/api/health/dashboard');
    
    // 진료 기록 조회
    await this.measureApiResponse('/api/medical/records');
    
    // 약물 정보 조회
    await this.measureApiResponse('/api/medications');
  }

  async runLoadTest(endpoint, concurrency = 10, requests = 50) {
    console.log(`\n🔄 로드 테스트: ${endpoint} (동시 요청: ${concurrency}, 총 요청: ${requests})`);
    
    const startTime = Date.now();
    const promises = [];
    
    for (let i = 0; i < requests; i++) {
      const promise = this.measureApiResponse(endpoint).catch(err => ({
        success: false,
        error: err.message,
        responseTime: 0
      }));
      promises.push(promise);
      
      // 동시성 제어
      if (promises.length >= concurrency) {
        await Promise.all(promises.splice(0, concurrency));
      }
    }
    
    // 남은 요청 처리
    if (promises.length > 0) {
      await Promise.all(promises);
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log(`⏱️  총 소요 시간: ${totalTime}ms`);
    console.log(`📊 평균 처리량: ${(requests / (totalTime / 1000)).toFixed(2)} req/sec`);
  }

  generateReport() {
    console.log('\n📈 성능 테스트 결과 리포트');
    console.log('=' .repeat(50));
    
    const successfulRequests = this.results.filter(r => r.success);
    const failedRequests = this.results.filter(r => !r.success);
    
    if (successfulRequests.length > 0) {
      const responseTimes = successfulRequests.map(r => r.responseTime);
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const minResponseTime = Math.min(...responseTimes);
      const maxResponseTime = Math.max(...responseTimes);
      
      console.log(`✅ 성공한 요청: ${successfulRequests.length}`);
      console.log(`❌ 실패한 요청: ${failedRequests.length}`);
      console.log(`⏱️  평균 응답 시간: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`🚀 최소 응답 시간: ${minResponseTime}ms`);
      console.log(`🐌 최대 응답 시간: ${maxResponseTime}ms`);
      
      // 성능 등급 평가
      let grade = 'A';
      if (avgResponseTime > 500) grade = 'D';
      else if (avgResponseTime > 300) grade = 'C';
      else if (avgResponseTime > 150) grade = 'B';
      
      console.log(`🏆 성능 등급: ${grade}`);
      
      // 개선 권장사항
      console.log('\n💡 개선 권장사항:');
      if (avgResponseTime > 200) {
        console.log('- API 응답 시간 최적화 필요 (목표: 200ms 이하)');
      }
      if (failedRequests.length > 0) {
        console.log('- 에러 처리 및 안정성 개선 필요');
      }
      if (maxResponseTime > 1000) {
        console.log('- 최대 응답 시간 개선 필요 (목표: 1초 이하)');
      }
    }
    
    return {
      totalRequests: this.results.length,
      successfulRequests: successfulRequests.length,
      failedRequests: failedRequests.length,
      avgResponseTime: successfulRequests.length > 0 ? 
        successfulRequests.reduce((sum, r) => sum + r.responseTime, 0) / successfulRequests.length : 0,
      results: this.results
    };
  }
}

// 테스트 실행
async function runTests() {
  const tester = new PerformanceTest();
  
  try {
    // 기본 API 테스트
    await tester.runBasicTests();
    
    // 로드 테스트
    await tester.runLoadTest('/health', 5, 20);
    await tester.runLoadTest('/api/health/dashboard', 3, 15);
    
    // 결과 리포트
    const report = tester.generateReport();
    
    // 결과를 파일로 저장
    const fs = require('fs');
    fs.writeFileSync('performance-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 상세 결과가 performance-report.json에 저장되었습니다.');
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error.message);
  }
}

// 스크립트가 직접 실행될 때만 테스트 실행
if (require.main === module) {
  runTests();
}

module.exports = PerformanceTest;