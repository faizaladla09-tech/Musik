import React from 'react';

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: { isOpen: boolean, title?: string, message: string, onConfirm: () => void, onCancel: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="liquid-glass rounded-2xl p-6 w-full max-w-sm border border-white/15 shadow-2xl">
        {title && <h2 className="text-xl font-bold text-white mb-2">{title}</h2>}
        <p className="text-white/80 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-xs font-semibold text-white/80 liquid-glass-pill hover:text-white transition-all">
            Batal
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-xl text-xs font-semibold text-black bg-white liquid-glass-button hover:bg-gray-200 transition-all">
            Oke
          </button>
        </div>
      </div>
    </div>
  );
}

export function AlertModal({ isOpen, title, message, onClose }: { isOpen: boolean, title?: string, message: string, onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="liquid-glass rounded-2xl p-6 w-full max-w-sm border border-white/15 shadow-2xl">
        {title && <h2 className="text-xl font-bold text-white mb-2">{title}</h2>}
        <p className="text-white/80 text-sm mb-6">{message}</p>
        <button onClick={onClose} className="w-full py-2.5 rounded-xl text-xs font-semibold text-black bg-white liquid-glass-button hover:bg-gray-200 transition-all">
          Tutup
        </button>
      </div>
    </div>
  );
}
