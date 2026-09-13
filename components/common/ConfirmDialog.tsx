'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm rounded-xl border border-[#262626] bg-[#121212] p-5 shadow-2xl space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8A8A8A] hover:text-[#F5F1E8] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isDestructive ? 'bg-rose-500/10 text-rose-400' : 'bg-[#C6FF00]/10 text-[#C6FF00]'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#F5F1E8] tracking-tight">{title}</h3>
            <p className="text-xs text-[#8A8A8A] leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1F1F1F]">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="h-8 px-3 text-xs font-medium text-[#8A8A8A] hover:text-[#F5F1E8] hover:bg-[#1E1E1E] rounded-md transition-all duration-150"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`h-8 px-3 text-xs font-semibold rounded-md transition-all duration-150 flex items-center gap-1.5 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-[#C6FF00] hover:bg-[#b0e600] text-[#0A0A0A]'
            }`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
