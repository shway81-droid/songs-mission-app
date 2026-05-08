'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DuoButton } from '@/components/ui';

interface GemAdjustModalProps {
  isOpen: boolean;
  childName: string;
  currentGems: number;
  onClose: () => void;
  onConfirm: (amount: number, isAdd: boolean) => void;
}

export default function GemAdjustModal({
  isOpen,
  childName,
  currentGems,
  onClose,
  onConfirm,
}: GemAdjustModalProps) {
  const [amount, setAmount] = useState(10);
  const [isAdd, setIsAdd] = useState(true);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(amount, isAdd);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 w-full max-w-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-xl font-extrabold text-gray-700 mb-4">
            💎 {childName} 젬 조정
          </h3>

          {/* 현재 젬 */}
          <div className="text-center mb-4 p-3 bg-gray-100 rounded-xl">
            <div className="text-sm text-gray-400">현재 보유</div>
            <div className="text-2xl font-black text-primary">{currentGems} 젬</div>
          </div>

          {/* 추가/차감 선택 */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setIsAdd(true)}
              className={`flex-1 py-2 rounded-xl font-bold transition-colors ${
                isAdd ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
              }`}
            >
              ➕ 추가
            </button>
            <button
              onClick={() => setIsAdd(false)}
              className={`flex-1 py-2 rounded-xl font-bold transition-colors ${
                !isAdd ? 'bg-error text-white' : 'bg-gray-100 text-gray-400'
              }`}
            >
              ➖ 차감
            </button>
          </div>

          {/* 금액 선택 */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[5, 10, 20, 50].map((value) => (
              <button
                key={value}
                onClick={() => setAmount(value)}
                className={`py-2 rounded-xl font-bold transition-colors ${
                  amount === value
                    ? 'bg-secondary text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {value}
              </button>
            ))}
          </div>

          {/* 직접 입력 */}
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
            className="w-full p-3 border-2 border-gray-200 rounded-xl text-center font-bold mb-4"
            min="1"
          />

          {/* 결과 미리보기 */}
          <div className="text-center mb-4 text-sm">
            <span className="text-gray-400">변경 후: </span>
            <span className={`font-bold ${isAdd ? 'text-primary' : 'text-error'}`}>
              {isAdd ? currentGems + amount : Math.max(0, currentGems - amount)} 젬
            </span>
          </div>

          {/* 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold"
            >
              취소
            </button>
            <div className="flex-1">
              <DuoButton
                color={isAdd ? 'primary' : 'orange'}
                size="small"
                onClick={handleConfirm}
              >
                {isAdd ? '추가하기' : '차감하기'}
              </DuoButton>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
