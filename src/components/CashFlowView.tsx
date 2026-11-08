import React, { useMemo, useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Coins,
  Wrench,
  Download,
  Filter,
  Calendar,
  Layers,
  Building,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Movement {
  id: string;
  type: 'ingreso' | 'egreso';
  date: string;
  category: string;
  concept: string;
  amount: number;
  paymentMethod: string;
  isEquipment: boolean;
  orderNumber?: string;
}

export const CashFlowView: React.FC = () => {
  const {
    incomes,
    expenses,
    metrics,
    formatCurrency,
    formatDate,
    categories,
  } = useApp();

  const [timeFilter, setTimeFilter] = useState<'todos' | 'dia' | 'semana' | 'mes' | 'anio'>('todos');
  const [typeFilter, setTypeFilter] = useState<'todos' | 'ingresos' | 'egresos_op' | 'egresos_eq'>('todos');
  const [categoryFilter, setCategoryFilter] = useState('todas');

  const todayStr = new Date().toISOString().split('T')[0];
  const thisMonthStr = todayStr.slice(0, 7);
  const thisYearStr = todayStr.slice(0, 4);

  // Unify incomes and expenses into a single chronological ledger
  const allMovements = useMemo(() => {
    const list: Movement[] = [];

    incomes.forEach(inc => {
      list.push({
        id: `inc-${inc.id}`,
        type: 'ingreso',
        date: inc.date,
        category: 'Cobro de Pedido / Ventas',
        concept: inc.concept + (inc.customerName ? ` (${inc.customerName})` : ''),
        amount: inc.amount,
        paymentMethod: inc.paymentMethod,
        isEquipment: false,
        orderNumber: inc.orderNumber,
      });
    });

    expenses.forEach(exp => {
      list.push({
        id: `exp-${exp.id}`,
        type: 'egreso',
        date: exp.date,
        category: exp.category,
        concept: exp.description,
        amount: exp.amount,
        paymentMethod: exp.paymentMethod,
        isEquipment: exp.expenseType === 'equipamiento',
      });
    });

    // Sort by date descending (most recent first)
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return list;
  }, [incomes, expenses]);

  // Filter movements
  const filteredMovements = useMemo(() => {
    return allMovements.filter(m => {
      // Time filter
      if (timeFilter === 'dia' && m.date !== todayStr) return false;
      if (timeFilter === 'mes' && !m.date.startsWith(thisMonthStr)) return false;
      if (timeFilter === 'anio' && !m.date.startsWith(thisYearStr)) return false;
      if (timeFilter === 'semana') {
        const d = new Date(m.date);
        const now = new Date();
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        if (d < start || d >= end) return false;
      }

      // Type filter
      if (typeFilter === 'ingresos' && m.type !== 'ingreso') return false;
      if (typeFilter === 'egresos_op' && (m.type !== 'egreso' || m.isEquipment)) return false;
      if (typeFilter === 'egresos_eq' && (m.type !== 'egreso' || !m.isEquipment)) return false;

      // Category filter
      if (categoryFilter !== 'todas' && m.category !== categoryFilter) return false;

      return true;
    });
  }, [allMovements, timeFilter, typeFilter, categoryFilter, todayStr, thisMonthStr, thisYearStr]);

  // Calculate filtered totals
  const filteredIncomeTotal = filteredMovements
    .filter(m => m.type === 'ingreso')
    .reduce((sum, m) => sum + m.amount, 0);

  const filteredExpenseTotal = filteredMovements
    .filter(m => m.type === 'egreso')
    .reduce((sum, m) => sum + m.amount, 0);

  const filteredNetBalance = filteredIncomeTotal - filteredExpenseTotal;

  // Export ledger to CSV
  const handleExportCSV = () => {
    const headers = ['Fecha', 'Tipo', 'Categoría', 'Concepto', 'Medio de Pago', 'Ingreso', 'Egreso'];
    const rows = filteredMovements.map(m => [
      m.date,
      m.type === 'ingreso' ? 'Ingreso' : m.isEquipment ? 'Inversión Equipamiento' : 'Gasto Operativo',
      `"${m.category.replace(/"/g, '""')}"`,
      `"${m.concept.replace(/"/g, '""')}"`,
      m.paymentMethod,
      m.type === 'ingreso' ? m.amount : '',
      m.type === 'egreso' ? m.amount : '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `3DNA_Libro_Caja_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Caja, Finanzas y Balance General
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Diferenciación estricta entre flujo de caja efectivo y rentabilidad operativa real
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Exportar a CSV (Excel)</span>
        </button>
      </div>

      {/* 6 CRITICAL FINANCIAL METRICS (Explicitly specified in Section 7) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. Total ingresos cobrados */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Total Cobrado</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-emerald-700 font-mono">
              {formatCurrency(metrics.totalIncomesAllTime)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Entradas reales</div>
          </div>
        </div>

        {/* 2. Total gastos registrados */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Total Egresos</span>
            <ArrowUpRight className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-rose-700 font-mono">
              {formatCurrency(metrics.totalExpensesAllTime)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Salidas totales</div>
          </div>
        </div>

        {/* 3. Balance disponible */}
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50/50 p-4 rounded-xl border border-violet-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-violet-900 mb-1">
            <span className="text-[11px] font-bold">Balance Disponible</span>
            <Wallet className="w-4 h-4 text-violet-700" />
          </div>
          <div>
            <div
              className={`text-2xl font-extrabold font-mono ${
                metrics.cashBalance >= 0 ? 'text-violet-950' : 'text-rose-600'
              }`}
            >
              {formatCurrency(metrics.cashBalance)}
            </div>
            <div className="text-[10px] text-violet-700 mt-0.5">Dinero en mano / cuenta</div>
          </div>
        </div>

        {/* 4. Ganancia estimada */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Ganancia Estimada</span>
            <TrendingUp className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-violet-700 font-mono">
              {formatCurrency(metrics.estimatedRealProfit)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Ventas - Costos op.</div>
          </div>
        </div>

        {/* 5. Dinero pendiente de cobro */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-[11px] font-semibold">Por Cobrar</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-amber-800 font-mono">
              {formatCurrency(metrics.pendingToCollect)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Saldos pendientes</div>
          </div>
        </div>

        {/* 6. Total reinvertido en el emprendimiento */}
        <div className="bg-white p-4 rounded-xl border border-cyan-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-cyan-800 mb-1">
            <span className="text-[11px] font-semibold">Total Reinvertido</span>
            <Wrench className="w-4 h-4 text-cyan-600" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-cyan-900 font-mono">
              {formatCurrency(metrics.totalCapitalInvestment)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Maquinaria y bienes</div>
          </div>
        </div>
      </div>

      {/* RENTABILIDAD VS FLUJO DE FONDOS EXPLANATION BOX */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Coins className="w-4 h-4" />
            <span>Principio Financiero de 3DNA</span>
          </div>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Las compras de maquinaria (como una nueva impresora 3D o secador) reducen el saldo de
            caja inmediata, pero <span className="text-cyan-300 font-semibold">no constituyen una pérdida operativa</span>,
            sino una acumulación de capital para fabricar más piezas en Itá Ibaté.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono shrink-0">
          <div className="bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Gastos Operativos:</span>
            <span className="text-amber-300 font-bold">
              {formatCurrency(metrics.totalOperationalExpenses)}
            </span>
          </div>
          <div className="bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Equipamiento:</span>
            <span className="text-cyan-300 font-bold">
              {formatCurrency(metrics.totalCapitalInvestment)}
            </span>
          </div>
        </div>
      </div>

      {/* FILTERS BAR: Day, Week, Month, Year, Category, Movement Type */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-violet-600" />
            Filtros del Historial Cronológico
          </span>
          <span className="text-xs text-slate-500">
            {filteredMovements.length} movimientos encontrados
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Time Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Período de Tiempo
            </label>
            <select
              value={timeFilter}
              onChange={e => setTimeFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none bg-white font-medium"
            >
              <option value="todos">Histórico Completo</option>
              <option value="dia">Solo Hoy</option>
              <option value="semana">Esta Semana</option>
              <option value="mes">Este Mes</option>
              <option value="anio">Este Año</option>
            </select>
          </div>

          {/* Movement Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Tipo de Movimiento
            </label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none bg-white font-medium"
            >
              <option value="todos">Todos los movimientos</option>
              <option value="ingresos">Solo Ingresos (Cobros)</option>
              <option value="egresos_op">Solo Gastos Operativos</option>
              <option value="egresos_eq">Solo Inversión en Maquinaria</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Categoría Específica
            </label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none bg-white font-medium"
            >
              <option value="todas">Todas las categorías</option>
              <option value="Cobro de Pedido / Ventas">Cobro de Pedido / Ventas</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtered Sub-Total Strip */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <span>
              Ingresos del filtro:{' '}
              <strong className="text-emerald-700 font-mono">
                +{formatCurrency(filteredIncomeTotal)}
              </strong>
            </span>
            <span>
              Egresos del filtro:{' '}
              <strong className="text-rose-600 font-mono">
                -{formatCurrency(filteredExpenseTotal)}
              </strong>
            </span>
          </div>
          <div>
            <span>Neto del período: </span>
            <strong
              className={`font-mono text-sm ${
                filteredNetBalance >= 0 ? 'text-violet-800' : 'text-rose-600'
              }`}
            >
              {formatCurrency(filteredNetBalance)}
            </strong>
          </div>
        </div>
      </div>

      {/* CHRONOLOGICAL UNIFIED MOVEMENTS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {filteredMovements.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No hay movimientos en el período seleccionado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Detalle / Concepto</th>
                  <th className="py-3 px-4">Medio</th>
                  <th className="py-3 px-4 text-right">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMovements.map(m => {
                  const isInc = m.type === 'ingreso';

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono whitespace-nowrap text-slate-700">
                        {formatDate(m.date)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isInc
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.isEquipment
                              ? 'bg-cyan-100 text-cyan-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isInc
                            ? 'Ingreso'
                            : m.isEquipment
                            ? 'Equipamiento'
                            : 'Gasto Operativo'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800">
                        {m.category}
                      </td>
                      <td className="py-3 px-4 text-slate-900 max-w-sm">
                        <div className="truncate font-semibold">{m.concept}</div>
                        {m.orderNumber && (
                          <span className="text-[10px] text-violet-700 font-mono block">
                            Pedido: {m.orderNumber}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                        <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                          {m.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-sm whitespace-nowrap">
                        <span className={isInc ? 'text-emerald-700' : 'text-rose-600'}>
                          {isInc ? '+' : '-'}
                          {formatCurrency(m.amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
