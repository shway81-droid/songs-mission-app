'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { FAMILY_MEMBERS, FamilyMember } from '@/types';
import toast from 'react-hot-toast';

// 부모님 비밀번호 (환경변수로 설정 가능)
const PARENT_PIN = process.env.NEXT_PUBLIC_PARENT_PIN || '1234';

export default function SelectPage() {
  const router = useRouter();
  const { setCurrentUser } = useUserStore();

  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState<FamilyMember | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSelect = (member: FamilyMember) => {
    if (member.role === 'child') {
      setCurrentUser(member.id);
      router.push('/child');
    } else {
      // 부모님 선택 시 비밀번호 모달 표시
      setSelectedParent(member);
      setShowPinModal(true);
      setPin('');
      setError(false);
    }
  };

  const handlePinInput = (digit: string) => {
    if (pin.length >= 4) return;

    const newPin = pin + digit;
    setPin(newPin);
    setError(false);

    // 4자리 입력 완료 시 확인
    if (newPin.length === 4) {
      if (newPin === PARENT_PIN) {
        // 비밀번호 일치
        if (selectedParent) {
          setCurrentUser(selectedParent.id);
          setShowPinModal(false);
          router.push('/parent');
        }
      } else {
        // 비밀번호 불일치
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 500);
        toast.error('비밀번호가 틀렸어요');
      }
    }
  };

  const handlePinDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const children = Object.values(FAMILY_MEMBERS).filter((m) => m.role === 'child');
  const parents = Object.values(FAMILY_MEMBERS).filter((m) => m.role === 'parent');

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <div className="flex-1 px-5 py-10 flex flex-col">
        {/* 상단 뱃지 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-center mb-6"
        >
          <div className="bg-white rounded-full py-2 px-4 shadow-sm flex items-center gap-2">
            <span className="text-lg">📚</span>
            <span className="text-primary font-bold text-sm">Family Space</span>
          </div>
        </motion.div>

        {/* 메인 타이틀 */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-[#1A1A2E] text-[32px] font-black mb-2">
            송가네 미션 앱
          </h1>
          <p className="text-gray-500 text-base font-semibold">
            오늘도 힘차게 시작해볼까요?
          </p>
        </motion.div>

        {/* 가족 구성원 그리드 */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto w-full">
          {/* 자녀 카드 */}
          {children.map((member, index) => (
            <motion.button
              key={member.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              onClick={() => handleSelect(member)}
              className="bg-white rounded-2xl p-6 flex flex-col items-center active:scale-95 transition-transform"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            >
              {/* 프로필 이미지 */}
              <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-4 border-blue-200">
                <Image
                  src={member.profileImage}
                  alt={member.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* 역할 라벨 */}
              <span className="text-gray-400 text-xs font-semibold mb-1">자녀</span>
              {/* 이름 */}
              <span className="text-[#1A1A2E] font-extrabold text-lg">
                {member.name}
              </span>
            </motion.button>
          ))}

          {/* 부모 카드 */}
          {parents.map((member, index) => (
            <motion.button
              key={member.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              onClick={() => handleSelect(member)}
              className="bg-white rounded-2xl p-6 flex flex-col items-center active:scale-95 transition-transform"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            >
              {/* 프로필 이미지 */}
              <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-4 border-green-200">
                <Image
                  src={member.profileImage}
                  alt={member.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* 역할 라벨 */}
              <span className="text-gray-400 text-xs font-semibold mb-1">부모님</span>
              {/* 이름 */}
              <span className="text-[#1A1A2E] font-extrabold text-lg">
                {member.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 하단 안내 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="p-6 text-center"
      >
        <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
          <span>🔒</span>
          <span className="font-medium">가족 전용 앱이에요. 외부인은 사용할 수 없어요!</span>
        </div>
      </motion.div>

      {/* 비밀번호 입력 모달 */}
      <AnimatePresence>
        {showPinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-5"
            onClick={() => setShowPinModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-xs"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 헤더 */}
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🔐</div>
                <h3 className="text-xl font-extrabold text-gray-800">
                  비밀번호 입력
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  4자리 비밀번호를 입력하세요
                </p>
              </div>

              {/* PIN 표시 */}
              <div className="flex justify-center gap-3 mb-6">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
                    transition={{ duration: 0.3 }}
                    className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-colors ${
                      error
                        ? 'border-red-400 bg-red-50'
                        : pin.length > i
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    {pin.length > i ? '●' : ''}
                  </motion.div>
                ))}
              </div>

              {/* 숫자 키패드 */}
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (item === 'del') {
                        handlePinDelete();
                      } else if (item !== null) {
                        handlePinInput(String(item));
                      }
                    }}
                    disabled={item === null}
                    className={`h-14 rounded-xl text-xl font-bold transition-all ${
                      item === null
                        ? 'invisible'
                        : item === 'del'
                          ? 'bg-gray-100 text-gray-500 active:bg-gray-200'
                          : 'bg-gray-100 text-gray-700 active:bg-primary active:text-white'
                    }`}
                  >
                    {item === 'del' ? '⌫' : item}
                  </button>
                ))}
              </div>

              {/* 취소 버튼 */}
              <button
                onClick={() => setShowPinModal(false)}
                className="w-full mt-4 py-3 text-gray-400 font-semibold"
              >
                취소
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
