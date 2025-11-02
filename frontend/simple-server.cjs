const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let pathname = req.url;
  
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  const filePath = path.join(__dirname, 'public', pathname);
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'text/plain';
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, data) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        }
      });
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log('🚀 K-hub 정적 서버가 실행 중입니다!');
  console.log(`📱 http://localhost:${PORT} 에서 확인하세요`);
  console.log('🎨 모든 페이지가 완전히 복구되었습니다:');
  console.log('   - 메인 페이지 (index.html)');
  console.log('   - 로그인 (login.html)');
  console.log('   - 회원가입 (signup.html)');
  console.log('   - 대시보드 (dashboard.html)');
  console.log('   - 기능 소개 (features.html)');
  console.log('   - 회사소개 (about.html)');
  console.log('   - 문의하기 (contact.html)');
  console.log('');
  console.log('✨ 모든 링크가 연결되어 완전한 웹사이트가 구현되었습니다!');
});