import { CHILDREN } from '@/types';
import ChildDetailClient from './ChildDetailClient';

// Static export를 위한 경로 생성
export function generateStaticParams() {
  return CHILDREN.map((child) => ({
    id: child.id,
  }));
}

export default function ChildDetailPage() {
  return <ChildDetailClient />;
}
