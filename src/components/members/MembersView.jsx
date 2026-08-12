import React, { useState } from 'react';
import { formatCurrency, formatDate, getStatusDetails } from '../../utils/formatters';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard
} from 'lucide-react';

export default function MembersView({ trackerData, onAddMember, onUpdateMember, onDeleteMember }) {
  const { members, commonPayment } = trackerData;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [viewingMember, setViewingMember] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    expectedAmount: commonPayment?.amountPerMember || 0,
    notes: ''
  });

  const [formError, setFormError] = useState('');

  // Filter Members
  const filteredMembers = members.filter((m) => {
    const mobileStr = m.mobile || '';
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mobileStr.includes(searchTerm);
    const matchesStatus =
      statusFilter === 'ALL' || m.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      mobile: '',
      expectedAmount: commonPayment?.amountPerMember || 0,
      notes: ''
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      mobile: member.mobile || '',
      expectedAmount: member.expectedAmount,
      notes: member.notes || ''
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Member name is required.');
      return;
    }

    if (editingMember) {
      onUpdateMember(editingMember.id, formData);
    } else {
      onAddMember(formData);
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-amber-300 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            Members Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Total {members.length} registered members in the Utsav committee.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition transform active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Member</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or mobile number..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 focus:border-amber-500 rounded-xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'PAID', 'PARTIAL', 'PENDING'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                statusFilter === status
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {status === 'ALL' ? 'All Members' : status}
            </button>
          ))}
        </div>
      </div>

      {/* --- DESKTOP TABLE VIEW --- */}
      <div className="hidden md:block rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Member Info</th>
                <th className="py-3.5 px-4">Mobile</th>
                <th className="py-3.5 px-4">Expected</th>
                <th className="py-3.5 px-4">Paid</th>
                <th className="py-3.5 px-4">Remaining</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((m) => {
                  const statusInfo = getStatusDetails(m.status);
                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-100">{m.name}</div>
                        {m.notes && <div className="text-[11px] text-slate-400">{m.notes}</div>}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {m.mobile || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        {formatCurrency(m.expectedAmount)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">
                        {formatCurrency(m.amountPaid)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-rose-400">
                        {formatCurrency(m.remainingAmount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusInfo.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingMember(m)}
                            title="View Details"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(m)}
                            title="Edit Member"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteMember(m.id, m.name)}
                            title="Delete Member"
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
                    No members matching search criteria.
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
            const statusInfo = getStatusDetails(m.status);
            return (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-100 text-base">{m.name}</h3>
                    {m.mobile && (
                      <p className="text-xs font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {m.mobile}
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
                    <span className="text-[10px] text-slate-400 block uppercase">Expected</span>
                    <span className="font-semibold text-slate-200">{formatCurrency(m.expectedAmount)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Paid</span>
                    <span className="font-bold text-emerald-400">{formatCurrency(m.amountPaid)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Remaining</span>
                    <span className="font-bold text-rose-400">{formatCurrency(m.remainingAmount)}</span>
                  </div>
                </div>

                {m.notes && (
                  <p className="text-xs text-slate-400 italic bg-slate-950/40 p-2 rounded-lg">
                    "{m.notes}"
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setViewingMember(m)}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Details
                  </button>
                  <button
                    onClick={() => handleOpenEdit(m)}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteMember(m.id, m.name)}
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
            No members matching search criteria.
          </div>
        )}
      </div>

      {/* --- ADD / EDIT MEMBER MODAL --- */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-lg text-amber-300 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                {editingMember ? 'Edit Member Details' : 'Add New Member'}
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
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Deshmukh"
                  className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 focus:border-amber-500 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mobile Number <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                  placeholder="e.g. 9876543210 (Optional)"
                  className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 focus:border-amber-500 rounded-xl font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target / Expected Contribution (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.expectedAmount}
                  onChange={(e) => setFormData({ ...formData, expectedAmount: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 focus:border-amber-500 rounded-xl font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Default per-member contribution is ₹{commonPayment?.amountPerMember || 0}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Notes / Role
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Committee Lead, Decor team"
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
                  {editingMember ? 'Save Changes' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MEMBER DETAIL MODAL --- */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-100">{viewingMember.name}</h3>
                {viewingMember.mobile && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" /> {viewingMember.mobile}
                  </p>
                )}
              </div>
              <button
                onClick={() => setViewingMember(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Expected</span>
                <span className="font-bold text-slate-200">{formatCurrency(viewingMember.expectedAmount)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Total Paid</span>
                <span className="font-bold text-emerald-400">{formatCurrency(viewingMember.amountPaid)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Remaining</span>
                <span className="font-bold text-rose-400">{formatCurrency(viewingMember.remainingAmount)}</span>
              </div>
            </div>

            {/* Payment History Sub-List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                Payment History
              </h4>
              {trackerData.payments.filter((p) => p.memberId === viewingMember.id).length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {trackerData.payments
                    .filter((p) => p.memberId === viewingMember.id)
                    .map((pay) => (
                      <div
                        key={pay.id}
                        className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-emerald-400">{formatCurrency(pay.amount)}</p>
                          <p className="text-[10px] text-slate-400">{pay.method} • {formatDate(pay.date)}</p>
                        </div>
                        {pay.reference && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded">
                            {pay.reference}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic text-center py-4 bg-slate-950/40 rounded-xl">
                  No payment transactions recorded for this member yet.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setViewingMember(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
