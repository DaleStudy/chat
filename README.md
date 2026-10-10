# 달레 스터디 AI 챗봇

달레 스터디 커뮤니티를 위한 AI 챗봇 서비스입니다.

## 🏗️ 프로젝트 구조

```
dalestudy-chatbot/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Cloudflare Worker (API + 프론트엔드 정적 파일 서빙)
├── data/             # JSON 데이터 파일
├── PLAN.md           # 프로젝트 계획서
└── README.md         # 이 파일
```

## 🚀 빠른 시작

### Prerequisites
- Node.js 22+
- AI Gateway 토큰 (`backend/.dev.vars`에 `AI_GATEWAY_TOKEN=...`)

### 1. 백엔드 (Worker) 실행
```bash
cd backend
npm install
npm run dev
```

`wrangler dev`가 프론트엔드를 빌드한 뒤 http://localhost:8787 에서 API와 화면을 함께 서빙합니다.

### 2. 프론트엔드 개발 서버 (선택)
```bash
cd frontend
npm install
npm run dev
```

http://localhost:3000 에서 실행되고, `/api` 요청은 8787 포트의 Worker로 프록시됩니다.

## 📁 주요 파일

### Frontend
- `src/components/ChatInterface.tsx` - 메인 채팅 인터페이스
- `src/components/MessageList.tsx` - 메시지 리스트 컴포넌트
- `src/components/ChatInput.tsx` - 메시지 입력 컴포넌트
- `src/api/index.ts` - API 호출 함수들
- `src/types/index.ts` - TypeScript 타입 정의

### Backend
- `src/index.ts` - Worker 진입점 (`/health`, `/api/chat`, `/api/search`)
- `src/chat.ts` - 채팅 처리 (질문 분류 → 검색 → 답변 생성)
- `src/services/llmService.ts` - AI Gateway 경유 OpenAI 호출
- `src/services/searchService.ts` - Fuse.js 검색 서비스
- `src/utils/dataLoader.ts` - JSON 데이터 로더
- `src/types/index.ts` - TypeScript 타입 정의

### Data
- `data/study-projects.json` - 스터디 프로젝트 및 FAQ 데이터

## 🔧 개발 명령어

### Backend
```bash
npm run dev        # 로컬 Worker 실행 (wrangler dev)
npm run deploy     # Cloudflare에 배포 (wrangler deploy)
npm run typecheck  # 타입 체크
npm run lint       # ESLint 실행
```

### Frontend  
```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run preview  # 빌드된 파일 미리보기
npm run lint     # ESLint 실행
```

## 🌐 API 엔드포인트

### POST /api/chat
사용자 메시지를 처리하고 AI 응답을 반환합니다.

**Request:**
```json
{
  "message": "달레 스터디에 어떻게 참여하나요?"
}
```

**Response:**
```json
{
  "message": "웹사이트에서 관심 있는 스터디를 선택하고...",
  "sources": [...]
}
```

### GET /api/search
키워드로 스터디 정보를 검색합니다.

**Request:**
```
GET /api/search?q=React 스터디
```

**Response:**
```json
{
  "query": "React 스터디",
  "category": "study", 
  "results": [...]
}
```

## 🚢 배포

`chat.dalestudy.com`은 Cloudflare `dalestudy` 계정의 Worker `chat`으로 배포됩니다. `backend/`에서 `npm run deploy`를 실행하면 프론트엔드 빌드까지 함께 진행됩니다. OpenAI 호출은 AI Gateway를 거치며, Worker secret `AI_GATEWAY_TOKEN`이 필요합니다.

## 📝 라이센스

MIT License
