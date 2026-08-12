import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useExpenseTracker } from './hooks/useExpenseTracker';
import LoginView from './components/auth/LoginView';
import AppLayout from './components/layout/AppLayout';
import DashboardView from './components/dashboard/DashboardView';
import MembersView from './components/members/MembersView';
import PaymentsView from './components/payments/PaymentsView';
import ExpensesView from './components/expenses/ExpensesView';
import CommonPaymentsView from './components/commonPayments/CommonPaymentsView';
import SettingsBackupModal from './components/settings/SettingsBackupModal';
import ConfirmationModal from './components/common/ConfirmationModal';

function MainApp() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Deletion confirmation modal state
  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const tracker = useExpenseTracker();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  // --- Deletion Dialog Handlers ---
  const handleDeleteMemberPrompt = (id, name) => {
    setConfirmModalState({
      isOpen: true,
      title: `Delete Member "${name}"?`,
      message: `Are you sure you want to delete member "${name}"? All associated payment records for this member will also be removed permanently.`,
      onConfirm: () => {
        tracker.deleteMember(id);
        setConfirmModalState({ isOpen: false });
      }
    });
  };

  const handleDeletePaymentPrompt = (id, amount) => {
    setConfirmModalState({
      isOpen: true,
      title: 'Delete Member Payment?',
      message: `Are you sure you want to delete payment record of ₹${amount}? Member paid balance and dashboard totals will automatically adjust.`,
      onConfirm: () => {
        tracker.deletePayment(id);
        setConfirmModalState({ isOpen: false });
      }
    });
  };

  const handleDeleteExpensePrompt = (id, name) => {
    setConfirmModalState({
      isOpen: true,
      title: `Delete Expense "${name}"?`,
      message: `Are you sure you want to delete expense "${name}" and all of its payment history? This action cannot be undone.`,
      onConfirm: () => {
        tracker.deleteExpense(id);
        setConfirmModalState({ isOpen: false });
      }
    });
  };

  const handleDeleteExpensePaymentPrompt = (id, amount) => {
    setConfirmModalState({
      isOpen: true,
      title: 'Delete Expense Payment?',
      message: `Are you sure you want to delete expense payment transaction of ₹${amount}? Remaining balance and status will automatically recalculate.`,
      onConfirm: () => {
        tracker.deleteExpensePayment(id);
        setConfirmModalState({ isOpen: false });
      }
    });
  };

  const handleSelectMemberForPayment = (memberId) => {
    setActiveTab('payments');
  };

  return (
    <AppLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onOpenBackupModal={() => setIsBackupModalOpen(true)}
    >
      {activeTab === 'dashboard' && <DashboardView trackerData={tracker} />}

      {activeTab === 'members' && (
        <MembersView
          trackerData={tracker}
          onAddMember={tracker.addMember}
          onUpdateMember={tracker.updateMember}
          onDeleteMember={handleDeleteMemberPrompt}
        />
      )}

      {activeTab === 'payments' && (
        <PaymentsView
          trackerData={tracker}
          onAddPayment={tracker.addPayment}
          onUpdatePayment={tracker.updatePayment}
          onDeletePayment={handleDeletePaymentPrompt}
        />
      )}

      {activeTab === 'expenses' && (
        <ExpensesView
          trackerData={tracker}
          onAddExpense={tracker.addExpense}
          onUpdateExpense={tracker.updateExpense}
          onDeleteExpense={handleDeleteExpensePrompt}
          onAddExpensePayment={tracker.addExpensePayment}
          onUpdateExpensePayment={tracker.updateExpensePayment}
          onDeleteExpensePayment={handleDeleteExpensePaymentPrompt}
        />
      )}

      {activeTab === 'common' && (
        <CommonPaymentsView
          trackerData={tracker}
          onUpdateCommonAmount={tracker.updateCommonPaymentAmount}
          onSelectMemberForPayment={handleSelectMemberForPayment}
        />
      )}

      {/* Backup / Restore Modal */}
      <SettingsBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onExport={tracker.exportBackupJSON}
        onImport={(parsed) => tracker.importBackupJSON(parsed)}
        onReset={tracker.resetToDefault}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        message={confirmModalState.message}
        onConfirm={confirmModalState.onConfirm}
        onCancel={() => setConfirmModalState({ isOpen: false })}
      />
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
