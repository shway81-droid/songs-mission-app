'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useUserStore } from '@/stores/userStore';
import { ProfileAvatar } from '@/components/ui';
import {
  getChildStats,
  getSubmissionsWithAssignments,
  addGems,
  subtractGems,
} from '@/lib/firestore';
import { FAMILY_MEMBERS, ChildStats, Submission, Assignment } from '@/types';

type SubmissionWithAssignment = Submission & { assignment: Assignment | null };

export default function ChildDetailClient() {
  const router = useRouter();
  const params = useParams();
  const childId = params.id as string;

  const { currentUser, isParent, hasHydrated } = useUserStore();

  const [child, setChild] = useState(FAMILY_MEMBERS[childId]);
  const [stats, setStats] = useState<ChildStats | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionWithAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  // 사진 보기 모달
  const [selectedPhoto, setSelectedPhoto] = useState<SubmissionWithAssignment | null>(null);

  // 젬 조정 모달
  const [showGemModal, setShowGemModal] = useState(false);
  const [gemAdjustType, setGemAdjustType] = useState<'add' | 'subtract'>('add');
  const [gemAmount, setGemAmount] = useState(10);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!currentUser || !isParent()) {
      router.replace('/select');
      return;
    }

    if (!FAMILY_MEMBERS[childId] || FAMILY_MEMBERS[childId].role !== 'child') {
      router.replace('/parent');
      return;
    }

    setChild(FAMILY_MEMBERS[childId]);
    loadData();
  }, [hasHydrated, currentUser, isParent, childId, router, selectedMonth]);

  const loadData = async () => {
    try {
      const [statsData, submissionsData] = await Promise.all([
        getChildStats(childId),
        getSubmissionsWithAssignments(childId, selectedMonth.year, selectedMonth.month),
      ]);

      setStats(statsData);
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      toast.error('데이터를 불러오는데 실패했어요');
    } finally {
      setLoading(false);
    }
  };

  const handleGemAdjust = async () => {
    if (!stats) return;

    try {
      if (gemAdjustType === 'add') {
        await addGems(childId, gemAmount);
        toast.success(`${gemAmount} 젬을 추가했어요! 💎`);
      } else {
        await subtractGems(childId, gemAmount);
        toast.success(`${gemAmount} 젬을 차감했어요`);
      }

      // 상태 새로고침
      const newStats = await getChildStats(childId);
      setStats(newStats);
      setShowGemModal(false);
    } catch (error) {
      console.error('젬 조정 실패:', error);
      toast.error('젬 조정에 실패했어요');
    }
  };

  const quickGemAdjust = async (amount: number) => {
    if (!stats) return;

    try {
      if (amount > 0) {
        await addGems(childId, amount);
        toast.success(`+${amount} 젬! 💎`);
      } else {
        await subtractGems(childId, Math.abs(amount));
        toast.success(`${amount} 젬`);
      }

      const newStats = await getChildStats(childId);
      setStats(newStats);
    } catch (error) {
      console.error('젬 조정 실패:', error);
      toast.error('젬 조정에 실패했어요');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return { bg: 'bg-green-100', text: 'text-primary', label: '승인됨' };
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-streak', label: '대기 중' };
      case 'rejected':
        return { bg: 'bg-red-100', text: 'text-error', label: '반려됨' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-400', label: status };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">👤</div>
          <p className="text-white font-bold">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!child || !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-white">
          <p>자녀 정보를 찾을 수 없어요</p>
          <button onClick={() => router.back()} className="mt-4 underline">
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* 헤더 */}
      <div className="bg-background-dark py-4 px-5">
        <button
          onClick={() => router.back()}
          className="text-white font-bold flex items-center gap-2"
        >
          <span>←</span> 돌아가기
        </button>
      </div>

      <div className="p-5">
        {/* 프로필 카드 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl p-6 text-center mb-5"
          style={{ boxShadow: '0 4px 0 rgba(0,0,0,0.1)' }}
        >
          <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden border-4 border-primary">
            <img
              src={child.profileImage}
              alt={child.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-2xl font-black text-gray-700">{child.name}</div>
          <div className="text-streak font-bold mt-1">🔥 {stats.currentStreak}일 연속 제출 중!</div>
        </motion.div>

        {/* 젬 관리 카드 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 mb-5 text-white"
          style={{
            background: 'linear-gradient(135deg, #FF9600 0%, #FFB800 100%)',
            boxShadow: '0 4px 0 #D98000',
          }}
        >
          <div className="text-sm font-bold opacity-90 mb-1">💎 보유 젬</div>
          <div className="text-5xl font-black text-center my-4">{stats.totalGems}</div>

          {/* 빠른 조정 버튼 */}
          <div className="flex gap-2 justify-center mb-4">
            {[5, 10, 20].map((amount) => (
              <button
                key={`add-${amount}`}
                onClick={() => quickGemAdjust(amount)}
                className="px-4 py-2 rounded-full border-2 border-white/50 text-sm font-bold hover:bg-white/20 transition-colors"
              >
                +{amount}
              </button>
            ))}
            <button
              onClick={() => quickGemAdjust(-10)}
              className="px-4 py-2 rounded-full border-2 border-white/50 text-sm font-bold hover:bg-white/20 transition-colors"
            >
              -10
            </button>
          </div>

          {/* 상세 조정 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setGemAdjustType('subtract');
                setGemAmount(10);
                setShowGemModal(true);
              }}
              className="flex-1 py-3 rounded-xl bg-white/30 font-bold text-center"
            >
              ➖ 차감
            </button>
            <button
              onClick={() => {
                setGemAdjustType('add');
                setGemAmount(10);
                setShowGemModal(true);
              }}
              className="flex-1 py-3 rounded-xl bg-white font-bold text-center text-streak"
              style={{ boxShadow: '0 4px 0 rgba(0,0,0,0.1)' }}
            >
              ➕ 추가
            </button>
          </div>
        </motion.div>

        {/* 제출 기록 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 4px 0 rgba(0,0,0,0.1)' }}
        >
          {/* 헤더 */}
          <div
            className="p-4 flex justify-between items-center"
            style={{ background: '#1CB0F6' }}
          >
            <span className="text-white font-extrabold">📸 제출 기록</span>
            <select
              value={`${selectedMonth.year}-${selectedMonth.month}`}
              onChange={(e) => {
                const [year, month] = e.target.value.split('-').map(Number);
                setSelectedMonth({ year, month });
                setLoading(true);
              }}
              className="bg-white/20 text-white px-3 py-1.5 rounded-full text-sm font-bold border-none outline-none cursor-pointer"
            >
              {Array.from({ length: 6 }, (_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                return (
                  <option
                    key={i}
                    value={`${d.getFullYear()}-${d.getMonth() + 1}`}
                    className="text-gray-700"
                  >
                    {d.getFullYear()}년 {d.getMonth() + 1}월
                  </option>
                );
              })}
            </select>
          </div>

          {/* 제출 목록 */}
          <div className="p-4">
            {submissions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">📭</div>
                <p>이 달에 제출한 기록이 없어요</p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((submission) => {
                  const badge = getStatusBadge(submission.status);
                  return (
                    <div
                      key={submission.id}
                      onClick={() => setSelectedPhoto(submission)}
                      className="flex gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      {/* 썸네일 */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        <img
                          src={submission.photoUrl}
                          alt="제출 사진"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-400 font-semibold">
                          {format(submission.submittedAt, 'M월 d일 (EEE)', { locale: ko })}
                        </div>
                        <div className="font-bold text-gray-700 text-sm truncate">
                          {submission.assignment?.title || '미션'}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              submission.status === 'approved'
                                ? 'bg-primary'
                                : submission.status === 'pending'
                                  ? 'bg-streak'
                                  : 'bg-error'
                            }`}
                          />
                          <span className={`text-xs font-semibold ${badge.text}`}>
                            {badge.label}
                          </span>
                          {submission.status === 'approved' && submission.assignment && (
                            <span className="text-xs font-bold text-streak">
                              +{submission.assignment.gems} 💎
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {submissions.length > 0 && (
              <div className="text-center mt-4 text-gray-400 text-xs">
                👆 항목을 탭하면 사진을 크게 볼 수 있어요
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* 젬 조정 모달 */}
      <AnimatePresence>
        {showGemModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-end z-50"
            onClick={() => setShowGemModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full rounded-t-3xl p-6 pb-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="text-xl font-extrabold text-gray-700">
                  {gemAdjustType === 'add' ? '💎 젬 추가' : '💎 젬 차감'}
                </div>
              </div>

              {/* 금액 선택 */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {[5, 10, 20, 30, 50, 100].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setGemAmount(amount)}
                    className={`py-3 rounded-xl font-bold text-sm transition-colors ${
                      gemAmount === amount
                        ? 'bg-streak text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {amount}
                  </button>
                ))}
              </div>

              {/* 직접 입력 */}
              <div className="mb-6">
                <input
                  type="number"
                  value={gemAmount}
                  onChange={(e) => setGemAmount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full text-center text-3xl font-black py-4 border-2 border-gray-200 rounded-xl focus:border-streak outline-none"
                  min={1}
                />
              </div>

              {/* 버튼 */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowGemModal(false)}
                  className="flex-1 py-4 rounded-xl bg-gray-100 font-bold text-gray-600"
                >
                  취소
                </button>
                <button
                  onClick={handleGemAdjust}
                  className={`flex-1 py-4 rounded-xl font-bold text-white ${
                    gemAdjustType === 'add' ? 'bg-primary' : 'bg-error'
                  }`}
                  style={{ boxShadow: `0 4px 0 ${gemAdjustType === 'add' ? '#4CAD00' : '#CC3D3D'}` }}
                >
                  {gemAdjustType === 'add' ? `+${gemAmount} 추가` : `-${gemAmount} 차감`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 사진 보기 모달 */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 헤더 정보 */}
              <div className="bg-white rounded-t-xl p-4">
                <div className="font-bold text-gray-700">
                  {selectedPhoto.assignment?.title || '미션'}
                </div>
                <div className="text-sm text-gray-400">
                  {format(selectedPhoto.submittedAt, 'yyyy년 M월 d일 HH:mm', { locale: ko })}
                </div>
              </div>

              {/* 사진 */}
              <img
                src={selectedPhoto.photoUrl}
                alt="제출 사진"
                className="max-w-full max-h-[60vh] object-contain bg-white"
              />

              {/* 닫기 버튼 */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="w-full bg-white rounded-b-xl py-4 font-bold text-gray-600"
              >
                닫기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
