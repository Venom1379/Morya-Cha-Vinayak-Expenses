import { useState, useEffect, useCallback } from 'react';
import { storageService } from '../services/storageService';

export function useExpenseTracker() {
  const [data, setData] = useState(() => storageService.getCalculatedData());

  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setData(storageService.getCalculatedData());
    });
    return unsubscribe;
  }, []);

  const addMember = useCallback((memberData) => storageService.addMember(memberData), []);
  const updateMember = useCallback((id, updatedData) => storageService.updateMember(id, updatedData), []);
  const deleteMember = useCallback((id) => storageService.deleteMember(id), []);

  const addPayment = useCallback((paymentData) => storageService.addPayment(paymentData), []);
  const updatePayment = useCallback((id, updatedData) => storageService.updatePayment(id, updatedData), []);
  const deletePayment = useCallback((id) => storageService.deletePayment(id), []);

  const addExpense = useCallback((expenseData) => storageService.addExpense(expenseData), []);
  const updateExpense = useCallback((id, updatedData) => storageService.updateExpense(id, updatedData), []);
  const deleteExpense = useCallback((id) => storageService.deleteExpense(id), []);

  const addExpensePayment = useCallback((epData) => storageService.addExpensePayment(epData), []);
  const updateExpensePayment = useCallback((id, updatedData) => storageService.updateExpensePayment(id, updatedData), []);
  const deleteExpensePayment = useCallback((id) => storageService.deleteExpensePayment(id), []);

  const updateCommonPaymentAmount = useCallback((amount) => storageService.updateCommonPaymentAmount(amount), []);

  const exportBackupJSON = useCallback(() => storageService.exportBackupJSON(), []);
  const importBackupJSON = useCallback((parsedData) => storageService.importBackupJSON(parsedData), []);
  const resetToDefault = useCallback(() => storageService.resetToDefault(), []);

  return {
    ...data,
    addMember,
    updateMember,
    deleteMember,
    addPayment,
    updatePayment,
    deletePayment,
    addExpense,
    updateExpense,
    deleteExpense,
    addExpensePayment,
    updateExpensePayment,
    deleteExpensePayment,
    updateCommonPaymentAmount,
    exportBackupJSON,
    importBackupJSON,
    resetToDefault
  };
}
