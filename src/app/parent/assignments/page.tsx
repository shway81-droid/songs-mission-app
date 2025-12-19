'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { TopHeader, DuoButton, ProfileAvatar } from '@/components/ui';
import {
  createAssignment,
  updateAssignment,
  getActiveAssignments,
} from '@/lib/firestore';
import { Assignment, CHILDREN, FamilyMember } from '@/types';
import toast from 'react-hot-toast';

export default function AssignmentsPage() {
  const router = useRouter();
  const { currentUser, isParent, hasHydrated } = useUserStore();

  const [selectedChild, setSelectedChild] = useState<FamilyMember | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [gems, setGems] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivatingAssignment, setDeactivatingAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    // hydration 완료 전에는 아무것도 하지 않음
    if (!hasHydrated) return;

    if (!currentUser || !isParent()) {
      router.replace('/select');
      return;
    }

    // 첫 번째 자녀 선택
    if (CHILDREN.length > 0 && !selectedChild) {
      setSelectedChild(CHILDREN[0]);
    }
  }, [hasHydrated, currentUser, isParent, router, selectedChild]);

  useEffect(() => {
    if (!selectedChild) return;

    const loadAssignments = async () => {
      setLoading(true);
      try {
        const assignmentList = await getActiveAssignments(selectedChild.id);
        setAssignments(assignmentList);
      } catch (error) {
        console.error('미션 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, [selectedChild]);

  const handleSave = async () => {
    if (!selectedChild || !title.trim()) {
      toast.error('미션 제목을 입력해주세요');
      return;
    }

    setSaving(true);
    try {
      if (editingAssignment) {
        // 기존 미션 수정
        await updateAssignment(editingAssignment.id, {
          title: title.trim(),
          description: description.trim(),
          gems: gems,
        });
        toast.success('미션이 수정되었어요!');
      } else {
        // 새 미션 생성
        await createAssignment(selectedChild.id, title.trim(), description.trim(), gems);
        toast.success('미션이 등록되었어요!');
      }

      // 새로고침
      const updated = await getActiveAssignments(selectedChild.id);
      setAssignments(updated);
      setShowEditModal(false);
      setEditingAssignment(null);
    } catch (error) {
      console.error('저장 실패:', error);
      toast.error('저장에 실패했어요');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (assignment?: Assignment) => {
    if (assignment) {
      setEditingAssignment(assignment);
      setTitle(assignment.title);
      setDescription(assignment.description || '');
      setGems(assignment.gems || 10);
    } else {
      setEditingAssignment(null);
      setTitle('');
      setDescription('');
      setGems(10);
    }
    setShowEditModal(true);
  };

  // 미션 비활성화
  const handleDeactivate = async () => {
    if (!deactivatingAssignment || !selectedChild) return;

    setSaving(true);
    try {
      await updateAssignment(deactivatingAssignment.id, { isActive: false });
      toast.success('미션이 비활성화되었어요');
      const updated = await getActiveAssignments(selectedChild.id);
      setAssignments(updated);
      setShowDeactivateConfirm(false);
      setDeactivatingAssignment(null);
    } catch (error) {
      console.error('비활성화 실패:', error);
      toast.error('비활성화에 실패했어요');
    } finally {
      setSaving(false);
    }
  };

  const openDeactivateConfirm = (assignment: Assignment) => {
    setDeactivatingAssignment(assignment);
    setShowDeactivateConfirm(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopHeader title="📝 미션 관리" onBack={() => router.back()} showStreak={false} />

      <div className="p-5">
        {/* 자녀 선택 탭 */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {CHILDREN.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child)}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-full whitespace-nowrap transition-all ${
                selectedChild?.id === child.id
                  ? 'bg-primary text-white'
                  : 'bg-white/20 text-white'
              }`}
              style={{
                boxShadow:
                  selectedChild?.id === child.id ? '0 4px 0 #4CAD00' : 'none',
              }}
            >
              <ProfileAvatar src={child.profileImage} alt={child.name} size="small" />
              <span className="font-bold">{child.name}</span>
            </button>
          ))}
        </div>

        {/* 현재 미션들 표시 */}
        {loading ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-3 animate-bounce">📝</div>
            <p className="text-white/70 font-semibold">불러오는 중...</p>
          </div>
        ) : (
          <motion.div
            key={selectedChild?.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: '0 4px 0 rgba(0,0,0,0.1)' }}
          >
            <div className="bg-secondary py-4 px-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedChild && (
                  <ProfileAvatar src={selectedChild.profileImage} alt={selectedChild.name} size="large" />
                )}
                <div>
                  <div className="text-white/80 text-xs font-bold">활성 미션</div>
                  <div className="text-white text-lg font-extrabold">
                    {selectedChild?.name} ({assignments.length}개)
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

            <div className="p-5">
              {assignments.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="bg-gray-100 rounded-xl p-4 border-2 border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-extrabold text-gray-600 text-base mb-1">
                            {assignment.title}
                          </div>
                          {assignment.description && (
                            <div className="text-gray-400 text-sm leading-relaxed">
                              {assignment.description}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 bg-blue-100 rounded-full px-2.5 py-1 ml-2">
                          <span className="text-sm">💎</span>
                          <span className="text-blue-600 font-bold text-sm">
                            {assignment.gems || 10}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(assignment)}
                          className="flex-1 py-2 px-3 rounded-lg bg-gray-200 text-gray-600 font-bold text-sm"
                        >
                          ✏️ 수정
                        </button>
                        <button
                          onClick={() => openDeactivateConfirm(assignment)}
                          className="flex-1 py-2 px-3 rounded-lg bg-red-100 text-red-500 font-bold text-sm"
                        >
                          🗑️ 종료
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 mb-4">
                  <span className="text-5xl block mb-3">📭</span>
                  <p className="text-gray-400 font-semibold">
                    등록된 미션이 없어요
                  </p>
                </div>
              )}

              <DuoButton onClick={() => openEditModal()}>➕ 새 미션 추가</DuoButton>
            </div>
          </motion.div>
        )}

        {/* 안내 문구 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-5 p-3.5 bg-white/10 rounded-xl"
        >
          <div className="text-white text-[13px] leading-relaxed flex items-start gap-2.5">
            <span className="text-xl">💡</span>
            <div>
              <strong>자녀별로 여러 미션을 등록할 수 있어요!</strong>
              <br />
              미션마다 보상 젬(💎)을 다르게 설정할 수 있어요.
            </div>
          </div>
        </motion.div>
      </div>

      {/* 미션 편집 모달 */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-end z-50"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-3xl p-6 pb-10 w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-lg font-extrabold text-gray-500 mb-5 text-center">
                {editingAssignment ? '미션 수정' : '새 미션 등록'}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-500 mb-2">
                  미션 제목 *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 수학 문제집 42~45쪽"
                  className="w-full p-4 rounded-xl border-2 border-gray-200 font-semibold text-gray-500 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-500 mb-2">
                  설명 (선택)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="예: 분수의 덧셈과 뺄셈 문제를 풀고 사진으로 제출해요"
                  rows={3}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 font-semibold text-gray-500 focus:border-primary focus:outline-none resize-none"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-500 mb-2">
                  보상 젬 💎
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setGems(Math.max(1, gems - 5))}
                    className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-500"
                  >
                    -
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={gems}
                      onChange={(e) => setGems(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                      min={1}
                      max={100}
                      className="w-full p-4 rounded-xl border-2 border-gray-200 font-bold text-center text-xl text-blue-600 focus:border-primary focus:outline-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl">💎</span>
                  </div>
                  <button
                    onClick={() => setGems(Math.min(100, gems + 5))}
                    className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-500"
                  >
                    +
                  </button>
                </div>
                <div className="flex justify-center gap-2 mt-3">
                  {[5, 10, 15, 20, 30].map((value) => (
                    <button
                      key={value}
                      onClick={() => setGems(value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                        gems === value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5">
                <div className="flex-1">
                  <DuoButton
                    color="gray"
                    onClick={() => setShowEditModal(false)}
                    disabled={saving}
                  >
                    <span className="text-gray-500">취소</span>
                  </DuoButton>
                </div>
                <div className="flex-1">
                  <DuoButton onClick={handleSave} disabled={saving || !title.trim()}>
                    {saving ? '저장 중...' : '저장하기'}
                  </DuoButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 미션 비활성화 확인 모달 */}
      <AnimatePresence>
        {showDeactivateConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-5"
            onClick={() => setShowDeactivateConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-[320px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-5">
                <span className="text-5xl block mb-3">🗑️</span>
                <div className="text-lg font-extrabold text-gray-500 mb-2">
                  미션을 종료할까요?
                </div>
                <div className="text-sm text-gray-400">
                  종료된 미션은 더 이상 자녀에게 표시되지 않아요.
                  <br />새 미션을 등록할 수 있어요.
                </div>
              </div>

              <div className="flex gap-2.5">
                <div className="flex-1">
                  <DuoButton
                    color="gray"
                    onClick={() => setShowDeactivateConfirm(false)}
                    disabled={saving}
                  >
                    <span className="text-gray-500">취소</span>
                  </DuoButton>
                </div>
                <div className="flex-1">
                  <DuoButton
                    color="danger"
                    onClick={handleDeactivate}
                    disabled={saving}
                  >
                    {saving ? '처리 중...' : '종료하기'}
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
        <div className="text-center cursor-pointer" onClick={() => router.push('/parent/review')}>
          <div className="text-2xl">📋</div>
          <div className="text-[11px] font-bold text-gray-300">확인</div>
        </div>
        <div className="text-center">
          <div className="text-2xl">📝</div>
          <div className="text-[11px] font-bold text-primary">미션</div>
        </div>
      </div>
    </div>
  );
}
