'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';

// 루트 페이지: 로그인 상태에 따라 리다이렉트
export default function Home() {
  const router = useRouter();
  const { currentUser, isChild, isParent } = useUserStore();

  useEffect(() => {
    if (!currentUser) {
      // 사용자가 선택되지 않음 -> 가족 선택 화면
      router.replace('/select');
    } else if (isChild()) {
      // 자녀 -> 자녀 홈 화면
      router.replace('/child');
    } else if (isParent()) {
      // 부모 -> 부모 대시보드
      router.replace('/parent');
    }
  }, [currentUser, isChild, isParent, router]);

  // 로딩 화면
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">📚</div>
        <p className="text-white text-lg font-bold">송가네 미션 앱</p>
      </div>
    </div>
  );
}
