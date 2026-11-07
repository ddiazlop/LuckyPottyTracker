import React, { useState } from 'react';
import {
  Dog,
  Volume2,
  VolumeX,
  Vibrate,
  RotateCcw,
  Download,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { DogProfile, PottyRecord, DogLifeStage } from '../types';
import { createBackupFile, serializeBackupFile } from '../storage/backupFile';
import { downloadTextFile } from '../utils/downloadTextFile';
import { haptics } from '../utils/haptics';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  dog: DogProfile;
  onSaveProfile: (profile: DogProfile) => void;
  onResetData: () => void;
  onLoadSampleData: () => void;
  records: PottyRecord[];
  onImportRecords: (records: PottyRecord[]) => Promise<boolean>;
}

const LIFE_STAGE_STYLES: Record<DogLifeStage, string> = {
  puppy:
    'data-[state=on]:border-amber-500 data-[state=on]:bg-amber-500/10 data-[state=on]:text-amber-900 data-[state=on]:shadow-xs data-[state=on]:ring-2 data-[state=on]:ring-amber-500/30',
  adult:
    'data-[state=on]:border-blue-500 data-[state=on]:bg-blue-500/10 data-[state=on]:text-blue-900 data-[state=on]:shadow-xs data-[state=on]:ring-2 data-[state=on]:ring-blue-500/30',
  senior:
    'data-[state=on]:border-purple-500 data-[state=on]:bg-purple-500/10 data-[state=on]:text-purple-900 data-[state=on]:shadow-xs data-[state=on]:ring-2 data-[state=on]:ring-purple-500/30',
};

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  dog,
  onSaveProfile,
  onResetData,
  onLoadSampleData,
  records,
  onImportRecords,
}) => {
  const [name, setName] = useState(dog.name);
  const [breed, setBreed] = useState(dog.breed);
  const [lifeStage, setLifeStage] = useState<DogLifeStage>(
    dog.lifeStage || (dog.isPuppy ? 'puppy' : 'adult')
  );
  const [targetInterval, setTargetInterval] = useState(dog.targetIntervalHours);
  const [soundEnabled, setSoundEnabled] = useState(haptics.isSoundEnabled());
  const [hapticsEnabled, setHapticsEnabled] = useState(haptics.isHapticsEnabled());

  const handleSave = () => {
    haptics.triggerTick();
    onSaveProfile({
      ...dog,
      name: name.trim() || 'My Dog',
      breed: breed.trim() || 'Dog',
      lifeStage,
      isPuppy: lifeStage === 'puppy',
      targetIntervalHours: Number(targetInterval) || 4,
    });
    onClose();
  };

  const handleExport = () => {
    haptics.triggerTick();
    const backupFile = createBackupFile(dog, records);
    const backupFileName = `${dog.name.toLowerCase().replace(/\s+/g, '_')}_pawspot_backup_${Date.now()}.json`;

    downloadTextFile(backupFileName, serializeBackupFile(backupFile));
    toast.success('Backup exported', {
      description: `${records.length} records and ${dog.name}'s profile saved to a file.`,
    });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileReader = new FileReader();
    fileReader.readAsText(selectedFile, 'UTF-8');
    fileReader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!Array.isArray(parsed)) return;

        const isImported = await onImportRecords(parsed);
        if (!isImported) return;

        haptics.triggerBothFeedback();
        toast.success(`Successfully imported ${parsed.length} records!`);
      } catch {
        toast.error('Invalid JSON file format.');
      }
    };
  };

  const handleLifeStageChange = (value: string) => {
    if (!value) return;
    haptics.triggerTick();
    const stage = value as DogLifeStage;
    setLifeStage(stage);

    if (stage === 'puppy' && targetInterval > 3) setTargetInterval(2.5);
    if (stage === 'adult' && (targetInterval < 3 || targetInterval > 6)) setTargetInterval(4);
    if (stage === 'senior' && targetInterval > 4.5) setTargetInterval(3.5);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-md">
        {/* Header */}
        <DialogHeader>
          <DialogTitle>
            <Dog className="w-5 h-5 text-amber-600" />
            Dog Profile &amp; App Settings
          </DialogTitle>
          <DialogDescription>
            Tune {dog.name}&apos;s routine, feedback options and local data.
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-4 text-xs">
          {/* Dog Name */}
          <div className="space-y-1.5">
            <Label htmlFor="dog-name">Dog&apos;s Name</Label>
            <Input
              id="dog-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-semibold"
              placeholder="e.g. Lucky"
            />
          </div>

          {/* Breed */}
          <div className="space-y-1.5">
            <Label htmlFor="dog-breed">Breed / Mix</Label>
            <Input
              id="dog-breed"
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="font-medium"
              placeholder="e.g. Golden Retriever"
            />
          </div>

          {/* Life Stage Selection */}
          <div>
            <Label className="mb-1.5">Life Stage</Label>
            <ToggleGroup
              type="single"
              value={lifeStage}
              onValueChange={handleLifeStageChange}
              className="grid w-full grid-cols-3 gap-2"
            >
              {(
                [
                  { id: 'puppy', emoji: '🐾', label: 'Puppy', age: '< 1 year' },
                  { id: 'adult', emoji: '🐕', label: 'Adult', age: '1–7 years' },
                  { id: 'senior', emoji: '🦴', label: 'Senior', age: '7+ years' },
                ] as const
              ).map((stage) => (
                <ToggleGroupItem
                  key={stage.id}
                  value={stage.id}
                  className={cn(
                    'flex h-auto w-full flex-col items-start justify-between gap-0 rounded-2xl border border-slate-200 bg-slate-50/70 p-2.5 text-left text-slate-600 hover:bg-slate-100',
                    LIFE_STAGE_STYLES[stage.id]
                  )}
                >
                  <span className="text-xl mb-1">{stage.emoji}</span>
                  <span>
                    <span className="font-bold text-xs block leading-tight">{stage.label}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{stage.age}</span>
                  </span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              {lifeStage === 'puppy' && '🐾 Puppies have developing bladders: require frequent breaks (1.5–3h) and quick post-meal timing.'}
              {lifeStage === 'adult' && '🐕 Adults have mature bladder control: comfortably hold 4–6h with a steady daily routine.'}
              {lifeStage === 'senior' && '🦴 Senior dogs need gentler pacing, frequent relief (2.5–4h), and arthritis/mobility consideration.'}
            </p>
          </div>

          {/* Target Daytime Hold Interval */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Target Hold Time (Hours)</Label>
              <span className="font-bold text-amber-700 tabular-nums">{targetInterval} hours</span>
            </div>
            <Slider
              min={1}
              max={8}
              step={0.5}
              value={[targetInterval]}
              onValueChange={([value]) => setTargetInterval(value)}
            />
            <p className="text-[11px] text-slate-600 mt-2">
              Typical hold times: Puppies 1.5–3h • Adults 4–6h • Seniors 2.5–4h
            </p>
          </div>

          {/* Tactile & Sound Settings */}
          <div className="space-y-2.5 pt-1">
            <Separator />
            <span className="font-bold text-slate-900 block pt-1">Expressive Feedback</span>

            {/* Haptic vibration */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Vibrate className="w-4 h-4 text-slate-500" />
                <span className="text-slate-700 font-medium">Haptic Vibration</span>
              </div>
              <Switch
                checked={hapticsEnabled}
                aria-label="Toggle haptic vibration"
                onCheckedChange={(next) => {
                  setHapticsEnabled(next);
                  haptics.setHapticsEnabled(next);
                  if (next) haptics.triggerPeeFeedback();
                }}
              />
            </div>

            {/* Tactile Sound FX */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-slate-500" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-slate-700 font-medium">Tactile Sound Effects</span>
              </div>
              <Switch
                checked={soundEnabled}
                aria-label="Toggle tactile sound effects"
                onCheckedChange={(next) => {
                  setSoundEnabled(next);
                  haptics.setSoundEnabled(next);
                  if (next) haptics.triggerPeeFeedback();
                }}
              />
            </div>
          </div>

          {/* Data Controls */}
          <div className="space-y-2 pt-1">
            <Separator />
            <span className="font-bold text-slate-900 block pt-1">Data &amp; Sample Set</span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="soft"
                onClick={() => {
                  haptics.triggerTick();
                  onLoadSampleData();
                }}
                className="h-auto py-2 text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Sample Data</span>
              </Button>

              <Button variant="soft" onClick={handleExport} className="h-auto py-2 text-xs">
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Backup</span>
              </Button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <Button variant="ghost" asChild className="h-auto px-0 text-slate-600 hover:bg-transparent hover:text-slate-900">
                <label className="cursor-pointer font-medium">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="sr-only"
                  />
                </label>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="link"
                    onClick={() => haptics.triggerUndo()}
                    className="h-auto p-0 text-xs font-medium text-rose-600 hover:text-rose-700"
                  >
                    Clear All Records
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all potty records?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This removes every recorded event for {dog.name} from this device. This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onResetData}>Clear All Records</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => {
              haptics.triggerTick();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
