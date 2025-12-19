# 기술 스택 문서

## 학생 반복 과제 사진 제출 앱

> 작성일: 2025-12-19
> 버전: v1.1 (가족 전용 앱)

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | 가족용 과제 사진 제출 앱 |
| 플랫폼 | 웹앱 (PWA) |
| 대상 사용자 | 가족 4명 (부모 2명 + 자녀 2명) |
| 주요 기능 | 과제 사진 제출, 달력 기록, 연속 제출 스트릭 |
| 특이사항 | **인증 불필요** - 가족 전용 앱, 간단한 사용자 전환 방식 |

---

## 2. 기술 스택 요약

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                           │
│  Next.js 14 + TypeScript + Tailwind CSS + Zustand       │
├─────────────────────────────────────────────────────────┤
│                      Backend                            │
│  Firebase (Firestore + Storage) - 인증 불필요           │
├─────────────────────────────────────────────────────────┤
│                        PWA                              │
│  next-pwa + Service Worker                              │
└─────────────────────────────────────────────────────────┘

👨‍👩‍👧‍👦 가족 4명 전용 앱 - 간단한 사용자 전환 방식
```

---

## 3. Frontend 상세

### 3.1 핵심 기술

| 기술 | 버전 | 선택 이유 |
|------|------|----------|
| **Next.js** | 14.x (App Router) | SSR/SSG 지원, 이미지 최적화, PWA 설정 용이 |
| **TypeScript** | 5.x | 타입 안전성, 코드 품질 향상, 포트폴리오 가치 |
| **Tailwind CSS** | 3.x | 빠른 스타일링, 듀오링고 스타일 커스텀 용이 |
| **Zustand** | 4.x | 간결한 전역 상태 관리, Redux 대비 낮은 러닝커브 |

### 3.2 UI 라이브러리

| 라이브러리 | 용도 |
|------------|------|
| **shadcn/ui** | 기본 UI 컴포넌트 (Button, Card, Dialog 등) |
| **framer-motion** | 듀오링고 스타일 애니메이션, 전환 효과 |
| **react-hot-toast** | 알림 토스트 메시지 |

### 3.3 기능별 라이브러리

| 라이브러리 | 용도 | 비고 |
|------------|------|------|
| **react-webcam** | 카메라 촬영 | 과제 사진 촬영 기능 |
| **date-fns** | 날짜 처리 | 달력, 스트릭 계산 |
| **react-calendar** | 달력 컴포넌트 | 제출 현황 표시 |
| **browser-image-compression** | 이미지 압축 | 업로드 전 용량 최적화 |

---

## 4. Backend 상세 (Firebase)

### 4.1 사용 서비스

| 서비스 | 용도 | 설명 |
|--------|------|------|
| ~~Authentication~~ | ~~사용자 인증~~ | **불필요** - 가족 전용 앱 |
| **Firestore** | 데이터베이스 | 과제, 제출 기록, 가족 구성원 정보 |
| **Storage** | 파일 저장소 | 과제 사진 업로드 |

> **참고**: 가족 4명만 사용하므로 복잡한 인증 없이 **간단한 사용자 전환**으로 구현

### 4.2 Firestore 데이터 스키마 (가족용 간소화)

```
family/
  └── members/
        ├── son/                    # 아들
        │     ├── name: "아들 이름"
        │     ├── role: "student"
        │     ├── streak: number
        │     └── avatar: "👦"
        ├── daughter/               # 딸
        │     ├── name: "딸 이름"
        │     ├── role: "student"
        │     ├── streak: number
        │     └── avatar: "👧"
        ├── dad/                    # 아빠
        │     ├── name: "아빠"
        │     ├── role: "parent"
        │     └── avatar: "👨"
        └── mom/                    # 엄마
              ├── name: "엄마"
              ├── role: "parent"
              └── avatar: "👩"

assignments/
  └── {assignmentId}/
        ├── title: string
        ├── description: string
        ├── subject: string (예: "수학", "국어")
        ├── targetChild: "son" | "daughter" | "both"
        ├── isActive: boolean
        └── createdAt: timestamp

submissions/
  └── {date_childId}/              # 예: "2025-12-19_son"
        ├── assignmentId: string
        ├── childId: "son" | "daughter"
        ├── photoUrl: string
        ├── status: "submitted" | "approved" | "rejected"
        ├── rejectReason?: "blurry" | "wrong" | "resubmit"
        ├── submittedAt: timestamp
        └── reviewedAt?: timestamp
```

> **간소화 포인트**:
> - 고정된 4명의 가족 구성원 (하드코딩 가능)
> - classes 컬렉션 불필요
> - 날짜+자녀ID로 간단한 문서 관리

### 4.3 Storage 구조

```
submissions/
  └── {classId}/
        └── {assignmentId}/
              └── {studentId}/
                    └── {timestamp}.jpg
```

---

## 5. PWA 설정

### 5.1 사용 기술

| 기술 | 용도 |
|------|------|
| **next-pwa** | Next.js PWA 플러그인 |
| **Service Worker** | 오프라인 캐싱, 백그라운드 동기화 |
| **Web App Manifest** | 앱 아이콘, 시작 화면 설정 |
| **Web Push API** | 푸시 알림 (반려, 미제출 알림) |

### 5.2 PWA 기능

- 홈 화면 추가 (Add to Home Screen)
- 오프라인 기본 페이지 제공
- 앱 아이콘 및 스플래시 화면
- 푸시 알림 (선택 사항)

---

## 6. 프로젝트 구조

```
homework-app/
├── public/
│   ├── icons/                 # PWA 아이콘
│   └── manifest.json          # PWA 매니페스트
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── page.tsx           # 🏠 가족 선택 화면 (누구세요?)
│   │   ├── child/             # 👶 자녀(학생) 화면
│   │   │   ├── [id]/          # [son/daughter]
│   │   │   │   ├── page.tsx   # 자녀 홈
│   │   │   │   ├── task/      # 과제 상세
│   │   │   │   ├── camera/    # 카메라 촬영
│   │   │   │   └── calendar/  # 달력
│   │   ├── parent/            # 👨‍👩‍👧‍👦 부모 화면
│   │   │   ├── page.tsx       # 대시보드
│   │   │   ├── review/        # 제출물 확인
│   │   │   └── assign/        # 과제 등록
│   │   ├── layout.tsx         # 루트 레이아웃
│   │   └── globals.css        # 전역 스타일
│   ├── components/
│   │   ├── ui/                # 공통 UI 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── ...
│   │   └── features/          # 기능별 컴포넌트
│   │       ├── StreakCard.tsx
│   │       ├── TaskCard.tsx
│   │       ├── FamilySelector.tsx  # 가족 선택 컴포넌트
│   │       └── ...
│   ├── lib/
│   │   ├── firebase.ts        # Firebase 초기화
│   │   └── utils.ts           # 공통 유틸리티
│   ├── hooks/
│   │   └── useSubmissions.ts  # 제출 데이터 훅
│   ├── stores/
│   │   └── familyStore.ts     # Zustand - 현재 사용자 상태
│   ├── types/
│   │   └── index.ts           # TypeScript 타입 정의
│   └── data/
│       └── family.ts          # 가족 구성원 하드코딩 데이터
├── .env.local                 # 환경 변수 (Firebase 설정)
├── next.config.js             # Next.js 설정
├── tailwind.config.js         # Tailwind 설정
├── tsconfig.json              # TypeScript 설정
└── package.json
```

---

## 7. 사용자 전환 방식 (인증 대체)

### 7.1 가족 선택 화면
앱 시작 시 "누구세요?" 화면에서 가족 구성원 선택

```
┌─────────────────────────────────┐
│                                 │
│     🏠 우리 가족 과제 앱        │
│                                 │
│        누구세요?                │
│                                 │
│   👦          👧                │
│  아들        딸                 │
│                                 │
│   👨          👩                │
│  아빠        엄마               │
│                                 │
└─────────────────────────────────┘
```

### 7.2 가족 데이터 (하드코딩)

```typescript
// src/data/family.ts
export const FAMILY_MEMBERS = {
  son: {
    id: 'son',
    name: '아들이름',  // 실제 이름으로 변경
    role: 'child',
    avatar: '👦',
  },
  daughter: {
    id: 'daughter',
    name: '딸이름',   // 실제 이름으로 변경
    role: 'child',
    avatar: '👧',
  },
  dad: {
    id: 'dad',
    name: '아빠',
    role: 'parent',
    avatar: '👨',
  },
  mom: {
    id: 'mom',
    name: '엄마',
    role: 'parent',
    avatar: '👩',
  },
} as const;
```

### 7.3 상태 관리 (Zustand)

```typescript
// src/stores/familyStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FamilyStore {
  currentUser: string | null;  // 'son' | 'daughter' | 'dad' | 'mom'
  setCurrentUser: (id: string) => void;
  logout: () => void;
}

export const useFamilyStore = create<FamilyStore>()(
  persist(
    (set) => ({
      currentUser: null,
      setCurrentUser: (id) => set({ currentUser: id }),
      logout: () => set({ currentUser: null }),
    }),
    { name: 'family-storage' }
  )
);
```

> **장점**: 로그인 없이 localStorage에 현재 사용자 저장, 앱 재시작 시 유지

---

## 8. 개발 환경 설정

### 8.1 필수 설치

```bash
# Node.js 18.x 이상 필요
node -v

# 프로젝트 생성
npx create-next-app@latest homework-app --typescript --tailwind --app

# 추가 패키지 설치
npm install firebase zustand framer-motion
npm install react-webcam react-calendar date-fns
npm install react-hot-toast browser-image-compression
npm install -D next-pwa
```

### 8.2 환경 변수 (.env.local)

```env
# Firebase 설정
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## 9. 개발 순서

| 단계 | 작업 | 예상 산출물 |
|------|------|------------|
| 1 | 프로젝트 초기 설정 | Next.js + Firebase 기본 구조 |
| 2 | 가족 선택 화면 | "누구세요?" 화면, 아바타 선택 |
| 3 | 자녀 홈 화면 | 오늘 과제 카드, 스트릭 표시 |
| 4 | 카메라 촬영 | 사진 촬영 및 업로드 |
| 5 | 제출 완료 화면 | 축하 애니메이션, 스트릭 업데이트 |
| 6 | 부모 대시보드 | 자녀별 현황 요약, 미제출 알림 |
| 7 | 제출물 확인/반려 | 승인/반려 기능 |
| 8 | 과제 등록 화면 | 부모가 과제 추가하는 기능 |
| 9 | 달력 기능 | 월별 제출 현황 |
| 10 | PWA 설정 + 배포 | Vercel 배포 |

---

## 10. 디자인 시스템 (듀오링고 스타일)

### 10.1 컬러 팔레트

```css
/* Tailwind 커스텀 컬러 */
colors: {
  primary: '#58CC02',      /* 메인 그린 */
  'primary-dark': '#4CAD00',
  secondary: '#1CB0F6',    /* 블루 */
  streak: '#FF9600',       /* 스트릭 오렌지 */
  heart: '#FF4B4B',        /* 레드 */
  background: '#235390',   /* 다크 블루 배경 */
}
```

### 10.2 버튼 스타일

- 3D 효과: `box-shadow`로 입체감
- 눌림 효과: `transform: translateY(4px)`
- 둥근 모서리: `border-radius: 16px`
- 굵은 폰트: `font-weight: 800`

### 10.3 폰트

```css
font-family: 'Nunito', 'Noto Sans KR', sans-serif;
```

---

## 11. 참고 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [Firebase 공식 문서](https://firebase.google.com/docs)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [shadcn/ui](https://ui.shadcn.com)

---

## 12. 버전 히스토리

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0 | 2025-12-19 | 초기 기술 스택 문서 작성 |
| v1.1 | 2025-12-19 | 가족 전용 앱으로 변경 - 인증 제거, 사용자 전환 방식 추가 |
