# 달레 스터디 AI 챗봇 프로젝트 계획

## 🎯 프로젝트 목표

- LLMU 과정 학습 내용 실습 (Text Generation, RAG, Tool)
- 달레 스터디 커뮤니티 정보 제공 챗봇 구축
- chat.dalestudy.com 서브도메인 배포

## 🏗️ 기술 스택

- **Frontend**: React.js + TypeScript
- **Backend**: Node.js + Express
- **LLM API**: OpenAI GPT-4 또는 Anthropic Claude
- **검색 방식**: 키워드 기반 또는 In-memory 임베딩 매칭
- **데이터 저장**: JSON 파일 또는 간단한 SQLite
- **배포**: Vercel (Frontend) + Railway/Render (Backend)

## 📅 4주 개발 일정

### 1주차 (8/1) - 기반 구조 및 간단한 검색 시스템

**목표**: 프로젝트 셋업 & Fuse.js 기반 검색 구현

#### 🏗️ Day 1-2: 프로젝트 구조 생성

- [x] **프론트엔드**: React + TypeScript + Vite 프로젝트 생성
  - 기본 컴포넌트 구조 (App, ChatInterface, MessageList)
  - Tailwind CSS 또는 styled-components 설정
  - 환경변수 설정 (.env.example 포함)
- [x] **백엔드**: Node.js + Express + TypeScript 프로젝트 생성
  - 기본 라우터 구조 (/api/chat, /api/search)
  - CORS, dotenv, 기본 미들웨어 설정
  - 타입 정의 파일 생성 (types/index.ts)

#### 📊 Day 2-3: 데이터 구조 및 샘플 데이터

- [x] **데이터 스키마 정의**: TypeScript 인터페이스 작성
  ```typescript
  interface StudyProject { id, title, description, status, participants, etc. }
  interface FAQ { question, answer, keywords, tags }
  ```
- [x] **샘플 데이터 생성**: study-projects.json (최소 5개 프로젝트, 10개 FAQ)
- [x] **데이터 로더**: JSON 파일을 읽고 타입 검증하는 유틸리티

#### 🔍 Day 3-4: 검색 시스템 구현

- [x] **Fuse.js 설치 및 설정**: 가중치, threshold 등 옵션 튜닝
- [x] **검색 함수 구현**:
  - `searchProjects(query: string)`: 프로젝트 검색
  - `searchFAQs(query: string)`: FAQ 검색
  - `searchByCategory(query: string, category: string)`: 카테고리별 검색
- [x] **태그 시스템**: 태그별 필터링 및 분류 로직

#### 🤖 Day 4-5: LLM API 연동

- [x] **OpenAI API 연동**:
  - API 키 설정 및 클라이언트 초기화
  - 기본 채팅 완성 함수 구현
  - 에러 핸들링 (rate limit, API 에러 등)
- [x] **프롬프트 템플릿**:
  - 커뮤니티 관련 질문 판별용 프롬프트
  - 답변 생성용 프롬프트 (검색 결과 포함)

#### 🔗 Day 5-6: 통합 및 테스트

- [ ] **API 엔드포인트 완성**:
  - POST /api/chat - 사용자 질문 처리
  - GET /api/search - 검색 테스트용
- [ ] **프론트엔드 연동**:
  - [x] 채팅 인터페이스 기본 UI
  - API 호출 및 응답 처리
- [ ] **로컬 테스트**: 전체 플로우 동작 확인

#### 📋 Day 6-7: 문서화 및 배포 준비

- [ ] **README.md 작성**:
  - 프로젝트 설명, 설치 방법, 실행 방법
  - API 엔드포인트 문서
- [ ] **배포 설정**:
  - Vercel 설정 파일 (vercel.json)
  - Railway/Render 설정 파일
  - 환경변수 가이드

### 2주차 (8/8) - 챗봇 핵심 로직 및 스마트 매칭

**목표**: 챗봇 대화 엔진 및 필터링

- [ ] 질문 분류 시스템 (커뮤니티 관련 여부 판단)
- [ ] 키워드 추출 및 스마트 매칭 알고리즘
- [ ] 컨텍스트 관리 (대화 히스토리)
- [ ] 응답 거부 로직 구현
- [ ] 기본 UI 컴포넌트 구현

### 3주차 (8/15) - Tool 기능 및 UI/UX

**목표**: Tool 사용 기능 및 사용자 인터페이스

- [ ] Tool 호출 기능 구현 (예: 스터디 일정 조회, 프로젝트 상태 확인)
- [ ] 채팅 UI 완성 (메시지 기록, 타이핑 효과)
- [ ] 반응형 디자인 적용
- [ ] 에러 핸들링 및 로딩 상태
- [ ] 메인 사이트 챗 버튼 통합

### 4주차 (8/22) - 최종 통합 및 배포

**목표**: 배포 및 최종 테스트

- [ ] 프로덕션 환경 설정
- [ ] chat.dalestudy.com 서브도메인 배포
- [ ] 성능 최적화 (응답 속도, 캐싱)
- [ ] 최종 테스트 및 버그 수정
- [ ] 사용량 모니터링 설정

## 🗂️ 데이터 구조 예시

```javascript
// study-projects.json
{
  "projects": [
    {
      "id": "project-1",
      "title": "오픈소스 기여 프로젝트",
      "description": "인기 오픈소스 프로젝트에 실제 기여하는 스터디",
      "status": "진행중",
      "participants": 8,
      "duration": "3개월",
      "tech_stack": ["JavaScript", "TypeScript", "React"],
      "meeting_schedule": "매주 토요일 오후 2시",
      "keywords": ["오픈소스", "기여", "깃허브", "협업", "코드리뷰"],
      "tags": ["project", "active", "javascript"]
    }
  ],
  "faqs": [
    {
      "question": "달레 스터디 참여 방법",
      "answer": "웹사이트에서 관심 있는 스터디를 선택하고 신청서를 작성하면 됩니다.",
      "keywords": ["참여", "신청", "방법", "가입"],
      "tags": ["faq", "participation"]
    }
  ]
}
```

## 🤖 챗봇 대화 플로우

```
사용자 질문 → 질문 분류 → [커뮤니티 관련?]
                              ↓ Yes
                          키워드 추출 → 데이터 매칭 → 관련 정보 추출 → LLM 응답 생성
                              ↓ No
                          정중한 거부 응답
```

## 🛠️ 핵심 구현 포인트

### Fuse.js 기반 검색 시스템

```javascript
import Fuse from "fuse.js";

// Fuse.js 설정
const fuseOptions = {
  keys: [
    { name: "title", weight: 0.4 },
    { name: "keywords", weight: 0.3 },
    { name: "description", weight: 0.2 },
    { name: "tech_stack", weight: 0.1 },
  ],
  threshold: 0.4, // 0.0 (완전 일치) ~ 1.0 (모든 것 매칭)
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
};

function searchRelevantData(query, studyData) {
  const fuse = new Fuse(studyData, fuseOptions);
  const results = fuse.search(query);

  return results
    .filter((result) => result.score < 0.6) // 관련성 필터
    .map((result) => ({
      item: result.item,
      score: result.score,
      matches: result.matches, // 어떤 부분이 매칭됐는지 확인 가능
    }));
}
```

### 카테고리별 검색 최적화

```javascript
function searchByCategory(query, studyData) {
  // 먼저 카테고리로 필터링
  const category = detectCategory(query);
  let filteredData = studyData;

  if (category !== "general") {
    filteredData = studyData.filter((item) => item.tags.includes(category));
  }

  // 필터링된 데이터에서 Fuse.js 검색
  const fuse = new Fuse(filteredData, fuseOptions);
  return fuse.search(query);
}

function detectCategory(query) {
  const categoryKeywords = {
    project: ["프로젝트", "과제", "project"],
    study: ["스터디", "공부", "study", "학습"],
    schedule: ["일정", "시간", "언제", "when", "schedule"],
    participation: ["참여", "신청", "가입", "join", "apply"],
  };

  const queryLower = query.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => queryLower.includes(keyword))) {
      return category;
    }
  }
  return "general";
}
```

### 질문 필터링

```javascript
// 커뮤니티 관련 질문인지 판단
const isRelevantQuery = async (query) => {
  const prompt = `
  다음 질문이 달레 스터디 커뮤니티와 관련이 있는지 판단해주세요.
  관련 주제: 프로그래밍 스터디, 오픈소스 프로젝트, 개발 학습, 커뮤니티 활동
  
  질문: ${query}
  
  답변: YES 또는 NO
  `;

  const response = await llm.complete(prompt);
  return response.includes("YES");
};
```

## 📊 성공 지표

- [ ] 커뮤니티 관련 질문에 정확한 답변 제공 (80% 이상)
- [ ] 관련 없는 질문 필터링 (90% 이상)
- [ ] 응답 시간 3초 이내
- [ ] 모바일 친화적 UI/UX

## 🚀 향후 확장 가능성

- 실시간 스터디 현황 연동 (Database Tool)
- 슬랙/디스코드 봇 연동
- 음성 인터페이스 추가
- 다국어 지원 (영어)

## 💡 Mob Programming 팁

- 각 세션마다 Driver 역할 로테이션
- 기능별로 작업 분담 (Frontend/Backend/Data)
- 매 세션 시작 전 이전 주 회고 및 이번 주 목표 설정
- AI Agent 활용으로 보일러플레이트 코드 빠른 생성
