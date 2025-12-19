# 대화 기록

## 2025-12-19 세션

### 작업 1: 폴더 분석
- 분석한 파일:
  - `ux.md` - UX 기획안 (학생 반복 과제 사진 제출 앱)
  - `front.jsx` - 듀오링고 스타일 React 와이어프레임
- 프로젝트 개요 파악 완료

### 작업 2: 기술 스택 추천
- 사용자 조건 확인:
  - 플랫폼: 웹앱 (PWA)
  - 백엔드: Firebase
  - 경험: 중급 이상
  - 목적: 학습/포트폴리오
- 추천 스택:
  - Frontend: Next.js 14 + TypeScript + Tailwind CSS + Zustand
  - Backend: Firebase (Firestore + Storage)
  - PWA: next-pwa + Service Worker

### 작업 3: 기술 스택 문서 생성
- 생성 파일: `tech-stack.md`
- 포함 내용:
  - 기술 스택 요약
  - Frontend/Backend 상세
  - Firestore 스키마
  - 프로젝트 구조
  - 개발 환경 설정
  - 개발 순서 (10단계)
  - 디자인 시스템

### 작업 4: 가족 전용 앱으로 변경
- 사용자 요청: "인증 불필요, 가족 4명만 사용"
- 수정한 파일: `tech-stack.md`
- 변경 내용:
  - Firebase Auth 제거
  - 가족 선택 화면 ("누구세요?") 추가
  - Firestore 스키마 간소화 (family/members)
  - 프로젝트 구조 변경 (child/[id], parent)
  - 사용자 전환 방식 섹션 신규 추가
  - Zustand persist로 localStorage 저장
- 버전: v1.0 → v1.1

### 작업 5: 시스템 설계 문서 생성 (system-design.md)
- 생성 파일: `system-design.md`
- 포함 내용:
  - 자동화 vs 수동 처리 경계 정의
  - 화면별 데이터 구조 상세
  - 데이터 흐름도 (제출, 반려)
  - Firestore 스키마 최종본
  - 스트릭 로직 상세
  - 유지보수 가이드
  - 에러 처리 전략
- 핵심 원칙: 1인 개발/유지보수를 위한 자동화 최대화

### 작업 6: PRD 문서 생성 (PRD.md)
- 생성 파일: `PRD.md`
- 포함 내용:
  - 제품 개요 및 핵심 가치 제안
  - 목표 및 성공 지표 (KPI)
  - 사용자 정의 및 시나리오
  - 기능 요구사항 (P0/P1/P2 우선순위)
  - 화면별 상세 요구사항 (와이어프레임 포함)
  - 비기능 요구사항 (성능, 사용성, 보안)
  - 데이터 요구사항 (모델, 보존 정책)
  - 제약사항 및 가정
  - 릴리스 계획 (MVP → v1.1 → v2.0)
- 기능 목록: 공통 3개, 자녀 12개, 부모 10개

---

## 현재 폴더 구조
```
homework/
├── front.jsx           # 와이어프레임
├── ux.md               # UX 기획안
├── tech-stack.md       # 기술 스택 문서 (v1.1)
├── system-design.md    # 시스템 설계 문서
├── PRD.md              # 제품 요구사항 문서
└── conversation/
    └── current-session.md  # 대화 기록
```
