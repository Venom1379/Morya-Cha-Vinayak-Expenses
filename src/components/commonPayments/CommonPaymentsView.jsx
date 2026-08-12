import React, { useState } from 'react';
import { formatCurrency, getStatusDetails } from '../../utils/formatters';
import {
  Layers,
  Users,
  Wallet,
  PiggyBank,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function CommonPaymentsView({ trackerData, onUpdateCommonAmount, onSelectMemberForPayment }) {
  const { summary, members, commonPayment } = trackerData;
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [newAmount, setNewAmount] = useState(commonPayment?.amountPerMember || 2000);
  const [activeTab, setActiveTab] = useState('ALL');

  const handleSaveAmount = (e) => {
    e.preventDefault();
    if (Number(newAmount) >= 0) {
      onUpdateCommonAmount(Number(newAmount));
      setIsEditingAmount(false);
    }
  };

  const paidMembers = members.filter((m) => m.status === 'Paid');
  const partialMembers = members.filter((m) => m.status === 'Partial');
  const pendingMembers = members.filter((m) => m.status === 'Pending');

  const displayList =
    activeTab === 'PAID'
      ? paidMembers
      : activeTab === 'PARTIAL'
      ? partialMembers
      : activeTab === 'PENDING'
      ? pendingMembers
      : members;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-amber-300 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-400" />
            Common Contribution Settings & Status
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Uniform contribution target per member for the Ganesh Utsav festival.
          </p>
        </div>
      </div>

      {/* --- FIVE METRIC CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* Card 1: Common Amount per Member */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-lg flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Target Per Member</span>
            <button
              onClick={() => {
                setNewAmount(commonPayment.amountPerMember);
                setIsEditingAmount(true);
              }}
              title="Edit Target Amount"
              className="p-1 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-amber-300 mt-2">
            {formatCurrency(commonPayment.amountPerMember)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-1">Applies to all members</p>
        </div>

        {/* Card 2: Total Members */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Members</span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-sky-400 mt-2">
            {members.length}
          </h3>
          <p className="text-[10px] text-slate-400 mt-1">Committee strength</p>
        </div>

        {/* Card 3: Expected Collection */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Expected Total</span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-100 mt-2">
            {formatCurrency(summary.expectedTotalCollection)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-1">{members.length} × ₹{commonPayment.amountPerMember}</p>
        </div>

        {/* Card 4: Total Collected */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Total Collected</span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-2">
            {formatCurrency(summary.totalCollection)}
          </h3>
          <p className="text-[10px] text-emerald-500/80 mt-1">{paidMembers.length} fully paid</p>
        </div>

        {/* Card 5: Remaining Collection */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-400">Remaining to Collect</span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-rose-400 mt-2">
            {formatCurrency(summary.remainingCollection)}
          </h3>
          <p className="text-[10px] text-rose-400/80 mt-1">{pendingMembers.length + partialMembers.length} pending/partial</p>
        </div>

      </div>

      {/* Inline Edit Target Modal / Banner */}
      {isEditingAmount && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-300">Update Per-Member Common Contribution</h4>
              <p className="text-[11px] text-slate-400">Updating this will instantly adjust total expected collections across the tracker.</p>
            </div>
          </div>
          <form onSubmit={handleSaveAmount} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="number"
              min="0"
              required
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 cursor-pointer"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditingAmount(false)}
              className="px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300 text-xs hover:bg-slate-800"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Member Breakdown Categorization */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            Member Payment Status Breakdown
          </h3>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'ALL' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({members.length})
            </button>
            <button
              onClick={() => setActiveTab('PAID')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'PAID' ? 'bg-emerald-500 text-slate-950' : 'text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              Paid ({paidMembers.length})
            </button>
            <button
              onClick={() => setActiveTab('PARTIAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'PARTIAL' ? 'bg-amber-500 text-slate-950' : 'text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              Partial ({partialMembers.length})
            </button>
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'PENDING' ? 'bg-rose-500 text-slate-950' : 'text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              Pending ({pendingMembers.length})
            </button>
          </div>
        </div>

        {/* Member Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayList.length > 0 ? (
            displayList.map((m) => {
              const statusInfo = getStatusDetails(m.status);
              return (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-100 text-sm">{m.name}</h4>
                        <p className="text-xs font-mono text-slate-400 mt-0.5">{m.mobile}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusInfo.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 p-2 bg-slate-950/70 rounded-xl text-center text-xs border border-slate-800/60">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Target</span>
                        <span className="font-semibold text-slate-200">{formatCurrency(m.expectedAmount)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Paid</span>
                        <span className="font-bold text-emerald-400">{formatCurrency(m.amountPaid)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Due</span>
                        <span className="font-bold text-rose-400">{formatCurrency(m.remainingAmount)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      {m.paymentsCount} transactions
                    </span>
                    {m.status !== 'Paid' && (
                      <button
                        onClick={() => onSelectMemberForPayment(m.id)}
                        className="flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-200 transition cursor-pointer"
                      >
                        <span>Add Payment</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full p-8 text-center bg-slate-900/90 rounded-2xl border border-slate-800 text-slate-500 text-xs">
              No members in this category.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
