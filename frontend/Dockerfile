# 프론트엔드 Dockerfile
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production

# 소스 코드 복사
COPY . .

# 빌드 (Vite 사용)
RUN npm run build

# Nginx를 사용한 프로덕션 이미지
FROM nginx:alpine

# 빌드된 파일을 Nginx로 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# 정적 파일들도 복사 (public 폴더의 HTML 파일들)
COPY --from=builder /app/public /usr/share/nginx/html

# Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/nginx.conf

# 포트 노출
EXPOSE 80

# Nginx 시작
CMD ["nginx", "-g", "daemon off;"]