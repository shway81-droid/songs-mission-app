'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { DuoButton } from '@/components/ui';
import { getChildStats } from '@/lib/firestore';

export default function SuccessPage() {
  const router = useRouter();
  const { currentUser, isChild, hasHydrated } = useUserStore();
  const [streak, setStreak] = useState(1);

  useEffect(() => {
    // hydration 완료 전에는 아무것도 하지 않음
    if (!hasHydrated) return;

    if (!currentUser || !isChild()) {
      router.replace('/select');
      return;
    }

    // 최신 스트릭 가져오기
    getChildStats(currentUser.id).then((stats) => {
      setStreak(stats.currentStreak);
    });
  }, [hasHydrated, currentUser, isChild, router]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-5 text-center"
      style={{
        background: 'linear-gradient(180deg, #58CC02 0%, #78E100 100%)',
      }}
    >
      {/* 축하 애니메이션 */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="text-[100px] mb-5"
      >
        🎉
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-white text-[32px] font-black mb-2"
        style={{ textShadow: '0 4px 0 rgba(0,0,0,0.2)' }}
      >
        제출 완료!
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-white/90 text-base font-semibold mb-8"
      >
        오늘도 미션을 완료했어요!
      </motion.div>

      {/* 스트릭 업데이트 카드 */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white/20 rounded-[20px] p-6 backdrop-blur-sm mb-8 w-full max-w-[300px]"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-[48px]"
          >
            🔥
          </motion.span>
          <div className="text-left">
            <div className="text-white/85 text-sm font-bold">연속 제출 기록</div>
            <div className="text-white text-4xl font-black">{streak}일!</div>
          </div>
        </div>

        <div className="flex gap-1.5 justify-center">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <motion.div
              key={day}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5 + day * 0.05 }}
              className="w-8 h-2 rounded-full"
              style={{
                background: day <= streak ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>

        {streak < 7 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-3 text-sm text-white/90 font-bold"
          >
            +1 🔥 내일도 도전!
          </motion.div>
        )}
      </motion.div>

      {/* 젬 획득 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-white/15 rounded-full py-3 px-6 flex items-center gap-2 mb-8"
      >
        <span className="text-2xl">💎</span>
        <span className="text-white font-extrabold text-lg">+10 젬 획득!</span>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-[300px]"
      >
        <DuoButton color="white" onClick={() => router.push('/child')}>
          <span className="text-primary">홈으로 돌아가기</span>
        </DuoButton>
      </motion.div>

      {/* 파티클 효과 (간단한 버전) */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            opacity: 1,
            scale: 0,
            x: 0,
            y: 0,
          }}
          animate={{
            opacity: 0,
            scale: 1,
            x: Math.cos((i / 12) * Math.PI * 2) * 150,
            y: Math.sin((i / 12) * Math.PI * 2) * 150,
          }}
          transition={{
            duration: 1,
            delay: 0.2,
            ease: 'easeOut',
          }}
          className="absolute text-2xl pointer-events-none"
          style={{
            top: '30%',
            left: '50%',
          }}
        >
          {['⭐', '✨', '🌟', '💫'][i % 4]}
        </motion.div>
      ))}
    </div>
  );
}
