# Fly.io 배포 가이드

## 배포 전 준비사항

1. Fly.io CLI 설치 및 로그인
```bash
# Fly.io CLI 설치 (macOS)
brew install flyctl

# 로그인
fly auth login
```

2. 앱 생성 및 배포
```bash
# 백엔드 디렉토리로 이동
cd backend

# Fly.io 앱 생성 (fly.toml이 이미 있으므로 스킵 가능)
# fly launch --no-deploy

# 환경변수 설정
fly secrets set OPENAI_API_KEY="your-openai-api-key"
fly secrets set FRONTEND_URL="https://your-frontend-url.com"

# 배포
fly deploy
```

## 환경변수 설정

배포 후 다음 환경변수들을 설정해야 합니다:

- `OPENAI_API_KEY`: OpenAI API 키
- `FRONTEND_URL`: 프론트엔드 도메인 (CORS 설정용)

```bash
fly secrets set OPENAI_API_KEY="sk-..."
fly secrets set FRONTEND_URL="https://your-domain.com"
```

## 확인사항

- Health check: `https://your-app.fly.dev/health`
- API 엔드포인트: `https://your-app.fly.dev/api/chat`

## 로그 확인

```bash
fly logs
```

## 스케일링

```bash
# 최소 인스턴스 수 설정
fly scale count 1

# 메모리 조정
fly scale memory 512
```
