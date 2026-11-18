import React, { useState } from 'react';
import { DogProfile, PottyLocation, PottyRecord, PottyType } from '@/types';
import { haptics } from '@/utils/haptics';
import { ComboRecordButton } from './subsections/ComboRecordButton';
import { LocationSelector } from './subsections/LocationSelector';
import { MealLogButton } from './subsections/MealLogButton';
import { PottyTypeActionGrid } from './subsections/PottyTypeActionGrid';
import { QuickNoteTray } from './subsections/QuickNoteTray';
import { TimeOffsetSelector } from './subsections/TimeOffsetSelector';

interface BigButtonSectionProps {
  dog: DogProfile;
  onAddRecord: (record: Omit<PottyRecord, 'id'>) => void;
}

export const BigButtonSection: React.FC<BigButtonSectionProps> = ({ dog, onAddRecord }) => {
  const [selectedLocation, setSelectedLocation] = useState<PottyLocation>('Walk');
  const [isIndoorsShaking, setIsIndoorsShaking] = useState<boolean>(false);
  const [selectedTimeOffsetMinutes, setSelectedTimeOffsetMinutes] = useState<number>(0);
  const [isNoteTrayOpen, setIsNoteTrayOpen] = useState<boolean>(false);
  const [noteText, setNoteText] = useState<string>('');

  const isIndoorsSelected = selectedLocation === 'Indoors';

  const handleSelectLocation = (location: PottyLocation) => {
    if (location === 'Indoors') {
      haptics.triggerUndo();
      setIsIndoorsShaking(true);
      setTimeout(() => setIsIndoorsShaking(false), 500);
    } else {
      haptics.triggerTick();
    }
    setSelectedLocation(location);
  };

  const handleSelectTimeOffset = (offsetMinutes: number) => {
    haptics.triggerTick();
    setSelectedTimeOffsetMinutes(offsetMinutes);
  };

  const triggerPottyTypeHapticFeedback = (pottyType: PottyType) => {
    if (pottyType === 'pee') {
      haptics.triggerPeeFeedback();
    } else if (pottyType === 'poop') {
      haptics.triggerPoopFeedback();
    } else if (pottyType === 'both') {
      haptics.triggerBothFeedback();
    } else {
      haptics.triggerMealFeedback();
    }
  };

  const handleRecordPottyType = (pottyType: PottyType) => {
    triggerPottyTypeHapticFeedback(pottyType);

    const recordTimestamp = Date.now() - selectedTimeOffsetMinutes * 60 * 1000;

    onAddRecord({
      dogId: dog.id,
      type: pottyType,
      timestamp: recordTimestamp,
      isAccident: pottyType === 'meal' ? false : isIndoorsSelected,
      location: selectedLocation,
      notes: noteText.trim() || undefined,
    });

    if (noteText) setNoteText('');
    if (selectedTimeOffsetMinutes !== 0) setSelectedTimeOffsetMinutes(0);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-3 flex flex-col gap-4">
      <LocationSelector
        selectedLocation={selectedLocation}
        dogName={dog.name}
        isIndoorsShaking={isIndoorsShaking}
        onSelectLocation={handleSelectLocation}
      />

      <TimeOffsetSelector
        selectedOffsetMinutes={selectedTimeOffsetMinutes}
        onSelectOffsetMinutes={handleSelectTimeOffset}
      />

      <PottyTypeActionGrid
        selectedLocation={selectedLocation}
        onRecordPottyType={handleRecordPottyType}
      />

      <ComboRecordButton
        selectedLocation={selectedLocation}
        onRecordBoth={() => handleRecordPottyType('both')}
      />

      <MealLogButton
        dogName={dog.name}
        onRecordMeal={() => handleRecordPottyType('meal')}
      />

      <QuickNoteTray
        isOpen={isNoteTrayOpen}
        noteText={noteText}
        onOpenChange={setIsNoteTrayOpen}
        onNoteTextChange={setNoteText}
      />
    </div>
  );
};
