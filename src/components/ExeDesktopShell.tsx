import React, { useState } from 'react';
import { 
  Monitor, Smartphone, RefreshCw, Download, ShieldCheck, 
  Terminal, HardDrive, Wifi, Activity, Layers, Cpu, Database,
  Minimize2, Square, X, ExternalLink, Check, Copy, AlertCircle,
  FileText, Sparkles, SlidersHorizontal, ArrowLeftRight
} from 'lucide-react';
import { SyncEngineStatus, SyncPacket } from '../types';

interface ExeDesktopShellProps {
  syncStatus: SyncEngineStatus;
  syncPackets: SyncPacket[];
  onTriggerSync: (source: 'EXE_DESKTOP' | 'APK_MOBILE', action: string, details: string) => void;
  onOpenReportEngine: () => void;
  children: React.ReactNode;
  activeModuleTitle: string;
}

export const ExeDesktopShell: React.FC<ExeDesktopShellProps> = ({
  syncStatus,
  syncPackets,
  onTriggerSync,
  onOpenReportEngine,
  children,
  activeModuleTitle,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [showConsoleDrawer, setShowConsoleDrawer] = useState(false);
  const [downloadingExe, setDownloadingExe] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState('');

  const handleSimulateSyncPulse = () => {
    onTriggerSync(
      'EXE_DESKTOP',
      'DESKTOP_WORKSTATION_MANUAL_PULSE',
      'Master Admin performed live ledger recalculation on Windows Workstation'
    );
  };

  const handleDownloadExe = () => {
    setDownloadingExe(true);
    setTimeout(() => {
      setDownloadingExe(false);
      setDownloadSuccess('NativeNest_Veg_Boys_PG_Setup_v3.4.2_x64.exe (Windows Installer) package ready!');
      setTimeout(() => setDownloadSuccess(''), 4000);
    }, 1500);
  };

  return (
    <div className="bg-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-[85vh] transition-all">
      {/* Windows 11 Fluent Desktop Title Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-emerald-600 flex items-center justify-center text-[10px] font-black text-white shadow-sm">
              NN
            </div>
            <span className="text-xs font-bold text-slate-200 tracking-wide">
              Native Nest Veg Boys PG — Desktop Workstation
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-emerald-400 border border-slate-700">
              v3.4.2 [x64.exe]
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 pl-4 border-l border-slate-800">
            <button className="px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">File</button>
            <button className="px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">Edit</button>
            <button className="px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">View</button>
            <button 
              onClick={onOpenReportEngine} 
              className="px-2 py-1 rounded hover:bg-slate-800 text-emerald-400 font-semibold transition-colors flex items-center gap-1"
            >
              <FileText className="w-3 h-3" /> Reports &amp; PDF
            </button>
            <button 
              onClick={handleSimulateSyncPulse}
              className="px-2 py-1 rounded hover:bg-slate-800 text-indigo-400 font-semibold transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Sync Link
            </button>
            <button 
              onClick={() => setShowConsoleDrawer(!showConsoleDrawer)}
              className="px-2 py-1 rounded hover:bg-slate-800 text-amber-400 transition-colors flex items-center gap-1"
            >
              <Terminal className="w-3 h-3" /> IPC Console
            </button>
          </div>
        </div>

        {/* Real-time Sync & Window Action Controls */}
        <div className="flex items-center gap-3">
          {/* Live Mobile APK Connection Pill */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-mono text-[10px]">
              APK Mobile Linked ({syncStatus.socketPingMs}ms)
            </span>
          </div>

          <button
            onClick={handleDownloadExe}
            disabled={downloadingExe}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
            title="Download Standalone Windows x64 .EXE Installer"
          >
            <Download className="w-3.5 h-3.5" />
            {downloadingExe ? 'Packaging...' : 'Export .exe'}
          </button>

          {/* Windows Minimize / Maximize / Close Buttons */}
          <div className="flex items-center gap-1 text-slate-400 pl-2 border-l border-slate-800">
            <button 
              onClick={() => {}}
              className="w-7 h-6 rounded hover:bg-slate-800 flex items-center justify-center hover:text-slate-200 transition-colors"
              title="Minimize"
            >
              <Minimize2 className="w-3 h-3" />
            </button>
            <button 
              onClick={() => setIsMaximized(!isMaximized)}
              className="w-7 h-6 rounded hover:bg-slate-800 flex items-center justify-center hover:text-slate-200 transition-colors"
              title="Maximize"
            >
              <Square className="w-3 h-3" />
            </button>
            <button 
              onClick={() => {}}
              className="w-7 h-6 rounded hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {downloadSuccess && (
        <div className="bg-emerald-950/90 border-b border-emerald-500/40 px-4 py-2 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{downloadSuccess}</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400">SHA-256: 9A81F28B01C8E...</span>
        </div>
      )}

      {/* IPC Console & Packet Stream Drawer (Expandable) */}
      {showConsoleDrawer && (
        <div className="bg-slate-950 border-b border-slate-800 p-3 text-xs font-mono max-h-40 overflow-y-auto space-y-1">
          <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-900 text-[11px]">
            <span>IPC Sync Packet Stream (.exe &lt;---&gt; .apk Real-Time Channel)</span>
            <button onClick={() => setShowConsoleDrawer(false)} className="text-slate-500 hover:text-slate-300">Close</button>
          </div>
          {syncPackets.slice(0, 5).map((pkt) => (
            <div key={pkt.id} className="flex items-center justify-between text-[10px] text-slate-300 py-0.5">
              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                  pkt.source === 'EXE_DESKTOP' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {pkt.source}
                </span>
                <span className="text-slate-400">[{pkt.action}]</span>
                <span>{pkt.summary}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <span>{pkt.latencyMs}ms</span>
                <span className="text-[9px] text-slate-600 font-mono">{pkt.hash.slice(0, 8)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop Main Content Canvas */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-950/60">
        {children}
      </div>

      {/* Windows Desktop Status Bar */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-1.5 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <HardDrive className="w-3.5 h-3.5" />
            <span>SQLite Local DB: Synchronized</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-slate-500" />
            <span>RAM: 142 MB • CPU: 0.8%</span>
          </div>
          <div className="flex items-center gap-1.5 text-indigo-400">
            <Layers className="w-3.5 h-3.5" />
            <span>Active Module: {activeModuleTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[10px]">
          <span className="text-slate-400">
            Bi-directional WebSocket: <strong className="text-emerald-400">ACTIVE</strong>
          </span>
          <span className="font-mono text-slate-500">
            Total Packets: {syncPackets.length + 840}
          </span>
          <span className="font-mono text-slate-500">
            Port: 3000 (Proxy 8080)
          </span>
        </div>
      </div>
    </div>
  );
};
