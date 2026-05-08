'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useUserStore } from '@/stores/userStore';
import { ProgressBar, ProfileAvatar } from '@/components/ui';
import {
  getAllChildrenStats,
  getTodaySubmission,
  getPendingSubmissions,
  getSubmissionsByMonth,
} from '@/lib/firestore';
import { CHILDREN, ChildStats, Submission, FAMILY_MEMBERS } from '@/types';

interface ChildStatus {
  id: string;
  name: string;
  avatar: string;
  profileImage: string;
  submitted: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  streak: number;
  totalGems: number;
  monthlySubmissions: number;
}

export default function ParentDashboardPage() {
  const router = useRouter();
  const { currentUser, isParent, clearCurrentUser, hasHydrated } = useUserStore();

  const [childStatuses, setChildStatuses] = useState<ChildStatus[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const today = format(new Date(), 'M월 d일 EEEE', { locale: ko });

  useEffect(() => {
    // hydration 완료 전에는 아무것도 하지 않음
    if (!hasHydrated) return;

    if (!currentUser || !isParent()) {
      router.replace('/select');
      return;
    }

    const loadData = async () => {
      try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        // 각 자녀의 오늘 제출 현황 가져오기
        const statuses: ChildStatus[] = await Promise.all(
          CHILDREN.map(async (child) => {
            const [submission, stats, monthlySubmissions] = await Promise.all([
              getTodaySubmission(child.id),
              getAllChildrenStats().then(
                (allStats) =>
                  allStats.find((s) => s.childId === child.id) || {
                    childId: child.id,
                    currentStreak: 0,
                    longestStreak: 0,
                    totalSubmissions: 0,
                    totalGems: 0,
                  }
              ),
              getSubmissionsByMonth(child.id, currentYear, currentMonth),
            ]);

            return {
              id: child.id,
              name: child.name,
              avatar: child.avatar,
              profileImage: child.profileImage,
              submitted: !!submission,
              status: submission?.status,
              streak: stats.currentStreak,
              totalGems: stats.totalGems ?? 0,
              monthlySubmissions: monthlySubmissions.length,
            };
          })
        );

        setChildStatuses(statuses);

        // 확인 대기 제출물 수
        const pending = await getPendingSubmissions();
        setPendingCount(pending.length);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [hasHydrated, currentUser, isParent, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📊</div>
          <p className="text-white font-bold">불러오는 중...</p>
        </div>
      </div>
    );
  }

  const submittedCount = childStatuses.filter((c) => c.submitted).length;
  const totalCount = childStatuses.length;
  const submissionRate = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 헤더 */}
      <div className="bg-background-dark py-4 px-5 flex justify-between items-center">
        <div className="text-white text-lg font-extrabold flex items-center gap-2">
          {currentUser?.profileImage && (
            <ProfileAvatar src={currentUser.profileImage} alt={currentUser.name} size="small" />
          )}
          송가네 미션 앱
        </div>
        <div className="bg-white/20 py-1.5 px-3.5 rounded-full text-white text-[13px] font-bold">
          {today}
        </div>
      </div>

      <div className="p-5">
        {/* 자녀별 현황 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-5"
        >
          <div className="text-white font-extrabold text-base mb-3">
            👨‍👩‍👧‍👦 자녀별 현황
            <span className="text-white/60 text-xs font-semibold ml-2">(탭하여 상세보기)</span>
          </div>
          <div className="space-y-3">
            {childStatuses.map((child) => (
              <motion.div
                key={child.id}
                onClick={() => router.push(`/parent/child/${child.id}`)}
                className="bg-white rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                style={{ boxShadow: '0 4px 0 rgba(0,0,0,0.1)' }}
                whileTap={{ scale: 0.98 }}
              >
                {/* 상단: 프로필 + 상태 */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ProfileAvatar src={child.profileImage} alt={child.name} size="large" />
                    <div>
                      <div className="font-extrabold text-gray-700">{child.name}</div>
                      <div className="text-xs text-streak font-bold flex items-center gap-1">
                        <span>🔥</span>
                        {child.streak}일 연속
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`py-1.5 px-3 rounded-full text-xs font-bold ${
                        child.submitted
                          ? child.status === 'rejected'
                            ? 'bg-red-100 text-error'
                            : child.status === 'pending'
                              ? 'bg-yellow-100 text-streak'
                              : 'bg-green-100 text-primary'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {child.submitted
                        ? child.status === 'rejected'
                          ? '반려됨'
                          : child.status === 'pending'
                            ? '확인 대기'
                            : '제출 완료'
                        : '미제출'}
                    </div>
                    <span className="text-gray-300 text-lg">→</span>
                  </div>
                </div>

                {/* 하단: 젬 + 제출 수 */}
                <div className="px-4 pb-4 pt-0">
                  <div className="flex gap-3 border-t border-gray-100 pt-3">
                    <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
                      <div className="text-xl font-black text-streak">
                        💎 {child.totalGems}
                      </div>
                      <div className="text-[10px] text-gray-400 font-bold mt-1">보유 젬</div>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
                      <div className="text-xl font-black text-secondary">
                        📸 {child.monthlySubmissions}
                      </div>
                      <div className="text-[10px] text-gray-400 font-bold mt-1">이번 달 제출</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 확인 대기 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => router.push('/parent/review')}
          className="bg-white rounded-2xl p-4 cursor-pointer active:translate-y-1 transition-transform"
          style={{ boxShadow: '0 4px 0 rgba(0,0,0,0.1)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📋</span>
              <div>
                <div className="font-extrabold text-gray-500 text-[15px]">제출물 확인하기</div>
                <div className="text-[13px] text-gray-400">
                  {pendingCount > 0
                    ? `${pendingCount}개의 새 제출물이 있어요`
                    : '모든 제출물을 확인했어요'}
                </div>
              </div>
            </div>
            {pendingCount > 0 && (
              <div className="bg-streak text-white py-1 px-3 rounded-full text-sm font-extrabold">
                {pendingCount}
              </div>
            )}
          </div>
        </motion.div>

        {/* 미션 관리 버튼 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => router.push('/parent/assignments')}
          className="bg-white rounded-2xl p-4 mt-4 cursor-pointer active:translate-y-1 transition-transform"
          style={{ boxShadow: '0 4px 0 rgba(0,0,0,0.1)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📝</span>
              <div>
                <div className="font-extrabold text-gray-500 text-[15px]">미션 관리</div>
                <div className="text-[13px] text-gray-400">자녀별 미션을 등록/수정해요</div>
              </div>
            </div>
            <span className="text-xl text-gray-300">→</span>
          </div>
        </motion.div>

        {/* 사용자 전환 버튼 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <button
            onClick={() => {
              clearCurrentUser();
              router.push('/select');
            }}
            className="text-white/50 text-sm font-semibold underline"
          >
            다른 사람으로 전환
          </button>
        </motion.div>
      </div>

      {/* 하단 탭바 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white py-3 px-5 pb-7 flex justify-around shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
        <div className="text-center">
          <div className="text-2xl">📊</div>
          <div className="text-[11px] font-bold text-primary">현황</div>
        </div>
        <div className="text-center cursor-pointer" onClick={() => router.push('/parent/review')}>
          <div className="text-2xl">📋</div>
          <div className="text-[11px] font-bold text-gray-300">확인</div>
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
