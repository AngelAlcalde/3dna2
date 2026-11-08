import React, { useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  PlusCircle,
  Search,
  Calendar,
  Wallet,
  Trash2,
  X,
  Save,
  CheckCircle2,
  CreditCard,
  Building,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Income, PaymentMethod } from '../types';

export const IncomesView: React.FC = () => {
  const {
    incomes,
    orders,
    addIncome,
    deleteIncome,
    formatCurrency,
    formatDate,
    openConfirmModal,
  } = useApp();

  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('todos');
  const [dateFilter, setDateFilter] = useState('todos');

  // Modal for new income
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Transferencia');
  const [notes, setNotes] = useState('');

  // When order is selected in modal, auto-fill customer and pending balance
  const handleOrderSelect = (orderId: string) => {
    setSelectedOrderId(orderId);
    if (!orderId) return;
    const found = orders.find(o => o.id === orderId);
    if (found) {
      setCustomerName(found.customerName);
      setConcept(`Cobro saldo ${found.orderNumber} (${found.productName})`);
      setAmount(found.pendingBalance > 0 ? found.pendingBalance.toString() : '');
    }
  };

  const handleSaveIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const matchedOrder = orders.find(o => o.id === selectedOrderId);

    addIncome({
      date,
      orderId: selectedOrderId || undefined,
      orderNumber: matchedOrder?.orderNumber,
      customerName: customerName.trim() || 'Cliente Mostrador',
      concept: concept.trim() || 'Ingreso por venta',
      amount: amountNum,
      paymentMethod,
      notes: notes.trim(),
    });

    setIsModalOpen(false);
    setSelectedOrderId('');
    setCustomerName('');
    setConcept('');
    setAmount('');
    setNotes('');
  };

  const handleDelete = (inc: Income) => {
    openConfirmModal({
      title: '¿Eliminar Ingreso?',
      message: `¿Estás seguro de anular el ingreso de ${formatCurrency(inc.amount)} de ${inc.customerName}? Si estaba vinculado a un pedido, se recalculará su saldo pendiente.`,
      isDestructive: true,
      onConfirm: () => deleteIncome(inc.id),
    });
  };

  // Filtered incomes
  const filteredIncomes = useMemo(() => {
    return incomes.filter(inc => {
      const q = search.toLowerCase();
      const matchesSearch =
        inc.customerName.toLowerCase().includes(q) ||
        inc.concept.toLowerCase().includes(q) ||
        (inc.orderNumber && inc.orderNumber.toLowerCase().includes(q)) ||
        inc.paymentMethod.toLowerCase().includes(q);

      const matchesMethod = methodFilter === 'todos' || inc.paymentMethod === methodFilter;

      let matchesDate = true;
      const today = new Date().toISOString().split('T')[0];
      if (dateFilter === 'mes') {
        matchesDate = (inc.date || '').startsWith(today.slice(0, 7));
      } else if (dateFilter === 'dia') {
        matchesDate = inc.date === today;
      }

      return matchesSearch && matchesMethod && matchesDate;
    });
  }, [incomes, search, methodFilter, dateFilter]);

  const totalFiltered = filteredIncomes.reduce((sum, i) => sum + (i.amount || 0), 0);

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Control de Ingresos y Cobranzas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro estricto de dinero efectivamente cobrado (señas, anticipos y saldos)
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedOrderId('');
            setCustomerName('');
            setConcept('');
            setAmount('');
            setNotes('');
            setDate(new Date().toISOString().split('T')[0]);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-white" />
          <span>+ REGISTRAR COBRO</span>
        </button>
      </div>

      {/* Summary KPI Box */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 rounded-2xl p-5 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Total Cobrado Filtrado
          </span>
          <div className="text-3xl font-extrabold font-mono mt-1">
            {formatCurrency(totalFiltered)}
          </div>
          <p className="text-xs text-emerald-200/80 mt-1">
            {filteredIncomes.length} movimientos de ingresos registrados
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-emerald-800/60 border border-emerald-700/60 p-3 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <div className="leading-tight">
            <span className="font-bold block text-white">Regla de Cobranza 3DNA:</span>
            <span className="text-emerald-200">
              Solo se computan señas y pagos reales. Los pedidos pendientes no suman a la caja hasta cobrarse.
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por cliente, pedido, concepto..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 focus:border-violet-500 rounded-lg outline-none"
          />
        </div>

        <div>
          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            className="w-full px-2.5 py-2 border border-slate-300 focus:border-violet-500 rounded-lg outline-none bg-white font-medium"
          >
            <option value="todos">Todos los medios de pago</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Mercado Pago">Mercado Pago</option>
            <option value="Tarjeta de Débito">Tarjeta Débito</option>
            <option value="Tarjeta de Crédito">Tarjeta Crédito</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div>
          <select
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="w-full px-2.5 py-2 border border-slate-300 focus:border-violet-500 rounded-lg outline-none bg-white font-medium"
          >
            <option value="todos">Cualquier fecha</option>
            <option value="dia">Solo cobros de hoy</option>
            <option value="mes">Cobros de este mes</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {filteredIncomes.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            No se encontraron cobros registrados con los criterios seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Pedido Asociado</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Concepto</th>
                  <th className="py-3 px-4">Medio de Pago</th>
                  <th className="py-3 px-4 text-right">Importe Cobrado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncomes.map(inc => (
                  <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono whitespace-nowrap text-slate-700">
                      {formatDate(inc.date)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {inc.orderNumber ? (
                        <span className="font-mono font-bold text-violet-800 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded text-[11px]">
                          {inc.orderNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400">Directo en taller</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {inc.customerName}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate">
                      {inc.concept}
                      {inc.notes && (
                        <span className="text-slate-400 block text-[11px] truncate">
                          {inc.notes}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px]">
                        {inc.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-700 text-sm whitespace-nowrap">
                      +{formatCurrency(inc.amount)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(inc)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Anular ingreso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* NEW INCOME MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-6">
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white">
              <h3 className="text-base font-bold">+ Asentar Cobro / Seña</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-emerald-200 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIncome} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vincular a Pedido Existente (Opcional)
                </label>
                <select
                  value={selectedOrderId}
                  onChange={e => handleOrderSelect(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-emerald-500 rounded-lg outline-none bg-white font-medium"
                >
                  <option value="">-- Cobro suelto / Sin pedido asociado --</option>
                  {orders
                    .filter(o => o.status !== 'Cancelado')
                    .map(o => (
                      <option key={o.id} value={o.id}>
                        {o.orderNumber} - {o.customerName} ({o.productName}) - Saldo: $
                        {o.pendingBalance.toLocaleString('es-AR')}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha del Cobro
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-emerald-500 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Medio de Pago *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-emerald-500 rounded-lg outline-none bg-white font-medium"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Mercado Pago">Mercado Pago</option>
                    <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                    <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Nombre del cliente"
                    className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-emerald-500 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-800 mb-1">
                    Importe Recibido ($) *
                  </label>
                  <input
                    type="number"
                    required
                    step="100"
                    min="1"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm font-bold font-mono border border-emerald-300 focus:border-emerald-600 bg-emerald-50/50 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Concepto del Pago *
                </label>
                <input
                  type="text"
                  required
                  value={concept}
                  onChange={e => setConcept(e.target.value)}
                  placeholder="Ej: Seña 50% pedido #PED-1002 / Cancelación final"
                  className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-emerald-500 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observaciones / Comprobante
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Número de transferencia, alias o comprobante..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-emerald-500 rounded-lg outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Confirmar Ingreso</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
