'use client';

import Image from 'next/image';

interface ProfileAvatarProps {
  src: string;
  alt: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const sizeMap = {
  small: { container: 'w-8 h-8', pixels: 32 },
  medium: { container: 'w-12 h-12', pixels: 48 },
  large: { container: 'w-16 h-16', pixels: 64 },
};

export function ProfileAvatar({ src, alt, size = 'medium', className = '' }: ProfileAvatarProps) {
  const { container, pixels } = sizeMap[size];

  return (
    <div className={`${container} rounded-full overflow-hidden flex-shrink-0 ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={pixels}
        height={pixels}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
