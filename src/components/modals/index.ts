import dynamic from 'next/dynamic';

// 동적 import로 모달 컴포넌트 로드 (코드 분할)
export const ImageViewerModal = dynamic(() => import('./ImageViewerModal'), {
  ssr: false,
  loading: () => null,
});

export const GemAdjustModal = dynamic(() => import('./GemAdjustModal'), {
  ssr: false,
  loading: () => null,
});
