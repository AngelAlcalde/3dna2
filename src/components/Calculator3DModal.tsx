import React, { useState } from 'react';
import {
  X,
  Calculator,
  Zap,
  Layers,
  Wrench,
  Clock,
  Sparkles,
  PackagePlus,
  Save,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Calculator3DModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Calculator3DModal: React.FC<Calculator3DModalProps> = ({ isOpen, onClose }) => {
  const {
    formatCurrency,
    addProduct,
    setActiveView,
    setIsProductModalOpen,
    setIsOrderModalOpen,
    setEditingOrder,
  } = useApp();

  // Inputs
  const [modelName, setModelName] = useState('Pieza 3D');
  const [materialType, setMaterialType] = useState('PLA');
  const [filamentGrams, setFilamentGrams] = useState(85);
  const [filamentPricePerKg, setFilamentPricePerKg] = useState(18000);
  const [printHours, setPrintHours] = useState(4.5);
  const [printerWatts, setPrinterWatts] = useState(150);
  const [kwhCost, setKwhCost] = useState(120); // ARS per kWh
  const [machineWearPerHour, setMachineWearPerHour] = useState(150); // Wear / depreciation ARS/h
  const [laborMinutes, setLaborMinutes] = useState(15);
  const [laborHourlyRate, setLaborHourlyRate] = useState(3000);
  const [failRiskPercent, setFailRiskPercent] = useState(10); // 10% risk margin
  const [retailMarginPercent, setRetailMarginPercent] = useState(150); // 150% markup for retail
  const [wholesaleMarginPercent, setWholesaleMarginPercent] = useState(80); // 80% markup for wholesale

  if (!isOpen) return null;

  // Real 3D calculations
  const materialCost = (filamentGrams / 1000) * filamentPricePerKg;
  const energyKwh = (printerWatts / 1000) * printHours;
  const energyCost = energyKwh * kwhCost;
  const wearCost = printHours * machineWearPerHour;
  const laborCost = (laborMinutes / 60) * laborHourlyRate;

  const baseCost = materialCost + energyCost + wearCost + laborCost;
  const totalCost = baseCost * (1 + failRiskPercent / 100);

  // Suggested Prices
  const retailSuggested = Math.round((totalCost * (1 + retailMarginPercent / 100)) / 100) * 100;
  const wholesaleSuggested = Math.round((totalCost * (1 + wholesaleMarginPercent / 100)) / 100) * 100;

  const retailProfit = retailSuggested - totalCost;
  const wholesaleProfit = wholesaleSuggested - totalCost;

  const handleSaveToCatalog = () => {
    addProduct({
      name: modelName.trim() || 'Pieza 3D Calculada',
      description: `Fabricación estimada: ${printHours}hs, ${filamentGrams}g de ${materialType}.`,
      category: 'Calculado 3DNA',
      material: materialType,
      manufacturingCost: Math.round(totalCost),
      retailPrice: retailSuggested,
      wholesalePrice: wholesaleSuggested,
      notes: `Consumo: ${filamentGrams}g, tiempo: ${printHours}hs.`,
    });
    onClose();
    setActiveView('products');
  };

  const handleCreateOrder = () => {
    onClose();
    setEditingOrder(null);
    setIsOrderModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-violet-900 via-indigo-900 to-purple-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400 text-slate-950 rounded-xl font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Calculadora de Costos de Impresión 3D</h3>
              <p className="text-xs text-violet-200">
                Costeo preciso de filamento, horas de máquina, energía y margen sugerido
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-violet-200 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[80vh] overflow-y-auto">
          {/* Left Column: Cost Inputs (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre de Referencia de la Pieza
              </label>
              <input
                type="text"
                value={modelName}
                onChange={e => setModelName(e.target.value)}
                placeholder="Ej: Maceta Facetada 15cm"
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none focus:border-violet-500"
              />
            </div>

            {/* Material & Weight */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-violet-600" />
                1. Filamento y Material
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Tipo Material
                  </label>
                  <select
                    value={materialType}
                    onChange={e => setMaterialType(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white"
                  >
                    <option value="PLA">PLA</option>
                    <option value="PLA Silk">PLA Silk</option>
                    <option value="PETG">PETG</option>
                    <option value="ABS">ABS</option>
                    <option value="TPU">TPU</option>
                    <option value="Resina">Resina</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Peso de Pieza (g)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={filamentGrams}
                    onChange={e => setFilamentGrams(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Precio Bobina ($/kg)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={filamentPricePerKg}
                    onChange={e => setFilamentPricePerKg(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs font-mono border border-slate-300 rounded"
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>Costo filamento:</span>
                <span className="font-bold text-slate-800 font-mono">
                  {formatCurrency(materialCost)}
                </span>
              </div>
            </div>

            {/* Printing Time & Machine wear */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-600" />
                2. Tiempo de Impresión y Desgaste
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Horas de Impresión
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.5"
                    value={printHours}
                    onChange={e => setPrintHours(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Potencia (Watts)
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="10"
                    value={printerWatts}
                    onChange={e => setPrinterWatts(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs font-mono border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Costo kWh ($)
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={kwhCost}
                    onChange={e => setKwhCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs font-mono border border-slate-300 rounded"
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>Costo energía ({energyKwh.toFixed(2)} kWh) + Desgaste (${machineWearPerHour}/h):</span>
                <span className="font-bold text-slate-800 font-mono">
                  {formatCurrency(energyCost + wearCost)}
                </span>
              </div>
            </div>

            {/* Post-processing & Risk */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-600" />
                3. Mano de Obra y Riesgo de Fallo
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Minutos Operario
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={laborMinutes}
                    onChange={e => setLaborMinutes(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs font-mono border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Valor Hora ($)
                  </label>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    value={laborHourlyRate}
                    onChange={e => setLaborHourlyRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs font-mono border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Margen Fallo (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={failRiskPercent}
                    onChange={e => setFailRiskPercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs font-mono border border-slate-300 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Markup percentages */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-violet-800 mb-1">
                  Margen Minorista (%)
                </label>
                <input
                  type="number"
                  min="10"
                  step="10"
                  value={retailMarginPercent}
                  onChange={e => setRetailMarginPercent(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 font-bold font-mono border border-violet-300 rounded-lg bg-violet-50/50"
                />
              </div>
              <div>
                <label className="block font-semibold text-cyan-800 mb-1">
                  Margen Mayorista (%)
                </label>
                <input
                  type="number"
                  min="10"
                  step="10"
                  value={wholesaleMarginPercent}
                  onChange={e => setWholesaleMarginPercent(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 font-bold font-mono border border-cyan-300 rounded-lg bg-cyan-50/50"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Cost Breakdown & Suggested Prices Card (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-[#1b0b38] to-[#2e1065] text-white p-5 rounded-2xl shadow-lg border border-violet-800/40">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-violet-800/50">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Desglose de Costo Unitario
                </span>
                <span className="text-[11px] font-mono text-cyan-300">
                  {filamentGrams}g · {printHours}hs
                </span>
              </div>

              {/* Items Breakdown */}
              <div className="py-3 space-y-2 text-xs border-b border-violet-800/50">
                <div className="flex justify-between text-violet-200">
                  <span>Filamento ({filamentGrams}g):</span>
                  <span className="font-mono text-white">{formatCurrency(materialCost)}</span>
                </div>
                <div className="flex justify-between text-violet-200">
                  <span>Energía ({energyKwh.toFixed(2)} kWh):</span>
                  <span className="font-mono text-white">{formatCurrency(energyCost)}</span>
                </div>
                <div className="flex justify-between text-violet-200">
                  <span>Desgaste de impresora:</span>
                  <span className="font-mono text-white">{formatCurrency(wearCost)}</span>
                </div>
                <div className="flex justify-between text-violet-200">
                  <span>Mano de obra ({laborMinutes} min):</span>
                  <span className="font-mono text-white">{formatCurrency(laborCost)}</span>
                </div>
                <div className="flex justify-between text-amber-300 pt-1 border-t border-violet-900/60">
                  <span>Riesgo de fallo (+{failRiskPercent}%):</span>
                  <span className="font-mono">
                    +{formatCurrency(totalCost - baseCost)}
                  </span>
                </div>
              </div>

              {/* Total Unit Cost Highlight */}
              <div className="py-3 border-b border-violet-800/50 flex items-center justify-between">
                <span className="text-sm font-bold text-violet-100">Costo Total Fabricación:</span>
                <span className="text-xl font-extrabold text-amber-400 font-mono">
                  {formatCurrency(totalCost)}
                </span>
              </div>

              {/* Suggested Prices Cards */}
              <div className="py-3 space-y-3">
                {/* Minorista */}
                <div className="p-3 rounded-xl bg-violet-900/60 border border-violet-700/60">
                  <div className="flex justify-between text-xs font-bold text-violet-200">
                    <span>Precio Venta Minorista Sugerido:</span>
                    <span className="text-amber-300">+{retailMarginPercent}%</span>
                  </div>
                  <div className="text-2xl font-extrabold text-white font-mono mt-0.5">
                    {formatCurrency(retailSuggested)}
                  </div>
                  <div className="text-xs text-emerald-400 font-semibold mt-1">
                    Ganancia neta: +{formatCurrency(retailProfit)} por unidad
                  </div>
                </div>

                {/* Mayorista */}
                <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-800/60">
                  <div className="flex justify-between text-xs font-bold text-cyan-200">
                    <span>Precio Venta Mayorista Sugerido:</span>
                    <span className="text-cyan-300">+{wholesaleMarginPercent}%</span>
                  </div>
                  <div className="text-2xl font-extrabold text-white font-mono mt-0.5">
                    {formatCurrency(wholesaleSuggested)}
                  </div>
                  <div className="text-xs text-cyan-400 font-semibold mt-1">
                    Ganancia neta: +{formatCurrency(wholesaleProfit)} por unidad
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-violet-800/50 space-y-2">
              <button
                onClick={handleSaveToCatalog}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Guardar como Producto en Catálogo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
