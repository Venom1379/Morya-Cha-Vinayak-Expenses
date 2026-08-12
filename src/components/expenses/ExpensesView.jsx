import React, { useState } from 'react';
import { formatCurrency, formatDate, getStatusDetails } from '../../utils/formatters';
import {
  Receipt,
  PlusCircle,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Building,
  Calendar,
  X,
  CreditCard
} from 'lucide-react';
import ExpenseDetailModal from './ExpenseDetailModal';

export default function ExpensesView({
  trackerData,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onAddExpensePayment,
  onUpdateExpensePayment,
  onDeleteExpensePayment
}) {
  const { expenses } = trackerData;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Active Expense for Detail Modal
  const [viewingExpenseId, setViewingExpenseId] = useState(null);

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Murti',
    vendor: '',
    totalAmount: '',
    advanceAmount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [formError, setFormError] = useState('');

  const categories = ['Murti', 'DJ', 'Decoration', 'Food', 'Sound', 'Lightning', 'Other'];

  // Filter expenses
  const filteredExpenses = expenses.filter((exp) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      exp.name.toLowerCase().includes(searchLower) ||
      (exp.vendor || '').toLowerCase().includes(searchLower);

    const matchesCategory =
      selectedCategoryFilter === 'ALL' || exp.category === selectedCategoryFilter;
    const matchesStatus =
      selectedStatusFilter === 'ALL' || exp.status.toUpperCase() === selectedStatusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormData({
      name: '',
      category: 'Murti',
      vendor: '',
      totalAmount: '',
      advanceAmount: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      name: expense.name,
      category: expense.category || 'Other',
      vendor: expense.vendor || '',
      totalAmount: expense.totalAmount,
      advanceAmount: '', // only applicable during creation
      date: expense.date,
      notes: expense.notes || ''
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Expense name is required.');
      return;
    }
    if (!formData.totalAmount || Number(formData.totalAmount) <= 0) {
      setFormError('Total expense amount must be greater than ₹0.');
      return;
    }

    if (editingExpense) {
      onUpdateExpense(editingExpense.id, formData);
    } else {
      onAddExpense(formData);
    }
    setIsFormOpen(false);
  };

  const activeViewingExpense = expenses.find((e) => e.id === viewingExpenseId);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-amber-300 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-amber-400" />
            Expenses Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track Murti, DJ, Mandap decoration, Food, and custom event expenditures.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition transform active:scale-95 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Expense</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search expense or vendor name..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 focus:border-amber-500 rounded-xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
          />
        </div>

        {/* Filter Category */}
        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 focus:border-amber-500 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        >
          <option value="ALL">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Filter Status */}
        <select
          value={selectedStatusFilter}
          onChange={(e) => setSelectedStatusFilter(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 focus:border-amber-500 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        >
          <option value="ALL">All Payment Statuses</option>
          <option value="PAID">Paid</option>
          <option value="PARTIAL">Partial</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      {/* --- DESKTOP TABLE VIEW --- */}
      <div className="hidden md:block rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Expense Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Vendor</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Paid</th>
                <th className="py-3.5 px-4">Remaining</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((exp) => {
                  const statusInfo = getStatusDetails(exp.status);
                  return (
                    <tr
                      key={exp.id}
                      className="hover:bg-slate-800/40 transition cursor-pointer"
                      onClick={() => setViewingExpenseId(exp.id)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-100">{exp.name}</div>
                        <div className="text-[11px] text-slate-400">{formatDate(exp.date)}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-950 border border-slate-800 text-amber-300">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {exp.vendor || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-200">
                        {formatCurrency(exp.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">
                        {formatCurrency(exp.totalPaid)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-rose-400">
                        {formatCurrency(exp.remainingAmount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusInfo.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingExpenseId(exp.id)}
                            title="View History & Add Payments"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(exp)}
                            title="Edit Expense"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteExpense(exp.id, exp.name)}
                            title="Delete Expense"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate-500">
                    No expenses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MOBILE CARDS VIEW --- */}
      <div className="md:hidden space-y-3">
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map((exp) => {
            const statusInfo = getStatusDetails(exp.status);
            return (
              <div
                key={exp.id}
                onClick={() => setViewingExpenseId(exp.id)}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {exp.category}
                    </span>
                    <h3 className="font-extrabold text-slate-100 text-base mt-1">{exp.name}</h3>
                    {exp.vendor && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-slate-400" />
                        {exp.vendor}
                      </p>
                    )}
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusInfo.badgeClass}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                    {statusInfo.label}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-950/60 rounded-xl text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Total</span>
                    <span className="font-bold text-slate-200">{formatCurrency(exp.totalAmount)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Paid</span>
                    <span className="font-bold text-emerald-400">{formatCurrency(exp.totalPaid)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Remaining</span>
                    <span className="font-bold text-rose-400">{formatCurrency(exp.remainingAmount)}</span>
                  </div>
                </div>

                <div
                  className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setViewingExpenseId(exp.id)}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Payments ({exp.payments.length})
                  </button>
                  <button
                    onClick={() => handleOpenEdit(exp)}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteExpense(exp.id, exp.name)}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-slate-900/90 rounded-2xl border border-slate-800 text-slate-500 text-xs">
            No expenses found.
          </div>
        )}
      </div>

      {/* --- ADD / EDIT EXPENSE MODAL --- */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-lg text-amber-300 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                {editingExpense ? 'Edit Expense Record' : 'Add New Event Expense'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Expense Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ganpati Murti, DJ Sound, Mandap"
                  className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 focus:border-amber-500 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950/70 border border-slate-800 focus:border-amber-500 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Vendor / Provider
                  </label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    placeholder="e.g. Shree Kalakendra"
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 focus:border-amber-500 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Total Amount (₹) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                    placeholder="e.g. 25000"
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 focus:border-amber-500 rounded-xl font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Expense Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950/70 border border-slate-800 focus:border-amber-500 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              {!editingExpense && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Initial Advance Payment (₹) <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.advanceAmount}
                    onChange={(e) => setFormData({ ...formData, advanceAmount: e.target.value })}
                    placeholder="e.g. 10000"
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 focus:border-amber-500 rounded-xl font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    If specified, this advance payment transaction will be recorded automatically.
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Notes / Specifications
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. 6ft clay idol, includes Visarjan setup"
                  className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 focus:border-amber-500 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold hover:from-amber-400 hover:to-orange-400 shadow-md cursor-pointer"
                >
                  {editingExpense ? 'Save Changes' : 'Create Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EXPENSE DETAIL & SUB-PAYMENT HISTORY MODAL --- */}
      {activeViewingExpense && (
        <ExpenseDetailModal
          expense={activeViewingExpense}
          onClose={() => setViewingExpenseId(null)}
          onAddExpensePayment={onAddExpensePayment}
          onUpdateExpensePayment={onUpdateExpensePayment}
          onDeleteExpensePayment={onDeleteExpensePayment}
        />
      )}

    </div>
  );
}
