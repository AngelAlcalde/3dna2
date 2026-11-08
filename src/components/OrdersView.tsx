import React, { useMemo, useState } from 'react';
import {
  PlusCircle,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Clock,
  Phone,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Layers,
  ChevronDown,
  CheckSquare,
  Square,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';

export const OrdersView: React.FC = () => {
  const {
    orders,
    formatCurrency,
    formatDate,
    setIsOrderModalOpen,
    setEditingOrder,
    setSelectedOrderDetail,
    deleteOrder,
    deleteOrders,
    clearAllOrders,
    updateOrderStatus,
    openConfirmModal,
    resetToDemoData,
  } = useApp();

  const [filterType, setFilterType] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<string>('deliveryAsc'); // Default: closest due date first
  const [localSearch, setLocalSearch] = useState<string>('');

  // Multi-selection state for batch deletion
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper date calculations
  const isOverdue = (dateStr: string, status: OrderStatus) => {
    return dateStr < todayStr && status !== 'Entregado' && status !== 'Cancelado';
  };

  const isToday = (dateStr: string) => dateStr === todayStr;

  const isThisWeek = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return d >= startOfWeek && d < endOfWeek;
  };

  const isThisMonth = (dateStr: string) => {
    const ym = todayStr.slice(0, 7);
    return (dateStr || '').startsWith(ym);
  };

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Search query filter
    if (localSearch.trim()) {
      const q = localSearch.toLowerCase();
      result = result.filter(
        o =>
          o.customerName.toLowerCase().includes(q) ||
          o.orderNumber.toLowerCase().includes(q) ||
          o.productName.toLowerCase().includes(q) ||
          o.material.toLowerCase().includes(q) ||
          o.color.toLowerCase().includes(q) ||
          (o.customerPhone && o.customerPhone.includes(q))
      );
    }

    // Time/Status Preset Filters
    if (filterType === 'dia') {
      result = result.filter(o => isToday(o.estimatedDeliveryDate));
    } else if (filterType === 'semana') {
      result = result.filter(o => isThisWeek(o.estimatedDeliveryDate));
    } else if (filterType === 'mes') {
      result = result.filter(o => isThisMonth(o.estimatedDeliveryDate));
    } else if (filterType === 'atrasados') {
      result = result.filter(o => isOverdue(o.estimatedDeliveryDate, o.status));
    } else if (filterType === 'pendientes') {
      result = result.filter(o =>
        ['Recibido', 'Pendiente de confirmación', 'Pendiente de producción'].includes(o.status)
      );
    } else if (filterType === 'produccion') {
      result = result.filter(o => o.status === 'En producción');
    } else if (filterType === 'terminados') {
      result = result.filter(o => ['Terminado', 'Listo para retirar'].includes(o.status));
    } else if (filterType === 'entregados') {
      result = result.filter(o => o.status === 'Entregado');
    }

    // Secondary exact status dropdown filter
    if (statusFilter !== 'todos') {
      result = result.filter(o => o.status === statusFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'deliveryAsc') {
        return new Date(a.estimatedDeliveryDate).getTime() - new Date(b.estimatedDeliveryDate).getTime();
      }
      if (sortBy === 'deliveryDesc') {
        return new Date(b.estimatedDeliveryDate).getTime() - new Date(a.estimatedDeliveryDate).getTime();
      }
      if (sortBy === 'createdDesc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'createdAsc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === 'customer') {
        return a.customerName.localeCompare(b.customerName);
      }
      if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      }
      if (sortBy === 'balanceDesc') {
        return b.pendingBalance - a.pendingBalance;
      }
      return 0;
    });

    return result;
  }, [orders, localSearch, filterType, statusFilter, sortBy]);

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map(o => o.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Single Delete with confirmation
  const handleDelete = (order: Order) => {
    openConfirmModal({
      title: '¿Eliminar Pedido?',
      message: `¿Estás seguro de eliminar el pedido ${order.orderNumber} (${order.productName}) de ${order.customerName}? Esta acción borrará el registro de forma permanente.`,
      isDestructive: true,
      confirmButtonText: 'Eliminar Pedido',
      onConfirm: () => {
        deleteOrder(order.id);
        setSelectedIds(prev => prev.filter(id => id !== order.id));
      },
    });
  };

  // Batch delete selected orders
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    openConfirmModal({
      title: `¿Eliminar ${selectedIds.length} pedidos seleccionados?`,
      message: `Vas a eliminar definitivamente ${selectedIds.length} pedidos del taller. Esta acción no se puede deshacer.`,
      isDestructive: true,
      confirmButtonText: `Eliminar ${selectedIds.length} Pedidos`,
      onConfirm: () => {
        deleteOrders(selectedIds);
        setSelectedIds([]);
      },
    });
  };

  // Clear all completed / delivered orders
  const handleClearFinishedOrders = () => {
    const finishedIds = orders
      .filter(o => o.status === 'Entregado' || o.status === 'Cancelado')
      .map(o => o.id);

    if (finishedIds.length === 0) {
      openConfirmModal({
        title: 'No hay pedidos finalizados para depurar',
        message: 'No existen pedidos con estado "Entregado" o "Cancelado" en este momento.',
        isDestructive: false,
        onConfirm: () => {},
      });
      return;
    }

    openConfirmModal({
      title: '¿Depurar Pedidos Entregados y Cancelados?',
      message: `Se eliminarán ${finishedIds.length} pedidos que ya fueron entregados o cancelados, manteniendo activos los pedidos en curso y en producción.`,
      isDestructive: true,
      confirmButtonText: 'Depurar Finalizados',
      onConfirm: () => {
        deleteOrders(finishedIds);
        setSelectedIds(prev => prev.filter(id => !finishedIds.includes(id)));
      },
    });
  };

  // Clear ALL orders from the database
  const handleClearAllOrders = () => {
    if (orders.length === 0) return;
    openConfirmModal({
      title: '¿Vaciar Lista Completa de Pedidos?',
      message: `Se eliminarán absolutamente todos los pedidos registrados (${orders.length} pedidos). Los productos del catálogo se conservarán intactos.`,
      isDestructive: true,
      confirmButtonText: 'Vaciar Todos los Pedidos',
      requireKeyword: 'BORRAR',
      onConfirm: () => {
        clearAllOrders();
        setSelectedIds([]);
      },
    });
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'En producción':
        return 'bg-cyan-100 text-cyan-900 border border-cyan-300 font-semibold';
      case 'Terminado':
        return 'bg-teal-100 text-teal-900 border border-teal-300 font-semibold';
      case 'Listo para retirar':
        return 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold';
      case 'Entregado':
        return 'bg-blue-100 text-blue-900 border border-blue-300 font-semibold';
      case 'Cancelado':
        return 'bg-rose-100 text-rose-900 border border-rose-300 font-medium';
      case 'Pendiente de producción':
        return 'bg-amber-100 text-amber-900 border border-amber-300 font-medium';
      case 'Pendiente de confirmación':
        return 'bg-amber-50 text-amber-800 border border-amber-200 font-medium';
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-300 font-medium';
    }
  };

  const isAllSelected = filteredOrders.length > 0 && selectedIds.length === filteredOrders.length;

  return (
    <div className="space-y-5">
      {/* Top Header / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Gestión de Pedidos de Impresión 3D
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mostrando {filteredOrders.length} de {orders.length} pedidos registrados
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Menu to Clear or Purge Orders */}
          {orders.length > 0 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleClearFinishedOrders}
                className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                title="Elimina pedidos ya entregados o cancelados"
              >
                Depurar Finalizados
              </button>
              <button
                onClick={handleClearAllOrders}
                className="px-3 py-2 text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Vacía todos los pedidos para empezar de cero"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar Pedidos</span>
              </button>
            </div>
          )}

          {/* Primary CTA: + NUEVO PEDIDO */}
          <button
            onClick={() => {
              setEditingOrder(null);
              setIsOrderModalOpen(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>+ NUEVO PEDIDO</span>
          </button>
        </div>
      </div>

      {/* Floating Batch Selection Bar when orders are checked */}
      {selectedIds.length > 0 && (
        <div className="bg-gradient-to-r from-violet-900 via-purple-900 to-slate-900 text-white p-3.5 px-5 rounded-2xl shadow-lg border border-violet-700 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-mono font-bold text-xs flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="text-xs font-medium">
              {selectedIds.length === 1 ? 'pedido seleccionado' : 'pedidos seleccionados'} para gestión en lote
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 text-xs text-violet-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              Deseleccionar
            </button>
            <button
              onClick={handleDeleteSelected}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-md shadow-rose-950/40 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar {selectedIds.length} Seleccionados</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs (Required by prompt) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {[
          { id: 'todos', label: 'Todos los pedidos' },
          { id: 'dia', label: 'Entregas del día' },
          { id: 'semana', label: 'Esta semana' },
          { id: 'mes', label: 'Este mes' },
          { id: 'atrasados', label: 'Atrasados' },
          { id: 'pendientes', label: 'Pendientes' },
          { id: 'produccion', label: 'En producción' },
          { id: 'terminados', label: 'Terminados / Listos' },
          { id: 'entregados', label: 'Entregados' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filterType === tab.id
                ? 'bg-violet-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Sort Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            placeholder="Buscar por cliente, pedido, material..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 focus:border-violet-500 rounded-lg outline-none"
          />
        </div>

        {/* Sort By Selector (Crucial: orders by closest delivery date by default) */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="w-full px-2.5 py-2 border border-slate-300 focus:border-violet-500 rounded-lg outline-none bg-white font-medium"
          >
            <option value="deliveryAsc">Entrega más próxima (Por defecto)</option>
            <option value="deliveryDesc">Entrega más lejana</option>
            <option value="createdDesc">Fecha de ingreso (Más reciente)</option>
            <option value="createdAsc">Fecha de ingreso (Más antiguo)</option>
            <option value="customer">Nombre del Cliente (A-Z)</option>
            <option value="status">Estado del pedido</option>
            <option value="balanceDesc">Mayor saldo pendiente</option>
          </select>
        </div>

        {/* Specific Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-2.5 py-2 border border-slate-300 focus:border-violet-500 rounded-lg outline-none bg-white font-medium"
          >
            <option value="todos">Filtrar por estado específico (Todos)</option>
            <option value="Recibido">Recibido</option>
            <option value="Pendiente de confirmación">Pendiente de confirmación</option>
            <option value="Pendiente de producción">Pendiente de producción</option>
            <option value="En producción">En producción</option>
            <option value="Terminado">Terminado</option>
            <option value="Listo para retirar">Listo para retirar</option>
            <option value="Entregado">Entregado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Layers className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">
              No hay pedidos en esta vista
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {orders.length === 0
                ? 'La base de datos de pedidos está vacía. Podés registrar uno nuevo o restaurar los datos de ejemplo.'
                : 'No se encontraron pedidos con los filtros seleccionados.'}
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              {orders.length === 0 ? (
                <>
                  <button
                    onClick={() => {
                      setEditingOrder(null);
                      setIsOrderModalOpen(true);
                    }}
                    className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    + Crear Primer Pedido
                  </button>
                  <button
                    onClick={resetToDemoData}
                    className="px-3.5 py-2 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Cargar Datos de Ejemplo</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setFilterType('todos');
                    setStatusFilter('todos');
                    setLocalSearch('');
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors cursor-pointer"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <button
                      onClick={handleToggleSelectAll}
                      className="text-slate-400 hover:text-violet-700 cursor-pointer p-0.5"
                      title={isAllSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    >
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4 text-violet-700" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3">Pedido / Fecha</th>
                  <th className="py-3 px-4">Cliente / Contacto</th>
                  <th className="py-3 px-4">Producto & Especificaciones</th>
                  <th className="py-3 px-4">Entrega Estimada</th>
                  <th className="py-3 px-4 text-right">Total / Saldo</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map(order => {
                  const overdue = isOverdue(order.estimatedDeliveryDate, order.status);
                  const isDueToday = isToday(order.estimatedDeliveryDate);
                  const isSelected = selectedIds.includes(order.id);

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-50/80 transition-colors group ${
                        isSelected ? 'bg-violet-50/50' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 align-top text-center">
                        <button
                          onClick={() => handleToggleSelectOne(order.id)}
                          className="text-slate-400 hover:text-violet-700 cursor-pointer p-0.5"
                          title="Seleccionar pedido"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-violet-700" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Order Number & Creation Date */}
                      <td className="py-3 px-3 align-top">
                        <div className="font-mono font-bold text-violet-900">
                          {order.orderNumber}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {formatDate(order.date)}
                        </div>
                      </td>

                      {/* Customer Name & WhatsApp */}
                      <td className="py-3 px-4 align-top">
                        <div className="font-semibold text-slate-900">
                          {order.customerName}
                        </div>
                        {order.customerPhone ? (
                          <a
                            href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                              `¡Hola ${order.customerName}! Te contactamos de 3DNA (Itá Ibaté) sobre tu pedido ${order.orderNumber} (${order.productName}). Estado: ${order.status}. Saldo pendiente: ${formatCurrency(order.pendingBalance)}.`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-medium mt-0.5"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{order.customerPhone}</span>
                          </a>
                        ) : (
                          <div className="text-[11px] text-slate-400">Sin teléfono</div>
                        )}
                      </td>

                      {/* Product Name, Quantity, Material, Color */}
                      <td className="py-3 px-4 align-top max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">
                          {order.productName}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-medium text-slate-700">
                            {order.quantity} {order.quantity === 1 ? 'ud' : 'uds'}
                          </span>
                          <span>·</span>
                          <span>{order.material}</span>
                          {order.color && (
                            <>
                              <span>·</span>
                              <span className="text-slate-600 truncate">{order.color}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Estimated Delivery Date */}
                      <td className="py-3 px-4 align-top whitespace-nowrap">
                        <div
                          className={`font-mono font-bold ${
                            overdue
                              ? 'text-rose-600'
                              : isDueToday
                              ? 'text-amber-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {formatDate(order.estimatedDeliveryDate)}
                        </div>
                        {overdue && (
                          <div className="text-[10px] font-bold text-rose-600 uppercase tracking-tight">
                            ¡Atrasado!
                          </div>
                        )}
                        {isDueToday && (
                          <div className="text-[10px] font-bold text-amber-700 uppercase tracking-tight">
                            ¡Entrega hoy!
                          </div>
                        )}
                      </td>

                      {/* Total & Pending Balance */}
                      <td className="py-3 px-4 align-top text-right whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900">
                          {formatCurrency(order.totalAmount)}
                        </div>
                        <div className="text-[11px] font-mono mt-0.5">
                          {order.pendingBalance === 0 ? (
                            <span className="text-emerald-600 font-medium">Saldado</span>
                          ) : (
                            <span className="text-amber-600 font-semibold">
                              Saldo: {formatCurrency(order.pendingBalance)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Dropdown / Badge */}
                      <td className="py-3 px-4 align-top text-center whitespace-nowrap">
                        <div className="inline-block">
                          <select
                            value={order.status}
                            onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className={`text-xs px-2.5 py-1 rounded-full cursor-pointer outline-none border transition-colors ${getStatusBadge(
                              order.status
                            )}`}
                          >
                            <option value="Recibido">Recibido</option>
                            <option value="Pendiente de confirmación">Pendiente conf.</option>
                            <option value="Pendiente de producción">Pendiente prod.</option>
                            <option value="En producción">En producción</option>
                            <option value="Terminado">Terminado</option>
                            <option value="Listo para retirar">Listo p/ retirar</option>
                            <option value="Entregado">Entregado</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedOrderDetail(order)}
                            className="p-1.5 text-slate-500 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors cursor-pointer"
                            title="Ver detalle del pedido"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingOrder(order);
                              setIsOrderModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar pedido"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(order)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar este pedido"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
