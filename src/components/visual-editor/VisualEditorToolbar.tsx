import React from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  Sun,
  Moon,
  Save,
  CheckCircle2,
  RotateCcw,
  RotateCw,
  Trash2,
  LayoutDashboard,
  LogOut,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useTheme } from '../../services/theme';

export type DeviceViewport = 'desktop' | 'tablet' | 'mobile';

interface VisualEditorToolbarProps {
  deviceViewport: DeviceViewport;
  onSelectViewport: (viewport: DeviceViewport) => void;
  hasUnsavedChanges: boolean;
  changesCount: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSaveDraft: () => void;
  onOpenPublishModal: () => void;
  onDiscardChanges: () => void;
  onGoToDashboard: () => void;
  onExitEditor: () => void;
}

export const VisualEditorToolbar: React.FC<VisualEditorToolbarProps> = ({
  deviceViewport,
  onSelectViewport,
  hasUnsavedChanges,
  changesCount,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSaveDraft,
  onOpenPublishModal,
  onDiscardChanges,
  onGoToDashboard,
  onExitEditor,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#111111]/95 backdrop-blur-md text-white border-b border-neutral-800 shadow-xl select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#FF6B00] text-white flex items-center justify-center font-black text-xs shadow-sm">
              TC
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-sm">Visual Editor</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Live Preview
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-neutral-800">
            {hasUnsavedChanges ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>{changesCount} Perubahan Draft</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold text-neutral-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Semua tersimpan</span>
              </span>
            )}
          </div>
        </div>

        {/* Center: Device Switcher & Theme Toggle */}
        <div className="flex items-center gap-2 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800">
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => onSelectViewport('desktop')}
              title="Desktop View (100%)"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                deviceViewport === 'desktop'
                  ? 'bg-neutral-800 text-white shadow-xs font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onSelectViewport('tablet')}
              title="Tablet View (768px)"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                deviceViewport === 'tablet'
                  ? 'bg-neutral-800 text-white shadow-xs font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onSelectViewport('mobile')}
              title="Mobile View (375px)"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                deviceViewport === 'mobile'
                  ? 'bg-neutral-800 text-white shadow-xs font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-px h-4 bg-neutral-800" />

          {/* Theme Preview Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode Preview' : 'Switch to Dark Mode Preview'}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-neutral-300" />
            )}
          </button>

          {/* Undo & Redo */}
          <div className="hidden sm:flex items-center gap-0.5 pl-1 border-l border-neutral-800">
            <button
              type="button"
              disabled={!canUndo}
              onClick={onUndo}
              title="Undo change"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <button
              type="button"
              disabled={!canRedo}
              onClick={onRedo}
              title="Redo change"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={onDiscardChanges}
              title="Batalkan perubahan yang belum dipublikasikan"
              className="px-2.5 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer hidden lg:flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={onSaveDraft}
            className="px-3 py-1.5 text-xs font-bold text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save Draft</span>
          </button>

          <button
            type="button"
            onClick={onOpenPublishModal}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E05E00] rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Publish</span>
          </button>

          <div className="w-px h-4 bg-neutral-800 mx-1 hidden sm:block" />

          {/* Switch to Mode 1: Traditional Admin Dashboard */}
          <button
            type="button"
            onClick={onGoToDashboard}
            className="px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-700 hover:border-neutral-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Beralih ke Dashboard Tradisional Superadmin"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span className="hidden xl:inline">Dashboard</span>
          </button>

          {/* Exit Visual Editor */}
          <button
            type="button"
            onClick={onExitEditor}
            className="px-2.5 py-1.5 text-xs font-semibold text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1"
            title="Keluar dari Visual Editor ke Website Publik"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </div>
    </header>
  );
};
