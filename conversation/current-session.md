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

### 작업 7: 프로젝트 개발 구현
- 개발 모드: YOLO 모드 (자동 진행)
- 디자인 기준: `front.jsx` 와이어프레임 충실히 따름

#### 생성된 파일 목록:
**설정 파일:**
- `package.json` - 프로젝트 설정 (Next.js 14 + 의존성)
- `tsconfig.json` - TypeScript 설정
- `tailwind.config.js` - Tailwind CSS 설정 (듀오링고 컬러)
- `postcss.config.js` - PostCSS 설정
- `next.config.js` - Next.js 설정
- `next-env.d.ts` - Next.js TypeScript 선언

**코어 파일:**
- `src/lib/firebase.ts` - Firebase 초기화
- `src/lib/firestore.ts` - Firestore CRUD 함수들
- `src/stores/userStore.ts` - Zustand 사용자 상태 관리
- `src/types/index.ts` - TypeScript 타입 정의

**UI 컴포넌트 (`src/components/ui/`):**
- `DuoButton.tsx` - 3D 스타일 버튼
- `CharacterBubble.tsx` - 캐릭터 말풍선
- `ProgressBar.tsx` - 진행률 바
- `TopHeader.tsx` - 상단 헤더

**페이지 (`src/app/`):**
- `page.tsx` - 루트 (리다이렉트)
- `layout.tsx` - 앱 레이아웃
- `globals.css` - 전역 스타일
- `select/page.tsx` - 가족 선택 화면
- `child/page.tsx` - 자녀 홈 화면
- `child/camera/page.tsx` - 카메라/사진 제출
- `child/success/page.tsx` - 제출 완료 화면
- `child/calendar/page.tsx` - 달력 화면
- `parent/page.tsx` - 부모 대시보드
- `parent/review/page.tsx` - 제출물 확인/반려
- `parent/assignments/page.tsx` - 과제 관리

**PWA 설정:**
- `public/manifest.json` - PWA 매니페스트
- `public/icons/` - 아이콘 폴더

#### 해결한 문제:
1. Tailwind CSS 4.x → 3.4.1 다운그레이드 (PostCSS 플러그인 호환성)
2. TypeScript 타입 에러 수정 (boolean | null → boolean)
3. 달력 페이지 무한 루프 수정 (setStats → useMemo)

#### 빌드 결과:
- 총 10개 페이지 생성 완료
- 빌드 성공 ✓

---

## 현재 폴더 구조
```
homework/
├── .env.local           # Firebase 환경변수
├── .gitignore           # Git 무시 파일
├── CLAUDE.md            # Claude Code 가이드
├── front.jsx            # 와이어프레임
├── ux.md                # UX 기획안
├── tech-stack.md        # 기술 스택 문서 (v1.1)
├── system-design.md     # 시스템 설계 문서
├── PRD.md               # 제품 요구사항 문서
├── package.json         # 프로젝트 설정
├── tsconfig.json        # TypeScript 설정
├── tailwind.config.js   # Tailwind 설정
├── postcss.config.js    # PostCSS 설정
├── next.config.js       # Next.js 설정
├── next-env.d.ts        # Next.js 타입 선언
├── public/
│   ├── manifest.json    # PWA 매니페스트
│   └── icons/           # PWA 아이콘
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── select/page.tsx
│   │   ├── child/
│   │   │   ├── page.tsx
│   │   │   ├── camera/page.tsx
│   │   │   ├── success/page.tsx
│   │   │   └── calendar/page.tsx
│   │   └── parent/
│   │       ├── page.tsx
│   │       ├── review/page.tsx
│   │       └── assignments/page.tsx
│   ├── components/ui/
│   │   ├── index.ts
│   │   ├── DuoButton.tsx
│   │   ├── CharacterBubble.tsx
│   │   ├── ProgressBar.tsx
│   │   └── TopHeader.tsx
│   ├── lib/
│   │   ├── firebase.ts
│   │   └── firestore.ts
│   ├── stores/
│   │   └── userStore.ts
│   └── types/
│       └── index.ts
└── conversation/
    └── current-session.md
```

### 작업 8: PRD 누락 기능 점검 및 구현

#### 점검 결과
**P0 (MVP 필수)**: 100% 완료
**P1 (MVP 권장)**: 2개 누락 발견

#### 구현한 기능

**1. S-12: 정확한 주간 진행률 계산**
- 수정 파일: `src/lib/firestore.ts`
- 추가 함수: `getWeeklySubmissionCount(childId)`
  - 이번 주 월요일~일요일 기준 제출 횟수 계산
  - 중복 날짜 제거 (하루 여러 번 제출해도 1회로 카운트)
- 수정 파일: `src/app/child/page.tsx`
  - 임시 streak 기반 계산 → 실제 주간 데이터 사용

**2. P-09: 과제 비활성화 버튼**
- 수정 파일: `src/app/parent/assignments/page.tsx`
- 추가 기능:
  - "🗑️ 종료" 버튼 (수정 버튼 옆에 배치)
  - 비활성화 확인 모달 (안내 문구 포함)
  - `handleDeactivate()` 함수로 isActive: false 처리

#### 빌드 결과
- 빌드 성공 ✓
- 총 12개 페이지 생성

### 작업 9: 이미지 압축 1MB 제한 구현

#### 배경
- PRD 6.1 성능 요구사항: "이미지 압축: 클라이언트에서 처리"
- PRD S-05: "이미지 압축 (최대 1MB)"
- 기존: JPEG 0.8 품질로만 변환, 크기 제한 없음

#### 구현 내용

**1. 새 파일 생성: `src/lib/imageUtils.ts`**
- `compressImage(file)`: File/Blob을 1MB 이하로 압축
- `compressBase64Image(base64)`: Base64 이미지를 압축
- `formatFileSize(bytes)`: 파일 크기 포맷팅

**압축 알고리즘:**
1. 1MB 이하면 그대로 반환
2. 최대 해상도 제한 (1920x1440)
3. 품질을 0.9 → 0.5까지 단계적 감소
4. 여전히 크면 추가 리사이즈

**2. 카메라 페이지 수정: `src/app/child/camera/page.tsx`**
- 제출 시 `compressBase64Image()` 호출
- 콘솔에 압축 결과 로깅

#### 빌드 결과
- 빌드 성공 ✓

### 작업 10: 여러 과제 지원 + 젬(다이아몬드) 보상 설정

#### 배경
- 기존: 자녀별로 하나의 과제만 설정 가능
- 요청: 여러 과제 지원 + 과제별 젬(다이아몬드) 보상 설정

#### 구현 내용

**1. Assignment 타입 수정: `src/types/index.ts`**
- `gems: number` 필드 추가 (완료 시 받는 젬 개수)

**2. Firestore 함수 수정: `src/lib/firestore.ts`**
- `getActiveAssignment()` → `getActiveAssignments()` (배열 반환)
- `createAssignment()`: `gems` 매개변수 추가 (기본값 10)
- `updateAssignment()`: `gems` 필드 수정 지원
- `getAssignmentById()` 함수 신규 추가

**3. 자녀 홈 화면 수정: `src/app/child/page.tsx`**
- 여러 과제 카드 목록 표시
- 과제별 젬 표시 (💎 아이콘)
- 총 획득 가능 젬 표시

**4. 카메라 페이지 수정: `src/app/child/camera/page.tsx`**
- URL 쿼리 파라미터로 과제 ID 전달 (`?assignmentId=...`)
- 여러 과제 중 선택 가능한 바텀시트 모달
- 선택된 과제 표시 UI (상단에 현재 과제 + 젬 표시)
- Suspense 래퍼 추가 (useSearchParams 호환)

**5. 과제 관리 페이지 수정: `src/app/parent/assignments/page.tsx`**
- 여러 과제 목록 표시 (기존: 하나만)
- 과제별 수정/종료 버튼
- 젬 설정 UI 추가:
  - +/- 버튼으로 5씩 증감
  - 직접 숫자 입력 (1~100 범위)
  - 빠른 선택 버튼 (5, 10, 15, 20, 30)
- 총 젬 합계 표시

**6. 리뷰 페이지 수정: `src/app/parent/review/page.tsx`**
- `getActiveAssignment` → `getAssignmentById` 사용

#### 빌드 결과
- 빌드 성공 ✓
- 총 12개 페이지 생성

### 작업 11: "과제" → "미션" 용어 변경

#### 배경
- 기존: 앱 전체에서 "과제"라는 용어 사용
- 요청: 더 친근한 "미션"으로 변경

#### 변경된 파일

**레이아웃 및 메타데이터:**
- `src/app/layout.tsx` - 타이틀, 설명
- `src/app/page.tsx` - 로딩 화면 텍스트
- `public/manifest.json` - PWA 이름, 설명

**가족 선택 화면:**
- `src/app/select/page.tsx` - 앱 제목

**자녀 화면:**
- `src/app/child/page.tsx` - 오늘의 미션 카드
- `src/app/child/camera/page.tsx` - 미션 선택 모달
- `src/app/child/success/page.tsx` - 완료 메시지

**부모 화면:**
- `src/app/parent/page.tsx` - 미션 관리 버튼
- `src/app/parent/assignments/page.tsx` - 미션 관리 페이지 전체
- `src/app/parent/review/page.tsx` - 반려 사유, 승인 메시지

**기타:**
- `package.json` - 앱 설명
- `tests/app.spec.ts` - 테스트 설명, 버튼 이름

#### 변경 요약
- "송가네 과제 앱" → "송가네 미션 앱"
- "과제 관리" → "미션 관리"
- "과제 제목" → "미션 제목"
- "과제가 아니에요" → "미션이 아니에요"
- "새 과제 추가" → "새 미션 추가"
- 모든 주석 및 안내 문구 변경

#### 빌드 결과
- 빌드 성공 ✓

### 작업 12: 배포 전 체크리스트 수정

#### 수정 사항
1. **PWA 아이콘 생성**
   - 사용자 제공 이미지로 192x192, 512x512 아이콘 생성
   - `public/icons/icon-192.png`, `icon-512.png`

2. **Storage Rules 생성**
   - `storage.rules` 파일 생성
   - 5MB 이미지 크기 제한

3. **Firebase Hosting 설정**
   - `firebase.json`에 hosting 설정 추가
   - `next.config.js`에 `output: 'export'` 추가

#### 배포
- 프로젝트: `homework-7eefc`
- URL: https://homework-7eefc.web.app

### 작업 13: 미션 완료 상태 표시 UI 개선

#### 배경
- 기존: 완료된 미션과 미완료 미션 구분 안 됨
- 요청: 듀오링고 스타일로 완료 여부 시각화

#### 구현 내용

**1. firestore.ts 수정**
- `getTodaySubmissions()`: 오늘 제출된 모든 submission 가져오기
- `getTodayCompletedAssignmentIds()`: 완료된 미션 ID 목록 반환
- `submitAssignment()`: 미션별 개별 문서 생성 (`${today}_${childId}_${assignmentId}`)

**2. child/page.tsx 수정**
- 완료된 미션: 초록 체크(✓) + 연한 초록 배경 + 초록 텍스트
- 미완료 미션: 빈 원 + 회색 배경 + 클릭 가능
- 상단 헤더: "완료 2/3" 진행률 표시
- 모두 완료 시: 🎉 "모두 완료!" + 버튼 비활성화
- 완료된 미션 목록 하단으로 정렬
- 버튼: "📷 제출하러 가기 (2개 남음)"

#### 빌드 및 배포
- 빌드 성공 ✓
- 배포 완료: https://homework-7eefc.web.app

### 작업 14: 프로필 이미지 및 이름 표시 개선

#### 배경
- 기존: 이모지 아바타만 표시, 자녀 화면에서 누구인지 불명확
- 요청: 실제 프로필 사진 사용 + 이름 표시

#### 구현 내용

**1. types/index.ts 수정**
- `FamilyMember` 인터페이스에 `profileImage: string` 필드 추가
- 각 가족 구성원에 프로필 이미지 경로 설정 (`/profiles/son.png` 등)

**2. ProfileAvatar 컴포넌트 생성**
- `src/components/ui/ProfileAvatar.tsx`
- 크기 옵션: small(32px), medium(48px), large(64px)
- 둥근 모서리 + 이미지 커버

**3. userStore.ts 수정**
- `persist` 미들웨어에 `merge` 옵션 추가
- localStorage의 오래된 데이터와 최신 `FAMILY_MEMBERS` 병합
- 문제 해결: 이전 localStorage에 profileImage 없어서 선택 불가 이슈

**4. 화면별 수정**
- `select/page.tsx`: 프로필 사진으로 변경
- `child/page.tsx`: 말풍선에 이름 추가 ("안녕하세요, 송현준!")
- `parent/page.tsx`: ProfileAvatar 사용
- `parent/review/page.tsx`: ProfileAvatar 사용
- `parent/assignments/page.tsx`: ProfileAvatar 사용

### 작업 15: Firestore 데이터 초기화

#### 요청
- 모든 미션 데이터 삭제 (테스트용)

#### 실행
```bash
firebase firestore:delete assignments --recursive --project homework-7eefc
firebase firestore:delete submissions --recursive --project homework-7eefc
firebase firestore:delete stats --recursive --project homework-7eefc
```

### 작업 16: 일괄 승인 기능 추가

#### 배경
- 요청: 제출물 확인 시 여러 개를 한번에 승인하는 기능

#### 구현 내용

**parent/review/page.tsx 수정**
- `handleApproveAll()` 함수 추가
  - Promise.all로 모든 제출물 동시 승인
  - 성공 토스트 메시지 표시
- UI 버튼 추가
  - 제출물 1개 이상일 때 표시 (`>= 1`로 수정)
  - 듀오링고 스타일 3D 버튼 (초록색)
  - "✓ 3개 모두 승인하기" 형식

### 작업 17: 카메라 화면 깜빡임 문제 수정

#### 문제
- 카메라 화면에서 무한 깜빡임 발생
- 사진 촬영 시 화면이 계속 리렌더링됨

#### 원인
- `useEffect`에서 `stream` state를 의존성 배열에 포함
- stream 변경 → state 업데이트 → 재렌더링 → stream 변경 무한 루프

#### 해결
**child/camera/page.tsx 수정**
- `stream` state → `streamRef` ref로 변경
- `cameraReady` state 추가 (UI 업데이트용)
- useEffect 의존성 배열에서 `startCamera`, `stopCamera` 제거

### 작업 18: Zustand hydration 문제 수정

#### 문제
- 화면 전환 시 자꾸 select 화면으로 이동됨
- 새로고침/화면 전환 시 로그인 상태 유실

#### 원인
- Zustand persist는 localStorage에서 비동기로 데이터 로드
- 로드 완료 전 `currentUser`가 null → redirect 발생

#### 해결
**userStore.ts 수정**
- `hasHydrated` state 추가
- `setHasHydrated` action 추가
- `onRehydrateStorage` 콜백 설정

**모든 페이지 수정**
- `hasHydrated` 체크 후에만 redirect 실행
- 수정된 파일:
  - `child/page.tsx`
  - `child/camera/page.tsx`
  - `child/success/page.tsx`
  - `child/calendar/page.tsx`
  - `parent/page.tsx`
  - `parent/review/page.tsx`
  - `parent/assignments/page.tsx`

### 작업 19: 브라우저 캐시 문제 수정

#### 문제
- 일반 브라우저에서 화면 전환 안됨
- 시크릿 모드에서는 정상 작동

#### 원인
- 이전 버전 JS가 브라우저에 캐시됨

#### 해결
**firebase.json 수정**
- HTML, JS 파일에 no-cache 헤더 추가
```json
"headers": [
  { "source": "**/*.html", "headers": [{ "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }] },
  { "source": "**/*.js", "headers": [{ "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }] }
]
```

### 작업 20: 부모 PIN 인증 추가

#### 요청
- 부모 로그인 시 4자리 비밀번호 입력
- 비밀번호: 7824

#### 구현
**select/page.tsx 수정**
- PIN 입력 모달 추가
- 숫자 키패드 UI (듀오링고 스타일)
- 틀리면 shake 애니메이션 + 에러 토스트
- 맞으면 parent 화면으로 이동

**.env.local 수정**
- `NEXT_PUBLIC_PARENT_PIN=7824` 추가

### 작업 21: 진행률 라벨 변경

#### 요청
- "이번 주 진행률" → "오늘 진행률"

#### 수정
**child/page.tsx**
- ProgressBar label prop 변경

### 작업 22: 성능 최적화

#### 적용한 최적화

**1. Firebase Lite SDK 전환**
- `firebase.ts`: `firebase/firestore` → `firebase/firestore/lite`
- `firestore.ts`: lite 버전 import
- 번들 크기 약 53KB 감소

**2. N+1 쿼리 최적화**
- `getPendingSubmissionsWithAssignments()` 함수 추가
- 제출물 + 미션 정보를 한 번에 조회
- 기존: N개 제출물 × N개 쿼리 → 개선: 2개 쿼리

**3. CSS 애니메이션 추가**
- `tailwind.config.js`에 fade-in, slide-up, scale-in 애니메이션 추가

### 작업 23: 최종 커밋

#### 커밋 정보
- 해시: `88c43ee`
- 메시지: "최종수정본: 송가네 미션 앱 v1.0"
- 47개 파일 변경 (15,860줄 추가)

#### 주요 기능
- 가족 선택 화면 및 역할별 라우팅
- 자녀: 미션 목록, 카메라 촬영, 제출, 달력, 스트릭
- 부모: 대시보드, 제출물 확인/승인/반려, 미션 관리
- 부모 PIN 인증 (4자리)
- 일괄 승인 기능
- 듀오링고 스타일 UI

#### 최적화
- Firebase Lite SDK (번들 53KB 감소)
- N+1 쿼리 최적화
- Zustand hydration 처리
- 캐시 헤더 설정

#### 배포
- URL: https://homework-7eefc.web.app
