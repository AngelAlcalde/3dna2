import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  PlusCircle,
  Search,
  Tag,
  Trash2,
  X,
  Save,
  Plus,
  Wrench,
  Coins,
  ShieldAlert,
  Building,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Expense, ExpenseType } from '../types';

export const ExpensesView: React.FC = () => {
  const {
    expenses,
    categories,
    addExpense,
    deleteExpense,
    addCategory,
    formatCurrency,
    formatDate,
    openConfirmModal,
  } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [typeFilter, setTypeFilter] = useState('todos');

  // Modal for new expense
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Compra de filamento');
  const [expenseType, setExpenseType] = useState<ExpenseType>('operativo');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo de caja');
  const [notes, setNotes] = useState('');

  // Category creation inline state
  const [isNewCatOpen, setIsNewCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<ExpenseType>('operativo');

  const handleCategoryChange = (selectedCatName: string) => {
    setCategory(selectedCatName);
    const found = categories.find(c => c.name === selectedCatName);
    if (found) {
      setExpenseType(found.defaultType);
    }
  };

  const handleCreateNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim(), newCatType);
    setCategory(newCatName.trim());
    setExpenseType(newCatType);
    setNewCatName('');
    setIsNewCatOpen(false);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    addExpense({
      date,
      category,
      expenseType,
      description: description.trim(),
      amount: amountNum,
      paymentMethod,
      notes: notes.trim(),
    });

    setIsModalOpen(false);
    setDescription('');
    setAmount('');
    setNotes('');
  };

  const handleDelete = (exp: Expense) => {
    openConfirmModal({
      title: '¿Eliminar Gasto?',
      message: `¿Estás seguro de eliminar el gasto de ${formatCurrency(exp.amount)} ("${exp.description}")? El balance de caja se recalculará automáticamente.`,
      isDestructive: true,
      onConfirm: () => deleteExpense(exp.id),
    });
  };

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const q = search.toLowerCase();
      const matchesSearch =
        exp.description.toLowerCase().includes(q) ||
        exp.category.toLowerCase().includes(q) ||
        (exp.notes && exp.notes.toLowerCase().includes(q));

      const matchesCat = categoryFilter === 'todas' || exp.category === categoryFilter;
      const matchesType = typeFilter === 'todos' || exp.expenseType === typeFilter;

      return matchesSearch && matchesCat && matchesType;
    });
  }, [expenses, search, categoryFilter, typeFilter]);

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalOperativo = filteredExpenses
    .filter(e => e.expenseType === 'operativo')
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalEquipamiento = filteredExpenses
    .filter(e => e.expenseType === 'equipamiento')
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Control de Gastos y Egresos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Diferenciación entre gastos operativos del taller y compras de equipamiento
          </p>
        </div>

        <button
          onClick={() => {
            setDescription('');
            setAmount('');
            setNotes('');
            setDate(new Date().toISOString().split('T')[0]);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-rose-600/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-white" />
          <span>+ REGISTRAR GASTO</span>
        </button>
      </div>

      {/* Summary KPI Cards: Total, Operativo, Equipamiento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Egresos Registrados</span>
            <ArrowUpRight className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {formatCurrency(totalFiltered)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Impacta directamente en la caja diaria
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-xs font-semibold">Gastos Operativos (Consumo)</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-900 font-mono">
            {formatCurrency(totalOperativo)}
          </div>
          <div className="text-[11px] text-amber-700/80 mt-1">
            Filamento, luz, embalajes, boquillas
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-cyan-200/80 shadow-xs">
          <div className="flex items-center justify-between text-cyan-800 mb-1">
            <span className="text-xs font-semibold">Inversión en Equipamiento</span>
            <Wrench className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-900 font-mono">
            {formatCurrency(totalEquipamiento)}
          </div>
          <div className="text-[11px] text-cyan-700/80 mt-1">
            Bienes de capital, impresoras, secadores
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por descripción o notas..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 focus:border-violet-500 rounded-lg outline-none"
          />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full px-2.5 py-2 border border-slate-300 focus:border-violet-500 rounded-lg outline-none bg-white font-medium"
          >
            <option value="todas">Todas las categorías</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="w-full px-2.5 py-2 border border-slate-300 focus:border-violet-500 rounded-lg outline-none bg-white font-medium"
          >
            <option value="todos">Todos los tipos de gasto</option>
            <option value="operativo">Solo gastos operativos</option>
            <option value="equipamiento">Solo compras de equipamiento</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            No se encontraron gastos registrados con los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Descripción</th>
                  <th className="py-3 px-4">Medio de Pago</th>
                  <th className="py-3 px-4 text-right">Importe</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono whitespace-nowrap text-slate-700">
                      {formatDate(exp.date)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-900">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          exp.expenseType === 'equipamiento'
                            ? 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {exp.expenseType === 'equipamiento' ? 'Equipamiento / Bien' : 'Operativo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-sm">
                      <div className="font-medium text-slate-900">{exp.description}</div>
                      {exp.notes && (
                        <div className="text-[11px] text-slate-400 truncate">{exp.notes}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                        {exp.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-rose-600 text-sm whitespace-nowrap">
                      -{formatCurrency(exp.amount)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(exp)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Eliminar gasto"
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

      {/* NEW EXPENSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-6">
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-rose-900 to-pink-950 text-white">
              <h3 className="text-base font-bold">+ Registrar Gasto o Compra</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-rose-200 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha del Gasto
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-rose-500 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-rose-800 mb-1">
                    Importe Saliente ($) *
                  </label>
                  <input
                    type="number"
                    required
                    step="100"
                    min="1"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm font-bold font-mono border border-rose-300 focus:border-rose-600 bg-rose-50/50 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Categoría del Gasto *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsNewCatOpen(!isNewCatOpen)}
                    className="text-[11px] font-bold text-violet-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Crear nueva categoría</span>
                  </button>
                </div>
                <select
                  value={category}
                  onChange={e => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-rose-500 rounded-lg outline-none bg-white font-medium"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.defaultType === 'equipamiento' ? 'Equipamiento' : 'Operativo'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Inline Create Category Box */}
              {isNewCatOpen && (
                <div className="p-3 bg-violet-50 rounded-xl border border-violet-200 space-y-2">
                  <div className="text-xs font-bold text-violet-900">
                    Nueva Categoría Personalizada
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nombre de categoría"
                      value={newCatName}
                      onChange={e => setNewCatName(e.target.value)}
                      className="flex-1 px-2.5 py-1 text-xs border border-violet-300 rounded bg-white"
                    />
                    <select
                      value={newCatType}
                      onChange={e => setNewCatType(e.target.value as ExpenseType)}
                      className="px-2 py-1 text-xs border border-violet-300 rounded bg-white"
                    >
                      <option value="operativo">Operativo</option>
                      <option value="equipamiento">Equipamiento</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleCreateNewCategory}
                      className="px-3 py-1 bg-violet-700 text-white rounded text-xs font-bold cursor-pointer"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              )}

              {/* Type selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Naturaleza Contable del Gasto
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExpenseType('operativo')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      expenseType === 'operativo'
                        ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-300'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold text-amber-900">Gasto Operativo</div>
                    <div className="text-[10px] text-slate-500">
                      Consumos habituales: Filamento, electricidad, packaging
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpenseType('equipamiento')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      expenseType === 'equipamiento'
                        ? 'border-cyan-400 bg-cyan-50 ring-2 ring-cyan-300'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold text-cyan-900">Equipamiento / Capital</div>
                    <div className="text-[10px] text-slate-500">
                      Inversión en impresoras, secadores, herramientas duraderas
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción del Gasto *
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ej: 2 Bobinas PLA Negro Grilon3 / Factura de luz taller"
                  className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-rose-500 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Medio de Pago Utilizado
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-rose-500 rounded-lg outline-none bg-white font-medium"
                  >
                    <option value="Efectivo de caja">Efectivo de caja diaria</option>
                    <option value="Transferencia">Transferencia bancaria</option>
                    <option value="Mercado Pago">Mercado Pago</option>
                    <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Proveedor / Observaciones
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Factura, comercio o proveedor..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-rose-500 rounded-lg outline-none"
                  />
                </div>
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
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Egreso</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
