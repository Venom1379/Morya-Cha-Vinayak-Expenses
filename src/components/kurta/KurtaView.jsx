import React, { useState } from 'react';
import { formatCurrency, formatDate, getStatusDetails } from '../../utils/formatters';
import {
  Shirt,
  Users,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Search,
  Sparkles,
  DollarSign,
  X,
  CreditCard,
  PlusCircle
} from 'lucide-react';

export default function KurtaView({ trackerData, onUpdateKurtaCommonAmount, onSetMemberKurtaStatus }) {
  const { summary, members, kurtaSettings } = trackerData;

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [newAmount, setNewAmount] = useState(kurtaSettings?.amountPerMember || 0);

  // Modal to record Kurta payment for a specific member
  const [selectedMemberForPayment, setSelectedMemberForPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: kurtaSettings?.amountPerMember || 0,
    method: 'Cash',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleSaveCommonAmount = (e) => {
    e.preventDefault();
    if (Number(newAmount) >= 0) {
      onUpdateKurtaCommonAmount(Number(newAmount));
      setIsEditingAmount(false);
    }
  };

  const handleOpenPaymentModal = (member) => {
    setSelectedMemberForPayment(member);
    setPaymentForm({
      amount: member.kurtaAmountPaid > 0 ? member.kurtaAmountPaid : (kurtaSettings?.amountPerMember || 0),
      method: 'Cash',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const handleConfirmPaid = (e) => {
    e.preventDefault();
    if (selectedMemberForPayment) {
      onSetMemberKurtaStatus(selectedMemberForPayment.id, 'Paid', paymentForm);
      setSelectedMemberForPayment(null);
    }
  };

  const handleMarkPending = (memberId) => {
    onSetMemberKurtaStatus(memberId, 'Pending');
  };

  // Filter Members for Kurta View
  const filteredMembers = members.filter((m) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = m.name.toLowerCase().includes(searchLower) || m.mobile.includes(searchLower);
    const matchesStatus =
      activeTab === 'ALL' ||
      (activeTab === 'PAID' && m.kurtaStatus === 'Paid') ||
      (activeTab === 'PENDING' && m.kurtaStatus === 'Pending');

    return matchesSearch && matchesStatus;
  });

  const paidMembersCount = members.filter((m) => m.kurtaStatus === 'Paid').length;
  const pendingMembersCount = members.filter((m) => m.kurtaStatus === 'Pending').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-amber-300 tracking-tight flex items-center gap-2">
            <Shirt className="w-6 h-6 text-amber-400" />
            Kurta Payment Tracker
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Set common Kurta amount for all members and track individual payment status (Paid vs Unpaid).
          </p>
        </div>

        <button
          onClick={() => {
            setNewAmount(kurtaSettings?.amountPerMember || 0);
            setIsEditingAmount(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition transform active:scale-95 cursor-pointer"
        >
          <Edit2 className="w-4 h-4" />
          <span>Set Common Kurta Amount</span>
        </button>
      </div>

      {/* --- FOUR METRIC SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Common Kurta Amount */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Common Kurta Amount</span>
            <button
              onClick={() => {
                setNewAmount(kurtaSettings?.amountPerMember || 0);
                setIsEditingAmount(true);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-amber-300 transition"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          <h3 className="text-2xl font-extrabold text-amber-300 mt-2">
            {formatCurrency(kurtaSettings?.amountPerMember || 0)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Target per member</p>
        </div>

        {/* Card 2: Total Kurta Expected */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Expected Collection</span>
          <h3 className="text-2xl font-extrabold text-slate-100 mt-2">
            {formatCurrency(summary.totalKurtaExpected)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">{members.length} Members × ₹{kurtaSettings?.amountPerMember || 0}</p>
        </div>

        {/* Card 3: Total Kurta Collected */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Total Collected</span>
          <h3 className="text-2xl font-extrabold text-emerald-400 mt-2">
            {formatCurrency(summary.totalKurtaCollected)}
          </h3>
          <p className="text-[11px] text-emerald-500/80 mt-1">{paidMembersCount} members paid</p>
        </div>

        {/* Card 4: Status Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Payment Breakdown</span>
          <div className="flex items-center gap-3 mt-3 text-sm">
            <span className="font-extrabold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> {paidMembersCount} Paid
            </span>
            <span className="text-slate-600">•</span>
            <span className="font-extrabold text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {pendingMembersCount} Unpaid
            </span>
          </div>
        </div>

      </div>

      {/* --- INLINE FORM TO SET COMMON KURTA AMOUNT --- */}
      {isEditingAmount && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-300">Set Common Kurta Amount for All Members</h4>
              <p className="text-[11px] text-slate-400">e.g. ₹2,000 per member</p>
            </div>
          </div>
          <form onSubmit={handleSaveCommonAmount} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="number"
              min="0"
              required
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="e.g. 2000"
              className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 cursor-pointer"
            >
              Save Amount
            </button>
            <button
              type="button"
              onClick={() => setIsEditingAmount(false)}
              className="px-3.5 py-2 rounded-xl border border-slate-800 text-slate-300 text-xs hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* --- SEARCH AND STATUS FILTER CONTROLS --- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search member name..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 focus:border-amber-500 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Members ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('PAID')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'PAID'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-slate-900/80 border border-slate-800 text-emerald-400 hover:bg-emerald-500/10'
            }`}
          >
            Paid ({paidMembersCount})
          </button>
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'PENDING'
                ? 'bg-rose-500 text-slate-950 shadow-md'
                : 'bg-slate-900/80 border border-slate-800 text-rose-400 hover:bg-rose-500/10'
            }`}
          >
            Unpaid / Pending ({pendingMembersCount})
          </button>
        </div>
      </div>

      {/* --- DESKTOP TABLE VIEW --- */}
      <div className="hidden md:block rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Member Name</th>
                <th className="py-3.5 px-4">Mobile</th>
                <th className="py-3.5 px-4">Common Kurta Amount</th>
                <th className="py-3.5 px-4">Paid Amount</th>
                <th className="py-3.5 px-4">Kurta Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((m) => {
                  const isPaid = m.kurtaStatus === 'Paid';
                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-100">
                        {m.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {m.mobile}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        {formatCurrency(kurtaSettings?.amountPerMember || 0)}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-emerald-400">
                        {formatCurrency(m.kurtaAmountPaid)}
                      </td>
                      <td className="py-3.5 px-4">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Unpaid / Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isPaid ? (
                          <button
                            onClick={() => handleMarkPending(m.id)}
                            className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-medium cursor-pointer"
                          >
                            Mark Unpaid
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenPaymentModal(m)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold hover:bg-emerald-500/25 text-xs transition cursor-pointer"
                          >
                            Record Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-slate-500">
                    {members.length === 0 ? 'No members added yet. Add members in the Members tab first.' : 'No members found matching filter.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MOBILE CARDS VIEW --- */}
      <div className="md:hidden space-y-3">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((m) => {
            const isPaid = m.kurtaStatus === 'Paid';
            return (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-100 text-base">{m.name}</h3>
                    <p className="text-xs font-mono text-slate-400">{m.mobile}</p>
                  </div>
                  {isPaid ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      Unpaid
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Common Target</span>
                    <span className="font-semibold text-slate-200">{formatCurrency(kurtaSettings?.amountPerMember || 0)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Paid Amount</span>
                    <span className="font-bold text-emerald-400">{formatCurrency(m.kurtaAmountPaid)}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-800">
                  {isPaid ? (
                    <button
                      onClick={() => handleMarkPending(m.id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-rose-400 text-xs"
                    >
                      Mark Unpaid
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenPaymentModal(m)}
                      className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs shadow-md"
                    >
                      Record Paid
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-slate-900/90 rounded-2xl border border-slate-800 text-slate-500 text-xs">
            {members.length === 0 ? 'No members added yet. Add members in the Members tab first.' : 'No members found matching filter.'}
          </div>
        )}
      </div>

      {/* --- RECORD KURTA PAYMENT MODAL --- */}
      {selectedMemberForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-100 text-base flex items-center gap-2">
                <Shirt className="w-4 h-4 text-amber-400" />
                Record Kurta Payment for {selectedMemberForPayment.name}
              </h3>
              <button
                onClick={() => setSelectedMemberForPayment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPaid} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Kurta Payment Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI (GPay / PhonePe)</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  required
                  value={paymentForm.date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedMemberForPayment(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 shadow-md cursor-pointer"
                >
                  Confirm Paid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
