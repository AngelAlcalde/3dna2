import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ConfirmModal: React.FC = () => {
  const { confirmModal, closeConfirmModal } = useApp();
  const [typedKeyword, setTypedKeyword] = useState('');

  useEffect(() => {
    setTypedKeyword('');
  }, [confirmModal.isOpen]);

  if (!confirmModal.isOpen) return null;

  const requiresTyping = Boolean(confirmModal.requireKeyword);
  const isKeywordMatching = requiresTyping
    ? typedKeyword.trim().toUpperCase() === confirmModal.requireKeyword?.toUpperCase()
    : true;

  const handleConfirm = () => {
    if (!isKeywordMatching) return;
    confirmModal.onConfirm();
    closeConfirmModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className={`p-5 flex items-center justify-between border-b ${
          confirmModal.isDestructive
            ? 'bg-rose-50/70 border-rose-100 text-rose-900'
            : 'bg-amber-50/70 border-amber-100 text-amber-900'
        }`}>
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                confirmModal.isDestructive
                  ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                  : 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
              }`}
            >
              {confirmModal.isDestructive ? (
                <Trash2 className="w-5 h-5 stroke-[2.2]" />
              ) : (
                <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {confirmModal.title}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">3DNA · Hecho en Itá Ibaté</p>
            </div>
          </div>
          <button
            onClick={closeConfirmModal}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            {confirmModal.message}
          </p>

          {requiresTyping && (
            <div className="p-3.5 bg-rose-50/80 rounded-xl border border-rose-200 space-y-2">
              <label className="block text-xs font-semibold text-rose-900">
                Para confirmar esta acción irreversible, escribí <span className="font-mono font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-300">{confirmModal.requireKeyword}</span> abajo:
              </label>
              <input
                type="text"
                autoFocus
                value={typedKeyword}
                onChange={e => setTypedKeyword(e.target.value)}
                placeholder={`Escribí ${confirmModal.requireKeyword} aquí...`}
                className="w-full px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-white border border-rose-300 focus:border-rose-600 focus:ring-1 focus:ring-rose-500 rounded-lg outline-none"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={closeConfirmModal}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!isKeywordMatching}
              onClick={handleConfirm}
              className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                !isKeywordMatching
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                  : confirmModal.isDestructive
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20 active:scale-95'
                  : 'bg-violet-700 hover:bg-violet-800 shadow-violet-700/20 active:scale-95'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{confirmModal.confirmButtonText || (confirmModal.isDestructive ? 'Eliminar' : 'Confirmar')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
