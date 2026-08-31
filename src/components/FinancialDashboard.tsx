import React, { useState } from 'react';
import { BankAccount, FeeTransaction, FinancialAlert, Student } from '../types';
import { 
  Building, CreditCard, AlertTriangle, ShieldCheck, Plus, RefreshCw, 
  ArrowUpRight, ArrowDownRight, CheckCircle2, TrendingUp, DollarSign, 
  FileSpreadsheet, Zap, HelpCircle, ExternalLink
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  Legend, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';

interface FinancialDashboardProps {
  banks?: BankAccount[];
  transactions?: FeeTransaction[];
  alerts?: FinancialAlert[];
  students?: Student[];
  onAddBankAccount?: (bank: Omit<BankAccount, 'id' | 'lastReconciled'>) => void;
  onSimulateWebhookReconciliation?: () => void;
  onReconcileBank?: (bankId: string) => void;
  onSimulatePayment?: (bankId: string, amount: number, studentRoll: string) => void;
  onDismissAlert?: (alertId: string) => void;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  banks = [],
  transactions = [],
  alerts = [],
  students = [],
  onAddBankAccount,
  onSimulateWebhookReconciliation,
  onReconcileBank,
  onSimulatePayment,
  onDismissAlert,
}) => {
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [selectedBankTab, setSelectedBankTab] = useState<string>('ALL');

  // Bank Form State
  const [bankFormData, setBankFormData] = useState({
    bankName: 'State Bank of India',
    accountNumber: '',
    accountType: 'PRIMARY_FEES' as BankAccount['accountType'],
    ifscCode: 'SBIN0001234',
    branchName: 'Main Campus Branch',
    balance: 500000,
    isActive: true,
  });

  const [bankFormErrors, setBankFormErrors] = useState<Record<string, string>>({});

  const totalLiquidity = (banks || []).reduce((sum, b) => sum + (b.balance || 0), 0);
  const totalHostelDues = (students || []).reduce((sum, s) => sum + (s.feeBalance || 0), 0);
  const totalMessDues = (students || []).reduce((sum, s) => sum + (s.messBalance || 0), 0);
  const totalCautionHeld = (students || []).reduce((sum, s) => sum + (s.depositAmount || 0), 0);

  // Revenue vs Expense Trend mock data
  const financialTrendData = [
    { month: 'Apr', feeIncome: 420000, messIncome: 240000, expenses: 310000 },
    { month: 'May', feeIncome: 480000, messIncome: 260000, expenses: 290000 },
    { month: 'Jun', feeIncome: 510000, messIncome: 290000, expenses: 350000 },
    { month: 'Jul', feeIncome: 650000, messIncome: 340000, expenses: 380000 },
    { month: 'Aug', feeIncome: 590000, messIncome: 310000, expenses: 340000 },
    { month: 'Sep', feeIncome: 720000, messIncome: 360000, expenses: 410000 },
  ];

  const bankShareData = banks.map((b) => ({
    name: b.bankName.replace('Bank of India', 'SBI').replace('Bank', ''),
    value: b.balance,
  }));

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  const validateBank = () => {
    const errors: Record<string, string> = {};
    if (!bankFormData.accountNumber || bankFormData.accountNumber.length < 8) {
      errors.accountNumber = 'Account number must be at least 8 digits';
    }
    if (!bankFormData.ifscCode || bankFormData.ifscCode.length < 11) {
      errors.ifscCode = 'IFSC Code must be exactly 11 characters (e.g. SBIN0001234)';
    }
    setBankFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBank()) return;
    onAddBankAccount(bankFormData);
    setShowAddBankModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Financial Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Consolidated Multi-Bank Treasury</span>
            <div className="text-2xl font-black text-slate-100 mt-1 font-mono">
              ₹{totalLiquidity.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="w-3 h-3" /> Across {banks.length} linked commercial accounts
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Building className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Refundable Caution Deposits</span>
            <div className="text-2xl font-black text-blue-400 mt-1 font-mono">
              ₹{totalCautionHeld.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">Held in Escrow (ICICI Bank)</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Pending Dues</span>
            <div className="text-2xl font-black text-rose-400 mt-1 font-mono">
              ₹{(totalHostelDues + totalMessDues).toLocaleString()}
            </div>
            <span className="text-[11px] text-rose-400/80 block mt-1">Hostel: ₹{totalHostelDues.toLocaleString()} | Mess: ₹{totalMessDues.toLocaleString()}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Active Financial Alerts</span>
            <div className="text-2xl font-black text-amber-400 mt-1 font-mono">
              {alerts.length} Pending
            </div>
            <span className="text-[11px] text-amber-400/80 block mt-1">Auto-monitored by ledger daemon</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Zap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Financial Alerts Banner */}
      {alerts.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Automated Ledger &amp; Reconciliation Alerts ({alerts.length})
              </h4>
            </div>
            <button
              onClick={onSimulateWebhookReconciliation}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Simulate Bank Webhook Reconciliation
            </button>
          </div>

          <div className="space-y-2">
            {alerts.map((al) => (
              <div
                key={al.id}
                className="bg-slate-950/80 border border-amber-500/20 rounded-xl p-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${
                    al.severity === 'CRITICAL' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
                  }`} />
                  <div>
                    <span className="font-bold text-slate-200">{al.title}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{al.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">{al.createdAt}</span>
                  <button
                    onClick={() => onDismissAlert(al.id)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Multi-Bank Account Linkage Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              Multi-Bank Account Linkage &amp; Treasury Balances
            </h3>
            <p className="text-xs text-slate-400">
              Direct API integrations with State Bank of India, HDFC, ICICI &amp; PNB
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddBankModal(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" /> Link New Bank Account
            </button>
          </div>
        </div>

        {/* Bank Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {banks.map((b) => (
            <div
              key={b.id}
              className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {b.accountType.replace('_', ' ')}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="API Synced"></span>
                </div>

                <h4 className="text-sm font-bold text-slate-100">{b.bankName}</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{b.accountNumber}</p>
                <p className="text-[11px] text-slate-500">IFSC: {b.ifscCode} • {b.branchName}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Settled Balance</span>
                <div className="text-lg font-black text-emerald-400 font-mono">
                  ₹{b.balance.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Last verified: {b.lastReconciled || 'Just now'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-100">6-Month Cash Flow &amp; Mess Billing Trends</h4>
              <p className="text-xs text-slate-400">Hostel Fee Collections vs Mess Fund vs Operating Costs</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialTrendData}>
                <defs>
                  <linearGradient id="colorFee" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="feeIncome" name="Hostel Fee Income" stroke="#6366f1" fillOpacity={1} fill="url(#colorFee)" />
                <Area type="monotone" dataKey="messIncome" name="Mess Collections" stroke="#10b981" fillOpacity={1} fill="url(#colorMess)" />
                <Area type="monotone" dataKey="expenses" name="Expenditures" stroke="#f43f5e" fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bank Share Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-100 mb-1">Multi-Bank Liquidity Distribution</h4>
            <p className="text-xs text-slate-400 mb-2">Proportion of reserves across partner banks</p>
            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bankShareData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {bankShareData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-800 text-xs">
            {banks.map((b, idx) => (
              <div key={b.id} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="truncate max-w-[130px]">{b.bankName}</span>
                </div>
                <span className="font-mono font-bold text-slate-200">₹{(b.balance / 100000).toFixed(1)} Lakh</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Link New Bank Account */}
      {showAddBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Link New Bank Account</h3>
                  <p className="text-xs text-slate-400">Configure corporate ledger integration</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddBankModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBankSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Financial Institution *</label>
                <select
                  value={bankFormData.bankName}
                  onChange={(e) => setBankFormData({ ...bankFormData, bankName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                >
                  <option value="State Bank of India">State Bank of India (SBI)</option>
                  <option value="HDFC Bank Ltd">HDFC Bank Ltd</option>
                  <option value="ICICI Bank Ltd">ICICI Bank Ltd</option>
                  <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                  <option value="Bank of Baroda">Bank of Baroda</option>
                  <option value="Axis Bank">Axis Bank</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Account Number *</label>
                  <input
                    type="text"
                    value={bankFormData.accountNumber}
                    onChange={(e) => setBankFormData({ ...bankFormData, accountNumber: e.target.value })}
                    placeholder="e.g. 50100492819210"
                    className={`w-full bg-slate-950 border rounded-xl px-3 py-2 font-mono text-slate-100 focus:outline-none ${
                      bankFormErrors.accountNumber ? 'border-rose-500' : 'border-slate-700'
                    }`}
                  />
                  {bankFormErrors.accountNumber && <p className="text-[10px] text-rose-400 mt-1">{bankFormErrors.accountNumber}</p>}
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">IFSC Code (11 digits) *</label>
                  <input
                    type="text"
                    value={bankFormData.ifscCode}
                    onChange={(e) => setBankFormData({ ...bankFormData, ifscCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. SBIN0001234"
                    className={`w-full bg-slate-950 border rounded-xl px-3 py-2 font-mono text-slate-100 focus:outline-none ${
                      bankFormErrors.ifscCode ? 'border-rose-500' : 'border-slate-700'
                    }`}
                  />
                  {bankFormErrors.ifscCode && <p className="text-[10px] text-rose-400 mt-1">{bankFormErrors.ifscCode}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Purpose / Account Type *</label>
                  <select
                    value={bankFormData.accountType}
                    onChange={(e) => setBankFormData({ ...bankFormData, accountType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                  >
                    <option value="PRIMARY_FEES">Primary Hostel Fees</option>
                    <option value="MESS_FEES">Mess Operations Fund</option>
                    <option value="CAUTION_DEPOSIT">Caution Deposit Escrow</option>
                    <option value="MAINTENANCE_RESERVE">Maintenance &amp; Repairs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Branch Name</label>
                  <input
                    type="text"
                    value={bankFormData.branchName}
                    onChange={(e) => setBankFormData({ ...bankFormData, branchName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Initial Opening Balance (INR)</label>
                <input
                  type="number"
                  value={bankFormData.balance}
                  onChange={(e) => setBankFormData({ ...bankFormData, balance: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-slate-100 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBankModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20"
                >
                  Link &amp; Authorize Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
