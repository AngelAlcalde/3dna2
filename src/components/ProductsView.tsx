import React, { useState } from 'react';
import {
  Boxes,
  PlusCircle,
  Search,
  Tag,
  Edit,
  Trash2,
  TrendingUp,
  PackagePlus,
  X,
  Save,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';

export const ProductsView: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    formatCurrency,
    setIsOrderModalOpen,
    setEditingOrder,
    openConfirmModal,
  } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todas');

  // Modal state for adding/editing product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [material, setMaterial] = useState('PLA');
  const [manufacturingCost, setManufacturingCost] = useState(0);
  const [retailPrice, setRetailPrice] = useState(0);
  const [wholesalePrice, setWholesalePrice] = useState(0);
  const [notes, setNotes] = useState('');

  // Extract unique categories
  const categories = Array.from(new Set(products.map(p => p.category || 'General')));

  // Computed profits
  const retailProfit = retailPrice - manufacturingCost;
  const wholesaleProfit = wholesalePrice - manufacturingCost;
  const retailMarginPercent = manufacturingCost > 0 ? Math.round((retailProfit / manufacturingCost) * 100) : 0;
  const wholesaleMarginPercent = manufacturingCost > 0 ? Math.round((wholesaleProfit / manufacturingCost) * 100) : 0;

  const openNewModal = () => {
    setEditingProd(null);
    setName('');
    setDescription('');
    setCategory('General');
    setMaterial('PLA');
    setManufacturingCost(2000);
    setRetailPrice(5000);
    setWholesalePrice(3800);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProd(p);
    setName(p.name);
    setDescription(p.description);
    setCategory(p.category);
    setMaterial(p.material);
    setManufacturingCost(p.manufacturingCost);
    setRetailPrice(p.retailPrice);
    setWholesalePrice(p.wholesalePrice);
    setNotes(p.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingProd) {
      updateProduct(editingProd.id, {
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        material: material.trim(),
        manufacturingCost: Number(manufacturingCost),
        retailPrice: Number(retailPrice),
        wholesalePrice: Number(wholesalePrice),
        notes: notes.trim(),
      });
    } else {
      addProduct({
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        material: material.trim(),
        manufacturingCost: Number(manufacturingCost),
        retailPrice: Number(retailPrice),
        wholesalePrice: Number(wholesalePrice),
        notes: notes.trim(),
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (p: Product) => {
    openConfirmModal({
      title: '¿Eliminar Producto?',
      message: `¿Estás seguro de eliminar el producto "${p.name}" del catálogo?`,
      isDestructive: true,
      onConfirm: () => deleteProduct(p.id),
    });
  };

  const handleCreateOrderWithProduct = (p: Product) => {
    setEditingOrder(null);
    setIsOrderModalOpen(true);
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.material.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'todas' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Catálogo de Productos y Precios
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión de piezas habituales, costos de filamento y márgenes de ganancia automáticos
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-slate-950" />
          <span>+ NUEVO PRODUCTO</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre de producto, material o descripción..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 focus:border-violet-500 rounded-lg outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full px-2.5 py-2 border border-slate-300 focus:border-violet-500 rounded-lg outline-none bg-white font-medium"
          >
            <option value="todas">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(p => {
          const rProfit = p.retailPrice - p.manufacturingCost;
          const wProfit = p.wholesalePrice - p.manufacturingCost;
          const rPercent =
            p.manufacturingCost > 0 ? Math.round((rProfit / p.manufacturingCost) * 100) : 0;
          const wPercent =
            p.manufacturingCost > 0 ? Math.round((wProfit / p.manufacturingCost) * 100) : 0;

          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between hover:border-violet-300 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-100 text-violet-800">
                    {p.category}
                  </span>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1 text-slate-400 hover:text-violet-700 hover:bg-violet-50 rounded transition-colors"
                      title="Editar precios o producto"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug mb-1">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                  {p.description || 'Sin descripción detallada.'}
                </p>

                {/* Specs */}
                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-4 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Material sugerido:</span>
                    <span className="font-semibold text-slate-800">{p.material}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Costo de fabricación:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrency(p.manufacturingCost)}
                    </span>
                  </div>
                  {p.notes && (
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 truncate">
                      Nota: {p.notes}
                    </div>
                  )}
                </div>

                {/* Pricing & Automatic Profit Matrix (Exact user requirement) */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Retail Box */}
                  <div className="p-2.5 rounded-xl bg-violet-50/70 border border-violet-100">
                    <div className="text-[10px] font-bold text-violet-800 uppercase tracking-tight">
                      Venta Minorista
                    </div>
                    <div className="text-base font-extrabold text-violet-950 font-mono mt-0.5">
                      {formatCurrency(p.retailPrice)}
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-700 mt-1">
                      Ganancia: +{formatCurrency(rProfit)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Margen: +{rPercent}%
                    </div>
                  </div>

                  {/* Wholesale Box */}
                  <div className="p-2.5 rounded-xl bg-cyan-50/70 border border-cyan-100">
                    <div className="text-[10px] font-bold text-cyan-800 uppercase tracking-tight">
                      Venta Mayorista
                    </div>
                    <div className="text-base font-extrabold text-cyan-950 font-mono mt-0.5">
                      {formatCurrency(p.wholesalePrice)}
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-700 mt-1">
                      Ganancia: +{formatCurrency(wProfit)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Margen: +{wPercent}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button: Use in New Order */}
              <button
                onClick={() => handleCreateOrderWithProduct(p)}
                className="mt-4 w-full py-2 px-3 bg-slate-100 hover:bg-violet-700 hover:text-white text-slate-700 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PackagePlus className="w-3.5 h-3.5" />
                <span>Crear Pedido con este Producto</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-6">
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-violet-900 to-indigo-950 text-white">
              <h3 className="text-base font-bold">
                {editingProd ? 'Editar Producto del Catálogo' : '+ Agregar Nuevo Producto 3D'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-violet-300 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej: Mate Camionero Térmico 3D"
                  className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-violet-500 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="Mates, Trofeos, Repuestos..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-violet-500 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Material Recomendado
                  </label>
                  <input
                    type="text"
                    value={material}
                    onChange={e => setMaterial(e.target.value)}
                    placeholder="PLA, PETG, ABS..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-violet-500 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Características del modelo, tamaño, acabado..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-violet-500 rounded-lg outline-none"
                />
              </div>

              {/* Price Calculation inputs */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Cálculo de Precios y Ganancias
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Costo Fabricación
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={manufacturingCost}
                      onChange={e => setManufacturingCost(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-violet-800 mb-1">
                      Venta Minorista
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={retailPrice}
                      onChange={e => setRetailPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 text-xs font-mono font-bold border border-violet-300 rounded-lg bg-violet-50/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-cyan-800 mb-1">
                      Venta Mayorista
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={wholesalePrice}
                      onChange={e => setWholesalePrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 text-xs font-mono font-bold border border-cyan-300 rounded-lg bg-cyan-50/50"
                    />
                  </div>
                </div>

                {/* Automatic Gain Display (Prompt example: Costo $2.000, Minorista $5.000 -> Ganancia $3.000) */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200">
                  <div className="text-emerald-700">
                    <span className="font-semibold block">Ganancia Minorista:</span>
                    <span className="font-mono font-bold text-sm">
                      +{formatCurrency(retailProfit)}
                    </span>{' '}
                    <span className="text-[11px] text-slate-500">({retailMarginPercent}%)</span>
                  </div>
                  <div className="text-emerald-700">
                    <span className="font-semibold block">Ganancia Mayorista:</span>
                    <span className="font-mono font-bold text-sm">
                      +{formatCurrency(wholesaleProfit)}
                    </span>{' '}
                    <span className="text-[11px] text-slate-500">({wholesaleMarginPercent}%)</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observaciones Técnicas / Slicer
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ej: Relleno giroide 20%, 4 paredes, altura 0.16mm"
                  className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-violet-500 rounded-lg outline-none"
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
                  className="px-4 py-2 bg-violet-700 hover:bg-violet-800 text-white font-bold rounded-lg text-xs shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProd ? 'Guardar Cambios' : 'Registrar Producto'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
