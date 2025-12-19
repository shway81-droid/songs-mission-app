# 시스템 설계 문서

## 가족용 과제 사진 제출 앱

> 작성일: 2025-12-19
> 버전: v1.0
> 전제: **부모 1인 개발·유지보수**

---

## 1. 시스템 개요

### 1.1 핵심 원칙

```
┌─────────────────────────────────────────────────────────┐
│  🎯 1인 개발/유지보수를 위한 설계 원칙                    │
├─────────────────────────────────────────────────────────┤
│  ✓ 자동화 최대화 → 수동 작업 최소화                      │
│  ✓ 단순한 데이터 구조 → 복잡한 관계 피하기               │
│  ✓ 하드코딩 허용 → 가족 4명 고정, 설정 파일로 관리        │
│  ✓ 서버리스 → Firebase로 인프라 관리 부담 제거           │
└─────────────────────────────────────────────────────────┘
```

### 1.2 사용자 역할

| 역할 | 사용자 | 주요 행동 |
|------|--------|----------|
| **자녀 (child)** | 아들, 딸 | 과제 확인, 사진 제출, 달력 조회 |
| **부모 (parent)** | 아빠, 엄마 | 현황 확인, 승인/반려, 과제 등록 |

---

## 2. 자동화 vs 수동 처리 경계

### 2.1 처리 구분표

| 기능 | 자동 (시스템) | 수동 (부모) | 비고 |
|------|:------------:|:-----------:|------|
| 제출 시 상태 변경 | ✅ | | `submitted` 자동 설정 |
| 제출 시간 기록 | ✅ | | `submittedAt` 자동 |
| 스트릭 계산 | ✅ | | 제출 시 자동 증가 |
| 스트릭 리셋 | ✅ | | 자정 기준 미제출 시 리셋 |
| 달력 상태 표시 | ✅ | | 제출 데이터 기반 렌더링 |
| 사진 압축/업로드 | ✅ | | 클라이언트에서 자동 처리 |
| 과제 등록 | | ✅ | 부모가 직접 입력 |
| 승인 처리 | | ✅ | 버튼 클릭 (선택사항) |
| 반려 처리 | | ✅ | 사유 선택 후 확정 |
| 오늘의 과제 표시 | ✅ | | `isActive` 기준 필터 |

### 2.2 자동화 상세

```
┌─────────────────────────────────────────────────────────┐
│                    자동화 영역                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [제출 시 자동 처리]                                     │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐             │
│  │ 사진촬영 │ → │ 압축    │ → │ 업로드   │             │
│  └─────────┘    └─────────┘    └─────────┘             │
│       ↓                              ↓                  │
│  ┌─────────────────────────────────────────┐           │
│  │  Firestore 자동 기록                     │           │
│  │  - status: "submitted"                  │           │
│  │  - submittedAt: serverTimestamp()       │           │
│  │  - photoUrl: Storage URL                │           │
│  └─────────────────────────────────────────┘           │
│       ↓                                                 │
│  ┌─────────────────────────────────────────┐           │
│  │  스트릭 자동 업데이트                     │           │
│  │  - streak: streak + 1                   │           │
│  │  - lastSubmitDate: today                │           │
│  └─────────────────────────────────────────┘           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2.3 수동 처리 영역

```
┌─────────────────────────────────────────────────────────┐
│                    수동(부모) 영역                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [과제 등록] - 필요할 때만                               │
│  ┌─────────────────────────────────────────┐           │
│  │  제목: "수학 문제집 42~45쪽"             │           │
│  │  설명: "분수 덧셈 문제 풀기"             │           │
│  │  대상: 아들 / 딸 / 둘 다                 │           │
│  │  [등록] 버튼                             │           │
│  └─────────────────────────────────────────┘           │
│                                                         │
│  [승인/반려] - 선택사항 (확인 의무 없음)                 │
│  ┌─────────────────────────────────────────┐           │
│  │  📸 제출된 사진 미리보기                  │           │
│  │                                         │           │
│  │  [승인]  [반려 ▾]                        │           │
│  │          ├─ 📸 사진이 흐려요             │           │
│  │          ├─ ❌ 과제가 아니에요           │           │
│  │          └─ 🔁 다시 제출 필요            │           │
│  └─────────────────────────────────────────┘           │
│                                                         │
│  💡 제출 즉시 "완료" 처리 → 승인은 선택                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 3. 화면별 데이터 구조

### 3.1 화면-데이터 매핑 총괄표

| 화면 | 경로 | 읽기 데이터 | 쓰기 데이터 |
|------|------|------------|------------|
| 가족 선택 | `/` | (하드코딩) | localStorage |
| 자녀 홈 | `/child/[id]` | assignments, submissions, streak | - |
| 과제 상세 | `/child/[id]/task` | assignment | - |
| 카메라 | `/child/[id]/camera` | - | submissions, storage |
| 제출 완료 | `/child/[id]/success` | streak | streak |
| 달력 | `/child/[id]/calendar` | submissions (월별) | - |
| 부모 대시보드 | `/parent` | submissions (오늘), assignments | - |
| 제출물 확인 | `/parent/review` | submissions | submissions (status) |
| 과제 등록 | `/parent/assign` | assignments | assignments |

---

### 3.2 화면별 상세 설계

#### 🏠 가족 선택 화면 (`/`)

```typescript
// 데이터 소스: 하드코딩 (src/data/family.ts)
interface FamilyMember {
  id: 'son' | 'daughter' | 'dad' | 'mom';
  name: string;
  role: 'child' | 'parent';
  avatar: string;
}

// 상태 저장: localStorage (Zustand persist)
interface FamilyStore {
  currentUser: string | null;
  setCurrentUser: (id: string) => void;
}

// 화면 로직
onSelect(memberId) {
  store.setCurrentUser(memberId);
  if (member.role === 'child') {
    router.push(`/child/${memberId}`);
  } else {
    router.push('/parent');
  }
}
```

**자동화**: 없음
**수동**: 아바타 클릭으로 사용자 선택

---

#### 👦 자녀 홈 화면 (`/child/[id]`)

```typescript
// 필요 데이터
interface ChildHomeData {
  // 1. 오늘의 과제 (활성 과제 중 해당 자녀 대상)
  todayAssignment: Assignment | null;

  // 2. 오늘 제출 상태
  todaySubmission: Submission | null;

  // 3. 스트릭 정보
  streak: number;

  // 4. 이번 주 진행률
  weekProgress: { done: number; total: number };
}

// Firestore 쿼리
const todayAssignment = await getDocs(
  query(
    collection(db, 'assignments'),
    where('isActive', '==', true),
    where('targetChild', 'in', [childId, 'both'])
  )
);

const todaySubmission = await getDoc(
  doc(db, 'submissions', `${today}_${childId}`)
);
```

**화면 상태별 표시**:
| 상태 | 표시 내용 |
|------|----------|
| 미제출 | 오늘 과제 카드 + 제출 버튼 |
| 제출됨 | "제출 완료!" 배지 |
| 반려됨 | 🔴 반려 알림 + 재제출 버튼 |

**자동화**: 상태에 따른 UI 자동 전환
**수동**: 없음 (조회만)

---

#### 📷 카메라/제출 화면 (`/child/[id]/camera`)

```typescript
// 제출 프로세스 (자동화)
async function submitPhoto(photoBlob: Blob, childId: string, assignmentId: string) {
  // 1. 이미지 압축 (자동)
  const compressed = await imageCompression(photoBlob, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920
  });

  // 2. Storage 업로드 (자동)
  const path = `submissions/${childId}/${today}_${Date.now()}.jpg`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, compressed);
  const photoUrl = await getDownloadURL(storageRef);

  // 3. Firestore 저장 (자동)
  await setDoc(doc(db, 'submissions', `${today}_${childId}`), {
    assignmentId,
    childId,
    photoUrl,
    status: 'submitted',  // 자동 설정
    submittedAt: serverTimestamp()
  });

  // 4. 스트릭 업데이트 (자동)
  await updateStreak(childId);
}
```

**자동화**:
- 이미지 압축
- Storage 업로드
- Firestore 문서 생성
- 스트릭 계산/업데이트

**수동**: 사진 촬영, 제출 버튼 클릭

---

#### 📅 달력 화면 (`/child/[id]/calendar`)

```typescript
// 월별 제출 데이터 조회
interface CalendarData {
  [date: string]: 'submitted' | 'approved' | 'rejected' | 'none';
}

// Firestore 쿼리 (월 단위)
const submissions = await getDocs(
  query(
    collection(db, 'submissions'),
    where('childId', '==', childId),
    where('submittedAt', '>=', monthStart),
    where('submittedAt', '<=', monthEnd)
  )
);

// 캘린더 렌더링 데이터로 변환
const calendarData = submissions.docs.reduce((acc, doc) => {
  const date = formatDate(doc.data().submittedAt);
  acc[date] = doc.data().status;
  return acc;
}, {});
```

**상태 아이콘**:
| 상태 | 아이콘 | 의미 |
|------|:------:|------|
| none | ⚪ | 미제출 |
| submitted | ⭕ | 제출 완료 |
| approved | ⭕ | 승인됨 |
| rejected | 🔴 | 반려됨 |

**자동화**: 데이터 기반 아이콘 자동 렌더링
**수동**: 없음

---

#### 👨‍👩‍👧‍👦 부모 대시보드 (`/parent`)

```typescript
// 대시보드 데이터
interface DashboardData {
  // 자녀별 오늘 현황
  children: {
    [childId: string]: {
      name: string;
      todayStatus: 'submitted' | 'pending' | 'rejected' | 'none';
      streak: number;
    }
  };

  // 확인 대기 제출물 수
  pendingCount: number;

  // 오늘 과제 정보
  todayAssignment: Assignment | null;
}

// 쿼리
const todaySubmissions = await getDocs(
  query(
    collection(db, 'submissions'),
    where('submittedAt', '>=', todayStart),
    where('submittedAt', '<=', todayEnd)
  )
);
```

**화면 구성**:
```
┌─────────────────────────────────────────┐
│  📊 오늘 현황           12월 20일 금요일  │
├─────────────────────────────────────────┤
│                                         │
│  👦 아들        👧 딸                    │
│  ⭕ 제출완료    ⚪ 미제출                │
│  🔥 5일        🔥 3일                   │
│                                         │
├─────────────────────────────────────────┤
│  ⚠️ 미제출: 딸                          │
├─────────────────────────────────────────┤
│  📋 확인 대기 (1건) →                    │
└─────────────────────────────────────────┘
```

**자동화**: 현황 자동 집계, 미제출 자동 표시
**수동**: 없음 (조회만)

---

#### ✅ 제출물 확인 (`/parent/review`)

```typescript
// 확인 대기 목록
const pendingSubmissions = await getDocs(
  query(
    collection(db, 'submissions'),
    where('status', '==', 'submitted'),
    orderBy('submittedAt', 'desc')
  )
);

// 승인 처리
async function approve(submissionId: string) {
  await updateDoc(doc(db, 'submissions', submissionId), {
    status: 'approved',
    reviewedAt: serverTimestamp()
  });
}

// 반려 처리
async function reject(submissionId: string, reason: RejectReason) {
  await updateDoc(doc(db, 'submissions', submissionId), {
    status: 'rejected',
    rejectReason: reason,
    reviewedAt: serverTimestamp()
  });

  // 스트릭 유지 (반려 시 증가 안 함, 리셋도 안 함)
}
```

**반려 사유 (고정)**:
```typescript
type RejectReason = 'blurry' | 'wrong' | 'resubmit';

const REJECT_REASONS = {
  blurry: { icon: '📸', text: '사진이 흐려요' },
  wrong: { icon: '❌', text: '과제가 아니에요' },
  resubmit: { icon: '🔁', text: '다시 제출 필요' }
};
```

**자동화**: 없음
**수동**: 승인/반려 버튼 클릭

---

#### ➕ 과제 등록 (`/parent/assign`)

```typescript
// 과제 등록 폼
interface AssignmentForm {
  title: string;           // 필수
  description?: string;    // 선택
  subject: string;         // 과목 (수학, 국어 등)
  targetChild: 'son' | 'daughter' | 'both';
}

// 과제 등록
async function createAssignment(form: AssignmentForm) {
  // 기존 활성 과제 비활성화
  const activeAssignments = await getDocs(
    query(
      collection(db, 'assignments'),
      where('isActive', '==', true)
    )
  );

  const batch = writeBatch(db);
  activeAssignments.docs.forEach(doc => {
    batch.update(doc.ref, { isActive: false });
  });

  // 새 과제 등록
  batch.set(doc(collection(db, 'assignments')), {
    ...form,
    isActive: true,
    createdAt: serverTimestamp()
  });

  await batch.commit();
}
```

**자동화**: 새 과제 등록 시 기존 과제 자동 비활성화
**수동**: 과제 내용 입력

---

## 4. 데이터 흐름도

### 4.1 제출 흐름

```
[자녀]                    [시스템]                   [Firebase]
  │                          │                          │
  │  📷 사진 촬영             │                          │
  │─────────────────────────>│                          │
  │                          │  압축 (자동)              │
  │                          │─────────────────────────>│
  │                          │         Storage 저장     │
  │                          │<─────────────────────────│
  │                          │  URL 획득                │
  │                          │─────────────────────────>│
  │                          │    Firestore 문서 생성   │
  │                          │<─────────────────────────│
  │                          │  스트릭 업데이트          │
  │                          │─────────────────────────>│
  │  🎉 완료 화면             │         streak +1       │
  │<─────────────────────────│                          │
```

### 4.2 반려 흐름

```
[부모]                    [시스템]                   [Firebase]
  │                          │                          │
  │  🔴 반려 버튼             │                          │
  │─────────────────────────>│                          │
  │  사유 선택                │                          │
  │─────────────────────────>│                          │
  │                          │─────────────────────────>│
  │                          │  status: "rejected"      │
  │                          │  rejectReason: "..."     │
  │                          │<─────────────────────────│
  │  ✅ 반려 완료             │                          │
  │<─────────────────────────│                          │
  │                          │                          │
[자녀]                       │                          │
  │  앱 접속                  │                          │
  │─────────────────────────>│                          │
  │                          │─────────────────────────>│
  │                          │    제출 데이터 조회       │
  │                          │<─────────────────────────│
  │  🔴 반려 알림 표시         │                          │
  │<─────────────────────────│                          │
  │  📷 재제출                │                          │
  │─────────────────────────>│      (제출 흐름 반복)     │
```

---

## 5. Firestore 스키마 최종

### 5.1 컬렉션 구조

```
firestore/
├── assignments/           # 과제 목록
│   └── {auto-id}/
│       ├── title: string
│       ├── description: string
│       ├── subject: string
│       ├── targetChild: "son" | "daughter" | "both"
│       ├── isActive: boolean
│       └── createdAt: Timestamp
│
├── submissions/           # 제출 기록
│   └── {YYYY-MM-DD_childId}/   # 문서 ID = 날짜_자녀ID
│       ├── assignmentId: string
│       ├── childId: string
│       ├── photoUrl: string
│       ├── status: "submitted" | "approved" | "rejected"
│       ├── rejectReason?: "blurry" | "wrong" | "resubmit"
│       ├── submittedAt: Timestamp
│       └── reviewedAt?: Timestamp
│
└── streaks/               # 스트릭 정보
    └── {childId}/
        ├── current: number        # 현재 연속 일수
        ├── longest: number        # 최장 기록
        └── lastSubmitDate: string # 마지막 제출일 (YYYY-MM-DD)
```

### 5.2 인덱스 설정

```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "submissions",
      "fields": [
        { "fieldPath": "childId", "order": "ASCENDING" },
        { "fieldPath": "submittedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "submissions",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "submittedAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### 5.3 보안 규칙 (간소화)

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 가족 전용 앱 - 모든 읽기/쓰기 허용
    // (실제 운영 시 도메인 제한 권장)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ **보안 참고**: 가족 전용이므로 간소화했지만, 배포 시 Vercel 도메인만 허용하는 것을 권장

---

## 6. 스트릭 로직 상세

### 6.1 스트릭 계산 규칙

```typescript
// src/lib/streak.ts

interface StreakData {
  current: number;
  longest: number;
  lastSubmitDate: string;  // 'YYYY-MM-DD'
}

async function updateStreak(childId: string): Promise<number> {
  const today = format(new Date(), 'yyyy-MM-dd');
  const streakRef = doc(db, 'streaks', childId);
  const streakDoc = await getDoc(streakRef);

  if (!streakDoc.exists()) {
    // 첫 제출
    await setDoc(streakRef, {
      current: 1,
      longest: 1,
      lastSubmitDate: today
    });
    return 1;
  }

  const data = streakDoc.data() as StreakData;
  const lastDate = parseISO(data.lastSubmitDate);
  const daysDiff = differenceInDays(new Date(), lastDate);

  let newCurrent: number;

  if (daysDiff === 0) {
    // 오늘 이미 제출함 → 유지
    return data.current;
  } else if (daysDiff === 1) {
    // 연속 → +1
    newCurrent = data.current + 1;
  } else {
    // 끊김 → 리셋
    newCurrent = 1;
  }

  const newLongest = Math.max(data.longest, newCurrent);

  await updateDoc(streakRef, {
    current: newCurrent,
    longest: newLongest,
    lastSubmitDate: today
  });

  return newCurrent;
}
```

### 6.2 스트릭 규칙 요약

| 상황 | 결과 |
|------|------|
| 오늘 첫 제출 | streak + 1 |
| 오늘 중복 제출 | 유지 (변화 없음) |
| 어제 제출 → 오늘 제출 | streak + 1 |
| 이틀 이상 미제출 후 제출 | streak = 1 (리셋) |
| 제출 후 반려 | streak 유지 (감소 안 함) |
| 반려 후 재제출 | streak 변화 없음 (이미 카운트됨) |

---

## 7. 유지보수 가이드

### 7.1 일상 운영 (부모)

| 작업 | 빈도 | 방법 |
|------|------|------|
| 오늘 현황 확인 | 매일 | 부모 대시보드 조회 |
| 제출물 확인/반려 | 필요시 | 리뷰 화면에서 처리 |
| 새 과제 등록 | 필요시 | 과제 등록 화면 |
| 스트릭 확인 | 수시 | 대시보드 / 자녀 화면 |

### 7.2 설정 변경

| 변경 사항 | 파일 위치 | 방법 |
|----------|----------|------|
| 가족 이름 변경 | `src/data/family.ts` | 코드 수정 → 재배포 |
| 반려 사유 추가 | `src/data/rejectReasons.ts` | 코드 수정 → 재배포 |
| 색상 변경 | `tailwind.config.js` | 코드 수정 → 재배포 |

### 7.3 데이터 백업

```bash
# Firebase CLI로 Firestore 백업 (월 1회 권장)
firebase firestore:export gs://your-bucket/backup-$(date +%Y%m%d)
```

### 7.4 비용 관리

| 서비스 | 무료 한도 | 예상 사용량 | 위험도 |
|--------|----------|------------|:------:|
| Firestore 읽기 | 50,000/일 | ~100/일 | 🟢 |
| Firestore 쓰기 | 20,000/일 | ~10/일 | 🟢 |
| Storage | 5GB | ~1GB/월 | 🟢 |
| Vercel | 100GB 대역폭 | ~1GB/월 | 🟢 |

> 가족 4명 사용 시 무료 한도 내 충분

---

## 8. 에러 처리 전략

### 8.1 클라이언트 에러

```typescript
// 공통 에러 핸들러
function handleError(error: Error, context: string) {
  console.error(`[${context}]`, error);

  // 사용자 친화적 메시지
  toast.error(getErrorMessage(error));
}

function getErrorMessage(error: Error): string {
  if (error.message.includes('network')) {
    return '인터넷 연결을 확인해주세요';
  }
  if (error.message.includes('storage')) {
    return '사진 업로드에 실패했어요. 다시 시도해주세요';
  }
  return '문제가 발생했어요. 잠시 후 다시 시도해주세요';
}
```

### 8.2 오프라인 대응

```typescript
// 네트워크 상태 감지
const isOnline = useOnlineStatus();

if (!isOnline) {
  return <OfflineBanner message="오프라인 상태입니다" />;
}
```

---

## 9. 버전 히스토리

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0 | 2025-12-19 | 초기 시스템 설계 문서 작성 |

---

## 부록: 체크리스트

### 개발 전 확인

- [ ] Firebase 프로젝트 생성
- [ ] Firestore 데이터베이스 생성
- [ ] Storage 버킷 생성
- [ ] 환경 변수 설정 (.env.local)
- [ ] Vercel 프로젝트 연결

### 배포 전 확인

- [ ] 가족 이름 설정 완료
- [ ] 테스트 데이터 삭제
- [ ] Firestore 보안 규칙 검토
- [ ] PWA manifest 설정
- [ ] 모바일 테스트 완료
