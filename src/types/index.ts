export type OrderStatus =
  | 'Recibido'
  | 'Pendiente de confirmación'
  | 'Pendiente de producción'
  | 'En producción'
  | 'Terminado'
  | 'Listo para retirar'
  | 'Entregado'
  | 'Cancelado';

export type PaymentMethod =
  | 'Efectivo'
  | 'Transferencia'
  | 'Mercado Pago'
  | 'Tarjeta de Débito'
  | 'Tarjeta de Crédito'
  | 'Otro';

export type ExpenseType = 'operativo' | 'equipamiento';

export interface Order {
  id: string;
  orderNumber: string; // e.g. "PED-1001"
  date: string; // YYYY-MM-DD
  customerName: string;
  customerPhone: string;
  productName: string;
  productId?: string;
  description: string;
  quantity: number;
  color: string;
  material: string; // PLA, PETG, ABS, TPU, Resina, etc.
  notes: string;
  estimatedDeliveryDate: string; // YYYY-MM-DD
  unitCost: number;
  retailPrice: number;
  wholesalePrice: number;
  agreedPrice: number; // Unit price agreed with customer
  totalAmount: number; // agreedPrice * quantity
  initialDeposit: number;
  totalPaid: number; // Sum of all recorded payments for this order
  pendingBalance: number; // totalAmount - totalPaid
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  material: string;
  manufacturingCost: number;
  retailPrice: number;
  wholesalePrice: number;
  notes?: string;
  createdAt: string;
}

export interface Income {
  id: string;
  date: string; // YYYY-MM-DD
  orderId?: string;
  orderNumber?: string;
  customerName: string;
  concept: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  category: string;
  expenseType: ExpenseType; // 'operativo' | 'equipamiento'
  description: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  defaultType: ExpenseType;
  isCustom?: boolean;
}

export interface BusinessConfig {
  name: string;
  tagline: string;
  city: string;
  address: string;
  phone: string;
  instagram: string;
  currencySymbol: string;
  currencyCode: string;
}

export interface CalculatorState {
  filamentGrams: number;
  filamentPricePerKg: number;
  printHours: number;
  machinePowerWatts: number;
  kwhCost: number;
  machineWearPerHour: number;
  laborMinutes: number;
  laborCostPerHour: number;
  failRiskPercent: number;
  retailProfitPercent: number;
  wholesaleProfitPercent: number;
}
