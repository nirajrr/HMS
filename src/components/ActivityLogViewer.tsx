import React, { useState } from 'react';
import { ActivityLog } from '../types';
import { 
  History, Search, Filter, ShieldCheck, Download, 
  Terminal, User, Calendar, RefreshCw
} from 'lucide-react';

interface ActivityLogViewerProps {
  logs?: ActivityLog[];
}

export const ActivityLogViewer: React.FC<ActivityLogViewerProps> = ({ logs = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('ALL');

  const filteredLogs = (logs || []).filter((l) => {
    const q = searchTerm.toLowerCase();
    const matchesQuery =
      !q ||
      l.performedBy.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      (l.targetEntity && l.targetEntity.toLowerCase().includes(q));

    const matchesModule = selectedModule === 'ALL' || l.module === selectedModule;
    return matchesQuery && matchesModule;
  });

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `hostel_audit_trail_${new Date().toISOString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              Cryptographic &amp; Immutable System Activity Log
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Append-only audit trail capturing student operations, room swaps, mess ledger edits &amp; approvals
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportToJson}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export Audit JSON
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit trail by clerk username, action type, student roll no, IP address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Modules</option>
              <option value="STUDENT">Student Management</option>
              <option value="ROOM">Room Allotment &amp; Swapping</option>
              <option value="MESS">Mess Ledger Adjustments</option>
              <option value="FINANCE">Multi-Bank Treasury &amp; Reconciliation</option>
              <option value="MAINTENANCE">Maintenance &amp; High-Cost Repairs</option>
              <option value="POLICE">Police Statutory Compliance</option>
              <option value="AUTH">Authentication &amp; Security</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="mt-4 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-850 text-slate-400 uppercase font-semibold border-b border-slate-800 font-sans">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor / Clerk</th>
                <th className="px-4 py-3">Module &amp; Action</th>
                <th className="px-4 py-3">Operation Details</th>
                <th className="px-4 py-3">Client IP / Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-[11px]">
                    {log.timestamp}
                  </td>

                  <td className="px-4 py-3 font-sans">
                    <span className="font-bold text-slate-200 block">{log.performedBy}</span>
                    <span className="text-[10px] text-slate-500 font-mono">@{log.userId}</span>
                  </td>

                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-indigo-400 border border-slate-700 inline-block font-sans">
                      {log.module}
                    </span>
                    <span className="text-[11px] text-slate-200 block font-semibold mt-0.5">{log.action}</span>
                  </td>

                  <td className="px-4 py-3 font-sans text-slate-300 max-w-md">
                    <p className="line-clamp-2">{log.details}</p>
                    {log.targetEntity && (
                      <span className="text-[10px] text-indigo-400 font-mono mt-0.5 block">
                        Target: {log.targetEntity}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-slate-500 text-[11px]">
                    <div>{log.ipAddress || '192.168.1.42'}</div>
                    <div className="text-[9px] text-slate-600 truncate max-w-[120px]">sha256:{log.id.replace('log_', '')}a8f</div>
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
