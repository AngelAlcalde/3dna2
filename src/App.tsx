/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { OrdersView } from './components/OrdersView';
import { ProductsView } from './components/ProductsView';
import { IncomesView } from './components/IncomesView';
import { ExpensesView } from './components/ExpensesView';
import { CashFlowView } from './components/CashFlowView';
import { ConfigView } from './components/ConfigView';
import { OrderModal } from './components/OrderModal';
import { OrderDetailModal } from './components/OrderDetailModal';
import { Calculator3DModal } from './components/Calculator3DModal';
import { ReceiptPrintModal } from './components/ReceiptPrintModal';
import { BackupModal } from './components/BackupModal';
import { ConfirmModal } from './components/ConfirmModal';

const MainLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    activeView,
    isOrderModalOpen,
    setIsOrderModalOpen,
    editingOrder,
    setEditingOrder,
    selectedOrderDetail,
    setSelectedOrderDetail,
    isCalculatorModalOpen,
    setIsCalculatorModalOpen,
  } = useApp();

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'orders':
        return <OrdersView />;
      case 'products':
        return <ProductsView />;
      case 'incomes':
        return <IncomesView />;
      case 'expenses':
        return <ExpensesView />;
      case 'cashflow':
        return <CashFlowView />;
      case 'calculator':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Calculadora de Costos de Impresión 3D
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fórmula técnica de costeo por filamento, horas de máquina, energía eléctrica y márgenes
                </p>
              </div>
              <button
                onClick={() => setIsCalculatorModalOpen(true)}
                className="px-4 py-2.5 bg-violet-700 hover:bg-violet-800 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
              >
                Abrir Calculadora Interactiva
              </button>
            </div>
            {/* Embed calculator directly when on this view */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <Calculator3DModal
                isOpen={true}
                onClose={() => {}}
              />
            </div>
          </div>
        );
      case 'config':
        return <ConfigView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex text-slate-900 antialiased font-sans">
      {/* Sidebar (desktop persistent + mobile drawer) */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        {/* View Content Port */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setEditingOrder(null);
        }}
        orderToEdit={editingOrder}
      />

      <OrderDetailModal
        order={selectedOrderDetail}
        onClose={() => setSelectedOrderDetail(null)}
        onEdit={order => {
          setSelectedOrderDetail(null);
          setEditingOrder(order);
          setIsOrderModalOpen(true);
        }}
      />

      {/* Show Calculator3DModal as popup when triggered from header or other buttons */}
      {activeView !== 'calculator' && (
        <Calculator3DModal
          isOpen={isCalculatorModalOpen}
          onClose={() => setIsCalculatorModalOpen(false)}
        />
      )}

      <ReceiptPrintModal />
      <BackupModal />
      <ConfirmModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
