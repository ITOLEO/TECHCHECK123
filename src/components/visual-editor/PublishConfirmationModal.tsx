import React from 'react';
import { CheckCircle2, X, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';

interface PublishConfirmationModalProps {
  isOpen: boolean;
  changesSummary: string[];
  isPublishing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const PublishConfirmationModal: React.FC<PublishConfirmationModalProps> = ({
  isOpen,
  changesSummary,
  isPublishing,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#16171D] rounded-2xl shadow-2xl border border-[#E9E9E6] dark:border-[#272932] overflow-hidden text-[#111111] dark:text-[#EDEDED]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-[#251E19] text-[#FF6B00] flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-black text-[#111111] dark:text-white mb-1">
            Publikasikan Perubahan ke Website?
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
            Perubahan yang Anda buat pada mode Visual Editor akan langsung aktif dan terlihat oleh semua pengunjung website.
          </p>

          {/* Changes summary */}
          {changesSummary.length > 0 && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-2">
                Daftar Perubahan yang Akan Dipublikasi:
              </span>
              <ul className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {changesSummary.map((item, idx) => (
                  <li
                    key={idx}
                    className="text-xs font-semibold text-[#111111] dark:text-neutral-200 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isPublishing}
              onClick={onCancel}
              className="px-4 py-2.5 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isPublishing}
              onClick={onConfirm}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E05E00] rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Memublikasikan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Publish Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
