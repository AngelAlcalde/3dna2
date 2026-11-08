import React from 'react';
import {
  LayoutDashboard,
  PackageCheck,
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Calculator,
  Settings2,
  PlusCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const {
    activeView,
    setActiveView,
    metrics,
    setIsOrderModalOpen,
    setEditingOrder,
  } = useApp();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Panel Principal',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'orders',
      label: 'Gestión de Pedidos',
      icon: PackageCheck,
      badge: metrics.inProductionCount > 0 ? `${metrics.inProductionCount} en prod.` : null,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
    },
    {
      id: 'products',
      label: 'Productos y Precios',
      icon: Boxes,
      badge: null,
    },
    {
      id: 'incomes',
      label: 'Ingresos y Cobros',
      icon: ArrowDownLeft,
      badge: null,
    },
    {
      id: 'expenses',
      label: 'Control de Gastos',
      icon: ArrowUpRight,
      badge: null,
    },
    {
      id: 'cashflow',
      label: 'Caja y Finanzas',
      icon: Wallet,
      badge: null,
    },
    {
      id: 'calculator',
      label: 'Calculadora de Costos 3D',
      icon: Calculator,
      badge: 'Pro',
      badgeColor: 'bg-amber-400/20 text-amber-300 border border-amber-400/30',
    },
    {
      id: 'config',
      label: 'Respaldo & Configuración',
      icon: Settings2,
      badge: null,
    },
  ];

  const handleNavClick = (id: string) => {
    setActiveView(id);
    setIsMobileOpen(false);
  };

  const handleNewOrder = () => {
    setEditingOrder(null);
    setIsOrderModalOpen(true);
    setIsMobileOpen(false);
  };

  const content = (
    <div className="flex flex-col h-full bg-[#1b0b38] text-slate-200 border-r border-violet-950/60 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-violet-900/40 flex items-center justify-between">
        <BrandLogo showTagline={true} size="md" className="brightness-110" />
      </div>

      {/* Quick Action Button: + NUEVO PEDIDO */}
      <div className="p-4">
        <button
          onClick={handleNewOrder}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/30 active:scale-[0.98] text-sm cursor-pointer"
        >
          <PlusCircle className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          <span>+ NUEVO PEDIDO</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-violet-400/70 px-3 py-1">
          Menú de Gestión
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left ${
                isActive
                  ? 'bg-gradient-to-r from-violet-700 to-fuchsia-700 text-white shadow-md shadow-violet-950/50'
                  : 'text-slate-300 hover:bg-violet-900/40 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-amber-300' : 'text-violet-400 group-hover:text-violet-300'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                    item.badgeColor || 'bg-violet-800 text-violet-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Workshop Status Widget in Sidebar */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-b from-violet-950/80 to-[#120524] border border-violet-800/40 text-xs text-slate-300">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-100">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Taller 3DNA Activo</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/50 px-1.5 py-0.5 rounded">
            Itá Ibaté
          </span>
        </div>
        <div className="space-y-1.5 text-[11px] text-slate-400">
          <div className="flex justify-between">
            <span>En producción:</span>
            <span className="font-semibold text-amber-300 font-mono">{metrics.inProductionCount} pedidos</span>
          </div>
          <div className="flex justify-between">
            <span>Listos p/ entrega:</span>
            <span className="font-semibold text-emerald-300 font-mono">{metrics.finishedCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Cobros pendientes:</span>
            <span className="font-semibold text-fuchsia-300 font-mono">
              ${metrics.pendingToCollect.toLocaleString('es-AR')}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 text-center border-t border-violet-900/40 text-[11px] text-violet-400/80">
        3DNA &copy; 2026 · Hecho en Itá Ibaté
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 h-screen sticky top-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
