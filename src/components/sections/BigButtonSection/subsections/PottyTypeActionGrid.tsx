import React from 'react';
import { motion } from 'motion/react';
import { Droplets } from 'lucide-react';
import { PottyLocation, PottyType } from '@/types';
import { Button } from '@/components/ui/button';

const MotionButton = motion.create(Button);

interface PottyTypeActionButtonProps {
  pottyType: PottyType;
  actionLabel: string;
  selectedLocation: PottyLocation;
  icon: React.ReactNode;
  buttonClassName: string;
  subtitleClassName: string;
  onRecordPottyType: (pottyType: PottyType) => void;
}

const PottyTypeActionButton: React.FC<PottyTypeActionButtonProps> = ({
  pottyType,
  actionLabel,
  selectedLocation,
  icon,
  buttonClassName,
  subtitleClassName,
  onRecordPottyType,
}) => {
  return (
    <MotionButton
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.94 }}
      onClick={() => onRecordPottyType(pottyType)}
      variant="ghost"
      className={`group relative h-auto min-h-[160px] w-full flex-col gap-0 overflow-hidden rounded-3xl border p-5 text-white shadow-lg hover:bg-transparent hover:brightness-105 ${buttonClassName}`}
    >
      <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
      {icon}
      <span className="text-2xl font-extrabold tracking-tight">{actionLabel}</span>
      <span className={`text-xs font-medium mt-1 ${subtitleClassName}`}>
        Record at {selectedLocation}
      </span>
    </MotionButton>
  );
};

interface PottyTypeActionGridProps {
  selectedLocation: PottyLocation;
  onRecordPottyType: (pottyType: PottyType) => void;
}

export const PottyTypeActionGrid: React.FC<PottyTypeActionGridProps> = ({
  selectedLocation,
  onRecordPottyType,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3.5">
      <PottyTypeActionButton
        pottyType="pee"
        actionLabel="PEE"
        selectedLocation={selectedLocation}
        onRecordPottyType={onRecordPottyType}
        buttonClassName="border-amber-300/40 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-amber-500/25"
        subtitleClassName="text-amber-100"
        icon={
          <span className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mb-3 shadow-inner">
            <Droplets className="w-9 h-9 text-white drop-shadow-sm" />
          </span>
        }
      />

      <PottyTypeActionButton
        pottyType="poop"
        actionLabel="POOP"
        selectedLocation={selectedLocation}
        onRecordPottyType={onRecordPottyType}
        buttonClassName="border-stone-600/40 bg-gradient-to-br from-amber-800 via-stone-800 to-amber-950 shadow-amber-950/20"
        subtitleClassName="text-stone-300"
        icon={
          <span className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center mb-3 shadow-inner text-3xl">
            💩
          </span>
        }
      />
    </div>
  );
};
