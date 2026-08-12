import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="font-extrabold text-base text-slate-100">{title || 'Are you sure?'}</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{message}</p>
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800 text-xs">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 font-semibold hover:bg-slate-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md cursor-pointer"
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}
