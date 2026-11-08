import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  initialBusinessConfig,
  initialExpenseCategories,
  initialExpenses,
  initialIncomes,
  initialOrders,
  initialProducts,
} from '../data/initialData';
import {
  BusinessConfig,
  Expense,
  ExpenseCategory,
  ExpenseType,
  Income,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
} from '../types';

interface ConfirmModalData {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  isDestructive?: boolean;
  confirmButtonText?: string;
  requireKeyword?: string;
}

interface AppContextType {
  // Navigation & search
  activeView: string;
  setActiveView: (view: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Data
  orders: Order[];
  products: Product[];
  incomes: Income[];
  expenses: Expense[];
  categories: ExpenseCategory[];
  config: BusinessConfig;

  // Order actions
  addOrder: (
    data: Omit<Order, 'id' | 'orderNumber' | 'totalPaid' | 'pendingBalance' | 'createdAt' | 'updatedAt'>,
    initialDepositAmount?: number,
    depositPaymentMethod?: PaymentMethod
  ) => Order;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  deleteOrders: (ids: string[]) => void;
  clearAllOrders: () => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;

  // Product actions
  addProduct: (data: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Income actions
  addIncome: (data: Omit<Income, 'id' | 'createdAt'>) => void;
  deleteIncome: (id: string) => void;

  // Expense actions
  addExpense: (data: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addCategory: (name: string, defaultType: ExpenseType) => void;

  // Database maintenance & cleanup
  clearFinancials: () => void;
  clearEntireDatabase: (keepProducts?: boolean) => void;

  // Config & backup
  updateConfig: (updates: Partial<BusinessConfig>) => void;
  resetToDemoData: () => void;
  exportBackup: () => void;
  importBackup: (jsonData: string) => boolean;

  // Modals
  isOrderModalOpen: boolean;
  setIsOrderModalOpen: (open: boolean) => void;
  editingOrder: Order | null;
  setEditingOrder: (order: Order | null) => void;

  selectedOrderDetail: Order | null;
  setSelectedOrderDetail: (order: Order | null) => void;

  isProductModalOpen: boolean;
  setIsProductModalOpen: (open: boolean) => void;
  editingProduct: Product | null;
  setEditingProduct: (product: Product | null) => void;

  isIncomeModalOpen: boolean;
  setIsIncomeModalOpen: (open: boolean) => void;
  prefilledOrderForIncome: Order | null;
  setPrefilledOrderForIncome: (order: Order | null) => void;

  isExpenseModalOpen: boolean;
  setIsExpenseModalOpen: (open: boolean) => void;
  editingExpense: Expense | null;
  setEditingExpense: (expense: Expense | null) => void;

  isReceiptModalOpen: boolean;
  setIsReceiptModalOpen: (open: boolean) => void;
  receiptOrder: Order | null;
  setReceiptOrder: (order: Order | null) => void;

  isCalculatorModalOpen: boolean;
  setIsCalculatorModalOpen: (open: boolean) => void;

  isBackupModalOpen: boolean;
  setIsBackupModalOpen: (open: boolean) => void;

  confirmModal: ConfirmModalData;
  openConfirmModal: (data: Omit<ConfirmModalData, 'isOpen'>) => void;
  closeConfirmModal: () => void;

  // Helpers & computed metrics
  formatCurrency: (val: number) => string;
  formatDate: (dateStr: string) => string;
  metrics: {
    totalOrders: number;
    pendingOrdersCount: number;
    inProductionCount: number;
    finishedCount: number;
    deliveredCount: number;
    monthIncomes: number;
    monthExpenses: number;
    monthNetProfit: number;
    pendingToCollect: number;
    totalIncomesAllTime: number;
    totalExpensesAllTime: number;
    cashBalance: number;
    totalCapitalInvestment: number;
    totalOperationalExpenses: number;
    estimatedRealProfit: number;
  };
}

const STORAGE_KEYS = {
  ORDERS: '3dna_orders_v1',
  PRODUCTS: '3dna_products_v1',
  INCOMES: '3dna_incomes_v1',
  EXPENSES: '3dna_expenses_v1',
  CATEGORIES: '3dna_categories_v1',
  CONFIG: '3dna_config_v1',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Persisted state with fallback to initial data
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return stored ? JSON.parse(stored) : initialOrders;
    } catch {
      return initialOrders;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return stored ? JSON.parse(stored) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  const [incomes, setIncomes] = useState<Income[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INCOMES);
      return stored ? JSON.parse(stored) : initialIncomes;
    } catch {
      return initialIncomes;
    }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return stored ? JSON.parse(stored) : initialExpenses;
    } catch {
      return initialExpenses;
    }
  });

  const [categories, setCategories] = useState<ExpenseCategory[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return stored ? JSON.parse(stored) : initialExpenseCategories;
    } catch {
      return initialExpenseCategories;
    }
  });

  const [config, setConfig] = useState<BusinessConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return stored ? JSON.parse(stored) : initialBusinessConfig;
    } catch {
      return initialBusinessConfig;
    }
  });

  // Modal states
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [prefilledOrderForIncome, setPrefilledOrderForIncome] = useState<Order | null>(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  const [confirmModal, setConfirmModal] = useState<ConfirmModalData>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDestructive: false,
  });

  const openConfirmModal = (data: Omit<ConfirmModalData, 'isOpen'>) => {
    setConfirmModal({ ...data, isOpen: true });
  };

  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  // Keep localStorage in sync
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error('Error saving orders to localStorage', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products to localStorage', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes));
    } catch (e) {
      console.error('Error saving incomes to localStorage', e);
    }
  }, [incomes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (e) {
      console.error('Error saving expenses to localStorage', e);
    }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Error saving categories to localStorage', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('Error saving config to localStorage', e);
    }
  }, [config]);

  // Currency & Date formatting helpers
  const formatCurrency = (val: number): string => {
    if (isNaN(val)) return '$ 0';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '-';
    try {
      // Handles YYYY-MM-DD cleanly without time-zone shift
      const parts = dateStr.split('T')[0].split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];
        return `${day}/${month}/${year}`;
      }
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // ORDER ACTIONS
  const addOrder = (
    data: Omit<Order, 'id' | 'orderNumber' | 'totalPaid' | 'pendingBalance' | 'createdAt' | 'updatedAt'>,
    initialDepositAmount = 0,
    depositPaymentMethod: PaymentMethod = 'Efectivo'
  ): Order => {
    // Generate next order number
    const maxNum = orders.reduce((max, ord) => {
      const match = ord.orderNumber.match(/\d+/);
      const n = match ? parseInt(match[0], 10) : 1000;
      return n > max ? n : max;
    }, 1000);
    const nextOrderNumber = `PED-${maxNum + 1}`;
    const orderId = `ped-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const deposit = Math.min(Math.max(0, initialDepositAmount), data.totalAmount);
    const pending = Math.max(0, data.totalAmount - deposit);

    const newOrder: Order = {
      ...data,
      id: orderId,
      orderNumber: nextOrderNumber,
      initialDeposit: deposit,
      totalPaid: deposit,
      pendingBalance: pending,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setOrders(prev => [newOrder, ...prev]);

    // If initial deposit is paid, register an Income record automatically
    if (deposit > 0) {
      const newIncome: Income = {
        id: `inc-${Date.now()}`,
        date: data.date || nowIso.split('T')[0],
        orderId: orderId,
        orderNumber: nextOrderNumber,
        customerName: data.customerName,
        concept: `Seña inicial Pedido #${nextOrderNumber} (${data.productName})`,
        amount: deposit,
        paymentMethod: depositPaymentMethod,
        notes: `Seña registrada al crear el pedido.`,
        createdAt: nowIso,
      };
      setIncomes(prev => [newIncome, ...prev]);
    }

    return newOrder;
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id !== id) return ord;
        const totalAmount = updates.totalAmount ?? ord.totalAmount;
        const totalPaid = updates.totalPaid ?? ord.totalPaid;
        const pendingBalance = Math.max(0, totalAmount - totalPaid);
        const updated = {
          ...ord,
          ...updates,
          totalAmount,
          pendingBalance,
          updatedAt: new Date().toISOString(),
        };
        // Also update selectedOrderDetail if active
        if (selectedOrderDetail && selectedOrderDetail.id === id) {
          setSelectedOrderDetail(updated);
        }
        return updated;
      })
    );
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    if (selectedOrderDetail && selectedOrderDetail.id === id) {
      setSelectedOrderDetail(null);
    }
  };

  const deleteOrders = (ids: string[]) => {
    const idSet = new Set(ids);
    setOrders(prev => prev.filter(o => !idSet.has(o.id)));
    if (selectedOrderDetail && idSet.has(selectedOrderDetail.id)) {
      setSelectedOrderDetail(null);
    }
  };

  const clearAllOrders = () => {
    setOrders([]);
    setSelectedOrderDetail(null);
    setEditingOrder(null);
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    updateOrder(id, { status });
  };

  // PRODUCT ACTIONS
  const addProduct = (data: Omit<Product, 'id' | 'createdAt'>): Product => {
    const newProduct: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // INCOME ACTIONS
  const addIncome = (data: Omit<Income, 'id' | 'createdAt'>) => {
    const newIncome: Income = {
      ...data,
      id: `inc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setIncomes(prev => [newIncome, ...prev]);

    // If tied to an order, update the order's totalPaid and pendingBalance
    if (data.orderId) {
      setOrders(prev =>
        prev.map(ord => {
          if (ord.id !== data.orderId) return ord;
          const newTotalPaid = (ord.totalPaid || 0) + data.amount;
          const newPending = Math.max(0, ord.totalAmount - newTotalPaid);
          const updated = {
            ...ord,
            totalPaid: newTotalPaid,
            pendingBalance: newPending,
            updatedAt: new Date().toISOString(),
          };
          if (selectedOrderDetail && selectedOrderDetail.id === ord.id) {
            setSelectedOrderDetail(updated);
          }
          return updated;
        })
      );
    }
  };

  const deleteIncome = (id: string) => {
    const incomeToDelete = incomes.find(inc => inc.id === id);
    if (incomeToDelete && incomeToDelete.orderId) {
      // Revert paid amount on the order
      setOrders(prev =>
        prev.map(ord => {
          if (ord.id !== incomeToDelete.orderId) return ord;
          const newTotalPaid = Math.max(0, (ord.totalPaid || 0) - incomeToDelete.amount);
          const newPending = Math.max(0, ord.totalAmount - newTotalPaid);
          const updated = {
            ...ord,
            totalPaid: newTotalPaid,
            pendingBalance: newPending,
            updatedAt: new Date().toISOString(),
          };
          if (selectedOrderDetail && selectedOrderDetail.id === ord.id) {
            setSelectedOrderDetail(updated);
          }
          return updated;
        })
      );
    }
    setIncomes(prev => prev.filter(i => i.id !== id));
  };

  // EXPENSE ACTIONS
  const addExpense = (data: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...data,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => (e.id === id ? { ...e, ...updates } : e)));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addCategory = (name: string, defaultType: ExpenseType) => {
    if (!name.trim()) return;
    const exists = categories.some(c => c.name.toLowerCase() === name.trim().toLowerCase());
    if (exists) return;
    const newCat: ExpenseCategory = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      defaultType,
      isCustom: true,
    };
    setCategories(prev => [...prev, newCat]);
  };

  // CONFIG & BACKUP
  const updateConfig = (updates: Partial<BusinessConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  // DATABASE CLEANUP & RESET
  const clearFinancials = () => {
    setIncomes([]);
    setExpenses([]);
  };

  const clearEntireDatabase = (keepProducts = true) => {
    setOrders([]);
    setIncomes([]);
    setExpenses([]);
    setSelectedOrderDetail(null);
    setEditingOrder(null);
    if (!keepProducts) {
      setProducts([]);
    }
  };

  const resetToDemoData = () => {
    setOrders(initialOrders);
    setProducts(initialProducts);
    setIncomes(initialIncomes);
    setExpenses(initialExpenses);
    setCategories(initialExpenseCategories);
    setConfig(initialBusinessConfig);
  };

  const exportBackup = () => {
    const data = {
      appName: '3DNA - Sistema de Gestión',
      exportDate: new Date().toISOString(),
      orders,
      products,
      incomes,
      expenses,
      categories,
      config,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `3DNA_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importBackup = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (Array.isArray(parsed.orders)) setOrders(parsed.orders);
      if (Array.isArray(parsed.products)) setProducts(parsed.products);
      if (Array.isArray(parsed.incomes)) setIncomes(parsed.incomes);
      if (Array.isArray(parsed.expenses)) setExpenses(parsed.expenses);
      if (Array.isArray(parsed.categories)) setCategories(parsed.categories);
      if (parsed.config && typeof parsed.config === 'object') setConfig(parsed.config);
      return true;
    } catch (e) {
      console.error('Import error', e);
      return false;
    }
  };

  // COMPUTED METRICS
  const metrics = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentYearMonth = `${currentYear}-${currentMonth}`;

    const totalOrders = orders.length;
    const pendingOrdersCount = orders.filter(o =>
      ['Recibido', 'Pendiente de confirmación', 'Pendiente de producción'].includes(o.status)
    ).length;
    const inProductionCount = orders.filter(o => o.status === 'En producción').length;
    const finishedCount = orders.filter(o =>
      ['Terminado', 'Listo para retirar'].includes(o.status)
    ).length;
    const deliveredCount = orders.filter(o => o.status === 'Entregado').length;

    // Total incomes (actual money received)
    const totalIncomesAllTime = incomes.reduce((sum, inc) => sum + (inc.amount || 0), 0);

    // Current month incomes
    const monthIncomes = incomes
      .filter(inc => (inc.date || '').startsWith(currentYearMonth))
      .reduce((sum, inc) => sum + (inc.amount || 0), 0);

    // Total expenses & current month expenses
    const totalExpensesAllTime = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    const monthExpenses = expenses
      .filter(exp => (exp.date || '').startsWith(currentYearMonth))
      .reduce((sum, exp) => sum + (exp.amount || 0), 0);

    // Month net profit (Month incomes - Month expenses)
    const monthNetProfit = monthIncomes - monthExpenses;

    // Pending to collect: sum of pendingBalance from non-cancelled orders
    const pendingToCollect = orders
      .filter(o => o.status !== 'Cancelado')
      .reduce((sum, o) => sum + (o.pendingBalance || 0), 0);

    // Cash balance (Available cash in hand / bank: all incomes received - all expenses paid)
    const cashBalance = totalIncomesAllTime - totalExpensesAllTime;

    // Breakdown between capital reinvestment vs operational expenses
    const totalCapitalInvestment = expenses
      .filter(e => e.expenseType === 'equipamiento')
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const totalOperationalExpenses = expenses
      .filter(e => e.expenseType !== 'equipamiento')
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    // Estimated real profit (Incomes minus purely operational expenses)
    const estimatedRealProfit = totalIncomesAllTime - totalOperationalExpenses;

    return {
      totalOrders,
      pendingOrdersCount,
      inProductionCount,
      finishedCount,
      deliveredCount,
      monthIncomes,
      monthExpenses,
      monthNetProfit,
      pendingToCollect,
      totalIncomesAllTime,
      totalExpensesAllTime,
      cashBalance,
      totalCapitalInvestment,
      totalOperationalExpenses,
      estimatedRealProfit,
    };
  }, [orders, incomes, expenses]);

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        searchQuery,
        setSearchQuery,
        orders,
        products,
        incomes,
        expenses,
        categories,
        config,
        addOrder,
        updateOrder,
        deleteOrder,
        deleteOrders,
        clearAllOrders,
        updateOrderStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        addIncome,
        deleteIncome,
        addExpense,
        updateExpense,
        deleteExpense,
        addCategory,
        clearFinancials,
        clearEntireDatabase,
        updateConfig,
        resetToDemoData,
        exportBackup,
        importBackup,
        isOrderModalOpen,
        setIsOrderModalOpen,
        editingOrder,
        setEditingOrder,
        selectedOrderDetail,
        setSelectedOrderDetail,
        isProductModalOpen,
        setIsProductModalOpen,
        editingProduct,
        setEditingProduct,
        isIncomeModalOpen,
        setIsIncomeModalOpen,
        prefilledOrderForIncome,
        setPrefilledOrderForIncome,
        isExpenseModalOpen,
        setIsExpenseModalOpen,
        editingExpense,
        setEditingExpense,
        isReceiptModalOpen,
        setIsReceiptModalOpen,
        receiptOrder,
        setReceiptOrder,
        isCalculatorModalOpen,
        setIsCalculatorModalOpen,
        isBackupModalOpen,
        setIsBackupModalOpen,
        confirmModal,
        openConfirmModal,
        closeConfirmModal,
        formatCurrency,
        formatDate,
        metrics,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
