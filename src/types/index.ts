// 가족 구성원 타입
export type FamilyRole = 'child' | 'parent';

export interface FamilyMember {
  id: string;
  name: string;
  role: FamilyRole;
  avatar: string;
  profileImage: string;
}

// 미션 타입
export interface Assignment {
  id: string;
  childId: string;
  title: string;
  description?: string;
  gems: number; // 완료 시 받는 젬(다이아몬드) 개수
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 제출 상태 타입
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

// 제출물 타입
export interface Submission {
  id: string; // {YYYY-MM-DD}_{childId}
  assignmentId: string;
  childId: string;
  photoUrl: string;
  status: SubmissionStatus;
  rejectReason?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

// 자녀 통계 타입
export interface ChildStats {
  childId: string;
  currentStreak: number;
  longestStreak: number;
  totalSubmissions: number;
  lastSubmissionDate?: Date;
}

// 가족 구성원 상수
export const FAMILY_MEMBERS: Record<string, FamilyMember> = {
  son: { id: 'son', name: '송현준', role: 'child', avatar: '👦', profileImage: '/profiles/son.png' },
  daughter: { id: 'daughter', name: '송민주', role: 'child', avatar: '👧', profileImage: '/profiles/daughter.png' },
  dad: { id: 'dad', name: '아빠', role: 'parent', avatar: '👨', profileImage: '/profiles/dad.png' },
  mom: { id: 'mom', name: '엄마', role: 'parent', avatar: '👩', profileImage: '/profiles/mom.png' },
};

// 자녀 목록 헬퍼
export const CHILDREN = Object.values(FAMILY_MEMBERS).filter(m => m.role === 'child');
export const PARENTS = Object.values(FAMILY_MEMBERS).filter(m => m.role === 'parent');
