import React from 'react';
import { formatCurrency, formatDateTime, getStatusDetails } from '../../utils/formatters';
import {
  Wallet,
  Receipt,
  PiggyBank,
  Users,
  TrendingUp,
  PieChart as PieIcon,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid
} from 'recharts';

const CATEGORY_COLORS = {
  Murti: '#f59e0b',       // Amber
  DJ: '#ec4899',          // Pink
  Decoration: '#8b5cf6',  // Purple
  Food: '#10b981',        // Emerald
  Sound: '#3b82f6',       // Blue
  Lightning: '#eab308',   // Yellow
  Other: '#64748b'        // Slate
};

const STATUS_COLORS = {
  Paid: '#10b981',
  Partial: '#f59e0b',
  Pending: '#f43f5e'
};

export default function DashboardView({ trackerData }) {
  const { summary, expenses, members, activityLog } = trackerData;

  // 1. Prepare Data for "Income vs Expenses" Bar Chart
  const incomeVsExpenseData = [
    {
      name: 'Financial Overview',
      'Total Collection': summary.totalCollection,
      'Total Expenses': summary.totalExpenses,
      'Remaining Balance': Math.max(0, summary.remainingBalance)
    }
  ];

  // 2. Prepare Data for "Expenses by Category" Pie Chart
  const categoryMap = {};
  expenses.forEach((exp) => {
    const cat = exp.category || 'Other';
    categoryMap[cat] = (categoryMap[cat] || 0) + (exp.totalPaid || 0);
  });
  const expensesByCategoryData = Object.keys(categoryMap).map((cat) => ({
    name: cat,
    value: categoryMap[cat]
  })).filter((item) => item.value > 0);

  // If no expense payments yet, show budget total allocation by category
  if (expensesByCategoryData.length === 0) {
    expenses.forEach((exp) => {
      const cat = exp.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + (exp.totalAmount || 0);
    });
    Object.keys(categoryMap).forEach((cat) => {
      expensesByCategoryData.push({ name: cat, value: categoryMap[cat] });
    });
  }

  // 3. Prepare Data for "Payment Collection Status" Pie Chart
  const collectionStatusData = [
    { name: 'Paid', value: summary.paidMembersCount },
    { name: 'Partial', value: summary.partialMembersCount },
    { name: 'Pending', value: summary.pendingMembersCount }
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-orange-500/10 border border-amber-500/20 shadow-lg">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-amber-300 tracking-tight flex items-center gap-2">
            <span>🚩</span> Morya Cha Vinayak Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time financial summary, collection status, and expense tracking.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-amber-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Live Data</span>
        </div>
      </div>

      {/* --- FOUR METRIC CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Collection Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/40 transition shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
            <Wallet className="w-16 h-16 text-emerald-400" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Collection</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-0.5">
                {formatCurrency(summary.totalCollection)}
              </h3>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            From {summary.totalMembers} registered members
          </p>
        </div>

        {/* Total Expenses Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/40 transition shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
            <Receipt className="w-16 h-16 text-rose-400" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Expenses</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-rose-400 mt-0.5">
                {formatCurrency(summary.totalExpenses)}
              </h3>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
            Budgeted: {formatCurrency(summary.totalExpensesBudget)}
          </p>
        </div>

        {/* Remaining Amount Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/40 transition shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
            <PiggyBank className="w-16 h-16 text-amber-400" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Remaining Balance</p>
              <h3 className={`text-xl sm:text-2xl font-extrabold mt-0.5 ${summary.remainingBalance >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                {formatCurrency(summary.remainingBalance)}
              </h3>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Net cash on hand
          </p>
        </div>

        {/* Total Members Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/40 transition shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
            <Users className="w-16 h-16 text-sky-400" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Members</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-sky-400 mt-0.5">
                {summary.totalMembers}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-semibold">{summary.paidMembersCount} Paid</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">{summary.partialMembersCount} Partial</span>
            <span>•</span>
            <span className="text-rose-400 font-semibold">{summary.pendingMembersCount} Pending</span>
          </div>
        </div>

      </div>

      {/* --- RECHARTS CHARTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Income vs Expenses Bar Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Income vs Expenses
              </h3>
              <p className="text-xs text-slate-400">Comparison of funds collected vs expenses paid</p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpenseData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} tickLine={false} />
                <Tooltip
                  formatter={(val) => formatCurrency(val)}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                />
                <Bar dataKey="Total Collection" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={60} />
                <Bar dataKey="Total Expenses" fill="#f43f5e" radius={[8, 8, 0, 0]} maxBarSize={60} />
                <Bar dataKey="Remaining Balance" fill="#f59e0b" radius={[8, 8, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Expenses by Category Pie Chart */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-1">
              <PieIcon className="w-4 h-4 text-amber-400" />
              Expenses by Category
            </h3>
            <p className="text-xs text-slate-400 mb-4">Breakdown of event expenditures</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {expensesByCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {expensesByCategoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[entry.name] || '#64748b'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => formatCurrency(val)}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                  />
                  <Legend
                    formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500">No expense records yet.</p>
            )}
          </div>
        </div>

      </div>

      {/* --- PAYMENT COLLECTION STATUS & RECENT ACTIVITY STREAM --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 3. Payment Collection Status Chart */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-lg">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            Member Payment Status
          </h3>
          <p className="text-xs text-slate-400 mb-4">Member collection distribution</p>

          <div className="h-52 w-full">
            {collectionStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={collectionStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {collectionStatusData.map((entry, index) => (
                      <Cell key={`status-cell-${index}`} fill={STATUS_COLORS[entry.name] || '#64748b'} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val} Members`, 'Count']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                  />
                  <Legend
                    formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500 text-center py-10">No members added yet.</p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Expected Total Collection:</span>
              <span className="font-bold text-amber-300">{formatCurrency(summary.expectedTotalCollection)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Total Collected:</span>
              <span className="font-bold text-emerald-400">{formatCurrency(summary.totalCollection)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Remaining to Collect:</span>
              <span className="font-bold text-rose-400">{formatCurrency(summary.remainingCollection)}</span>
            </div>
          </div>
        </div>

        {/* 4. Recent Activity Feed */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  Recent Activity Log
                </h3>
                <p className="text-xs text-slate-400">Latest transactions, payments, and member updates</p>
              </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {activityLog && activityLog.length > 0 ? (
                activityLog.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/70 hover:border-slate-700 transition flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mt-0.5 border border-amber-500/20 shrink-0">
                        ⚡
                      </div>
                      <div>
                        <p className="text-slate-200 font-medium leading-relaxed">{log.message}</p>
                        <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(log.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No activity recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
