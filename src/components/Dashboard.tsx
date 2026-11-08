import React from 'react';
import {
  Package,
  Clock,
  Wrench,
  CheckCircle2,
  Truck,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  AlertCircle,
  PlusCircle,
  Calendar,
  Layers,
  ChevronRight,
  Phone,
  Flame,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';

export const Dashboard: React.FC = () => {
  const {
    orders,
    products,
    incomes,
    expenses,
    metrics,
    formatCurrency,
    formatDate,
    setActiveView,
    setIsOrderModalOpen,
    setEditingOrder,
    setSelectedOrderDetail,
    updateOrderStatus,
  } = useApp();

  // Upcoming deliveries sorted by delivery date
  const activeOrders = orders
    .filter(o => o.status !== 'Entregado' && o.status !== 'Cancelado')
    .sort((a, b) => new Date(a.estimatedDeliveryDate).getTime() - new Date(b.estimatedDeliveryDate).getTime());

  // Check if an order is overdue
  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = (dateStr: string) => {
    return dateStr < todayStr;
  };

  // Top selling products calculated dynamically from orders
  const productSalesMap: Record<string, { name: string; units: number; revenue: number }> = {};
  orders.forEach(ord => {
    if (ord.status !== 'Cancelado') {
      const key = ord.productName || 'Otros';
      if (!productSalesMap[key]) {
        productSalesMap[key] = { name: key, units: 0, revenue: 0 };
      }
      productSalesMap[key].units += ord.quantity || 1;
      productSalesMap[key].revenue += ord.totalAmount || 0;
    }
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  // Status distribution for orders
  const statusCounts: Record<OrderStatus, number> = {
    'Recibido': 0,
    'Pendiente de confirmación': 0,
    'Pendiente de producción': 0,
    'En producción': 0,
    'Terminado': 0,
    'Listo para retirar': 0,
    'Entregado': 0,
    'Cancelado': 0,
  };
  orders.forEach(o => {
    if (statusCounts[o.status] !== undefined) {
      statusCounts[o.status]++;
    }
  });

  // Monthly income vs expense comparison (last 6 months)
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const now = new Date();
  const past6Months: { key: string; label: string; income: number; expense: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const key = `${y}-${m}`;
    const label = `${monthNames[d.getMonth()]} ${y.toString().slice(-2)}`;

    const inc = incomes
      .filter(x => (x.date || '').startsWith(key))
      .reduce((sum, x) => sum + (x.amount || 0), 0);

    const exp = expenses
      .filter(x => (x.date || '').startsWith(key))
      .reduce((sum, x) => sum + (x.amount || 0), 0);

    past6Months.push({ key, label, income: inc, expense: exp });
  }

  const maxMonthValue = Math.max(
    ...past6Months.map(m => Math.max(m.income, m.expense)),
    50000
  );

  return (
    <div className="space-y-6">
      {/* Workshop Hero Showcase Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1f0942] via-[#2e1065] to-[#4c1d95] text-white p-6 sm:p-8 shadow-xl border border-violet-800/40">
        {/* Background glow & subtle pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 pointer-events-none hidden md:block">
          <img
            src="/src/assets/images/workshop_3dna_printer_1794168412102.jpg"
            alt="Taller de impresión 3D 3DNA"
            className="w-full h-full object-cover rounded-l-3xl"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1f0942] to-transparent" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300 mb-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Taller Operativo · Hecho en Itá Ibaté</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Panel de Control 3DNA
          </h2>
          <p className="text-sm text-violet-200/90 leading-relaxed mb-6">
            Administrá tus pedidos de impresión 3D, monitoreá los costos de filamento y mantené la
            caja de tu emprendimiento organizada y al día en tiempo real.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setEditingOrder(null);
                setIsOrderModalOpen(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>Registrar Nuevo Pedido</span>
            </button>
            <button
              onClick={() => setActiveView('orders')}
              className="px-4 py-2.5 bg-violet-900/60 hover:bg-violet-800/70 text-violet-100 border border-violet-700/60 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Ver Pedidos ({orders.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 9 MAIN KPI CARDS (Required by specification) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Indicadores Clave del Negocio
          </h3>
          <span className="text-xs text-slate-500">Actualizado automáticamente</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* 1. Pedidos recibidos */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Pedidos Recibidos</span>
              <Package className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {metrics.totalOrders}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Total histórico</div>
            </div>
          </div>

          {/* 2. Pedidos pendientes */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Pendientes</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-amber-600 tabular-nums">
                {metrics.pendingOrdersCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Por iniciar o confirmar</div>
            </div>
          </div>

          {/* 3. Pedidos en producción */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">En Producción</span>
              <Wrench className="w-4 h-4 text-cyan-600" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-cyan-600 tabular-nums">
                {metrics.inProductionCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">En cama de impresión</div>
            </div>
          </div>

          {/* 4. Pedidos terminados */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Terminados / Listos</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-emerald-600 tabular-nums">
                {metrics.finishedCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Listos para retirar</div>
            </div>
          </div>

          {/* 5. Pedidos entregados */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Entregados</span>
              <Truck className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-blue-600 tabular-nums">
                {metrics.deliveredCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Clientes satisfechos</div>
            </div>
          </div>

          {/* 6. Ingresos del mes */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Ingresos del Mes</span>
              <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-emerald-700 font-mono tabular-nums">
                {formatCurrency(metrics.monthIncomes)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Cobros de este mes</div>
            </div>
          </div>

          {/* 7. Gastos del mes */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Gastos del Mes</span>
              <ArrowUpRight className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-rose-700 font-mono tabular-nums">
                {formatCurrency(metrics.monthExpenses)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Salidas registradas</div>
            </div>
          </div>

          {/* 8. Ganancia neta del mes */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Ganancia Neta Mes</span>
              <TrendingUp className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <div
                className={`text-xl font-extrabold font-mono tabular-nums ${
                  metrics.monthNetProfit >= 0 ? 'text-violet-800' : 'text-rose-600'
                }`}
              >
                {formatCurrency(metrics.monthNetProfit)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Ingresos - Gastos</div>
            </div>
          </div>

          {/* 9. Dinero pendiente de cobrar */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-2 bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 rounded-xl border border-amber-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-800 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Dinero Pendiente de Cobro
              </span>
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-amber-900 font-mono tabular-nums">
                {formatCurrency(metrics.pendingToCollect)}
              </div>
              <div className="text-[11px] text-amber-700/80 mt-0.5">
                Saldos a percibir al entregar los trabajos
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: PRÓXIMOS VENCIMIENTOS Y ENTREGAS (Prioridad de taller) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-600" />
              <h3 className="text-base font-bold text-slate-900">
                Próximos Vencimientos y Entregas
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ordenados cronológicamente para saber qué trabajos deben imprimirse y despacharse primero.
            </p>
          </div>
          <button
            onClick={() => setActiveView('orders')}
            className="text-xs font-semibold text-violet-700 hover:text-violet-900 flex items-center gap-1 cursor-pointer self-start sm:self-center"
          >
            Ver todos los pedidos
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeOrders.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No hay pedidos activos pendientes de entrega en este momento.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 mt-2">
            {activeOrders.slice(0, 5).map(order => {
              const overdue = isOverdue(order.estimatedDeliveryDate);
              const isToday = order.estimatedDeliveryDate === todayStr;

              return (
                <div
                  key={order.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-1 rounded shrink-0 ${
                        overdue
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : isToday
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-violet-100 text-violet-800'
                      }`}
                    >
                      {formatDate(order.estimatedDeliveryDate)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 text-sm truncate">
                          {order.productName}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs text-slate-500">·</span>
                        <span className="text-xs font-medium text-slate-700 truncate">
                          {order.customerName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>Cant: {order.quantity}</span>
                        <span>·</span>
                        <span>Material: {order.material}</span>
                        <span>·</span>
                        <span>Color: {order.color}</span>
                        {overdue && (
                          <span className="text-rose-600 font-bold">¡Vencido!</span>
                        )}
                        {isToday && (
                          <span className="text-amber-700 font-bold">¡Entrega Hoy!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Status Badge */}
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                        order.status === 'En producción'
                          ? 'bg-cyan-100 text-cyan-800'
                          : order.status === 'Listo para retirar' || order.status === 'Terminado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>

                    {/* Quick WhatsApp button */}
                    {order.customerPhone && (
                      <a
                        href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `¡Hola ${order.customerName}! Te contactamos de 3DNA (Itá Ibaté) sobre tu pedido ${order.orderNumber} de ${order.productName}. Estado actual: ${order.status}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Enviar WhatsApp al cliente"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      onClick={() => setSelectedOrderDetail(order)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-violet-700 hover:bg-violet-50 rounded-md border border-slate-200 transition-colors cursor-pointer"
                    >
                      Ver detalle
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CHARTS & ANALYTICS GRIDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Ingresos vs Gastos por Mes */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-bold text-slate-900">
                Flujo Mensual: Ingresos vs Gastos
              </h4>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-violet-600 inline-block" />
                  Ingresos
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
                  Gastos
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Comparativa de dinero real cobrado vs egresos en los últimos 6 meses.
            </p>
          </div>

          <div className="space-y-4">
            {past6Months.map(m => {
              const incPercent = Math.min(100, Math.round((m.income / maxMonthValue) * 100));
              const expPercent = Math.min(100, Math.round((m.expense / maxMonthValue) * 100));

              return (
                <div key={m.key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{m.label}</span>
                    <div className="flex gap-4 font-mono text-[11px]">
                      <span className="text-violet-700 font-bold">
                        +{formatCurrency(m.income)}
                      </span>
                      <span className="text-rose-600 font-medium">
                        -{formatCurrency(m.expense)}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 h-3">
                    {/* Income bar */}
                    <div className="bg-slate-100 rounded-xs overflow-hidden flex justify-end">
                      <div
                        className="bg-violet-600 h-full rounded-xs transition-all duration-500"
                        style={{ width: `${incPercent}%` }}
                      />
                    </div>
                    {/* Expense bar */}
                    <div className="bg-slate-100 rounded-xs overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-xs transition-all duration-500"
                        style={{ width: `${expPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Cálculo con datos reales registrados</span>
            <button
              onClick={() => setActiveView('cashflow')}
              className="text-violet-700 font-semibold hover:underline cursor-pointer"
            >
              Ver libro de caja completo →
            </button>
          </div>
        </div>

        {/* Chart 2: Pedidos por Estado */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              Distribución de Pedidos por Estado
            </h4>
            <p className="text-xs text-slate-500 mb-5">
              Estado de la carga de trabajo en el taller 3DNA de Itá Ibaté.
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              { label: 'Recibido', count: statusCounts['Recibido'], color: 'bg-slate-400' },
              {
                label: 'Pendiente de confirmación',
                count: statusCounts['Pendiente de confirmación'],
                color: 'bg-amber-400',
              },
              {
                label: 'Pendiente de producción',
                count: statusCounts['Pendiente de producción'],
                color: 'bg-amber-500',
              },
              {
                label: 'En producción (en máquina)',
                count: statusCounts['En producción'],
                color: 'bg-cyan-500',
              },
              { label: 'Terminado', count: statusCounts['Terminado'], color: 'bg-teal-500' },
              {
                label: 'Listo para retirar',
                count: statusCounts['Listo para retirar'],
                color: 'bg-emerald-500',
              },
              { label: 'Entregado', count: statusCounts['Entregado'], color: 'bg-blue-600' },
              { label: 'Cancelado', count: statusCounts['Cancelado'], color: 'bg-rose-400' },
            ].map(item => {
              const totalOrdersCount = orders.length || 1;
              const percent = Math.round((item.count / totalOrdersCount) * 100);

              return (
                <div key={item.label} className="flex items-center gap-3 text-xs">
                  <div className="w-40 shrink-0 text-slate-700 truncate font-medium">
                    {item.label}
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="w-12 text-right font-mono font-bold text-slate-800 shrink-0">
                    {item.count} <span className="text-[10px] text-slate-500 font-normal">({percent}%)</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Total: {orders.length} pedidos</span>
            <button
              onClick={() => setActiveView('orders')}
              className="text-violet-700 font-semibold hover:underline cursor-pointer"
            >
              Gestionar workflow →
            </button>
          </div>
        </div>
      </div>

      {/* TOP SELLING PRODUCTS & WORKSHOP HIGHLIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Productos más Vendidos */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Productos Más Vendidos
              </h4>
              <p className="text-xs text-slate-500">
                Ranking por unidades fabricadas y facturación generada
              </p>
            </div>
            <button
              onClick={() => setActiveView('products')}
              className="text-xs font-semibold text-violet-700 hover:text-violet-900 cursor-pointer"
            >
              Ver catálogo completo
            </button>
          </div>

          {topProducts.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              Aún no hay suficientes ventas registradas para generar el ranking.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {topProducts.map((prod, index) => (
                <div key={prod.name} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-800 font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                      #{index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">{prod.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {prod.units} {prod.units === 1 ? 'unidad fabricada' : 'unidades fabricadas'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-slate-900 shrink-0">
                    {formatCurrency(prod.revenue)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Material & Machine Tips */}
        <div className="bg-gradient-to-br from-violet-950 to-[#270e4c] rounded-2xl p-5 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Layers className="w-4 h-4" />
              <span>Optimización 3D</span>
            </div>
            <h4 className="text-base font-bold text-white mb-2">
              Costeo Inteligente 3DNA
            </h4>
            <p className="text-xs text-violet-200/90 leading-relaxed mb-4">
              Cada bobina de filamento y cada hora de impresión cuenta. Utilizá nuestra calculadora de
              costos para fijar precios minoristas y mayoristas que aseguren tu rentabilidad real en
              Itá Ibaté.
            </p>
            <div className="p-3 rounded-xl bg-violet-900/50 border border-violet-800/60 text-xs text-violet-200 space-y-1.5">
              <div className="flex justify-between">
                <span>Filamentos activos:</span>
                <span className="font-semibold text-white">PLA, PETG, ABS</span>
              </div>
              <div className="flex justify-between">
                <span>Total reinvertido:</span>
                <span className="font-semibold text-cyan-300 font-mono">
                  {formatCurrency(metrics.totalCapitalInvestment)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveView('calculator')}
            className="mt-4 w-full py-2.5 px-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-cyan-900/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            Abrir Calculadora de Costos
          </button>
        </div>
      </div>
    </div>
  );
};
