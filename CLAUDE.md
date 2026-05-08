# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**송가네 미션 앱** - 가족 4명(부모 2 + 자녀 2)을 위한 과제 사진 제출 PWA

- 인증 없음 - 가족 구성원 선택 방식
- 자녀: 송현준(아들), 송민주(딸)
- 부모: 아빠, 엄마

## 기술 스택

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Zustand
- **Backend**: Firebase (Firestore + Storage) - 인증 불필요
- **배포**: Firebase Hosting
- **테스트**: Playwright
- **UI 스타일**: 듀오링고 스타일 (`front.jsx` 참조 필수)

## 개발 명령어

```bash
npm run dev          # 개발 서버 (localhost:3000)
npm run build        # 프로덕션 빌드
npm run lint         # ESLint 실행
firebase deploy      # Firebase 배포

# Playwright 테스트 (tests/ 폴더)
npx playwright test                      # 모든 테스트 실행
npx playwright test tests/app.spec.ts    # 특정 파일만 실행
npx playwright test --headed             # 브라우저 표시하며 실행
npx playwright test --ui                 # UI 모드로 실행
```

## 프로젝트 구조

```
src/
├── app/                        # Next.js App Router
│   ├── page.tsx                # 스플래시 → /select로 리다이렉트
│   ├── select/page.tsx         # 가족 선택 화면
│   ├── child/                  # 자녀 화면
│   │   ├── page.tsx            # 자녀 홈 (미션 목록)
│   │   ├── camera/             # 카메라 촬영
│   │   ├── calendar/           # 달력 (제출 기록)
│   │   └── success/            # 제출 완료
│   └── parent/                 # 부모 화면
│       ├── page.tsx            # 대시보드
│       ├── child/[id]/         # 자녀 상세 (동적 라우트)
│       ├── review/             # 제출물 확인/승인/반려
│       └── assignments/        # 미션 관리
├── components/
│   ├── ui/                     # 공통 UI 컴포넌트
│   │   ├── DuoButton.tsx       # 3D 효과 버튼
│   │   ├── CharacterBubble.tsx # 캐릭터 말풍선
│   │   ├── ProgressBar.tsx     # 진행률 바
│   │   ├── TopHeader.tsx       # 상단 헤더 (스트릭, 젬)
│   │   └── ProfileAvatar.tsx   # 프로필 아바타
│   └── modals/                 # 모달 컴포넌트
│       ├── ImageViewerModal.tsx
│       └── GemAdjustModal.tsx
├── lib/
│   ├── firebase.ts             # Firebase 초기화
│   ├── firestore.ts            # Firestore 쿼리 함수 (CRUD + 스트릭 + 젬)
│   └── imageUtils.ts           # 이미지 압축 유틸
├── stores/
│   └── userStore.ts            # Zustand 상태 (현재 사용자, persist)
└── types/
    └── index.ts                # 타입 정의 + FAMILY_MEMBERS 상수
tests/                          # Playwright 테스트
    ├── app.spec.ts
    ├── navigation.spec.ts
    └── bulk-approve.spec.ts
```

## 디자인 규칙

**`front.jsx` 와이어프레임을 충실히 따를 것**

- 컬러: primary `#58CC02`, secondary `#1CB0F6`, streak `#FF9600`, background `#235390`
- 버튼: 3D 효과 (box-shadow + 눌림 translateY), border-radius 16px
- 폰트: Nunito + Noto Sans KR, font-weight 800
- 애니메이션: framer-motion 사용

## Firestore 스키마

```
assignments/{id}                    # 미션 목록
  - childId: string                 # 대상 자녀 ID
  - title, description: string
  - gems: number                    # 완료 시 보상 젬
  - isActive: boolean
  - createdAt, updatedAt: Timestamp

submissions/{YYYY-MM-DD_childId_assignmentId}   # 제출 기록
  - assignmentId, childId: string
  - photoUrl: string
  - status: "pending" | "approved" | "rejected"
  - gemsEarned: number              # 획득한 젬 (제출 시 즉시 적립)
  - rejectReason?: string
  - submittedAt, reviewedAt?: Timestamp
  - reviewedBy?: string

stats/{childId}                     # 자녀 통계
  - currentStreak, longestStreak: number
  - totalSubmissions: number
  - totalGems: number               # 누적 젬
  - lastSubmissionDate?: Timestamp
```

## 핵심 로직 (src/lib/firestore.ts)

### 스트릭 계산
- 어제 제출 + 오늘 첫 제출 → streak + 1 (연속)
- 2일 이상 미제출 후 제출 → streak = 1 (리셋)
- 같은 날 중복 제출 → streak 유지

### 젬 시스템
- 제출 시 즉시 젬 적립 (승인 대기와 무관)
- `addGems()` / `subtractGems()` / `setGems()` - 젬 관리

### 주요 함수
- `getActiveAssignments(childId)` - 활성 미션 목록
- `submitAssignment(childId, assignmentId, photoFile)` - 사진 업로드 + 제출 + 젬 적립
- `getTodaySubmissions(childId)` - 오늘 제출한 미션들
- `getTodayCompletedAssignmentIds(childId)` - 오늘 완료한 미션 ID 목록
- `getPendingSubmissionsWithAssignments()` - 부모 리뷰용 대기 목록
- `approveSubmission()` / `rejectSubmission()` - 승인/반려
- `getSubmissionsWithAssignments(childId, year, month)` - 월별 제출 + 미션 정보

## 가족 데이터 (src/types/index.ts)

```typescript
export const FAMILY_MEMBERS: Record<string, FamilyMember> = {
  son: { id: 'son', name: '송현준', role: 'child', avatar: '👦', profileImage: '/profiles/son.png' },
  daughter: { id: 'daughter', name: '송민주', role: 'child', avatar: '👧', profileImage: '/profiles/daughter.png' },
  dad: { id: 'dad', name: '아빠', role: 'parent', avatar: '👨', profileImage: '/profiles/dad.png' },
  mom: { id: 'mom', name: '엄마', role: 'parent', avatar: '👩', profileImage: '/profiles/mom.png' },
};
```

## 상태 관리 (src/stores/userStore.ts)

Zustand + persist 미들웨어로 현재 사용자 상태 관리:
- `currentUser` - 선택된 가족 구성원
- `setCurrentUser(userId)` - 사용자 선택
- `isChild()` / `isParent()` - 역할 확인

## 참조 문서

- `front.jsx` - 와이어프레임 (디자인 기준, 반드시 참조)
- `ux.md` - UX 기획안
- `PRD.md` - 제품 요구사항
- `tech-stack.md` - 기술 스택 상세
- `system-design.md` - 시스템 설계
