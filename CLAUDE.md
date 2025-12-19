# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**송가네 과제 앱** - 가족 4명(부모 2 + 자녀 2)을 위한 과제 사진 제출 PWA

- 인증 없음 - 가족 구성원 선택 방식
- 자녀: 송현준(아들), 송민주(딸)
- 부모: 아빠, 엄마

## 기술 스택

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Zustand
- **Backend**: Firebase (Firestore + Storage) - 인증 불필요
- **배포**: Firebase Hosting
- **UI 스타일**: 듀오링고 스타일 (`front.jsx` 참조 필수)

## 개발 명령어

```bash
# 개발 서버
npm run dev

# 빌드
npm run build

# Firebase 배포
firebase deploy
```

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # 가족 선택 화면
│   ├── child/[id]/         # 자녀 화면 (son/daughter)
│   │   ├── page.tsx        # 자녀 홈
│   │   ├── task/           # 과제 상세
│   │   ├── camera/         # 카메라 촬영
│   │   └── calendar/       # 달력
│   └── parent/             # 부모 화면
│       ├── page.tsx        # 대시보드
│       ├── review/         # 제출물 확인
│       └── assign/         # 과제 등록
├── components/
│   ├── ui/                 # 공통 UI (DuoButton, Card 등)
│   └── features/           # 기능별 컴포넌트
├── lib/
│   ├── firebase.ts         # Firebase 초기화
│   └── streak.ts           # 스트릭 계산 로직
├── stores/
│   └── familyStore.ts      # Zustand 상태 (현재 사용자)
└── data/
    └── family.ts           # 가족 구성원 하드코딩
```

## 디자인 규칙

**`front.jsx` 와이어프레임을 충실히 따를 것**

- 컬러: primary `#58CC02`, secondary `#1CB0F6`, streak `#FF9600`, background `#235390`
- 버튼: 3D 효과 (box-shadow + 눌림 translateY), border-radius 16px
- 폰트: Nunito + Noto Sans KR, font-weight 800
- 애니메이션: framer-motion 사용

## Firestore 스키마

```
assignments/{id}          # 과제 목록
  - title, description, subject
  - targetChild: "son" | "daughter" | "both"
  - isActive: boolean

submissions/{YYYY-MM-DD_childId}   # 제출 기록
  - status: "submitted" | "approved" | "rejected"
  - rejectReason?: "blurry" | "wrong" | "resubmit"
  - photoUrl, submittedAt

streaks/{childId}         # 스트릭 정보
  - current, longest, lastSubmitDate
```

## 핵심 로직

### 스트릭 계산
- 오늘 첫 제출 → streak + 1
- 2일 이상 미제출 후 제출 → streak = 1 (리셋)
- 반려 시 → streak 유지 (감소 안 함)

### 자동화 영역
- 제출 시: 상태 변경, 시간 기록, 이미지 압축, 스트릭 업데이트
- 과제 등록 시: 기존 과제 자동 비활성화

## 가족 데이터

```typescript
// src/data/family.ts
export const FAMILY_MEMBERS = {
  son: { id: 'son', name: '송현준', role: 'child', avatar: '👦' },
  daughter: { id: 'daughter', name: '송민주', role: 'child', avatar: '👧' },
  dad: { id: 'dad', name: '아빠', role: 'parent', avatar: '👨' },
  mom: { id: 'mom', name: '엄마', role: 'parent', avatar: '👩' },
};
```

## 참조 문서

- `ux.md` - UX 기획안
- `front.jsx` - 와이어프레임 (디자인 기준)
- `tech-stack.md` - 기술 스택 상세
- `system-design.md` - 시스템 설계
- `PRD.md` - 제품 요구사항
