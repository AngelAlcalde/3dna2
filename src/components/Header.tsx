import React from 'react';
import {
  Menu,
  Search,
  PlusCircle,
  Calculator,
  Download,
  Wallet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    activeView,
    searchQuery,
    setSearchQuery,
    setIsOrderModalOpen,
    setEditingOrder,
    setIsCalculatorModalOpen,
    setIsBackupModalOpen,
    metrics,
    formatCurrency,
  } = useApp();

  const viewTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Panel de Control',
      subtitle: 'Resumen operativo y métricas financieras de 3DNA',
    },
    orders: {
      title: 'Gestión de Pedidos',
      subtitle: 'Control de órdenes, estados de producción y entregas',
    },
    products: {
      title: 'Catálogo de Productos',
      subtitle: 'Costos de fabricación, márgenes y listas minorista/mayorista',
    },
    incomes: {
      title: 'Ingresos y Cobranzas',
      subtitle: 'Registro de pagos de clientes, señas y saldos',
    },
    expenses: {
      title: 'Control de Gastos',
      subtitle: 'Egresos operativos y reinversión en maquinaria',
    },
    cashflow: {
      title: 'Caja y Finanzas',
      subtitle: 'Libro diario, flujo de fondos y balance general',
    },
    calculator: {
      title: 'Calculadora de Costos 3D',
      subtitle: 'Costeo por filamento, tiempo de máquina, energía y márgenes',
    },
    config: {
      title: 'Configuración y Respaldo',
      subtitle: 'Datos del taller, copias de seguridad JSON y opciones',
    },
  };

  const currentInfo = viewTitles[activeView] || {
    title: '3DNA - Sistema de Gestión',
    subtitle: 'Hecho en Itá Ibaté',
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left Zone: Mobile hamburger & breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 -ml-1 text-slate-700 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors cursor-pointer"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="lg:hidden flex items-center">
            <BrandLogo size="sm" showTagline={false} />
          </div>

          <div className="hidden lg:block truncate">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight truncate">
              {currentInfo.title}
            </h1>
            <p className="text-xs text-slate-500 truncate">{currentInfo.subtitle}</p>
          </div>
        </div>

        {/* Center / Right Zone: Search & Quick Financial Health Pill */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Search */}
          <div className="relative hidden md:block w-48 lg:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar pedido, cliente, producto..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-violet-500 rounded-lg outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                ×
              </button>
            )}
          </div>

          {/* Real Cash in Hand Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-50/80 border border-violet-200/70 text-xs text-violet-900">
            <Wallet className="w-3.5 h-3.5 text-violet-600" />
            <span className="text-slate-500 font-medium">Caja:</span>
            <span
              className={`font-mono font-bold ${
                metrics.cashBalance >= 0 ? 'text-violet-900' : 'text-rose-600'
              }`}
            >
              {formatCurrency(metrics.cashBalance)}
            </span>
          </div>

          {/* Quick 3D Calculator Button */}
          <button
            onClick={() => setIsCalculatorModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-violet-800 bg-violet-100 hover:bg-violet-200/80 rounded-lg transition-colors cursor-pointer"
            title="Calculadora de Costos de Impresión 3D"
          >
            <Calculator className="w-3.5 h-3.5 text-violet-700" />
            <span className="hidden sm:inline">Calculadora 3D</span>
          </button>

          {/* Backup Button */}
          <button
            onClick={() => setIsBackupModalOpen(true)}
            className="p-1.5 text-slate-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors cursor-pointer"
            title="Copia de Seguridad y Respaldo"
            aria-label="Copia de Seguridad"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Primary Action Button: + NUEVO PEDIDO */}
          <button
            onClick={() => {
              setEditingOrder(null);
              setIsOrderModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 rounded-lg shadow-sm shadow-amber-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>+ NUEVO PEDIDO</span>
          </button>
        </div>
      </div>
    </header>
  );
};
