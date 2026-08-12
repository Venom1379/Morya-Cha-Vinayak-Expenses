import React, { useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Wallet,
  PlusCircle,
  Search,
  Filter,
  Edit2,
  Trash2,
  Calendar,
  X,
  CreditCard,
  CheckCircle2,
  UserCheck
} from 'lucide-react';

export default function PaymentsView({ trackerData, onAddPayment, onUpdatePayment, onDeletePayment }) {
  const { payments, members } = trackerData;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState('ALL');
  const [selectedMethodFilter, setSelectedMethodFilter] = useState('ALL');

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  const [formData, setFormData] = useState({
    memberId: members.length > 0 ? members[0].id : '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    method: 'UPI',
    reference: '',
    notes: ''
  });

  const [formError, setFormError] = useState('');

  // Map member names for fast lookup
  const memberMap = {};
  members.forEach((m) => {
    memberMap[m.id] = m;
  });

  // Filter payments
  const filteredPayments = payments.filter((p) => {
    const member = memberMap[p.memberId];
    const memberName = member ? member.name.toLowerCase() : '';
    const ref = (p.reference || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch = memberName.includes(searchLower) || ref.includes(searchLower);
    const matchesMember = selectedMemberFilter === 'ALL' || p.memberId === selectedMemberFilter;
    const matchesMethod = selectedMethodFilter === 'ALL' || p.method === selectedMethodFilter;

    return matchesSearch && matchesMember && matchesMethod;
  });

  const handleOpenAdd = () => {
    setEditingPayment(null);
    setFormData({
      memberId: members.length > 0 ? members[0].id : '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      method: 'UPI',
      reference: '',
      notes: ''
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (payment) => {
    setEditingPayment(payment);
    setFormData({
      memberId: payment.memberId,
      amount: payment.amount,
      date: payment.date,
      method: payment.method || 'Cash',
      reference: payment.reference || '',
      notes: payment.notes || ''
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.memberId) {
      setFormError('Please select a member.');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setFormError('Payment amount must be greater than ₹0.');
      return;
    }
    if (!formData.date) {
      setFormError('Payment date is required.');
      return;
    }

    if (editingPayment) {
      onUpdatePayment(editingPayment.id, formData);
    } else {
      onAddPayment(formData);
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-amber-300 tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-amber-400" />
            Member Payments Received
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Record, track, and filter money collected from members.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          disabled={members.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition transform active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record New Payment</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search member or reference ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 focus:border-amber-500 rounded-xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
          />
        </div>

        {/* Filter by Member */}
        <select
          value={selectedMemberFilter}
          onChange={(e) => setSelectedMemberFilter(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 focus:border-amber-500 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        >
          <option value="ALL">All Members</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.mobile})
            </option>
          ))}
        </select>

        {/* Filter by Payment Method */}
        <select
          value={selectedMethodFilter}
          onChange={(e) => setSelectedMethodFilter(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 focus:border-amber-500 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        >
          <option value="ALL">All Payment Methods</option>
          <option value="UPI">UPI (GPay / PhonePe)</option>
          <option value="Cash">Cash</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* --- DESKTOP TABLE VIEW --- */}
      <div className="hidden md:block rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Member</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Reference / Txn ID</th>
                <th className="py-3.5 px-4">Notes</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((p) => {
                  const member = memberMap[p.memberId];
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-100">{member ? member.name : 'Unknown Member'}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{member?.mobile}</div>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-emerald-400">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {formatDate(p.date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-950 border border-slate-800 text-amber-300">
                          {p.method}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                        {p.reference || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-xs italic truncate max-w-xs">
                        {p.notes || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            title="Edit Payment"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeletePayment(p.id, p.amount)}
                            title="Delete Payment"
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
                  <td colSpan="7" className="py-10 text-center text-slate-500">
                    No payment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MOBILE CARD VIEW --- */}
      <div className="md:hidden space-y-3">
        {filteredPayments.length > 0 ? (
          filteredPayments.map((p) => {
            const member = memberMap[p.memberId];
            return (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">
                      {member ? member.name : 'Unknown Member'}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">{member?.mobile}</p>
                  </div>
                  <span className="text-base font-extrabold text-emerald-400">
                    {formatCurrency(p.amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-amber-300 font-semibold">
                    {p.method}
                  </span>
                  <span className="text-slate-400">{formatDate(p.date)}</span>
                </div>

                {p.reference && (
                  <p className="text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2 rounded-lg truncate">
                    Txn Ref: {p.reference}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => onDeletePayment(p.id, p.amount)}
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
            No payment records found.
          </div>
        )}
      </div>

      {/* --- ADD / EDIT PAYMENT MODAL --- */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-lg text-amber-300 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-400" />
                {editingPayment ? 'Edit Payment Record' : 'Record Member Payment'}
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
                  Select Member <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={formData.memberId}
                  onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 focus:border-amber-500 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.mobile}) — Remaining: ₹{m.remainingAmount}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Payment Amount (₹) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="e.g. 2000"
                  className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 focus:border-amber-500 rounded-xl font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Payment Method <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950/70 border border-slate-800 focus:border-amber-500 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Payment Date <span className="text-rose-400">*</span>
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

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Reference / Transaction No.
                </label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="e.g. UPI/123456789 or Receipt No."
                  className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 focus:border-amber-500 rounded-xl font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional remarks..."
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
                  {editingPayment ? 'Save Changes' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
