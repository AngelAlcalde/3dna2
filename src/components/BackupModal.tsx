import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Database,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BackupModal: React.FC = () => {
  const {
    isBackupModalOpen,
    setIsBackupModalOpen,
    exportBackup,
    importBackup,
    resetToDemoData,
    clearAllOrders,
    clearEntireDatabase,
    openConfirmModal,
    orders,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  if (!isBackupModalOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importBackup(content);
        if (ok) {
          setImportStatus({
            success: true,
            message: '¡Copia de seguridad restaurada con éxito!',
          });
          setTimeout(() => {
            setImportStatus(null);
            setIsBackupModalOpen(false);
          }, 1500);
        } else {
          setImportStatus({
            success: false,
            message: 'Error al importar: el formato del archivo JSON no es válido.',
          });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleClearOrders = () => {
    openConfirmModal({
      title: '¿Vaciar Lista de Pedidos?',
      message: `Se eliminarán todos los pedidos (${orders.length} pedidos) de forma permanente.`,
      isDestructive: true,
      confirmButtonText: 'Vaciar Pedidos',
      requireKeyword: 'BORRAR',
      onConfirm: () => {
        clearAllOrders();
        setIsBackupModalOpen(false);
      },
    });
  };

  const handleClearDatabase = () => {
    openConfirmModal({
      title: '¿Limpiar Toda la Base de Datos?',
      message: 'Se borrarán todos los pedidos, cobros y gastos del sistema para comenzar desde cero en blanco.',
      isDestructive: true,
      confirmButtonText: 'Limpiar Todo',
      requireKeyword: 'LIMPIAR',
      onConfirm: () => {
        clearEntireDatabase(true);
        setIsBackupModalOpen(false);
      },
    });
  };

  const handleResetDemo = () => {
    openConfirmModal({
      title: '¿Restablecer Datos de Demostración?',
      message: 'Esta acción reemplazará los datos actuales por los ejemplos iniciales de 3DNA (Itá Ibaté). Se recomienda exportar primero una copia de seguridad.',
      isDestructive: true,
      confirmButtonText: 'Cargar Datos Demo',
      onConfirm: () => {
        resetToDemoData();
        setIsBackupModalOpen(false);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-violet-900 to-indigo-950 text-white">
          <h3 className="text-base font-bold">Copia de Seguridad y Base de Datos</h3>
          <button
            onClick={() => setIsBackupModalOpen(false)}
            className="p-1 text-violet-300 hover:text-white rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-slate-600 max-h-[80vh] overflow-y-auto">
          <p className="text-slate-600 leading-relaxed">
            Tu información se guarda automáticamente en tu navegador. Para mayor seguridad o para
            trasladar tus datos a otro dispositivo, podés descargar una copia de seguridad en archivo JSON.
          </p>

          {importStatus && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2 ${
                importStatus.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {importStatus.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}

          {/* Export Action */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-900 text-sm">Descargar Respaldo</div>
              <div className="text-[11px] text-slate-500">
                Guarda todos los pedidos, productos y caja en archivo .JSON
              </div>
            </div>
            <button
              onClick={exportBackup}
              className="px-3.5 py-2 bg-violet-700 hover:bg-violet-800 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </div>

          {/* Import Action */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-900 text-sm">Restaurar Respaldo</div>
              <div className="text-[11px] text-slate-500">
                Carga un archivo de respaldo previamente exportado
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>Importar</span>
            </button>
          </div>

          {/* Database Clearing & Reset Zone */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
              Acciones de Limpieza de Datos
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleClearOrders}
                className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-left cursor-pointer transition-colors"
              >
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Vaciar Pedidos</span>
                </div>
                <div className="text-[10px] text-amber-800/80 mt-0.5">
                  Borra los {orders.length} pedidos
                </div>
              </button>

              <button
                onClick={handleClearDatabase}
                className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 rounded-lg text-left cursor-pointer transition-colors"
              >
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-rose-600" />
                  <span>Limpiar Sistema</span>
                </div>
                <div className="text-[10px] text-rose-800/80 mt-0.5">
                  Reinicio en blanco total
                </div>
              </button>
            </div>
          </div>

          {/* Reset Demo Data */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              ¿Querés volver a ver los ejemplos de Itá Ibaté?
            </span>
            <button
              onClick={handleResetDemo}
              className="text-xs font-semibold text-violet-700 hover:text-violet-900 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer Datos Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
