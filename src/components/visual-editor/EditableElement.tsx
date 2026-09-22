import React, { useState } from 'react';
import { Edit3 } from 'lucide-react';

interface EditableElementProps {
  isEditMode: boolean;
  label: string;
  onEdit: () => void;
  children: React.ReactNode;
  className?: string;
  badgePosition?: 'top-right' | 'top-left' | 'bottom-right' | 'center';
}

export const EditableElement: React.FC<EditableElementProps> = ({
  isEditMode,
  label,
  onEdit,
  children,
  className = '',
  badgePosition = 'top-right',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // When not in visual edit mode, return child exactly as-is without any extra wrapper behavior
  if (!isEditMode) {
    return <>{children}</>;
  }

  const getPositionClasses = () => {
    switch (badgePosition) {
      case 'top-left':
        return 'top-2 left-2';
      case 'bottom-right':
        return 'bottom-2 right-2';
      case 'center':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      case 'top-right':
      default:
        return 'top-2 right-2';
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        // Prevent accidental navigation when clicking editable element in visual edit mode
        e.preventDefault();
        e.stopPropagation();
        onEdit();
      }}
      className={`relative group/editable cursor-pointer transition-all ${
        isHovered
          ? 'outline-dashed outline-2 outline-[#FF6B00] outline-offset-4 rounded-xl'
          : ''
      } ${className}`}
      title={`Click to edit ${label}`}
    >
      {children}

      {/* Floating subtle Edit badge visible on hover only in Edit Mode */}
      {isHovered && (
        <div
          className={`absolute ${getPositionClasses()} z-40 pointer-events-none animate-in fade-in zoom-in-95 duration-150`}
        >
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-white bg-[#111111] dark:bg-[#1D1F27] border border-[#FF6B00] rounded-lg shadow-xl shadow-black/30 backdrop-blur-md">
            <Edit3 className="w-3 h-3 text-[#FF6B00]" />
            <span>Edit {label}</span>
          </span>
        </div>
      )}
    </div>
  );
};
