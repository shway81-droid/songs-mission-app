'use client';

import { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface DuoButtonProps {
  children: ReactNode;
  onClick?: () => void;
  color?: 'primary' | 'secondary' | 'streak' | 'gray' | 'white' | 'danger';
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'large';
  className?: string;
}

const colorMap = {
  primary: {
    bg: 'bg-primary',
    shadow: '#4CAD00',
    text: 'text-white',
  },
  secondary: {
    bg: 'bg-secondary',
    shadow: '#1899D6',
    text: 'text-white',
  },
  streak: {
    bg: 'bg-streak',
    shadow: '#D98000',
    text: 'text-white',
  },
  gray: {
    bg: 'bg-gray-200',
    shadow: '#CDCDCD',
    text: 'text-gray-500',
  },
  white: {
    bg: 'bg-white',
    shadow: '#E5E5E5',
    text: 'text-primary',
  },
  danger: {
    bg: 'bg-error',
    shadow: '#CC3D3D',
    text: 'text-white',
  },
};

export default function DuoButton({
  children,
  onClick,
  color = 'primary',
  disabled = false,
  fullWidth = true,
  size = 'large',
  className = '',
}: DuoButtonProps) {
  const [pressed, setPressed] = useState(false);
  const colorStyle = colorMap[color];

  const padding = size === 'large' ? 'py-4 px-6' : 'py-3 px-4';
  const fontSize = size === 'large' ? 'text-[17px]' : 'text-[15px]';

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      whileTap={{ scale: 0.98 }}
      className={`
        ${fullWidth ? 'w-full' : 'w-auto'}
        ${padding}
        ${fontSize}
        ${disabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : colorStyle.bg}
        ${disabled ? '' : colorStyle.text}
        rounded-2xl
        font-extrabold
        uppercase
        tracking-wide
        flex items-center justify-center gap-2
        transition-all duration-100
        ${className}
      `}
      style={{
        boxShadow: pressed || disabled ? 'none' : `0 4px 0 ${disabled ? '#CDCDCD' : colorStyle.shadow}`,
        transform: pressed ? 'translateY(4px)' : 'translateY(0)',
      }}
    >
      {children}
    </motion.button>
  );
}
