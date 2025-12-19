import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  addDoc,
} from 'firebase/firestore/lite';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Assignment, Submission, ChildStats } from '@/types';
import { format } from 'date-fns';

// ============================================================
// 미션 (Assignments)
// ============================================================

// ID로 미션 가져오기
export async function getAssignmentById(assignmentId: string): Promise<Assignment | null> {
  const docRef = doc(db, 'assignments', assignmentId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate(),
    updatedAt: docSnap.data().updatedAt?.toDate(),
  } as Assignment;
}

// 특정 자녀의 활성 미션들 가져오기 (여러 개 지원)
export async function getActiveAssignments(childId: string): Promise<Assignment[]> {
  const q = query(
    collection(db, 'assignments'),
    where('childId', '==', childId),
    where('isActive', '==', true)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return [];

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Assignment[];
}

// 특정 자녀의 모든 미션 가져오기
export async function getAssignments(childId: string): Promise<Assignment[]> {
  const q = query(
    collection(db, 'assignments'),
    where('childId', '==', childId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Assignment[];
}

// 미션 생성
export async function createAssignment(
  childId: string,
  title: string,
  description?: string,
  gems: number = 10
): Promise<string> {
  const docRef = await addDoc(collection(db, 'assignments'), {
    childId,
    title,
    description: description || '',
    gems,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

// 미션 수정
export async function updateAssignment(
  assignmentId: string,
  data: Partial<Pick<Assignment, 'title' | 'description' | 'isActive' | 'gems'>>
): Promise<void> {
  await updateDoc(doc(db, 'assignments', assignmentId), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

// ============================================================
// 제출 (Submissions)
// ============================================================

// 오늘 제출 확인 (기존 호환성 유지)
export async function getTodaySubmission(childId: string): Promise<Submission | null> {
  const submissions = await getTodaySubmissions(childId);
  // 가장 최근 제출 또는 반려된 제출 반환
  const rejected = submissions.find(s => s.status === 'rejected');
  if (rejected) return rejected;
  return submissions[0] || null;
}

// 오늘 제출된 모든 미션 가져오기
export async function getTodaySubmissions(childId: string): Promise<Submission[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const q = query(
    collection(db, 'submissions'),
    where('childId', '==', childId),
    where('submittedAt', '>=', Timestamp.fromDate(today)),
    where('submittedAt', '<', Timestamp.fromDate(tomorrow))
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    submittedAt: doc.data().submittedAt?.toDate(),
    reviewedAt: doc.data().reviewedAt?.toDate(),
  })) as Submission[];
}

// 오늘 완료된 미션 ID 목록 가져오기
export async function getTodayCompletedAssignmentIds(childId: string): Promise<string[]> {
  const submissions = await getTodaySubmissions(childId);
  // 반려되지 않은 제출의 assignmentId만 반환
  return submissions
    .filter(s => s.status !== 'rejected' && s.assignmentId)
    .map(s => s.assignmentId!);
}

// 제출물 가져오기 (월별)
export async function getSubmissionsByMonth(
  childId: string,
  year: number,
  month: number
): Promise<Submission[]> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const q = query(
    collection(db, 'submissions'),
    where('childId', '==', childId),
    where('submittedAt', '>=', Timestamp.fromDate(startDate)),
    where('submittedAt', '<=', Timestamp.fromDate(endDate))
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    submittedAt: doc.data().submittedAt?.toDate(),
    reviewedAt: doc.data().reviewedAt?.toDate(),
  })) as Submission[];
}

// 사진 업로드 및 제출 (미션별 개별 제출 지원)
export async function submitAssignment(
  childId: string,
  assignmentId: string,
  photoFile: File
): Promise<string> {
  const today = format(new Date(), 'yyyy-MM-dd');
  // 미션별로 별도 문서 생성
  const submissionId = `${today}_${childId}_${assignmentId}`;

  // 1. Storage에 사진 업로드
  const photoPath = `submissions/${childId}/${today}_${assignmentId}_${Date.now()}.jpg`;
  const storageRef = ref(storage, photoPath);
  await uploadBytes(storageRef, photoFile);
  const photoUrl = await getDownloadURL(storageRef);

  // 2. Firestore에 제출 기록 저장
  await setDoc(doc(db, 'submissions', submissionId), {
    assignmentId,
    childId,
    photoUrl,
    status: 'pending',
    submittedAt: Timestamp.now(),
  });

  // 3. 스트릭 업데이트 (하루에 한 번만)
  const stats = await getChildStats(childId);
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  if (!stats.lastSubmissionDate ||
      new Date(stats.lastSubmissionDate).setHours(0,0,0,0) !== todayDate.getTime()) {
    await updateStreak(childId);
  }

  return submissionId;
}

// 제출물 반려
export async function rejectSubmission(
  submissionId: string,
  reason: string,
  reviewerId: string
): Promise<void> {
  await updateDoc(doc(db, 'submissions', submissionId), {
    status: 'rejected',
    rejectReason: reason,
    reviewedAt: Timestamp.now(),
    reviewedBy: reviewerId,
  });
}

// 제출물 승인
export async function approveSubmission(
  submissionId: string,
  reviewerId: string
): Promise<void> {
  await updateDoc(doc(db, 'submissions', submissionId), {
    status: 'approved',
    reviewedAt: Timestamp.now(),
    reviewedBy: reviewerId,
  });
}

// 확인 대기 중인 제출물 가져오기
export async function getPendingSubmissions(): Promise<Submission[]> {
  const q = query(
    collection(db, 'submissions'),
    where('status', '==', 'pending'),
    orderBy('submittedAt', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    submittedAt: doc.data().submittedAt?.toDate(),
    reviewedAt: doc.data().reviewedAt?.toDate(),
  })) as Submission[];
}

// 확인 대기 중인 제출물 + 미션 정보 함께 가져오기 (N+1 쿼리 최적화)
export async function getPendingSubmissionsWithAssignments(): Promise<
  (Submission & { assignment: Assignment | null })[]
> {
  const pending = await getPendingSubmissions();
  if (pending.length === 0) return [];

  // 중복 제거된 assignmentId 목록
  const assignmentIds = Array.from(new Set(pending.map((s) => s.assignmentId).filter(Boolean))) as string[];

  // 모든 미션을 한 번에 가져오기
  const assignments = await Promise.all(
    assignmentIds.map((id) => getAssignmentById(id))
  );

  // Map으로 변환하여 빠른 조회
  const assignmentMap = new Map<string, Assignment | null>();
  assignmentIds.forEach((id, index) => {
    assignmentMap.set(id, assignments[index]);
  });

  // 제출물에 미션 정보 병합
  return pending.map((submission) => ({
    ...submission,
    assignment: submission.assignmentId
      ? assignmentMap.get(submission.assignmentId) || null
      : null,
  }));
}

// ============================================================
// 스트릭 (Streak)
// ============================================================

// 자녀 통계 가져오기
export async function getChildStats(childId: string): Promise<ChildStats> {
  const docRef = doc(db, 'stats', childId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    // 초기 통계 생성
    const initialStats: ChildStats = {
      childId,
      currentStreak: 0,
      longestStreak: 0,
      totalSubmissions: 0,
    };
    await setDoc(docRef, initialStats);
    return initialStats;
  }

  return {
    ...docSnap.data(),
    lastSubmissionDate: docSnap.data().lastSubmissionDate?.toDate(),
  } as ChildStats;
}

// 스트릭 업데이트
export async function updateStreak(childId: string): Promise<number> {
  const stats = await getChildStats(childId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let newStreak = 1;

  if (stats.lastSubmissionDate) {
    const lastDate = new Date(stats.lastSubmissionDate);
    lastDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      // 오늘 이미 제출한 경우 (중복 제출)
      newStreak = stats.currentStreak;
    } else if (diffDays === 1) {
      // 어제 제출 -> 연속
      newStreak = stats.currentStreak + 1;
    } else {
      // 2일 이상 간격 -> 리셋
      newStreak = 1;
    }
  }

  const newLongestStreak = Math.max(stats.longestStreak, newStreak);

  await updateDoc(doc(db, 'stats', childId), {
    currentStreak: newStreak,
    longestStreak: newLongestStreak,
    totalSubmissions: stats.totalSubmissions + 1,
    lastSubmissionDate: Timestamp.now(),
  });

  return newStreak;
}

// 모든 자녀 통계 가져오기 (부모 대시보드용)
export async function getAllChildrenStats(): Promise<ChildStats[]> {
  const snapshot = await getDocs(collection(db, 'stats'));
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    lastSubmissionDate: doc.data().lastSubmissionDate?.toDate(),
  })) as ChildStats[];
}

// ============================================================
// 주간 진행률 (Weekly Progress)
// ============================================================

// 이번 주 제출 횟수 가져오기 (월요일~일요일 기준)
export async function getWeeklySubmissionCount(childId: string): Promise<{
  submitted: number;
  total: number;
}> {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = 일요일, 1 = 월요일 ...

  // 이번 주 월요일 계산 (일요일이면 지난주 월요일)
  const monday = new Date(today);
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  monday.setDate(today.getDate() - daysFromMonday);
  monday.setHours(0, 0, 0, 0);

  // 이번 주 일요일 계산
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const q = query(
    collection(db, 'submissions'),
    where('childId', '==', childId),
    where('submittedAt', '>=', Timestamp.fromDate(monday)),
    where('submittedAt', '<=', Timestamp.fromDate(sunday))
  );

  const snapshot = await getDocs(q);

  // 중복 날짜 제거 (하루에 여러 번 제출해도 1번으로 카운트)
  const uniqueDates = new Set<string>();
  snapshot.docs.forEach((doc) => {
    const submittedAt = doc.data().submittedAt?.toDate();
    if (submittedAt) {
      uniqueDates.add(format(submittedAt, 'yyyy-MM-dd'));
    }
  });

  return {
    submitted: uniqueDates.size,
    total: 7,
  };
}
