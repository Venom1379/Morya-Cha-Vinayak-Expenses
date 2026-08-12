/**
 * Central Storage Service for Morya Cha Vinayak Expense & Payment Tracker
 * Stores and manages all data in ONE unified JSON structure.
 */

const STORAGE_KEY = 'morya_vinayak_expense_tracker_v1';

export const INITIAL_DATA = {
  members: [
    {
      id: 'mem-1',
      name: 'Rahul Deshmukh',
      mobile: '9876543210',
      expectedAmount: 2000,
      notes: 'President / Main organizer',
      createdAt: '2026-08-01'
    },
    {
      id: 'mem-2',
      name: 'Amit Patil',
      mobile: '9822114455',
      expectedAmount: 2000,
      notes: 'Treasurer',
      createdAt: '2026-08-01'
    },
    {
      id: 'mem-3',
      name: 'Priya Kulkarni',
      mobile: '9765432109',
      expectedAmount: 2000,
      notes: 'Cultural Lead',
      createdAt: '2026-08-02'
    },
    {
      id: 'mem-4',
      name: 'Suresh Shinde',
      mobile: '9988776655',
      expectedAmount: 2000,
      notes: 'Decoration team',
      createdAt: '2026-08-03'
    },
    {
      id: 'mem-5',
      name: 'Vikas More',
      mobile: '9123456789',
      expectedAmount: 2000,
      notes: 'Volunteers co-ordinator',
      createdAt: '2026-08-04'
    }
  ],
  payments: [
    {
      id: 'pay-1',
      memberId: 'mem-1',
      amount: 2000,
      date: '2026-08-05',
      method: 'UPI',
      reference: 'UPI/7839201948',
      notes: 'Full payment via GPay'
    },
    {
      id: 'pay-2',
      memberId: 'mem-2',
      amount: 2000,
      date: '2026-08-06',
      method: 'Bank Transfer',
      reference: 'NEFT/8849201',
      notes: 'Direct transfer to account'
    },
    {
      id: 'pay-3',
      memberId: 'mem-3',
      amount: 1000,
      date: '2026-08-08',
      method: 'Cash',
      reference: 'CASH-001',
      notes: 'First installment paid in cash'
    }
  ],
  expenses: [
    {
      id: 'exp-1',
      name: 'Ganpati Murti',
      category: 'Murti',
      vendor: 'Shree Ganesh Kalakendra',
      totalAmount: 25000,
      date: '2026-08-02',
      notes: '6ft Clay idol booking'
    },
    {
      id: 'exp-2',
      name: 'Sound & DJ System',
      category: 'DJ',
      vendor: 'Dhananjay DJ Sound',
      totalAmount: 20000,
      date: '2026-08-03',
      notes: 'Visarjan miravand setup'
    },
    {
      id: 'exp-3',
      name: 'Mandap Decoration & Lighting',
      category: 'Decoration',
      vendor: 'Royal Decorators',
      totalAmount: 18000,
      date: '2026-08-04',
      notes: 'Flower and LED entrance'
    },
    {
      id: 'exp-4',
      name: 'Maha Prasad & Catering',
      category: 'Food',
      vendor: 'Swad Catering Service',
      totalAmount: 15000,
      date: '2026-08-07',
      notes: 'Prasad for 500 devotees'
    }
  ],
  expensePayments: [
    {
      id: 'exp-pay-1',
      expenseId: 'exp-1',
      amount: 10000,
      date: '2026-08-02',
      notes: 'Advance booking payment'
    },
    {
      id: 'exp-pay-2',
      expenseId: 'exp-2',
      amount: 5000,
      date: '2026-08-03',
      notes: 'Initial advance'
    },
    {
      id: 'exp-pay-3',
      expenseId: 'exp-3',
      amount: 18000,
      date: '2026-08-09',
      notes: 'Full payment completed'
    }
  ],
  commonPayment: {
    amountPerMember: 2000
  },
  activityLog: [
    {
      id: 'act-1',
      type: 'PAYMENT',
      message: '₹2,000 payment received from Rahul Deshmukh',
      timestamp: '2026-08-05T10:30:00.000Z'
    },
    {
      id: 'act-2',
      type: 'EXPENSE_PAYMENT',
      message: 'Murti advance ₹10,000 paid to Shree Ganesh Kalakendra',
      timestamp: '2026-08-02T14:15:00.000Z'
    },
    {
      id: 'act-3',
      type: 'MEMBER_ADDED',
      message: 'New member Vikas More added',
      timestamp: '2026-08-04T09:00:00.000Z'
    }
  ],
  settings: {
    title: 'Morya Cha Vinayak Expenses',
    year: '2026'
  }
};

class StorageService {
  constructor() {
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((listener) => listener());
  }

  getRawData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        this.saveRawData(INITIAL_DATA);
        return INITIAL_DATA;
      }
      const parsed = JSON.parse(stored);
      // Validate schema minimum requirements
      if (!parsed.members || !parsed.payments || !parsed.expenses || !parsed.expensePayments) {
        this.saveRawData(INITIAL_DATA);
        return INITIAL_DATA;
      }
      return parsed;
    } catch (e) {
      console.error('Failed to parse localStorage data:', e);
      return INITIAL_DATA;
    }
  }

  saveRawData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.notify();
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  /**
   * Get calculated data with all dynamic member, payment, expense, and dashboard totals.
   */
  getCalculatedData() {
    const raw = this.getRawData();
    const commonAmount = Number(raw.commonPayment?.amountPerMember) || 0;

    // 1. Process Members
    const members = (raw.members || []).map((m) => {
      const expectedAmount = Number(m.expectedAmount) >= 0 ? Number(m.expectedAmount) : commonAmount;
      const memberPayments = (raw.payments || []).filter((p) => p.memberId === m.id);
      const amountPaid = memberPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const remainingAmount = Math.max(0, expectedAmount - amountPaid);

      let status = 'Pending';
      if (amountPaid >= expectedAmount && expectedAmount > 0) {
        status = 'Paid';
      } else if (amountPaid > 0) {
        status = 'Partial';
      }

      return {
        ...m,
        expectedAmount,
        amountPaid,
        remainingAmount,
        status,
        paymentsCount: memberPayments.length
      };
    });

    // 2. Process Expenses & Multi-payments
    const expenses = (raw.expenses || []).map((exp) => {
      const totalAmount = Number(exp.totalAmount) || 0;
      const paymentsList = (raw.expensePayments || []).filter((ep) => ep.expenseId === exp.id);
      const totalPaid = paymentsList.reduce((sum, ep) => sum + (Number(ep.amount) || 0), 0);
      const remainingAmount = Math.max(0, totalAmount - totalPaid);

      const advancePayment = paymentsList.length > 0 ? Number(paymentsList[0].amount) || 0 : 0;

      let status = 'Pending';
      if (totalPaid >= totalAmount && totalAmount > 0) {
        status = 'Paid';
      } else if (totalPaid > 0) {
        status = 'Partial';
      }

      return {
        ...exp,
        totalAmount,
        totalPaid,
        advancePaid: advancePayment,
        remainingAmount,
        status,
        payments: paymentsList.sort((a, b) => new Date(b.date) - new Date(a.date))
      };
    });

    // 3. Overall Financial Summaries
    const totalCollection = (raw.payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalExpensesSpent = (raw.expensePayments || []).reduce((sum, ep) => sum + (Number(ep.amount) || 0), 0);
    const totalExpensesBudget = (raw.expenses || []).reduce((sum, exp) => sum + (Number(exp.totalAmount) || 0), 0);
    const remainingBalance = totalCollection - totalExpensesSpent;

    const paidMembersCount = members.filter((m) => m.status === 'Paid').length;
    const partialMembersCount = members.filter((m) => m.status === 'Partial').length;
    const pendingMembersCount = members.filter((m) => m.status === 'Pending').length;

    const expectedTotalCollection = members.length * commonAmount;

    return {
      raw,
      members,
      payments: (raw.payments || []).sort((a, b) => new Date(b.date) - new Date(a.date)),
      expenses,
      expensePayments: raw.expensePayments || [],
      commonPayment: raw.commonPayment || { amountPerMember: 2000 },
      activityLog: (raw.activityLog || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
      settings: raw.settings || {},
      summary: {
        totalCollection,
        totalExpenses: totalExpensesSpent,
        totalExpensesBudget,
        remainingBalance,
        totalMembers: members.length,
        expectedTotalCollection,
        remainingCollection: Math.max(0, expectedTotalCollection - totalCollection),
        paidMembersCount,
        partialMembersCount,
        pendingMembersCount
      }
    };
  }

  // --- MEMBER ACTIONS ---
  addMember(memberData) {
    const raw = this.getRawData();
    const newMember = {
      id: 'mem-' + Date.now(),
      name: memberData.name.trim(),
      mobile: memberData.mobile.trim(),
      expectedAmount: Number(memberData.expectedAmount) >= 0 ? Number(memberData.expectedAmount) : (raw.commonPayment?.amountPerMember || 2000),
      notes: memberData.notes || '',
      createdAt: memberData.createdAt || new Date().toISOString().split('T')[0]
    };
    raw.members.push(newMember);

    this.logActivity(raw, 'MEMBER_ADDED', `New member "${newMember.name}" added`);
    this.saveRawData(raw);
    return newMember;
  }

  updateMember(id, updatedData) {
    const raw = this.getRawData();
    const index = raw.members.findIndex((m) => m.id === id);
    if (index !== -1) {
      raw.members[index] = {
        ...raw.members[index],
        name: updatedData.name.trim(),
        mobile: updatedData.mobile.trim(),
        expectedAmount: Number(updatedData.expectedAmount) >= 0 ? Number(updatedData.expectedAmount) : raw.members[index].expectedAmount,
        notes: updatedData.notes || ''
      };
      this.logActivity(raw, 'MEMBER_UPDATED', `Member "${updatedData.name}" details updated`);
      this.saveRawData(raw);
    }
  }

  deleteMember(id) {
    const raw = this.getRawData();
    const member = raw.members.find((m) => m.id === id);
    const memberName = member ? member.name : 'Member';
    
    raw.members = raw.members.filter((m) => m.id !== id);
    // Also delete payments for this member
    raw.payments = raw.payments.filter((p) => p.memberId !== id);

    this.logActivity(raw, 'MEMBER_DELETED', `Member "${memberName}" and associated payments removed`);
    this.saveRawData(raw);
  }

  // --- MEMBER PAYMENT ACTIONS ---
  addPayment(paymentData) {
    const raw = this.getRawData();
    const newPayment = {
      id: 'pay-' + Date.now(),
      memberId: paymentData.memberId,
      amount: Number(paymentData.amount) || 0,
      date: paymentData.date || new Date().toISOString().split('T')[0],
      method: paymentData.method || 'Cash',
      reference: paymentData.reference || '',
      notes: paymentData.notes || ''
    };
    raw.payments.push(newPayment);

    const member = raw.members.find((m) => m.id === paymentData.memberId);
    const memberName = member ? member.name : 'Member';
    this.logActivity(raw, 'PAYMENT', `₹${newPayment.amount.toLocaleString('en-IN')} payment received from ${memberName}`);

    this.saveRawData(raw);
    return newPayment;
  }

  updatePayment(id, updatedData) {
    const raw = this.getRawData();
    const index = raw.payments.findIndex((p) => p.id === id);
    if (index !== -1) {
      raw.payments[index] = {
        ...raw.payments[index],
        amount: Number(updatedData.amount) || 0,
        date: updatedData.date,
        method: updatedData.method,
        reference: updatedData.reference || '',
        notes: updatedData.notes || ''
      };
      this.logActivity(raw, 'PAYMENT_UPDATED', `Payment transaction of ₹${updatedData.amount} updated`);
      this.saveRawData(raw);
    }
  }

  deletePayment(id) {
    const raw = this.getRawData();
    const payment = raw.payments.find((p) => p.id === id);
    const amount = payment ? payment.amount : 0;

    raw.payments = raw.payments.filter((p) => p.id !== id);
    this.logActivity(raw, 'PAYMENT_DELETED', `Payment record of ₹${amount} deleted`);
    this.saveRawData(raw);
  }

  // --- EXPENSE ACTIONS ---
  addExpense(expenseData) {
    const raw = this.getRawData();
    const expenseId = 'exp-' + Date.now();
    const newExpense = {
      id: expenseId,
      name: expenseData.name.trim(),
      category: expenseData.category || 'Other',
      vendor: expenseData.vendor ? expenseData.vendor.trim() : '',
      totalAmount: Number(expenseData.totalAmount) || 0,
      date: expenseData.date || new Date().toISOString().split('T')[0],
      notes: expenseData.notes || ''
    };
    raw.expenses.push(newExpense);

    // If advance payment was supplied during creation
    if (Number(expenseData.advanceAmount) > 0) {
      raw.expensePayments.push({
        id: 'exp-pay-' + Date.now(),
        expenseId: expenseId,
        amount: Number(expenseData.advanceAmount),
        date: expenseData.date || new Date().toISOString().split('T')[0],
        notes: 'Advance Payment'
      });
      this.logActivity(raw, 'EXPENSE_PAYMENT', `${newExpense.name} advance ₹${Number(expenseData.advanceAmount).toLocaleString('en-IN')} paid`);
    } else {
      this.logActivity(raw, 'EXPENSE_ADDED', `New expense "${newExpense.name}" (₹${newExpense.totalAmount.toLocaleString('en-IN')}) added`);
    }

    this.saveRawData(raw);
    return newExpense;
  }

  updateExpense(id, updatedData) {
    const raw = this.getRawData();
    const index = raw.expenses.findIndex((e) => e.id === id);
    if (index !== -1) {
      raw.expenses[index] = {
        ...raw.expenses[index],
        name: updatedData.name.trim(),
        category: updatedData.category || raw.expenses[index].category,
        vendor: updatedData.vendor ? updatedData.vendor.trim() : '',
        totalAmount: Number(updatedData.totalAmount) || 0,
        date: updatedData.date,
        notes: updatedData.notes || ''
      };
      this.logActivity(raw, 'EXPENSE_UPDATED', `Expense "${updatedData.name}" details updated`);
      this.saveRawData(raw);
    }
  }

  deleteExpense(id) {
    const raw = this.getRawData();
    const expense = raw.expenses.find((e) => e.id === id);
    const name = expense ? expense.name : 'Expense';

    raw.expenses = raw.expenses.filter((e) => e.id !== id);
    raw.expensePayments = raw.expensePayments.filter((ep) => ep.expenseId !== id);

    this.logActivity(raw, 'EXPENSE_DELETED', `Expense "${name}" and its payment records deleted`);
    this.saveRawData(raw);
  }

  // --- EXPENSE SUB-PAYMENT ACTIONS ---
  addExpensePayment(expensePaymentData) {
    const raw = this.getRawData();
    const newEp = {
      id: 'exp-pay-' + Date.now(),
      expenseId: expensePaymentData.expenseId,
      amount: Number(expensePaymentData.amount) || 0,
      date: expensePaymentData.date || new Date().toISOString().split('T')[0],
      notes: expensePaymentData.notes || ''
    };
    raw.expensePayments.push(newEp);

    const expense = raw.expenses.find((e) => e.id === expensePaymentData.expenseId);
    const name = expense ? expense.name : 'Expense';
    this.logActivity(raw, 'EXPENSE_PAYMENT', `₹${newEp.amount.toLocaleString('en-IN')} paid towards ${name}`);

    this.saveRawData(raw);
    return newEp;
  }

  updateExpensePayment(id, updatedData) {
    const raw = this.getRawData();
    const index = raw.expensePayments.findIndex((ep) => ep.id === id);
    if (index !== -1) {
      raw.expensePayments[index] = {
        ...raw.expensePayments[index],
        amount: Number(updatedData.amount) || 0,
        date: updatedData.date,
        notes: updatedData.notes || ''
      };
      this.logActivity(raw, 'EXPENSE_PAYMENT_UPDATED', `Expense payment of ₹${updatedData.amount} updated`);
      this.saveRawData(raw);
    }
  }

  deleteExpensePayment(id) {
    const raw = this.getRawData();
    const ep = raw.expensePayments.find((p) => p.id === id);
    const amount = ep ? ep.amount : 0;

    raw.expensePayments = raw.expensePayments.filter((p) => p.id !== id);
    this.logActivity(raw, 'EXPENSE_PAYMENT_DELETED', `Expense payment transaction of ₹${amount} deleted`);
    this.saveRawData(raw);
  }

  // --- COMMON PAYMENT SETTINGS ---
  updateCommonPaymentAmount(amount) {
    const raw = this.getRawData();
    const newAmount = Number(amount) >= 0 ? Number(amount) : 2000;
    if (!raw.commonPayment) raw.commonPayment = {};
    raw.commonPayment.amountPerMember = newAmount;

    // Update members who don't have explicit custom expectedAmount
    this.logActivity(raw, 'SETTINGS_UPDATED', `Common contribution set to ₹${newAmount.toLocaleString('en-IN')} per member`);
    this.saveRawData(raw);
  }

  // --- BACKUP & RESTORE ---
  exportBackupJSON() {
    const raw = this.getRawData();
    const jsonString = JSON.stringify(raw, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `morya-cha-vinayak-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  importBackupJSON(parsedData) {
    if (!parsedData || typeof parsedData !== 'object') {
      throw new Error('Invalid JSON format');
    }
    if (!Array.isArray(parsedData.members) || !Array.isArray(parsedData.expenses)) {
      throw new Error('JSON backup must contain valid "members" and "expenses" arrays.');
    }

    const cleanData = {
      members: parsedData.members || [],
      payments: parsedData.payments || [],
      expenses: parsedData.expenses || [],
      expensePayments: parsedData.expensePayments || [],
      commonPayment: parsedData.commonPayment || { amountPerMember: 2000 },
      activityLog: parsedData.activityLog || [],
      settings: parsedData.settings || {}
    };

    this.logActivity(cleanData, 'RESTORE', 'Application data restored from backup JSON');
    this.saveRawData(cleanData);
  }

  resetToDefault() {
    this.saveRawData(INITIAL_DATA);
  }

  // --- HELPER ACTIVITY LOGGER ---
  logActivity(rawObj, type, message) {
    if (!rawObj.activityLog) rawObj.activityLog = [];
    rawObj.activityLog.unshift({
      id: 'act-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      type,
      message,
      timestamp: new Date().toISOString()
    });
    // Keep max 50 recent activities
    if (rawObj.activityLog.length > 50) {
      rawObj.activityLog = rawObj.activityLog.slice(0, 50);
    }
  }
}

export const storageService = new StorageService();
