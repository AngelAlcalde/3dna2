import React from 'react';
import { X, Printer, Phone, Check, Copy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';

export const ReceiptPrintModal: React.FC = () => {
  const {
    isReceiptModalOpen,
    setIsReceiptModalOpen,
    receiptOrder,
    config,
    formatCurrency,
    formatDate,
  } = useApp();

  const [copied, setCopied] = React.useState(false);

  if (!isReceiptModalOpen || !receiptOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  const textSummary = `*3DNA - Hecho en Itá Ibaté*
*Comprobante de Pedido #${receiptOrder.orderNumber}*
---------------------------------------
Cliente: ${receiptOrder.customerName}
Teléfono: ${receiptOrder.customerPhone || '-'}
Fecha Pedido: ${formatDate(receiptOrder.date)}
Entrega Estimada: ${formatDate(receiptOrder.estimatedDeliveryDate)}
Estado: ${receiptOrder.status}
---------------------------------------
Producto: ${receiptOrder.productName}
Cantidad: ${receiptOrder.quantity} unid.
Material: ${receiptOrder.material}
Color: ${receiptOrder.color || 'A convenir'}
${receiptOrder.description ? `Detalles: ${receiptOrder.description}\n` : ''}---------------------------------------
Total Acordado: ${formatCurrency(receiptOrder.totalAmount)}
Seña / Abonado: ${formatCurrency(receiptOrder.totalPaid)}
*SALDO PENDIENTE: ${formatCurrency(receiptOrder.pendingBalance)}*
---------------------------------------
Taller 3DNA · ${config.address}, ${config.city}
Instagram: ${config.instagram} · WhatsApp: ${config.phone}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(textSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-6">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Vista Previa de Comprobante / Remito
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1 text-xs bg-violet-600 hover:bg-violet-500 text-white font-bold rounded flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={() => setIsReceiptModalOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="printable-receipt" className="p-8 bg-white text-slate-900 font-sans space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
            <BrandLogo size="md" showTagline={true} />
            <div className="text-right">
              <div className="text-xs uppercase font-bold text-slate-500">Orden de Trabajo / Remito</div>
              <div className="text-xl font-extrabold font-mono text-violet-900">
                {receiptOrder.orderNumber}
              </div>
              <div className="text-xs text-slate-500">
                Fecha: {formatDate(receiptOrder.date)}
              </div>
            </div>
          </div>

          {/* Customer & Delivery Dates */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
                Datos del Cliente
              </span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">
                {receiptOrder.customerName}
              </div>
              <div className="text-slate-600 font-mono mt-0.5">
                {receiptOrder.customerPhone || 'Sin teléfono'}
              </div>
            </div>

            <div className="text-right">
              <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
                Fecha Estimada de Entrega
              </span>
              <div className="font-bold text-violet-900 text-sm mt-0.5 font-mono">
                {formatDate(receiptOrder.estimatedDeliveryDate)}
              </div>
              <div className="text-slate-600 mt-0.5">
                Estado: <span className="font-semibold">{receiptOrder.status}</span>
              </div>
            </div>
          </div>

          {/* Item details table */}
          <div>
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 font-bold uppercase text-[10px] text-slate-700">
                <tr>
                  <th className="p-2.5 border-b">Descripción del Trabajo</th>
                  <th className="p-2.5 border-b text-center">Cant.</th>
                  <th className="p-2.5 border-b">Material / Color</th>
                  <th className="p-2.5 border-b text-right">Precio Unit.</th>
                  <th className="p-2.5 border-b text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2.5 border-b">
                    <div className="font-bold text-slate-900">{receiptOrder.productName}</div>
                    {receiptOrder.description && (
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {receiptOrder.description}
                      </div>
                    )}
                  </td>
                  <td className="p-2.5 border-b text-center font-mono font-bold">
                    {receiptOrder.quantity}
                  </td>
                  <td className="p-2.5 border-b">
                    {receiptOrder.material}
                    {receiptOrder.color && ` (${receiptOrder.color})`}
                  </td>
                  <td className="p-2.5 border-b text-right font-mono">
                    {formatCurrency(receiptOrder.agreedPrice)}
                  </td>
                  <td className="p-2.5 border-b text-right font-mono font-bold">
                    {formatCurrency(receiptOrder.totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-600">Total del Trabajo:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {formatCurrency(receiptOrder.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Seña / Abonado:</span>
                <span className="font-bold font-mono">
                  -{formatCurrency(receiptOrder.totalPaid)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-300 flex justify-between text-sm font-extrabold">
                <span className="text-slate-900">Saldo a Cobrar:</span>
                <span className="text-amber-600 font-mono">
                  {formatCurrency(receiptOrder.pendingBalance)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-4 border-t border-slate-200 text-center text-[11px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">
              ¡Gracias por elegir 3DNA! Fabricación aditiva de precisión hecha en Itá Ibaté.
            </p>
            <p>
              {config.address} · {config.city} · WhatsApp: {config.phone} · Instagram: {config.instagram}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
