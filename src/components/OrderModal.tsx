import React, { useEffect, useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus, PaymentMethod } from '../types';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderToEdit?: Order | null;
}

export const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose, orderToEdit }) => {
  const { products, addOrder, updateOrder } = useApp();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState('');
  const [material, setMaterial] = useState('PLA');
  const [notes, setNotes] = useState('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [unitCost, setUnitCost] = useState(0);
  const [retailPrice, setRetailPrice] = useState(0);
  const [wholesalePrice, setWholesalePrice] = useState(0);
  const [agreedPrice, setAgreedPrice] = useState(0);
  const [initialDeposit, setInitialDeposit] = useState(0);
  const [depositPaymentMethod, setDepositPaymentMethod] = useState<PaymentMethod>('Efectivo');
  const [status, setStatus] = useState<OrderStatus>('Recibido');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (orderToEdit) {
      setDate(orderToEdit.date || new Date().toISOString().split('T')[0]);
      setCustomerName(orderToEdit.customerName || '');
      setCustomerPhone(orderToEdit.customerPhone || '');
      setSelectedProductId(orderToEdit.productId || '');
      setProductName(orderToEdit.productName || '');
      setDescription(orderToEdit.description || '');
      setQuantity(orderToEdit.quantity || 1);
      setColor(orderToEdit.color || '');
      setMaterial(orderToEdit.material || 'PLA');
      setNotes(orderToEdit.notes || '');
      setEstimatedDeliveryDate(orderToEdit.estimatedDeliveryDate || '');
      setUnitCost(orderToEdit.unitCost || 0);
      setRetailPrice(orderToEdit.retailPrice || 0);
      setWholesalePrice(orderToEdit.wholesalePrice || 0);
      setAgreedPrice(orderToEdit.agreedPrice || 0);
      setInitialDeposit(orderToEdit.initialDeposit || 0);
      setStatus(orderToEdit.status || 'Recibido');
    } else {
      // Defaults for a new order
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setDate(today);
      setEstimatedDeliveryDate(nextWeek);
      setCustomerName('');
      setCustomerPhone('');
      setSelectedProductId('');
      setProductName('');
      setDescription('');
      setQuantity(1);
      setColor('');
      setMaterial('PLA');
      setNotes('');
      setUnitCost(0);
      setRetailPrice(0);
      setWholesalePrice(0);
      setAgreedPrice(0);
      setInitialDeposit(0);
      setDepositPaymentMethod('Efectivo');
      setStatus('Recibido');
    }
    setErrors({});
  }, [orderToEdit, isOpen]);

  // When a catalog product is chosen, auto-fill prices & info without altering catalog
  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    if (!productId) return;
    const found = products.find(p => p.id === productId);
    if (found) {
      setProductName(found.name);
      setDescription(found.description || '');
      setMaterial(found.material || 'PLA');
      setUnitCost(found.manufacturingCost || 0);
      setRetailPrice(found.retailPrice || 0);
      setWholesalePrice(found.wholesalePrice || 0);
      setAgreedPrice(found.retailPrice || 0); // Default to retail price
      if (found.notes && !notes) {
        setNotes(found.notes);
      }
    }
  };

  const totalAmount = agreedPrice * quantity;
  const pendingBalance = Math.max(0, totalAmount - (orderToEdit ? orderToEdit.totalPaid : initialDeposit));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!customerName.trim()) errs.customerName = 'El nombre del cliente es obligatorio';
    if (!productName.trim()) errs.productName = 'El nombre del producto es obligatorio';
    if (!estimatedDeliveryDate) errs.estimatedDeliveryDate = 'La fecha de entrega es obligatoria';
    if (quantity <= 0) errs.quantity = 'La cantidad debe ser mayor a 0';
    if (agreedPrice <= 0) errs.agreedPrice = 'El precio acordado debe ser mayor a 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (orderToEdit) {
      updateOrder(orderToEdit.id, {
        date,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        productId: selectedProductId || undefined,
        productName: productName.trim(),
        description: description.trim(),
        quantity: Number(quantity),
        color: color.trim(),
        material: material.trim(),
        notes: notes.trim(),
        estimatedDeliveryDate,
        unitCost: Number(unitCost),
        retailPrice: Number(retailPrice),
        wholesalePrice: Number(wholesalePrice),
        agreedPrice: Number(agreedPrice),
        totalAmount,
        status,
      });
    } else {
      addOrder(
        {
          date,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          productId: selectedProductId || undefined,
          productName: productName.trim(),
          description: description.trim(),
          quantity: Number(quantity),
          color: color.trim(),
          material: material.trim(),
          notes: notes.trim(),
          estimatedDeliveryDate,
          unitCost: Number(unitCost),
          retailPrice: Number(retailPrice),
          wholesalePrice: Number(wholesalePrice),
          agreedPrice: Number(agreedPrice),
          totalAmount,
          initialDeposit: Number(initialDeposit),
          status,
        },
        Number(initialDeposit),
        depositPaymentMethod
      );
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-violet-900 to-indigo-950 text-white">
          <div>
            <h3 className="text-base font-bold tracking-tight">
              {orderToEdit ? `Editar Pedido ${orderToEdit.orderNumber}` : '+ Registrar Nuevo Pedido de Impresión 3D'}
            </h3>
            <p className="text-xs text-violet-200 mt-0.5">
              Taller 3DNA · Hecho en Itá Ibaté
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-violet-300 hover:text-white hover:bg-violet-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* SECTION 1: DATOS DEL CLIENTE Y FECHAS */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 pb-1 border-b border-slate-200">
              1. Datos del Cliente y Plazos
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Ej: Valeria Benítez / Cabañas del Paraná"
                  className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors ${
                    errors.customerName ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-violet-500'
                  }`}
                />
                {errors.customerName && (
                  <p className="text-xs text-rose-600 mt-1">{errors.customerName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="+54 3786 ..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-violet-500 rounded-lg outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha de Recepción
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-violet-500 rounded-lg outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha Estimada de Entrega *
                </label>
                <input
                  type="date"
                  value={estimatedDeliveryDate}
                  onChange={e => setEstimatedDeliveryDate(e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors ${
                    errors.estimatedDeliveryDate
                      ? 'border-rose-500 bg-rose-50/50'
                      : 'border-slate-300 focus:border-violet-500'
                  }`}
                />
                {errors.estimatedDeliveryDate && (
                  <p className="text-xs text-rose-600 mt-1">{errors.estimatedDeliveryDate}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estado Inicial
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-violet-500 rounded-lg outline-none bg-white transition-colors"
                >
                  <option value="Recibido">1. Recibido</option>
                  <option value="Pendiente de confirmación">2. Pendiente de confirmación</option>
                  <option value="Pendiente de producción">3. Pendiente de producción</option>
                  <option value="En producción">4. En producción</option>
                  <option value="Terminado">5. Terminado</option>
                  <option value="Listo para retirar">6. Listo para retirar</option>
                  <option value="Entregado">7. Entregado</option>
                  <option value="Cancelado">8. Cancelado</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: PRODUCTO Y ESPECIFICACIONES TÉCNICAS */}
          <div>
            <div className="flex items-center justify-between mb-3 pb-1 border-b border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. Producto y Especificaciones 3D
              </h4>
              <span className="text-[11px] text-violet-700 font-medium">
                Podés elegir uno del catálogo o escribir uno personalizado
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cargar desde Catálogo
                </label>
                <select
                  value={selectedProductId}
                  onChange={e => handleProductSelect(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-violet-500 rounded-lg outline-none bg-white transition-colors"
                >
                  <option value="">-- Personalizado / No listado --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${p.retailPrice})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Producto Solicitado *
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  placeholder="Ej: Mate Camionero Térmico 3D"
                  className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors ${
                    errors.productName ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-violet-500'
                  }`}
                />
                {errors.productName && (
                  <p className="text-xs text-rose-600 mt-1">{errors.productName}</p>
                )}
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción o Características del Producto
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Detalles del modelo STL, altura de capa, relleno, dimensiones, boquilla, acabado..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-violet-500 rounded-lg outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cantidad de Unidades *
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-violet-500 rounded-lg outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Color Solicitado
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  placeholder="Ej: Negro Mate / Silk Dorado"
                  className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-violet-500 rounded-lg outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Material Utilizado
                </label>
                <select
                  value={material}
                  onChange={e => setMaterial(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-violet-500 rounded-lg outline-none bg-white transition-colors"
                >
                  <option value="PLA">PLA (Estándar)</option>
                  <option value="PLA Silk Dorado">PLA Silk / Brillante</option>
                  <option value="PETG">PETG (Técnico / Resistente)</option>
                  <option value="ABS">ABS (Mecánico / Temperatura)</option>
                  <option value="TPU">TPU (Flexible / Elástico)</option>
                  <option value="Resina UV">Resina UV (Alta resolución)</option>
                  <option value="Nylon">Nylon / Poliamida</option>
                  <option value="ASA">ASA (Intemperie UV)</option>
                  <option value="Otro">Otro material</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observaciones / Instrucciones de Taller
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Notas adicionales, archivo slicer, requisitos de entrega..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-violet-500 rounded-lg outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: COSTOS, PRECIOS, SEÑA Y SALDO */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 pb-1 border-b border-slate-200">
              3. Costos, Precios Acordados y Seña
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Costo Unitario ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={unitCost}
                  onChange={e => setUnitCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-violet-500 rounded-lg outline-none transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Precio Minorista Ref ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={retailPrice}
                  onChange={e => setRetailPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-violet-500 rounded-lg outline-none transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Precio Mayorista Ref ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={wholesalePrice}
                  onChange={e => setWholesalePrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-violet-500 rounded-lg outline-none transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-violet-900 mb-1">
                  Precio Acordado c/ Cliente ($) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={agreedPrice}
                  onChange={e => setAgreedPrice(parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 text-sm font-bold border rounded-lg outline-none transition-colors font-mono ${
                    errors.agreedPrice ? 'border-rose-500 bg-rose-50' : 'border-violet-400 focus:border-violet-600 bg-violet-50/50'
                  }`}
                />
              </div>
            </div>

            {/* Quick Pricing Helpers */}
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="text-slate-500">Copiar sugerido:</span>
              <button
                type="button"
                onClick={() => setAgreedPrice(retailPrice)}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
              >
                Aplicar Minorista (${retailPrice})
              </button>
              <button
                type="button"
                onClick={() => setAgreedPrice(wholesalePrice)}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
              >
                Aplicar Mayorista (${wholesalePrice})
              </button>
            </div>

            {/* Seña y Saldo Box */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/90 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <div className="text-xs text-slate-500 font-medium">Total del Pedido:</div>
                <div className="text-xl font-extrabold text-slate-900 font-mono">
                  ${totalAmount.toLocaleString('es-AR')}
                </div>
                <div className="text-[11px] text-slate-500">
                  {quantity} unid. × ${agreedPrice.toLocaleString('es-AR')}
                </div>
              </div>

              {!orderToEdit ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Seña Recibida Inicial ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={totalAmount}
                    step="500"
                    value={initialDeposit}
                    onChange={e => setInitialDeposit(Math.min(totalAmount, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 focus:border-violet-500 rounded-lg outline-none font-mono"
                  />
                  <div className="mt-1">
                    <select
                      value={depositPaymentMethod}
                      onChange={e => setDepositPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full text-xs px-2 py-1 border border-slate-300 rounded bg-white"
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia">Transferencia</option>
                      <option value="Mercado Pago">Mercado Pago</option>
                      <option value="Tarjeta de Débito">Débito</option>
                      <option value="Tarjeta de Crédito">Crédito</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-xs text-slate-500 font-medium">Total Abonado a la Fecha:</div>
                  <div className="text-xl font-extrabold text-emerald-700 font-mono">
                    ${orderToEdit.totalPaid.toLocaleString('es-AR')}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Señas y pagos ya registrados
                  </div>
                </div>
              )}

              <div className="sm:border-l sm:border-slate-200 sm:pl-4">
                <div className="text-xs text-slate-500 font-medium">Saldo Pendiente:</div>
                <div
                  className={`text-2xl font-extrabold font-mono ${
                    pendingBalance > 0 ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  ${pendingBalance.toLocaleString('es-AR')}
                </div>
                <div className="text-[11px] text-slate-500">
                  {pendingBalance === 0 ? '¡Totalmente saldado!' : 'A cobrar al entregar'}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-violet-700 to-indigo-700 hover:from-violet-600 hover:to-indigo-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-violet-900/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{orderToEdit ? 'Guardar Cambios' : 'Confirmar y Crear Pedido'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
