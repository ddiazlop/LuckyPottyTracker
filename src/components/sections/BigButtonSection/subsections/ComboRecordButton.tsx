import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { PottyLocation } from '@/types';
import { Button } from '@/components/ui/button';

const MotionButton = motion.create(Button);

interface ComboRecordButtonProps {
  selectedLocation: PottyLocation;
  onRecordBoth: () => void;
}

export const ComboRecordButton: React.FC<ComboRecordButtonProps> = ({
  selectedLocation,
  onRecordBoth,
}) => {
  return (
    <MotionButton
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.96 }}
      onClick={onRecordBoth}
      variant="ghost"
      className="h-auto min-h-[52px] w-full gap-2.5 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500 to-stone-800 p-3 text-xs font-bold text-white shadow-md shadow-slate-900/10 hover:bg-transparent hover:brightness-105 sm:text-sm"
    >
      <Sparkles className="w-4 h-4 text-amber-200" />
      <span>Recorded Both (Pee + Poop) at {selectedLocation}</span>
    </MotionButton>
  );
};
