import React, { useState } from 'react';
import { formatCurrency, formatDate, getStatusDetails } from '../../utils/formatters';
import {
  Receipt,
  PlusCircle,
  Edit2,
  Trash2,
  X,
  Calendar,
  Building,
  Tag,
  CreditCard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ExpenseDetailModal({
  expense,
  onClose,
  onAddExpensePayment,
  onUpdateExpensePayment,
  onDeleteExpensePayment
}) {
  const statusInfo = getStatusDetails(expense.status);

  // Sub-payment form modal state
  const [isSubFormOpen, setIsSubFormOpen] = useState(false);
  const [editingSubPayment, setEditingSubPayment] = useState(null);

  const [subFormData, setSubFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [subFormError, setSubFormError] = useState('');

  const handleOpenAddSubPayment = () => {
    setEditingSubPayment(null);
    setSubFormData({
      amount: expense.remainingAmount > 0 ? expense.remainingAmount : '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setSubFormError('');
    setIsSubFormOpen(true);
  };

  const handleOpenEditSubPayment = (ep) => {
    setEditingSubPayment(ep);
    setSubFormData({
      amount: ep.amount,
      date: ep.date,
      notes: ep.notes || ''
    });
    setSubFormError('');
    setIsSubFormOpen(true);
  };

  const handleSubSubmit = (e) => {
    e.preventDefault();
    const numAmount = Number(subFormData.amount);
    if (!numAmount || numAmount <= 0) {
      setSubFormError('Payment amount must be greater than ₹0.');
      return;
    }

    if (editingSubPayment) {
      onUpdateExpensePayment(editingSubPayment.id, {
        ...subFormData,
        expenseId: expense.id
      });
    } else {
      onAddExpensePayment({
        ...subFormData,
        expenseId: expense.id
      });
    }
    setIsSubFormOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {expense.category}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusInfo.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                {statusInfo.label}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-100 mt-1.5">{expense.name}</h3>
            {expense.vendor && (
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                Vendor: <strong className="text-slate-200">{expense.vendor}</strong>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950/70 rounded-xl border border-slate-800/80 text-center">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Total Amount</span>
            <span className="text-base sm:text-lg font-bold text-slate-100">{formatCurrency(expense.totalAmount)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Total Paid</span>
            <span className="text-base sm:text-lg font-extrabold text-emerald-400">{formatCurrency(expense.totalPaid)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Remaining</span>
            <span className="text-base sm:text-lg font-extrabold text-rose-400">{formatCurrency(expense.remainingAmount)}</span>
          </div>
        </div>

        {expense.notes && (
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60 text-xs text-slate-300">
            <span className="font-semibold text-slate-400 block mb-0.5">Notes:</span>
            {expense.notes}
          </div>
        )}

        {/* Payment History Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" />
              Expense Payment History ({expense.payments.length})
            </h4>
            <button
              onClick={handleOpenAddSubPayment}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs hover:from-amber-400 hover:to-orange-400 transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Payment</span>
            </button>
          </div>

          {expense.payments.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {expense.payments.map((ep, idx) => (
                <div
                  key={ep.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-emerald-400">
                        {formatCurrency(ep.amount)}
                      </span>
                      {idx === expense.payments.length - 1 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-amber-300">
                          Initial / Advance
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {formatDate(ep.date)}
                      {ep.notes && <span className="text-slate-400">— {ep.notes}</span>}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditSubPayment(ep)}
                      title="Edit Payment"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteExpensePayment(ep.id, ep.amount)}
                      title="Delete Payment"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center bg-slate-950/40 rounded-xl border border-slate-800/60 text-slate-500 text-xs">
              No payments made for this expense yet. Click "Add Payment" above to record advance or installment payments.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
          >
            Close Window
          </button>
        </div>

      </div>

      {/* --- INNER SUB-FORM MODAL FOR ADDING/EDITING EXPENSE PAYMENTS --- */}
      {isSubFormOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h4 className="font-extrabold text-sm text-amber-300">
                {editingSubPayment ? 'Edit Expense Payment' : `Add Payment for ${expense.name}`}
              </h4>
              <button
                onClick={() => setIsSubFormOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {subFormError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                ⚠️ {subFormError}
              </div>
            )}

            <form onSubmit={handleSubSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Payment Amount (₹) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={subFormData.amount}
                  onChange={(e) => setSubFormData({ ...subFormData, amount: e.target.value })}
                  placeholder="e.g. 5000"
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 focus:border-amber-500 rounded-xl font-mono text-slate-100 placeholder-slate-500 focus:outline-none"
                />
                {expense.remainingAmount > 0 && !editingSubPayment && (
                  <span className="text-[10px] text-amber-400 mt-1 block">
                    Remaining balance to clear: ₹{expense.remainingAmount}
                  </span>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Payment Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={subFormData.date}
                  onChange={(e) => setSubFormData({ ...subFormData, date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 focus:border-amber-500 rounded-xl text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Notes / Payment Stage
                </label>
                <input
                  type="text"
                  value={subFormData.notes}
                  onChange={(e) => setSubFormData({ ...subFormData, notes: e.target.value })}
                  placeholder="e.g. Advance, 2nd installment, Final payment"
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 focus:border-amber-500 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubFormOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold hover:from-amber-400 hover:to-orange-400 shadow-md cursor-pointer"
                >
                  {editingSubPayment ? 'Save Changes' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
