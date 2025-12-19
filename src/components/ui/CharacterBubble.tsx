'use client';

import { motion } from 'framer-motion';

interface CharacterBubbleProps {
  message: string;
  character?: string;
}

export default function CharacterBubble({
  message,
  character = '🦉',
}: CharacterBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 mb-5"
    >
      {/* 캐릭터 아바타 */}
      <div
        className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-[32px] flex-shrink-0"
        style={{
          border: '4px solid #4CAD00',
          boxShadow: '0 4px 0 #4CAD00',
        }}
      >
        {character}
      </div>

      {/* 말풍선 */}
      <div
        className="bg-white rounded-[20px] rounded-bl-[4px] py-3.5 px-4 max-w-[240px]"
        style={{ boxShadow: '0 4px 0 #E5E5E5' }}
      >
        <p className="font-bold text-gray-500 text-[15px] leading-relaxed whitespace-pre-line">
          {message}
        </p>
      </div>
    </motion.div>
  );
}
