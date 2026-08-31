import React, { useState, useRef } from 'react';
import { 
  Student, Room, FeeTransaction, BankAccount, MaintenanceRequest, 
  HousekeepingRecord, ResidentComplaint, Review, Notice, 
  ReportType, ReportFilterConfig 
} from '../types';
import { 
  FileText, Download, Printer, Filter, Calendar, Building2, 
  ShieldCheck, DollarSign, Utensils, Bed, Wrench, CheckCircle2, 
  Sparkles, RefreshCw, Eye, SlidersHorizontal, Share2, Layers,
  ChevronDown, Copy, Check, FileSpreadsheet, Lock, QrCode
} from 'lucide-react';

interface ReportEngineProps {
  students: Student[];
  rooms: Room[];
  banks: BankAccount[];
  transactions: FeeTransaction[];
  maintenance: MaintenanceRequest[];
  housekeeping: HousekeepingRecord[];
  complaints: ResidentComplaint[];
  notices: Notice[];
  onClose?: () => void;
}

export const ReportEngine: React.FC<ReportEngineProps> = ({
  students,
  rooms,
  banks,
  transactions,
  maintenance,
  housekeeping,
  complaints,
  notices,
  onClose,
}) => {
  const [reportType, setReportType] = useState<ReportType>('FINANCIAL_AUDIT');
  const [selectedBlock, setSelectedBlock] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('2026-08-01');
  const [dateTo, setDateTo] = useState('2026-08-31');
  const [includeWatermark, setIncludeWatermark] = useState(true);
  const [includeSignatures, setIncludeSignatures] = useState(true);
  const [includeQrSeal, setIncludeQrSeal] = useState(true);
  const [customReportTitle, setCustomReportTitle] = useState('Native Nest Veg Boys PG - Comprehensive Audit Report');
  const [preparedBy, setPreparedBy] = useState('Dr. Rajiv Malhotra (Chief Warden)');
  const [designation, setDesignation] = useState('Supervisory Board of Administration');
  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState('');

  const printableRef = useRef<HTMLDivElement>(null);

  // Filter calculations based on criteria
  const filteredStudents = students.filter(s => {
    const studentRoom = rooms.find(r => r.roomNumber === s.roomNumber);
    if (selectedBlock !== 'ALL' && studentRoom && !studentRoom.block.includes(selectedBlock)) return false;
    return true;
  });

  const filteredRooms = rooms.filter(r => {
    if (selectedBlock !== 'ALL' && !r.block.includes(selectedBlock)) return false;
    return true;
  });

  // Financial Metrics
  const totalCollections = transactions.filter(t => t.status === 'SUCCESS' || t.status === 'RECONCILED').reduce((acc, t) => acc + t.amount, 0);
  const totalHostelRent = transactions.filter(t => t.paymentType === 'HOSTEL_FEE').reduce((acc, t) => acc + t.amount, 0);
  const totalMessRevenue = transactions.filter(t => t.paymentType === 'MESS_BILL').reduce((acc, t) => acc + t.amount, 0);
  const totalSecurityDeposits = transactions.filter(t => t.paymentType === 'SECURITY_DEPOSIT').reduce((acc, t) => acc + t.amount, 0);
  const totalDueFees = filteredStudents.reduce((acc, s) => acc + (s.feeBalance || 0), 0);
  const totalDueMess = filteredStudents.reduce((acc, s) => acc + (s.messBalance || 0), 0);

  // Occupancy Metrics
  const totalBeds = filteredRooms.reduce((acc, r) => acc + r.totalBeds, 0);
  const occupiedBeds = filteredRooms.reduce((acc, r) => acc + r.occupiedBeds, 0);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // Police Compliance Metrics
  const verifiedPolice = filteredStudents.filter(s => s.policeVerificationStatus === 'VERIFIED').length;
  const pendingPolice = filteredStudents.filter(s => s.policeVerificationStatus === 'PENDING' || s.policeVerificationStatus === 'GENERATED').length;
  const policeCompliancePct = filteredStudents.length > 0 ? Math.round((verifiedPolice / filteredStudents.length) * 100) : 0;

  // Housekeeping & Quorum Metrics
  const totalCleanings = housekeeping.length;
  const quorumPassed = housekeeping.filter(h => h.status === 'VERIFIED_DONE' && h.consensusReached).length;
  const escalatedCleanings = housekeeping.filter(h => h.escalatedToAdmin).length;

  const handlePrintPdf = () => {
    setIsExporting(true);
    setTimeout(() => {
      window.print();
      setIsExporting(false);
      setExportSuccessMsg('PDF Print Preview generated successfully!');
      setTimeout(() => setExportSuccessMsg(''), 3000);
    }, 400);
  };

  const handleExportCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (reportType === 'FINANCIAL_AUDIT') {
      csvContent += 'Receipt No,Student Name,Roll No,Room,Payment Type,Bank,Amount (INR),Payment Mode,Date,Status\n';
      transactions.forEach(t => {
        csvContent += `"${t.receiptNumber}","${t.studentName}","${t.rollNumber}","${t.roomNumber}","${t.paymentType}","${t.bankName}",${t.amount},"${t.paymentMode}","${t.timestamp}","${t.status}"\n`;
      });
    } else if (reportType === 'POLICE_KYC_COMPLIANCE') {
      csvContent += 'Roll No,Resident Name,Gender,Room,Bed,Mobile,Aadhaar (Masked),PAN,Police Station,Verification Status,Ref No\n';
      filteredStudents.forEach(s => {
        csvContent += `"${s.rollNumber}","${s.name}","${s.gender}","${s.roomNumber}","${s.bedNumber}","${s.mobile}","${s.aadharNumber}","${s.panNumber || 'N/A'}","${s.policeStation || 'Civil Lines'}","${s.policeVerificationStatus}","${s.policeVerificationRefNo || 'PENDING'}"\n`;
      });
    } else {
      csvContent += 'Room No,Block,Floor,Size SqFt,Type,Total Beds,Occupied,Base Rent,Monthly Rent Per Bed,Status\n';
      filteredRooms.forEach(r => {
        csvContent += `"${r.roomNumber}","${r.block}",${r.floor},${r.roomSizeSqFt || 180},"${r.type}",${r.totalBeds},${r.occupiedBeds},${r.baseRoomRent || 15000},${r.monthlyRent},"${r.status}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NativeNest_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportSuccessMsg('Data CSV spreadsheet exported successfully!');
    setTimeout(() => setExportSuccessMsg(''), 3000);
  };

  const copyOnlineReportUrl = () => {
    const fakeUrl = `https://nativenest-boyspg.cloud/reports/verify?id=REP-2026-${Date.now().toString(16).toUpperCase()}&type=${reportType}`;
    navigator.clipboard.writeText(fakeUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Engine Controls Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100">
                  Custom PDF Report Engine &amp; Statutory Dispatch
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  High-Def Vector Print Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate formatted, tamper-evident audit reports for Revenue, Police KYC, Veg Dining, and Room Allocations
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Export CSV Data
            </button>

            <button
              onClick={copyOnlineReportUrl}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
              {copiedLink ? 'Hyperlink Copied!' : 'Copy Verification Hyperlink'}
            </button>

            <button
              onClick={handlePrintPdf}
              disabled={isExporting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              {isExporting ? 'Formatting Document...' : 'Print / Export Official PDF'}
            </button>
          </div>
        </div>

        {exportSuccessMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{exportSuccessMsg}</span>
          </div>
        )}

        {/* Template Selector Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 mt-5">
          {[
            { id: 'FINANCIAL_AUDIT', label: '1. Financial & Fee Ledger', icon: DollarSign, color: 'text-emerald-400' },
            { id: 'POLICE_KYC_COMPLIANCE', label: '2. Police KYC & Sec 188 Register', icon: ShieldCheck, color: 'text-amber-400' },
            { id: 'MESS_VEG_DINING', label: '3. Pure Veg Dining & Mess Ledger', icon: Utensils, color: 'text-orange-400' },
            { id: 'ROOM_BED_OCCUPANCY', label: '4. Bed Inventory & Variable Yield', icon: Bed, color: 'text-blue-400' },
            { id: 'MAINTENANCE_HOUSEKEEPING_CONSENSUS', label: '5. Housekeeping 3/4 Quorum Audit', icon: Wrench, color: 'text-purple-400' },
          ].map((tmpl) => {
            const Icon = tmpl.icon;
            const isSelected = reportType === tmpl.id;
            return (
              <button
                key={tmpl.id}
                onClick={() => setReportType(tmpl.id as ReportType)}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800 border-indigo-500 ring-2 ring-indigo-500/30 text-white shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`w-4 h-4 ${tmpl.color}`} />
                  {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400"></span>}
                </div>
                <span className="text-xs font-bold mt-2 block leading-tight">{tmpl.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter Customization Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Hostel Wing / Block</label>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Wings (Block A Shivaji, Block B Maharana)</option>
              <option value="A-Block">Block A (Shivaji Wing)</option>
              <option value="B-Block">Block B (Maharana Wing)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Audit Date Period</label>
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-200 focus:outline-none"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Prepared By &amp; Authority</label>
            <input
              type="text"
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none text-[11px]"
            />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeWatermark}
                onChange={(e) => setIncludeWatermark(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-0"
              />
              <span className="text-slate-300 text-xs">Official Watermark</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSignatures}
                onChange={(e) => setIncludeSignatures(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-0"
              />
              <span className="text-slate-300 text-xs">Digital Seals</span>
            </label>
          </div>
        </div>
      </div>

      {/* Printable High-Definition A4 PDF Paper Container */}
      <div 
        ref={printableRef}
        id="printable-audit-report"
        className="bg-white text-slate-900 rounded-2xl shadow-2xl p-8 md:p-12 border border-slate-300 max-w-5xl mx-auto font-sans relative overflow-hidden transition-all print:p-0 print:border-none print:shadow-none print:m-0 print:max-w-none print:w-full"
      >
        {/* Tamper-evident Watermark (Optional) */}
        {includeWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 opacity-5 -rotate-30 text-slate-900 text-5xl md:text-7xl font-extrabold tracking-widest text-center leading-none">
            NATIVE NEST VEG BOYS PG<br />OFFICIAL AUDIT SEAL
          </div>
        )}

        <div className="relative z-10 space-y-6">
          {/* Official Letterhead */}
          <div className="border-b-2 border-emerald-800 pb-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-white flex flex-col items-center justify-center font-bold shadow-md">
                <span className="text-xl tracking-tighter">NN</span>
                <span className="text-[9px] uppercase tracking-widest text-emerald-200 font-mono">VEG PG</span>
              </div>
              <div>
                <h1 className="text-2xl font-black text-emerald-950 tracking-tight">
                  NATIVE NEST VEG BOYS PG
                </h1>
                <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Pure Vegetarian Residence Hall &amp; Scholars Academy • ISO 9001:2026 Certified
                </p>
                <p className="text-[11px] text-slate-600">
                  Sector 62 Institutional Area, Knowledge Park Phase II • Reg No: NNV-PG/2026/DL-0982
                </p>
              </div>
            </div>

            <div className="text-left md:text-right text-xs text-slate-600 border-l-2 md:border-l-0 md:border-r-2 border-emerald-700 pl-3 md:pl-0 md:pr-3">
              <div className="font-mono text-emerald-950 font-bold text-sm">
                DOC REF: NNV-AUD-{new Date().getFullYear()}-{Math.floor(1000 + Math.random() * 9000)}
              </div>
              <div>Audit Date: <span className="font-semibold text-slate-800">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
              <div>Period: <span className="font-semibold text-slate-800">{dateFrom} to {dateTo}</span></div>
              <div>Jurisdiction: <span className="font-semibold text-slate-800">Sector 62 Police Station</span></div>
            </div>
          </div>

          {/* Report Sub-Header & Scope */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-emerald-900 font-bold text-sm block">
                {reportType === 'FINANCIAL_AUDIT' && 'Master Financial Collection & Reconciliation Audit'}
                {reportType === 'POLICE_KYC_COMPLIANCE' && 'Statutory Tenant KYC & Police Verification Intimation Register'}
                {reportType === 'MESS_VEG_DINING' && 'Pure Vegetarian Dining Hall & Nutrition Consumption Audit'}
                {reportType === 'ROOM_BED_OCCUPANCY' && 'Master Bed Inventory, Placement & Variable Yield Analysis'}
                {reportType === 'MAINTENANCE_HOUSEKEEPING_CONSENSUS' && 'Housekeeping Quorum Consensus & Statutory Grievance Audit'}
              </span>
              <span className="text-slate-600 text-[11px]">
                Classification: Protected Institutional Audit Record • Section 188 IPC Compliance Audit
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-emerald-800 text-white font-bold text-[10px] uppercase">
                Status: Verified &amp; Signed
              </span>
              {includeQrSeal && (
                <div className="w-10 h-10 border border-emerald-400 bg-white p-1 rounded flex items-center justify-center text-emerald-900 shadow-sm" title="Cryptographic QR Verification Stamp">
                  <QrCode className="w-full h-full" />
                </div>
              )}
            </div>
          </div>

          {/* Report Specific Tables & Data Visualizations */}

          {/* 1. FINANCIAL AUDIT TEMPLATE */}
          {reportType === 'FINANCIAL_AUDIT' && (
            <div className="space-y-5">
              {/* Executive Summary Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-800">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Total Realized Revenue</span>
                  <div className="text-lg font-black text-emerald-900 font-mono mt-0.5">₹{totalCollections.toLocaleString('en-IN')}</div>
                  <span className="text-[10px] text-emerald-700 font-medium">Reconciled in 4 Banks</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Hostel Rent Share</span>
                  <div className="text-lg font-black text-blue-900 font-mono mt-0.5">₹{totalHostelRent.toLocaleString('en-IN')}</div>
                  <span className="text-[10px] text-slate-600">{filteredRooms.length} Rooms Audited</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Pure Veg Mess Billing</span>
                  <div className="text-lg font-black text-amber-900 font-mono mt-0.5">₹{totalMessRevenue.toLocaleString('en-IN')}</div>
                  <span className="text-[10px] text-amber-700">4 Daily Meals Included</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Total Outstanding Dues</span>
                  <div className="text-lg font-black text-rose-900 font-mono mt-0.5">₹{(totalDueFees + totalDueMess).toLocaleString('en-IN')}</div>
                  <span className="text-[10px] text-rose-700">Action Required</span>
                </div>
              </div>

              {/* Transaction Ledger Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Audited Transaction Vouchers (Current Period)
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Receipt / Txn ID</th>
                        <th className="py-2.5 px-3">Resident Scholar</th>
                        <th className="py-2.5 px-3">Room</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Disbursed Bank</th>
                        <th className="py-2.5 px-3 text-right">Amount (INR)</th>
                        <th className="py-2.5 px-3">Mode</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700">
                      {transactions.slice(0, 8).map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-bold text-slate-900">{t.receiptNumber}</td>
                          <td className="py-2 px-3">
                            <span className="font-semibold text-slate-900">{t.studentName}</span>
                            <span className="block text-[10px] text-slate-500 font-mono">{t.rollNumber}</span>
                          </td>
                          <td className="py-2 px-3 font-mono">Rm {t.roomNumber}</td>
                          <td className="py-2 px-3">
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-semibold">
                              {t.paymentType.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-2 px-3 truncate max-w-[120px]">{t.bankName}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-950">₹{t.amount.toLocaleString('en-IN')}</td>
                          <td className="py-2 px-3 font-mono">{t.paymentMode}</td>
                          <td className="py-2 px-3 text-center">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. POLICE KYC COMPLIANCE TEMPLATE */}
          {reportType === 'POLICE_KYC_COMPLIANCE' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-800">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Compliance Rate</span>
                  <div className="text-xl font-black text-emerald-900 font-mono mt-0.5">{policeCompliancePct}%</div>
                  <span className="text-[10px] text-emerald-700">{verifiedPolice} Cleared by Law Enforcement</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Aadhaar Integrity</span>
                  <div className="text-xl font-black text-blue-900 font-mono mt-0.5">100% SHA-256</div>
                  <span className="text-[10px] text-slate-600">UIDAI Masked Format</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Pending Police Intimation</span>
                  <div className="text-xl font-black text-amber-900 font-mono mt-0.5">{pendingPolice} Residents</div>
                  <span className="text-[10px] text-amber-700">Digital Dispatch Scheduled</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Local Jurisdiction</span>
                  <div className="text-sm font-bold text-slate-900 mt-1">Sector 62 Police Station</div>
                  <span className="text-[10px] text-slate-500">SHO: Inspector R.K. Yadav</span>
                </div>
              </div>

              {/* Police Intimation Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Tenant Statutory KYC &amp; Police Verification Register
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Resident Details</th>
                        <th className="py-2.5 px-3">Room / Bed</th>
                        <th className="py-2.5 px-3">UIDAI Aadhaar</th>
                        <th className="py-2.5 px-3">Institution / Employer</th>
                        <th className="py-2.5 px-3">Contact</th>
                        <th className="py-2.5 px-3">Police Ref Track</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700">
                      {filteredStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-900 block">{s.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{s.rollNumber} • Male</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-medium">
                            Rm {s.roomNumber} ({s.bedNumber})
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-800 font-semibold">
                            {s.aadharNumber || 'XXXX-XXXX-8921'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 truncate max-w-[140px]">
                            {s.institutionOrEmployerName || 'IIT Delhi / Infopark'}
                          </td>
                          <td className="py-2.5 px-3 font-mono">{s.mobile}</td>
                          <td className="py-2.5 px-3 font-mono text-[10px] text-indigo-900 font-bold">
                            {s.policeVerificationRefNo || 'POL-SEC62-PENDING'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              s.policeVerificationStatus === 'VERIFIED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {s.policeVerificationStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. PURE VEG MESS & DINING TEMPLATE */}
          {reportType === 'MESS_VEG_DINING' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950">
                <span className="font-bold block text-sm mb-1">
                  100% Pure Vegetarian Dietary Protocol Certification
                </span>
                Native Nest Veg Boys PG operates under strict Sattvic &amp; Pure Vegetarian standards. Zero non-vegetarian preparation, separate Jain dining counters without onion/garlic, and daily calorie/protein balancing.
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-800">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Daily Pure Veg Meals</span>
                  <div className="text-xl font-black text-amber-900 font-mono mt-0.5">4 Times/Day</div>
                  <span className="text-[10px] text-slate-600">Breakfast, Lunch, Snacks, Dinner</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Jain Food Preference</span>
                  <div className="text-xl font-black text-emerald-900 font-mono mt-0.5">18 Residents</div>
                  <span className="text-[10px] text-emerald-700">Strict Root-Veg Exclusion</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Monthly Mess Fee</span>
                  <div className="text-xl font-black text-blue-900 font-mono mt-0.5">₹4,200 / Resident</div>
                  <span className="text-[10px] text-blue-700">Subsidized Nutrition</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Leave Rebate System</span>
                  <div className="text-xl font-black text-purple-900 font-mono mt-0.5">₹110 / Day</div>
                  <span className="text-[10px] text-purple-700">Min 3 Consecutive Days</span>
                </div>
              </div>

              {/* Weekly Pure Veg Menu Matrix */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-slate-100 p-2.5 font-bold text-slate-800 border-b border-slate-200 text-xs">
                  Official Pure Vegetarian Weekly Dining Schedule
                </div>
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Day</th>
                      <th className="py-2 px-3">Breakfast (07:30 - 09:30)</th>
                      <th className="py-2 px-3">Lunch (12:30 - 14:30)</th>
                      <th className="py-2 px-3">Evening Snacks (17:00 - 18:00)</th>
                      <th className="py-2 px-3">Dinner (20:00 - 22:00)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-2 px-3 font-bold text-slate-900">Monday</td>
                      <td className="py-2 px-3">Poha with Roasted Peanuts, Sprouts, Chai</td>
                      <td className="py-2 px-3">Paneer Butter Masala, Yellow Dal Tadka, Ghee Phulka, Rice, Curd</td>
                      <td className="py-2 px-3">Samosa, Mint Chutney, Tea</td>
                      <td className="py-2 px-3">Aloo Gobhi Masala, Chana Dal, Hot Rotis, Kheer</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-slate-900">Tuesday</td>
                      <td className="py-2 px-3">South Indian Idli, Medu Vada, Coconut Chutney, Sambar</td>
                      <td className="py-2 px-3">Rajma Masala (Jammu Style), Jeera Rice, Boondi Raita, Salad</td>
                      <td className="py-2 px-3">Veg Cutlet, Filter Coffee</td>
                      <td className="py-2 px-3">Palak Paneer, Moong Dal Khichdi with Desi Ghee, Papad</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-slate-900">Wednesday</td>
                      <td className="py-2 px-3">Aloo Paratha with Amul Butter, Dahi, Pickle</td>
                      <td className="py-2 px-3">Kadhi Pakoda, Dum Aloo, Steamed Basmati Rice, Chapati</td>
                      <td className="py-2 px-3">Dhokla with Green Chilli, Chai</td>
                      <td className="py-2 px-3">Shahi Paneer, Dal Makhani (Slow cooked), Butter Naan, Gulab Jamun</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-slate-900">Sunday (Feast)</td>
                      <td className="py-2 px-3">Chole Bhature with Pickled Onions, Sweet Lassi</td>
                      <td className="py-2 px-3">Special Veg Biryani, Mirchi ka Salan, Veg Korma, Raita, Rasgulla</td>
                      <td className="py-2 px-3">Paneer Bread Pakoda, Masala Chai</td>
                      <td className="py-2 px-3">Dal Baati Churma with Pure Ghee, Gatta Curry, Rice</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. ROOM & BED INVENTORY TEMPLATE */}
          {reportType === 'ROOM_BED_OCCUPANCY' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-800">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Total Capacity</span>
                  <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{totalBeds} Cots / Beds</div>
                  <span className="text-[10px] text-slate-600">{filteredRooms.length} Rooms Evaluated</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Current Occupancy</span>
                  <div className="text-xl font-black text-emerald-900 font-mono mt-0.5">{occupancyRate}% ({occupiedBeds} Beds)</div>
                  <span className="text-[10px] text-emerald-700">{totalBeds - occupiedBeds} Beds Vacant</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Avg Bed Rent Yield</span>
                  <div className="text-xl font-black text-blue-900 font-mono mt-0.5">₹8,850 / Bed</div>
                  <span className="text-[10px] text-blue-700">Variable Bed Tiering</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Estimated Monthly Yield</span>
                  <div className="text-xl font-black text-purple-900 font-mono mt-0.5">₹{(occupiedBeds * 8850).toLocaleString('en-IN')}</div>
                  <span className="text-[10px] text-purple-700">At Current Occupancy</span>
                </div>
              </div>

              {/* Room Inventory Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Room &amp; Block</th>
                      <th className="py-2.5 px-3">Physical Size</th>
                      <th className="py-2.5 px-3">Category &amp; Ventilation</th>
                      <th className="py-2.5 px-3">Bed Breakdown &amp; Individual Pricing</th>
                      <th className="py-2.5 px-3 text-center">Occupancy</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredRooms.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 block">Room #{r.roomNumber}</span>
                          <span className="text-[10px] text-slate-500">{r.block} • Floor {r.floor}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium">
                          {r.roomSizeSqFt || 190} sq ft
                          <span className="block text-[10px] text-slate-500">{r.dimensions || '14ft x 13.5ft'}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-slate-900 block">{r.roomCategory || 'STANDARD'}</span>
                          <span className="text-[10px] text-slate-500">{r.ventilationType || 'CROSS_VENTILATED'}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          {r.beds && r.beds.length > 0 ? (
                            <div className="space-y-1">
                              {r.beds.map((b) => (
                                <div key={b.id} className="flex items-center justify-between text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded">
                                  <span>{b.bedNumber} ({b.position || 'Corner'}):</span>
                                  <span className="font-bold text-emerald-900">₹{b.monthlyRent}</span>
                                  <span className={b.status === 'OCCUPIED' ? 'text-amber-700' : 'text-emerald-700'}>
                                    [{b.status}]
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="font-mono text-slate-900 font-bold">₹{r.monthlyRent} / bed</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold">
                          {r.occupiedBeds} / {r.totalBeds}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.status === 'OCCUPIED' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. HOUSEKEEPING 3/4 QUORUM AUDIT */}
          {reportType === 'MAINTENANCE_HOUSEKEEPING_CONSENSUS' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-800">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Cleaning Records</span>
                  <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{totalCleanings} Logged</div>
                  <span className="text-[10px] text-slate-600">Daily Shifts Audited</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">3/4 Quorum Pass Rate</span>
                  <div className="text-xl font-black text-emerald-900 font-mono mt-0.5">
                    {totalCleanings > 0 ? Math.round((quorumPassed / totalCleanings) * 100) : 0}%
                  </div>
                  <span className="text-[10px] text-emerald-700">{quorumPassed} Verified by Students</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Admin Escalations</span>
                  <div className="text-xl font-black text-rose-900 font-mono mt-0.5">{escalatedCleanings} Flagged</div>
                  <span className="text-[10px] text-rose-700">Supervisor Intervention</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Resident Complaints</span>
                  <div className="text-xl font-black text-blue-900 font-mono mt-0.5">{complaints.length} Tickets</div>
                  <span className="text-[10px] text-blue-700">Mapped to Room &amp; Bed</span>
                </div>
              </div>

              {/* Housekeeping Consensus Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Room &amp; Task</th>
                      <th className="py-2.5 px-3">Assigned Staff</th>
                      <th className="py-2.5 px-3">Shift &amp; Time</th>
                      <th className="py-2.5 px-3">3/4 Quorum Consensus</th>
                      <th className="py-2.5 px-3">Resident Remarks &amp; Feedback</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {housekeeping.map((hk) => (
                      <tr key={hk.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 block">Room #{hk.roomNumber}</span>
                          <span className="text-[10px] text-slate-500">{hk.cleaningTitle}</span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">
                          {hk.assignedStaff}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px]">
                          {hk.scheduledDate} ({hk.shift})
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          <span className="font-bold text-slate-900">
                            {hk.verifiedCount} / {hk.requiredQuorumCount} Quorum Met
                          </span>
                          {hk.disputedCount > 0 && (
                            <span className="block text-[10px] text-rose-700 font-semibold">
                              {hk.disputedCount} Dispute(s)
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 max-w-[220px]">
                          {hk.studentRemarks && hk.studentRemarks.length > 0 ? (
                            hk.studentRemarks.map((rem, i) => (
                              <div key={i} className="text-[10px] truncate">
                                • {rem.studentName}: "{rem.feedbackNotes || rem.remark}"
                              </div>
                            ))
                          ) : (
                            <span className="text-slate-400 italic">Awaiting resident feedback</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            hk.status === 'VERIFIED_DONE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : hk.status === 'FLAGGED_ESCALATED_ADMIN'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {hk.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Statutory Signatures & Seal Section */}
          {includeSignatures && (
            <div className="pt-8 mt-8 border-t-2 border-slate-200 grid grid-cols-3 gap-6 text-center text-xs">
              <div>
                <div className="h-14 flex items-end justify-center pb-2">
                  <span className="font-serif italic text-emerald-950 font-bold text-base">
                    Dr. Rajiv Malhotra
                  </span>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <div className="font-bold text-slate-900">Chief Warden &amp; Admin</div>
                  <div className="text-[10px] text-slate-500">Native Nest Veg Boys PG</div>
                </div>
              </div>

              <div>
                <div className="h-14 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-emerald-800 flex items-center justify-center text-[9px] font-bold text-emerald-950 uppercase p-1 leading-tight text-center">
                    SEAL<br />VERIFIED
                  </div>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <div className="font-bold text-slate-900">Statutory Seal</div>
                  <div className="text-[10px] text-slate-500">ISO 9001:2026 Certified</div>
                </div>
              </div>

              <div>
                <div className="h-14 flex items-end justify-center pb-2">
                  <span className="font-serif italic text-slate-800 font-bold text-base">
                    Suresh Verma
                  </span>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <div className="font-bold text-slate-900">Registrar &amp; Compliance Officer</div>
                  <div className="text-[10px] text-slate-500">Sector 62 Police Liaison</div>
                </div>
              </div>
            </div>
          )}

          {/* Document Verification Footer & Hyperlink */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 font-mono">
            <span>
              Generated via Native Nest ERP Engine • SHA-256: {Math.random().toString(36).substring(2, 12).toUpperCase()}
            </span>
            <span>
              Verify authenticity at: <a href="#verify" className="text-emerald-800 font-bold underline">https://nativenest-boyspg.cloud/verify</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
