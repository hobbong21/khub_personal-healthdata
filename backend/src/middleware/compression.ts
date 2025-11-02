import compression from 'compression';
import { Request, Response, NextFunction } from 'express';

// 압축 설정 최적화
export const compressionMiddleware = compression({
  // 압축 레벨 설정 (1-9, 6이 기본값)
  level: 6,
  
  // 압축 임계값 (바이트 단위)
  threshold: 1024,
  
  // 압축할 MIME 타입 필터
  filter: (req: Request, res: Response) => {
    // 이미 압축된 응답은 제외
    if (res.getHeader('Content-Encoding')) {
      return false;
    }
    
    // 특정 경로는 압축 제외 (예: 파일 다운로드)
    if (req.path.includes('/download') || req.path.includes('/stream')) {
      return false;
    }
    
    // 기본 압축 필터 사용
    return compression.filter(req, res);
  },
  
  // 압축 품질 설정
  windowBits: 15,
  memLevel: 8,
  
  // 청크 크기 설정
  chunkSize: 16 * 1024 // 16KB
});

// Brotli 압축 미들웨어 (더 높은 압축률)
export const brotliMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  // 클라이언트가 Brotli를 지원하는 경우
  if (acceptEncoding.includes('br')) {
    res.setHeader('Content-Encoding', 'br');
    res.setHeader('Vary', 'Accept-Encoding');
  }
  
  next();
};

// 응답 크기 모니터링
export const responseSizeMonitor = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(data: any) {
    const size = Buffer.byteLength(data, 'utf8');
    
    // 큰 응답에 대한 경고
    if (size > 1024 * 1024) { // 1MB 이상
      console.warn(`⚠️ 큰 응답 크기: ${req.method} ${req.path} - ${(size / 1024 / 1024).toFixed(2)}MB`);
    }
    
    // 개발 환경에서 응답 크기 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 응답 크기: ${req.method} ${req.path} - ${(size / 1024).toFixed(2)}KB`);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};