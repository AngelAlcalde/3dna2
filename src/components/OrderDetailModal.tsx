import React, { useState } from 'react';
import {
  X,
  Phone,
  Printer,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowDownLeft,
  Calendar,
  Layers,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus, PaymentMethod } from '../types';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onEdit: (order: Order) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose, onEdit }) => {
  const {
    incomes,
    addIncome,
    deleteOrder,
    updateOrderStatus,
    formatCurrency,
    formatDate,
    setReceiptOrder,
    setIsReceiptModalOpen,
    openConfirmModal,
  } = useApp();

  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Transferencia');
  const [paymentConcept, setPaymentConcept] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  if (!order) return null;

  // Payments tied to this specific order
  const orderPayments = incomes.filter(inc => inc.orderId === order.id);

  const statuses: OrderStatus[] = [
    'Recibido',
    'Pendiente de confirmación',
    'Pendiente de producción',
    'En producción',
    'Terminado',
    'Listo para retirar',
    'Entregado',
    'Cancelado',
  ];

  const handleStatusChange = (newStatus: OrderStatus) => {
    updateOrderStatus(order.id, newStatus);
  };

  const handleRegisterPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    addIncome({
      date: new Date().toISOString().split('T')[0],
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      concept:
        paymentConcept.trim() ||
        (order.pendingBalance <= amountNum
          ? `Cancelación final ${order.orderNumber}`
          : `Pago parcial ${order.orderNumber}`),
      amount: amountNum,
      paymentMethod,
      notes: paymentNotes.trim(),
    });

    setIsAddingPayment(false);
    setPaymentAmount('');
    setPaymentConcept('');
    setPaymentNotes('');
  };

  const handleDelete = () => {
    openConfirmModal({
      title: '¿Eliminar Pedido?',
      message: `¿Estás seguro de que deseas eliminar permanentemente el pedido ${order.orderNumber} de ${order.customerName}? Esta acción no se puede deshacer.`,
      isDestructive: true,
      onConfirm: () => {
        deleteOrder(order.id);
        onClose();
      },
    });
  };

  const handlePrintReceipt = () => {
    setReceiptOrder(order);
    setIsReceiptModalOpen(true);
  };

  const whatsappMessage = `¡Hola ${order.customerName}! Te escribimos de 3DNA (Hecho en Itá Ibaté) sobre tu pedido ${order.orderNumber} (${order.productName}).\nEstado: ${order.status}.\nTotal: ${formatCurrency(order.totalAmount)} | Pagado: ${formatCurrency(order.totalPaid)} | Saldo: ${formatCurrency(order.pendingBalance)}.\n¡Muchas gracias!`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-violet-800 text-amber-300 border border-violet-700">
              {order.orderNumber}
            </span>
            <div>
              <h3 className="text-base font-bold tracking-tight">{order.productName}</h3>
              <p className="text-xs text-violet-200">Cliente: {order.customerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintReceipt}
              className="p-1.5 text-violet-200 hover:text-white hover:bg-violet-800/80 rounded-lg transition-colors cursor-pointer"
              title="Imprimir remito / nota de pedido"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(order);
              }}
              className="p-1.5 text-violet-200 hover:text-white hover:bg-violet-800/80 rounded-lg transition-colors cursor-pointer"
              title="Editar datos del pedido"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-violet-200 hover:text-white hover:bg-violet-800/80 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Status Pipeline / Workflow selector */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-violet-600" />
                Flujo de Producción y Estado
              </span>
              <span className="text-xs font-bold text-violet-900">
                Estado Actual: {order.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {statuses.map(st => {
                const isActive = order.status === st;
                return (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-violet-700 text-white shadow-sm shadow-violet-900/30 ring-2 ring-violet-500'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-violet-50 hover:text-violet-800'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer & Technical Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Box */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center justify-between">
                <span>Información del Cliente</span>
                {order.customerPhone && (
                  <a
                    href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      whatsappMessage
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    <Phone className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </h4>
              <div className="text-xs space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Nombre:</span>
                  <span className="font-semibold text-slate-900">{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Teléfono:</span>
                  <span className="font-mono text-slate-800">{order.customerPhone || 'No registrado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fecha Pedido:</span>
                  <span>{formatDate(order.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Entrega Estimada:</span>
                  <span className="font-semibold text-violet-700 font-mono">
                    {formatDate(order.estimatedDeliveryDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* 3D Specs Box */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-violet-600" />
                <span>Especificaciones 3D</span>
              </h4>
              <div className="text-xs space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cantidad:</span>
                  <span className="font-bold text-slate-900 font-mono">{order.quantity} unidades</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Material:</span>
                  <span className="font-semibold text-slate-800">{order.material}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Color:</span>
                  <span className="font-medium text-slate-800">{order.color || 'No especificado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Costo Unit / Total:</span>
                  <span className="font-mono text-slate-700">
                    {formatCurrency(order.unitCost)} / {formatCurrency(order.unitCost * order.quantity)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Notes */}
          {(order.description || order.notes) && (
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 text-xs space-y-2">
              {order.description && (
                <div>
                  <span className="font-bold text-slate-700 block mb-0.5">Descripción del modelo:</span>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">{order.description}</p>
                </div>
              )}
              {order.notes && (
                <div>
                  <span className="font-bold text-slate-700 block mb-0.5">Observaciones de taller:</span>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">{order.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* FINANCIAL SUMMARY: TOTAL, PAGADO, SALDO */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50/70 to-fuchsia-50/40 border border-violet-200/90">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-violet-900 uppercase tracking-wider">
                Estado Financiero del Pedido
              </h4>
              {order.pendingBalance > 0 && !isAddingPayment && (
                <button
                  onClick={() => setIsAddingPayment(true)}
                  className="px-3 py-1 bg-violet-700 hover:bg-violet-800 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>+ Cobrar Saldo / Seña</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border border-violet-100 shadow-2xs">
                <div className="text-[11px] text-slate-500 font-medium">Total Pedido</div>
                <div className="text-lg font-bold text-slate-900 font-mono">
                  {formatCurrency(order.totalAmount)}
                </div>
                <div className="text-[10px] text-slate-400">
                  {order.quantity} × {formatCurrency(order.agreedPrice)}
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                <div className="text-[11px] text-emerald-700 font-medium">Total Cobrado</div>
                <div className="text-lg font-bold text-emerald-700 font-mono">
                  {formatCurrency(order.totalPaid)}
                </div>
                <div className="text-[10px] text-emerald-600">
                  {Math.round((order.totalPaid / (order.totalAmount || 1)) * 100)}% abonado
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-2xs">
                <div className="text-[11px] text-amber-700 font-medium">Saldo Pendiente</div>
                <div
                  className={`text-lg font-bold font-mono ${
                    order.pendingBalance > 0 ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  {formatCurrency(order.pendingBalance)}
                </div>
                <div className="text-[10px] text-slate-400">
                  {order.pendingBalance === 0 ? 'Completado' : 'Por cobrar'}
                </div>
              </div>
            </div>

            {/* Quick Inline Payment Form */}
            {isAddingPayment && (
              <form onSubmit={handleRegisterPayment} className="mt-4 p-3 bg-white rounded-xl border border-violet-300 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-violet-900">
                    Registrar Cobro para {order.orderNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingPayment(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Monto Recibido ($)
                    </label>
                    <input
                      type="number"
                      step="100"
                      min="1"
                      max={order.pendingBalance || undefined}
                      value={paymentAmount}
                      onChange={e => setPaymentAmount(e.target.value)}
                      placeholder={order.pendingBalance.toString()}
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg outline-none focus:border-violet-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Medio de Pago
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:border-violet-500"
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia">Transferencia</option>
                      <option value="Mercado Pago">Mercado Pago</option>
                      <option value="Tarjeta de Débito">Tarjeta Débito</option>
                      <option value="Tarjeta de Crédito">Tarjeta Crédito</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Concepto
                    </label>
                    <input
                      type="text"
                      value={paymentConcept}
                      onChange={e => setPaymentConcept(e.target.value)}
                      placeholder="Ej: Pago saldo al retirar"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(order.pendingBalance.toString())}
                    className="text-[11px] font-semibold text-violet-700 hover:underline cursor-pointer"
                  >
                    Completar todo el saldo (${order.pendingBalance.toLocaleString('es-AR')})
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Asentar Cobro
                  </button>
                </div>
              </form>
            )}

            {/* Payments History List */}
            <div className="mt-4 pt-3 border-t border-violet-100">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Historial de Cobros Registrados ({orderPayments.length})
              </span>
              {orderPayments.length === 0 ? (
                <div className="text-xs text-slate-400 py-1">
                  Aún no se registraron ingresos o señas para este pedido.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 bg-white rounded-lg border border-slate-200">
                  {orderPayments.map(p => (
                    <div key={p.id} className="p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-800">{p.concept}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>{formatDate(p.date)}</span>
                          <span>·</span>
                          <span className="font-medium text-slate-600">{p.paymentMethod}</span>
                        </div>
                      </div>
                      <div className="font-mono font-bold text-emerald-600 text-sm">
                        +{formatCurrency(p.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Pedido</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintReceipt}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Remito</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onEdit(order);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-violet-700 hover:bg-violet-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit className="w-4 h-4" />
                <span>Modificar Pedido</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
