import React, { useState } from 'react';
import { Student, Room, FeeTransaction, BankAccount } from '../types';
import { 
  UtensilsCrossed, Search, Plus, Minus, CreditCard, Receipt, 
  History, ArrowDownRight, ArrowUpRight, CheckCircle2, AlertTriangle, 
  Building2, DollarSign, Download, Filter
} from 'lucide-react';

interface MessBillingProps {
  students?: Student[];
  rooms?: Room[];
  banks?: BankAccount[];
  transactions?: FeeTransaction[];
  onAdjustMessCharge?: (studentId: string, amount: number, isAddition: boolean, reason: string) => void;
  onAdjustCharge?: (studentId: string, amount: number, reason: string) => void;
  onRecordMessPayment?: (paymentData: {
    studentId: string;
    amount: number;
    bankAccountId: string;
    paymentMode: 'UPI' | 'NET_BANKING' | 'CHEQUE' | 'CASH' | 'AUTO_DEBIT';
    transactionRef: string;
    notes?: string;
  }) => void;
  onCollectPayment?: (studentId: string, amountPaid: number, mode: 'UPI' | 'NET_BANKING' | 'CASH') => void;
}

export const MessBilling: React.FC<MessBillingProps> = ({
  students = [],
  rooms = [],
  banks = [],
  transactions = [],
  onAdjustMessCharge,
  onAdjustCharge,
  onRecordMessPayment,
  onCollectPayment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('ALL');
  const [showAdjustModal, setShowAdjustModal] = useState<Student | null>(null);
  const [showPayModal, setShowPayModal] = useState<Student | null>(null);
  
  // Adjust form state
  const [adjustAmount, setAdjustAmount] = useState<number>(300);
  const [adjustType, setAdjustType] = useState<'ADD' | 'SUBTRACT'>('ADD');
  const [adjustReason, setAdjustReason] = useState<string>('Special Feast Dinner Charges');
  
  // Payment form state
  const [payAmount, setPayAmount] = useState<number>(2400);
  const [payBankId, setPayBankId] = useState<string>(() => {
    if (Array.isArray(banks) && banks.length > 0) {
      return banks.find(b => b.accountType === 'MESS_FEES')?.id || banks[0]?.id || '';
    }
    return '';
  });
  const [payMode, setPayMode] = useState<'UPI' | 'NET_BANKING' | 'CASH' | 'CHEQUE'>('UPI');
  const [payRef, setPayRef] = useState<string>(`UPI-MESS-${Math.floor(100000 + Math.random() * 900000)}`);
  const [payNotes, setPayNotes] = useState<string>('Monthly Mess Subscription');
  const [lastReceipt, setLastReceipt] = useState<FeeTransaction | null>(null);

  // Search & Filter students
  const filteredStudents = (students || []).filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || (s.roomNumber && s.roomNumber.includes(q)) || (s.name && s.name.toLowerCase().includes(q)) || (s.rollNumber && s.rollNumber.toLowerCase().includes(q));
    const matchesRoom = selectedRoomNumber === 'ALL' || s.roomNumber === selectedRoomNumber;
    return matchesQuery && matchesRoom;
  });

  const messTransactions = (transactions || []).filter((t) => t.paymentType === 'MESS_BILL');
  const totalMessCollected = messTransactions.reduce((acc, t) => acc + t.amount, 0);
  const totalMessDues = (students || []).reduce((acc, s) => acc + (s.messBalance || 0), 0);
  const studentsWithDues = (students || []).filter((s) => (s.messBalance || 0) > 0).length;

  const handleExecuteAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAdjustModal || !adjustAmount || !adjustReason) return;
    if (onAdjustMessCharge) {
      onAdjustMessCharge(showAdjustModal.id, adjustAmount, adjustType === 'ADD', adjustReason);
    } else if (onAdjustCharge) {
      onAdjustCharge(showAdjustModal.id, adjustType === 'ADD' ? adjustAmount : -adjustAmount, adjustReason);
    }
    setShowAdjustModal(null);
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPayModal || !payAmount) return;
    if (onRecordMessPayment) {
      onRecordMessPayment({
        studentId: showPayModal.id,
        amount: payAmount,
        bankAccountId: payBankId || (banks[0]?.id || 'bnk_hdfc_02'),
        paymentMode: payMode,
        transactionRef: payRef,
        notes: payNotes,
      });
    } else if (onCollectPayment) {
      onCollectPayment(showPayModal.id, payAmount, payMode === 'CASH' ? 'CASH' : payMode === 'NET_BANKING' ? 'NET_BANKING' : 'UPI');
    }
    setShowPayModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Mess Fund Balance</span>
            <div className="text-xl font-bold text-slate-100 mt-0.5">
              ₹{((Array.isArray(banks) ? banks.find((b) => b.accountType === 'MESS_FEES')?.balance : null) ?? 1420000).toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500">HDFC Bank Dedicated Account</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Mess Collections</span>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              ₹{totalMessCollected.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-500">{messTransactions.length} Verified Transactions</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Outstanding Mess Dues</span>
            <div className="text-xl font-bold text-rose-400 mt-0.5">
              ₹{totalMessDues.toLocaleString()}
            </div>
            <span className="text-[11px] text-rose-400/80">{studentsWithDues} Students have pending dues</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <History className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Diet Cost / Month</span>
            <div className="text-xl font-bold text-indigo-400 mt-0.5">₹3,200</div>
            <span className="text-[11px] text-slate-500">Includes 4 meals / day</span>
          </div>
        </div>
      </div>

      {/* Search & Fast Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-amber-400" />
              Mess Billing &amp; Room-Wise Charge Adjustment Console
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Search by room or roll number • Post additions/rebates • Collect payments with bank linkage
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Room #, Roll No, Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={selectedRoomNumber}
              onChange={(e) => setSelectedRoomNumber(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Rooms</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.roomNumber}>Room {r.roomNumber}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Residents Mess Ledger Table */}
        <div className="mt-5 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Room #</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Roll Number</th>
                <th className="px-4 py-3">Mess Account Status</th>
                <th className="px-4 py-3">Current Balance</th>
                <th className="px-4 py-3 text-right">Quick Mess Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <span className="w-8 h-8 rounded-lg bg-slate-800 font-bold text-slate-200 flex items-center justify-center">
                      {s.roomNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-200">{s.name}</td>
                  <td className="px-4 py-3 font-mono text-indigo-400 text-[11px]">{s.rollNumber}</td>
                  <td className="px-4 py-3">
                    {s.messBalance === 0 ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Cleared (No Dues)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400 text-[11px] font-medium bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        <AlertTriangle className="w-3 h-3" /> Overdue: ₹{s.messBalance}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold">
                    <span className={s.messBalance > 0 ? 'text-rose-400' : 'text-slate-300'}>
                      ₹{s.messBalance.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Add/Subtract adjustment */}
                      <button
                        onClick={() => {
                          setShowAdjustModal(s);
                          setAdjustAmount(300);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-amber-400 border border-slate-700 hover:border-amber-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> / <Minus className="w-3 h-3" />
                        Adjust Charge
                      </button>

                      {/* Collect Payment */}
                      <button
                        onClick={() => {
                          setShowPayModal(s);
                          setPayAmount(s.messBalance > 0 ? s.messBalance : 3200);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <CreditCard className="w-3 h-3" />
                        Collect Bill
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Mess Transactions Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-3">
          <History className="w-4 h-4 text-indigo-400" />
          Recent Mess Billing &amp; Payment Transactions (Bank Linked)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-2.5">Receipt #</th>
                <th className="px-4 py-2.5">Resident Student</th>
                <th className="px-4 py-2.5">Amount</th>
                <th className="px-4 py-2.5">Linked Bank Account</th>
                <th className="px-4 py-2.5">Mode / Ref</th>
                <th className="px-4 py-2.5">Timestamp</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {messTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-2.5 text-indigo-400 font-bold">{tx.receiptNumber}</td>
                  <td className="px-4 py-2.5 font-sans font-medium text-slate-200">
                    {tx.studentName} <span className="text-slate-500 text-[10px] block font-mono">{tx.rollNumber} • Room {tx.roomNumber}</span>
                  </td>
                  <td className="px-4 py-2.5 font-bold text-emerald-400">₹{tx.amount.toLocaleString()}</td>
                  <td className="px-4 py-2.5 font-sans text-slate-300">{tx.bankName}</td>
                  <td className="px-4 py-2.5 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-200">{tx.paymentMode}</span>
                    <span className="block text-[10px] text-slate-500">{tx.transactionRef}</span>
                  </td>
                  <td className="px-4 py-2.5 text-[11px] text-slate-400 font-sans">{tx.timestamp}</td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add or Subtract Mess Charges */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Adjust Mess Charges</h3>
                  <p className="text-xs text-slate-400">
                    For {showAdjustModal.name} (Room {showAdjustModal.roomNumber})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAdjustModal(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteAdjustment} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjustType('ADD')}
                  className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    adjustType === 'ADD'
                      ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Extra Charge (Debit)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('SUBTRACT')}
                  className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    adjustType === 'SUBTRACT'
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" />
                  Credit / Leave Rebate
                </button>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Adjustment Amount (INR) *</label>
                <input
                  type="number"
                  min="1"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold font-mono text-amber-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Mandatory Audit Reason / Note *</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Special Feast, 5 Days Medical Leave Rebate, Guest Meals"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400">
                Current Due: <strong className="text-slate-200">₹{showAdjustModal.messBalance}</strong> → New Estimated Due: <strong className="text-amber-400">₹{
                  adjustType === 'ADD'
                    ? showAdjustModal.messBalance + adjustAmount
                    : Math.max(0, showAdjustModal.messBalance - adjustAmount)
                }</strong>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-600/20"
                >
                  Post Adjustment &amp; Log Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Mess Payment */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Receive Mess Bill Payment</h3>
                  <p className="text-xs text-slate-400">
                    {showPayModal.name} ({showPayModal.rollNumber}) • Room {showPayModal.roomNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPayModal(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecutePayment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Payment Amount (INR) *</label>
                <input
                  type="number"
                  min="1"
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Linked Bank Account *</label>
                <select
                  value={payBankId}
                  onChange={(e) => setPayBankId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                >
                  {banks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} (Acct: ...{b.accountNumber.slice(-4)}) - {b.accountType}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Payment Mode</label>
                  <select
                    value={payMode}
                    onChange={(e) => setPayMode(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  >
                    <option value="UPI">UPI / QR Code</option>
                    <option value="NET_BANKING">Internet Banking (NEFT/RTGS)</option>
                    <option value="CASH">Cash Over Counter</option>
                    <option value="CHEQUE">Cheque / Demand Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Transaction Ref / UTR #</label>
                  <input
                    type="text"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Notes / Period Description</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Mess subscription for September 2026"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/20"
                >
                  Confirm &amp; Generate Official Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
