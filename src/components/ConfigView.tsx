import React, { useState } from 'react';
import {
  Settings2,
  Building,
  Save,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Phone,
  Instagram,
  MapPin,
  Coins,
  Trash2,
  AlertTriangle,
  Layers,
  Database,
  Eraser,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';

export const ConfigView: React.FC = () => {
  const {
    config,
    updateConfig,
    exportBackup,
    setIsBackupModalOpen,
    resetToDemoData,
    clearAllOrders,
    clearFinancials,
    clearEntireDatabase,
    openConfirmModal,
    orders,
    incomes,
    expenses,
    products,
  } = useApp();

  const [name, setName] = useState(config.name);
  const [tagline, setTagline] = useState(config.tagline);
  const [city, setCity] = useState(config.city);
  const [address, setAddress] = useState(config.address);
  const [phone, setPhone] = useState(config.phone);
  const [instagram, setInstagram] = useState(config.instagram);

  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      name: name.trim(),
      tagline: tagline.trim(),
      city: city.trim(),
      address: address.trim(),
      phone: phone.trim(),
      instagram: instagram.trim(),
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  // 1. Clear Orders only
  const handleClearOrdersOnly = () => {
    openConfirmModal({
      title: '¿Vaciar Lista de Pedidos?',
      message: `Se eliminarán todos los pedidos registrados (${orders.length} pedidos) y sus saldos pendientes. Los productos del catálogo y los movimientos contables previos se conservarán.`,
      isDestructive: true,
      confirmButtonText: 'Vaciar Pedidos',
      requireKeyword: 'BORRAR',
      onConfirm: () => clearAllOrders(),
    });
  };

  // 2. Clear Financials only (incomes + expenses)
  const handleClearFinancialsOnly = () => {
    openConfirmModal({
      title: '¿Vaciar Movimientos de Caja?',
      message: `Se eliminarán todos los cobros registrados (${incomes.length}) y gastos (${expenses.length}), dejando el libro diario y el balance de caja en $0.`,
      isDestructive: true,
      confirmButtonText: 'Vaciar Caja y Gastos',
      requireKeyword: 'VACIAR',
      onConfirm: () => clearFinancials(),
    });
  };

  // 3. Clear Entire Database (Full clean wipe)
  const handleClearEntireDatabase = (keepCatalog: boolean) => {
    openConfirmModal({
      title: '¿Limpiar Base de Datos Completa?',
      message: keepCatalog
        ? `Vas a vaciar todos los pedidos, cobros y gastos del sistema, conservando tu catálogo de ${products.length} productos para empezar a cargar trabajos reales desde cero.`
        : `¡ADVERTENCIA! Se borrará todo el sistema: pedidos, catálogo de productos, cobros y gastos. Quedará completamente en blanco.`,
      isDestructive: true,
      confirmButtonText: 'Limpiar Base de Datos',
      requireKeyword: 'LIMPIAR',
      onConfirm: () => clearEntireDatabase(keepCatalog),
    });
  };

  // 4. Restore demo data
  const handleResetDemo = () => {
    openConfirmModal({
      title: '¿Restablecer Datos de Demostración?',
      message:
        'Esta acción restablecerá los pedidos, productos y gastos de ejemplo de 3DNA (Itá Ibaté). Se recomienda realizar un respaldo previo.',
      isDestructive: true,
      confirmButtonText: 'Cargar Datos Demo',
      onConfirm: () => resetToDemoData(),
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Configuración del Taller y Base de Datos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Información del emprendimiento, notas de remito, copias de seguridad y limpieza del sistema
          </p>
        </div>

        <button
          onClick={() => setIsBackupModalOpen(true)}
          className="px-4 py-2 bg-violet-700 hover:bg-violet-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Gestor de Copias JSON</span>
        </button>
      </div>

      {/* Workshop Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
          <BrandLogo size="lg" showTagline={false} />
          <div>
            <h3 className="text-lg font-bold text-slate-900">{config.name}</h3>
            <p className="text-xs text-slate-500">{config.tagline} · {config.city}</p>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded mt-1 inline-block">
              Moneda: Pesos Argentinos ($ ARS)
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveConfig} className="mt-6 space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Datos que se imprimen en los remitos y notas de pedido
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre del Emprendimiento
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lema / Slogan
              </label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Localidad y Provincia
              </label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dirección del Taller / Punto de Retiro
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teléfono de Contacto / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instagram / Redes
              </label>
              <input
                type="text"
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {savedNotice ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                ¡Cambios guardados con éxito!
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">
                Los cambios se reflejarán inmediatamente en todo el sistema.
              </span>
            )}

            <button
              type="submit"
              className="px-4 py-2 bg-violet-700 hover:bg-violet-800 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </button>
          </div>
        </form>
      </div>

      {/* DEDICATED CLEANUP & DATABASE WIPE SECTION */}
      <div className="bg-white rounded-2xl border border-rose-200/90 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-rose-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Limpieza y Vaciado de la Base de Datos
              </h3>
              <p className="text-xs text-slate-500">
                Opciones para borrar pedidos y movimientos contables cuando sea necesario iniciar de cero
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
            {orders.length} pedidos · {incomes.length} cobros · {expenses.length} gastos
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Podés limpiar secciones específicas o vaciar todo el sistema. Todas las opciones de vaciado
          incluyen <strong className="text-slate-900">confirmación de seguridad con palabra clave</strong> para evitar borrados por error. Te recomendamos descargar una copia de seguridad antes de proceder.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
          {/* Card 1: Clear Orders Only */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-amber-300 bg-slate-50/60 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs mb-1">
                <Trash2 className="w-4 h-4 text-amber-600" />
                <span>Vaciar Solo Pedidos</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                Borra todos los pedidos activos y finalizados ({orders.length}). Conserva los productos del catálogo y los registros de caja.
              </p>
            </div>
            <button
              onClick={handleClearOrdersOnly}
              className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Vaciar Pedidos ({orders.length})
            </button>
          </div>

          {/* Card 2: Clear Financials Only */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-amber-300 bg-slate-50/60 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs mb-1">
                <Eraser className="w-4 h-4 text-amber-600" />
                <span>Vaciar Movimientos de Caja</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                Borra todos los cobros ({incomes.length}) y gastos ({expenses.length}), reiniciando el balance de caja a $0 para un nuevo período contable.
              </p>
            </div>
            <button
              onClick={handleClearFinancialsOnly}
              className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Vaciar Caja y Gastos
            </button>
          </div>

          {/* Card 3: Clear All DB (Keep Products) */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs mb-1">
                <Database className="w-4 h-4 text-rose-600" />
                <span>Limpiar Base Completa (Conserva Catálogo)</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                Vacía todos los pedidos y la caja, pero mantiene tu lista de productos cargados. Ideal para empezar el taller de verdad sin datos de prueba.
              </p>
            </div>
            <button
              onClick={() => handleClearEntireDatabase(true)}
              className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Reinicio en Blanco (Conserva Productos)
            </button>
          </div>

          {/* Card 4: Restore Demo Data */}
          <div className="p-4 rounded-xl border border-violet-200 bg-violet-50/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-violet-900 font-bold text-xs mb-1">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span>Restablecer Ejemplos de Itá Ibaté</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                Restaura el set inicial de pedidos, piezas regionales (trofeos de pesca, mates, engranajes) y movimientos de prueba.
              </p>
            </div>
            <button
              onClick={handleResetDemo}
              className="w-full py-2 px-3 bg-violet-700 hover:bg-violet-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Cargar Datos Demo de 3DNA
            </button>
          </div>
        </div>
      </div>

      {/* Backup and Data Maintenance Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Copias de Seguridad y Respaldo Externo
        </h4>
        <p className="text-xs text-slate-500 leading-relaxed">
          Toda la información se almacena localmente en tu navegador. Podés exportar un archivo JSON en
          cualquier momento para respaldarlo en tu computadora o enviarlo a otro dispositivo.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={exportBackup}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Descargar Copia de Seguridad JSON</span>
          </button>

          <button
            onClick={() => setIsBackupModalOpen(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-600" />
            <span>Restaurar Copia de Seguridad</span>
          </button>
        </div>
      </div>
    </div>
  );
};
