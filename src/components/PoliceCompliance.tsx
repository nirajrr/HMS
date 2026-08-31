import React, { useState } from 'react';
import { Student } from '../types';
import { 
  ShieldCheck, AlertTriangle, FileText, CheckCircle2, Download, 
  Send, Search, Filter, Printer, ExternalLink, RefreshCw
} from 'lucide-react';

interface PoliceComplianceProps {
  students?: Student[];
  onOpenPoliceModal?: (student: Student) => void;
  onInitiatePoliceVerification?: (student: Student) => void;
  onBatchSubmitVerification?: () => void;
  onBatchVerification?: () => void;
}

export const PoliceCompliance: React.FC<PoliceComplianceProps> = ({
  students = [],
  onOpenPoliceModal,
  onInitiatePoliceVerification,
  onBatchSubmitVerification,
  onBatchVerification,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);

  const verifiedCount = (students || []).filter(s => s.policeVerificationStatus === 'VERIFIED').length;
  const pendingCount = (students || []).filter(s => s.policeVerificationStatus === 'PENDING').length;
  const generatedCount = (students || []).filter(s => s.policeVerificationStatus === 'GENERATED').length;
  const complianceRate = Math.round((verifiedCount / (students.length || 1)) * 100);

  const filteredStudents = (students || []).filter((s) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q || s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q) || s.roomNumber.includes(q);
    const matchesStatus = selectedStatus === 'ALL' || s.policeVerificationStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleBatch = () => {
    setIsSubmittingBatch(true);
    setTimeout(() => {
      if (onBatchSubmitVerification) {
        onBatchSubmitVerification();
      } else if (onBatchVerification) {
        onBatchVerification();
      }
      setIsSubmittingBatch(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Compliance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Compliance Rate</span>
            <div className="text-xl font-bold text-slate-100 mt-0.5">{complianceRate}% Compliant</div>
            <span className="text-[11px] text-emerald-400 font-medium">{verifiedCount} of {students.length} Verified</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Clear Police Records</span>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{verifiedCount} Approved</div>
            <span className="text-[11px] text-slate-500">CCTNS Verified</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Pending Police Action</span>
            <div className="text-xl font-bold text-amber-400 mt-0.5">{pendingCount} Pending</div>
            <span className="text-[11px] text-amber-500">Action mandatory by law</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Forms Prepared</span>
            <div className="text-xl font-bold text-blue-400 mt-0.5">{generatedCount} Queued</div>
            <span className="text-[11px] text-slate-500">Ready for digital submission</span>
          </div>
        </div>
      </div>

      {/* Control Banner & Legal Notice */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              Statutory Police Tenant / Resident Verification Console (Sec. 188 IPC Compliance)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated document generation, digital verification dispatch, and CCTNS reference indexing
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBatch}
              disabled={isSubmittingBatch || pendingCount === 0}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center gap-2 shadow cursor-pointer transition-colors"
            >
              <Send className="w-4 h-4" />
              {isSubmittingBatch ? 'Transmitting to Police Portal...' : `Batch Submit All (${pendingCount}) to Portal`}
            </button>
          </div>
        </div>

        {/* Filter controls */}
        <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by Student Name, Roll No, Room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Verification Statuses</option>
              <option value="PENDING">Pending Action</option>
              <option value="GENERATED">Form Generated / Dispatched</option>
              <option value="VERIFIED">Police Cleared &amp; Verified</option>
            </select>
          </div>
        </div>

        {/* Student Records List */}
        <div className="mt-4 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Resident Student</th>
                <th className="px-4 py-3">Room &amp; Permanent Address</th>
                <th className="px-4 py-3">Jurisdiction Police Station</th>
                <th className="px-4 py-3">Verification Reference #</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Verification Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-200 text-sm block">{s.name}</span>
                    <span className="font-mono text-indigo-400 text-[11px]">{s.rollNumber}</span>
                  </td>

                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-300 block">Room {s.roomNumber} ({s.bedNumber})</span>
                    <span className="text-[11px] text-slate-500 block truncate max-w-xs">{s.permanentAddress}, {s.city}</span>
                  </td>

                  <td className="px-4 py-3 text-slate-300">
                    {s.policeStation || 'City Central Station'}
                  </td>

                  <td className="px-4 py-3 font-mono">
                    {s.policeVerificationRefNo ? (
                      <span className="text-emerald-400 font-bold">{s.policeVerificationRefNo}</span>
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">Not yet filed</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {s.policeVerificationStatus === 'VERIFIED' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Verified &amp; Cleared
                      </span>
                    ) : s.policeVerificationStatus === 'GENERATED' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-semibold">
                        <FileText className="w-3 h-3" /> In Verification
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-semibold">
                        <AlertTriangle className="w-3 h-3" /> Action Required
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => (onOpenPoliceModal ? onOpenPoliceModal(s) : onInitiatePoliceVerification?.(s))}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Generate / Dispatch
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
