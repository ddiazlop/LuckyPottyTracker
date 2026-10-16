import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { haptics } from '../utils/haptics';

export interface ToastMessage {
  id: string;
  title: string;
  subtitle?: string;
  onUndo?: () => void;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto pointer-events-auto"
        >
          <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 border border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-100 truncate">{toast.title}</p>
                {toast.subtitle && (
                  <p className="text-[11px] text-slate-400 truncate">{toast.subtitle}</p>
                )}
              </div>
            </div>

            {toast.onUndo && (
              <button
                onClick={() => {
                  haptics.triggerUndo();
                  toast.onUndo?.();
                  onClose();
                }}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-400 text-xs font-semibold rounded-lg flex items-center gap-1 shrink-0 transition-transform"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Undo</span>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
