'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useUserStore } from '@/stores/userStore';
import { TopHeader, DuoButton, ProfileAvatar } from '@/components/ui';
import {
  getPendingSubmissionsWithAssignments,
  approveSubmission,
  rejectSubmission,
} from '@/lib/firestore';
import { Submission, FAMILY_MEMBERS } from '@/types';
import toast from 'react-hot-toast';

interface SubmissionWithDetails extends Submission {
  childName: string;
  childAvatar: string;
  childProfileImage: string;
  assignmentTitle: string;
  timeAgo: string;
}

const REJECT_REASONS = [
  { id: 1, icon: '📸', text: '사진이 흐려요' },
  { id: 2, icon: '❌', text: '미션이 아니에요' },
  { id: 3, icon: '🔁', text: '다시 제출 필요' },
];

export default function ReviewPage() {
  const router = useRouter();
  const { currentUser, isParent, hasHydrated } = useUserStore();

  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithDetails | null>(null);
  const [selectedReason, setSelectedReason] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // hydration 완료 전에는 아무것도 하지 않음
    if (!hasHydrated) return;

    if (!currentUser || !isParent()) {
      router.replace('/select');
      return;
    }

    loadSubmissions();
  }, [hasHydrated, currentUser, isParent, router]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      // 최적화된 함수 사용 (N+1 쿼리 제거)
      const pending = await getPendingSubmissionsWithAssignments();

      // 자녀 정보 추가
      const detailed = pending.map((sub) => {
        const child = FAMILY_MEMBERS[sub.childId];
        return {
          ...sub,
          childName: child?.name || '알 수 없음',
          childAvatar: child?.avatar || '👤',
          childProfileImage: child?.profileImage || '/profiles/son.png',
          assignmentTitle: sub.assignment?.title || '미션',
          timeAgo: formatDistanceToNow(sub.submittedAt, { addSuffix: true, locale: ko }),
        };
      });

      setSubmissions(detailed);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      toast.error('데이터를 불러오는데 실패했어요');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submission: SubmissionWithDetails) => {
    if (!currentUser) return;
    setProcessing(true);

    try {
      await approveSubmission(submission.id, currentUser.id);
      toast.success(`${submission.childName}의 미션을 승인했어요!`);
      setSubmissions((prev) => prev.filter((s) => s.id !== submission.id));
    } catch (error) {
      console.error('승인 실패:', error);
      toast.error('승인에 실패했어요');
    } finally {
      setProcessing(false);
    }
  };

  // 일괄 승인
  const handleApproveAll = async () => {
    if (!currentUser || submissions.length === 0) return;
    setProcessing(true);

    try {
      await Promise.all(
        submissions.map((sub) => approveSubmission(sub.id, currentUser.id))
      );
      toast.success(`${submissions.length}개의 미션을 모두 승인했어요!`);
      setSubmissions([]);
    } catch (error) {
      console.error('일괄 승인 실패:', error);
      toast.error('일괄 승인에 실패했어요');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission || !selectedReason || !currentUser) return;
    setProcessing(true);

    const reason = REJECT_REASONS.find((r) => r.id === selectedReason)?.text || '다시 제출 필요';

    try {
      await rejectSubmission(selectedSubmission.id, reason, currentUser.id);
      toast.success(`${selectedSubmission.childName}에게 반려 알림을 보냈어요`);
      setSubmissions((prev) => prev.filter((s) => s.id !== selectedSubmission.id));
      setShowRejectModal(false);
      setSelectedSubmission(null);
      setSelectedReason(null);
    } catch (error) {
      console.error('반려 실패:', error);
      toast.error('반려에 실패했어요');
    } finally {
      setProcessing(false);
    }
  };

  const openRejectModal = (submission: SubmissionWithDetails) => {
    setSelectedSubmission(submission);
    setShowRejectModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📋</div>
          <p className="text-white font-bold">불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopHeader title="📋 제출물 확인" onBack={() => router.back()} showStreak={false} />

      <div className="p-5">
        {submissions.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-16"
          >
            <span className="text-7xl">✨</span>
            <div className="text-white text-lg font-extrabold mt-4">
              모든 제출물을 확인했어요!
            </div>
            <div className="text-white/60 text-sm mt-2">새 제출물이 오면 알려드릴게요</div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* 일괄 승인 버튼 */}
            {submissions.length >= 1 && (
              <motion.button
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                onClick={handleApproveAll}
                disabled={processing}
                className="w-full bg-primary text-white py-3 px-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 active:translate-y-0.5 transition-transform disabled:opacity-50"
                style={{ boxShadow: '0 4px 0 #45a000' }}
              >
                <span>✓</span>
                <span>{submissions.length}개 모두 승인하기</span>
              </motion.button>
            )}
            {submissions.map((submission, index) => (
              <motion.div
                key={submission.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden"
                style={{ boxShadow: '0 4px 0 rgba(0,0,0,0.1)' }}
              >
                {/* 학생 정보 */}
                <div className="py-3.5 px-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ProfileAvatar src={submission.childProfileImage} alt={submission.childName} size="large" />
                    <div>
                      <div className="font-extrabold text-gray-500">{submission.childName}</div>
                      <div className="text-xs text-gray-400">{submission.timeAgo}</div>
                    </div>
                  </div>
                  <span className="bg-yellow-50 text-streak py-1 px-3 rounded-full text-xs font-bold">
                    확인 대기
                  </span>
                </div>

                {/* 사진 미리보기 */}
                <div className="p-4 bg-gray-100">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white">
                    {submission.photoUrl ? (
                      <img
                        src={submission.photoUrl}
                        alt="제출 사진"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                        <span className="text-5xl mb-2">📄</span>
                        <div className="text-secondary font-bold text-sm">
                          {submission.assignmentTitle}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 버튼들 */}
                <div className="py-3.5 px-4 flex gap-2.5">
                  <div className="flex-1">
                    <DuoButton
                      color="gray"
                      size="small"
                      onClick={() => openRejectModal(submission)}
                      disabled={processing}
                    >
                      <span className="text-error">반려</span>
                    </DuoButton>
                  </div>
                  <div className="flex-[2]">
                    <DuoButton
                      size="small"
                      onClick={() => handleApprove(submission)}
                      disabled={processing}
                    >
                      ✓ 승인
                    </DuoButton>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 반려 사유 선택 모달 */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-end z-50"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-3xl p-6 pb-10 w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-lg font-extrabold text-gray-500 mb-5 text-center">
                반려 사유 선택
              </div>

              <div className="space-y-2.5 mb-5">
                {REJECT_REASONS.map((reason) => (
                  <button
                    key={reason.id}
                    onClick={() => setSelectedReason(reason.id)}
                    className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                      selectedReason === reason.id
                        ? 'border-error bg-red-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <span className="text-3xl">{reason.icon}</span>
                    <span
                      className={`font-bold ${
                        selectedReason === reason.id ? 'text-error' : 'text-gray-500'
                      }`}
                    >
                      {reason.text}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex gap-2.5">
                <div className="flex-1">
                  <DuoButton
                    color="gray"
                    onClick={() => {
                      setShowRejectModal(false);
                      setSelectedReason(null);
                    }}
                  >
                    <span className="text-gray-500">취소</span>
                  </DuoButton>
                </div>
                <div className="flex-1">
                  <DuoButton
                    color="danger"
                    onClick={handleReject}
                    disabled={!selectedReason || processing}
                  >
                    반려하기
                  </DuoButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 하단 탭바 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white py-3 px-5 pb-7 flex justify-around shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
        <div className="text-center cursor-pointer" onClick={() => router.push('/parent')}>
          <div className="text-2xl">📊</div>
          <div className="text-[11px] font-bold text-gray-300">현황</div>
        </div>
        <div className="text-center">
          <div className="text-2xl">📋</div>
          <div className="text-[11px] font-bold text-primary">확인</div>
        </div>
        <div
          className="text-center cursor-pointer"
          onClick={() => router.push('/parent/assignments')}
        >
          <div className="text-2xl">📝</div>
          <div className="text-[11px] font-bold text-gray-300">미션</div>
        </div>
      </div>
    </div>
  );
}
