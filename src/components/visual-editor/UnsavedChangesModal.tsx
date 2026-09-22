import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onContinueEditing: () => void;
  onDiscardChanges: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onContinueEditing,
  onDiscardChanges,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onContinueEditing}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-[#16171D] rounded-2xl shadow-2xl border border-[#E9E9E6] dark:border-[#272932] p-6 text-[#111111] dark:text-[#EDEDED]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-base font-extrabold text-[#111111] dark:text-white mb-1.5">
          Perubahan Belum Disimpan!
        </h3>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-5">
          Anda memiliki perubahan draft yang belum dipublikasikan. Jika Anda keluar sekarang, perubahan yang belum disimpan akan hilang.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <button
            type="button"
            onClick={onDiscardChanges}
            className="w-full py-2.5 px-4 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl transition-colors cursor-pointer"
          >
            Discard Changes
          </button>
          <button
            type="button"
            onClick={onContinueEditing}
            className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E05E00] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Continue Editing
          </button>
        </div>
      </div>
    </div>
  );
};
