import React from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';

const MotionButton = motion.create(Button);

interface MealLogButtonProps {
  dogName: string;
  onRecordMeal: () => void;
}

export const MealLogButton: React.FC<MealLogButtonProps> = ({ dogName, onRecordMeal }) => {
  return (
    <MotionButton
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.96 }}
      onClick={onRecordMeal}
      variant="ghost"
      className="h-auto min-h-[52px] w-full justify-between gap-2.5 whitespace-normal rounded-2xl border border-emerald-400/30 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-4 py-3 text-xs font-bold text-white shadow-md shadow-emerald-700/15 hover:bg-transparent hover:brightness-105 sm:px-5 sm:text-sm"
    >
      <span className="flex items-center gap-2.5">
        <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-base">
          🥣
        </span>
        <span className="text-left">
          <span className="block leading-tight font-extrabold">
            LOG MEAL / FED {dogName.toUpperCase()}
          </span>
          <span className="text-[10px] font-normal text-emerald-100 block">
            Compare digestion &amp; potty delay in stats
          </span>
        </span>
      </span>
      <span className="text-[11px] font-bold bg-white/20 px-2.5 py-1 rounded-lg text-emerald-50 shrink-0">
        Feed 🍖
      </span>
    </MotionButton>
  );
};
