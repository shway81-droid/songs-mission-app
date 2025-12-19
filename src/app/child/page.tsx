'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { TopHeader, CharacterBubble, ProgressBar, DuoButton } from '@/components/ui';
import {
  getActiveAssignments,
  getTodaySubmission,
  getChildStats,
  getWeeklySubmissionCount,
  getTodayCompletedAssignmentIds,
} from '@/lib/firestore';
import { Assignment, Submission, ChildStats } from '@/types';

export default function ChildHomePage() {
  const router = useRouter();
  const { currentUser, isChild, clearCurrentUser, hasHydrated } = useUserStore();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [todaySubmission, setTodaySubmission] = useState<Submission | null>(null);
  const [completedAssignmentIds, setCompletedAssignmentIds] = useState<string[]>([]);
  const [stats, setStats] = useState<ChildStats | null>(null);
  const [weekProgress, setWeekProgress] = useState({ submitted: 0, total: 7 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // hydration 완료 전에는 아무것도 하지 않음
    if (!hasHydrated) return;

    if (!currentUser || !isChild()) {
      router.replace('/select');
      return;
    }

    const loadData = async () => {
      try {
        const [assignmentsData, submissionData, completedIds, statsData, weeklyData] = await Promise.all([
          getActiveAssignments(currentUser.id),
          getTodaySubmission(currentUser.id),
          getTodayCompletedAssignmentIds(currentUser.id),
          getChildStats(currentUser.id),
          getWeeklySubmissionCount(currentUser.id),
        ]);
        setAssignments(assignmentsData);
        setTodaySubmission(submissionData);
        setCompletedAssignmentIds(completedIds);
        setStats(statsData);
        setWeekProgress(weeklyData);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [hasHydrated, currentUser, isChild, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📚</div>
          <p className="text-white font-bold">불러오는 중...</p>
        </div>
      </div>
    );
  }

  const streak = stats?.currentStreak || 0;
  const hasRejected = todaySubmission?.status === 'rejected';
  const hasSubmittedToday = todaySubmission && todaySubmission.status !== 'rejected';

  // 완료된 미션과 미완료 미션 분리 및 정렬
  const sortedAssignments = [...assignments].sort((a, b) => {
    const aCompleted = completedAssignmentIds.includes(a.id);
    const bCompleted = completedAssignmentIds.includes(b.id);
    if (aCompleted && !bCompleted) return 1; // 완료된 것은 아래로
    if (!aCompleted && bCompleted) return -1;
    return 0;
  });

  const completedCount = completedAssignmentIds.length;
  const totalCount = assignments.length;
  const allCompleted = totalCount > 0 && completedCount >= totalCount;

  const getMessage = () => {
    const name = currentUser?.name || '';
    if (hasRejected) {
      return `앗! ${name}! 미션이 반려됐어 😅\n다시 제출해줘!`;
    }
    if (allCompleted) {
      return `대단해 ${name}! 🎉\n오늘 미션 모두 완료했어!`;
    }
    if (completedCount > 0) {
      return `잘하고 있어 ${name}! 💪\n${totalCount - completedCount}개 더 하면 오늘 완료!`;
    }
    return `안녕 ${name}! 오늘도 화이팅! 🎉\n${streak > 0 ? `${streak}일 연속 제출 중이야!` : '오늘부터 시작해보자!'}`;
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      <TopHeader streak={streak} />

      <div className="p-5">
        {/* 캐릭터 인사 */}
        <CharacterBubble message={getMessage()} />

        {/* 반려 알림 카드 */}
        {hasRejected && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-4 p-4 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, #FF4B4B 0%, #FF6B6B 100%)',
              boxShadow: '0 4px 0 #CC3D3D',
            }}
          >
            <div className="flex items-center gap-3 text-white mb-3">
              <span className="text-3xl">🔴</span>
              <div>
                <div className="font-extrabold text-[15px]">반려된 미션이 있어요!</div>
                <div className="text-[13px] opacity-90">
                  📸 {todaySubmission?.rejectReason || '다시 제출해주세요'}
                </div>
              </div>
            </div>
            <DuoButton color="white" size="small" onClick={() => router.push('/child/camera')}>
              <span className="text-error">다시 제출하기</span>
            </DuoButton>
          </motion.div>
        )}

        {/* 오늘의 미션 카드 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl overflow-hidden mb-4"
          style={{ boxShadow: '0 4px 0 rgba(0,0,0,0.1)' }}
        >
          <div className="bg-primary py-3.5 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{allCompleted ? '🎉' : '📝'}</span>
              <div>
                <div className="text-white/85 text-[12px] font-bold">오늘의 미션</div>
                <div className="text-white text-[17px] font-extrabold">
                  {totalCount > 0 ? (
                    allCompleted ? '모두 완료!' : `완료 ${completedCount}/${totalCount}`
                  ) : '미션 없음'}
                </div>
              </div>
            </div>
            {assignments.length > 0 && (
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                <span className="text-lg">💎</span>
                <span className="text-white font-bold text-sm">
                  {assignments.reduce((sum, a) => sum + (a.gems || 10), 0)}
                </span>
              </div>
            )}
          </div>

          <div className="p-4">
            {sortedAssignments.length > 0 ? (
              <div className="space-y-3 mb-3.5">
                {sortedAssignments.map((assignment) => {
                  const isCompleted = completedAssignmentIds.includes(assignment.id);
                  return (
                    <div
                      key={assignment.id}
                      onClick={() => !isCompleted && router.push(`/child/camera?assignmentId=${assignment.id}`)}
                      className={`rounded-xl p-3.5 border-2 transition-all ${
                        isCompleted
                          ? 'bg-green-50 border-primary/30 cursor-default'
                          : 'bg-gray-100 border-gray-200 cursor-pointer active:scale-[0.98]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2.5 flex-1">
                          {/* 체크마크 또는 빈 원 */}
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isCompleted
                              ? 'bg-primary text-white'
                              : 'border-2 border-gray-300 bg-white'
                          }`}>
                            {isCompleted && <span className="text-sm font-bold">✓</span>}
                          </div>
                          <div className="flex-1">
                            <div className={`font-extrabold mb-1 text-[16px] ${
                              isCompleted ? 'text-primary' : 'text-gray-600'
                            }`}>
                              {assignment.title}
                            </div>
                            {assignment.description && (
                              <div className={`text-[13px] leading-relaxed ${
                                isCompleted ? 'text-primary/60' : 'text-gray-400'
                              }`}>
                                {assignment.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 rounded-full px-2 py-1 ml-2 ${
                          isCompleted ? 'bg-primary/20' : 'bg-blue-100'
                        }`}>
                          <span className="text-sm">💎</span>
                          <span className={`font-bold text-xs ${
                            isCompleted ? 'text-primary' : 'text-blue-600'
                          }`}>
                            {assignment.gems || 10}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-100 rounded-xl p-3.5 mb-3.5 border-2 border-gray-200 text-center">
                <div className="text-gray-400 text-[14px]">아직 등록된 미션이 없어요</div>
              </div>
            )}

            <ProgressBar
              current={completedCount}
              total={totalCount || 1}
              label="오늘 진행률"
            />

            <DuoButton
              onClick={() => router.push('/child/camera')}
              disabled={allCompleted || assignments.length === 0}
            >
              {allCompleted ? '✓ 오늘 완료!' : `📷 제출하러 가기 (${totalCount - completedCount}개 남음)`}
            </DuoButton>
          </div>
        </motion.div>

        {/* 연속 제출 스트릭 카드 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-4 mb-4 text-white"
          style={{
            background: 'linear-gradient(135deg, #FF9600 0%, #FFB800 100%)',
            boxShadow: '0 4px 0 #D98000',
          }}
        >
          <div className="flex items-center gap-3.5 mb-3.5">
            <span className="text-[40px]">🔥</span>
            <div>
              <div className="text-[13px] font-bold opacity-90">연속 제출</div>
              <div className="text-[32px] font-black">{streak}일</div>
            </div>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div
                key={day}
                className="flex-1 h-2 rounded-full"
                style={{
                  background:
                    day <= streak ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)',
                }}
              />
            ))}
          </div>
          <div className="mt-2.5 text-[13px] font-bold opacity-90">
            {7 - streak > 0 ? `${7 - streak}일 더 하면 주간 완료! 🎁` : '이번 주 완벽 달성! 🏆'}
          </div>
        </motion.div>

        {/* 달력 버튼 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => router.push('/child/calendar')}
          className="bg-white rounded-2xl p-4 flex items-center justify-between cursor-pointer active:translate-y-1 transition-transform"
          style={{ boxShadow: '0 4px 0 rgba(0,0,0,0.1)' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">📅</span>
            <div>
              <div className="font-extrabold text-gray-500 text-[15px]">내 기록 보기</div>
              <div className="text-[13px] text-gray-400">달력에서 제출 현황을 확인해요</div>
            </div>
          </div>
          <span className="text-xl text-gray-300">→</span>
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
    </div>
  );
}
