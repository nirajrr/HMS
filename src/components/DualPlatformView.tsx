import React, { useState } from 'react';
import { 
  Monitor, Smartphone, ArrowLeftRight, RefreshCw, Download, 
  Sparkles, CheckCircle2, Zap, ShieldCheck, Activity, Terminal,
  SlidersHorizontal, HardDrive, Wifi, Lock
} from 'lucide-react';
import { 
  Student, Room, FeeTransaction, HousekeepingRecord, 
  ResidentComplaint, SyncEngineStatus, SyncPacket, BankAccount, 
  Notice, MaintenanceRequest, Review 
} from '../types';
import { ExeDesktopShell } from './ExeDesktopShell';
import { ApkMobileShell } from './ApkMobileShell';

interface DualPlatformViewProps {
  students: Student[];
  rooms: Room[];
  banks: BankAccount[];
  transactions: FeeTransaction[];
  maintenance: MaintenanceRequest[];
  housekeeping: HousekeepingRecord[];
  complaints: ResidentComplaint[];
  notices: Notice[];
  reviews: Review[];
  syncStatus: SyncEngineStatus;
  syncPackets: SyncPacket[];
  onTriggerSync: (source: 'EXE_DESKTOP' | 'APK_MOBILE', action: string, details: string) => void;
  onOpenReportEngine: () => void;
  onOpenPoliceModal: (student: Student) => void;
  activeModuleTitle: string;
  desktopContent: React.ReactNode;
}

export const DualPlatformView: React.FC<DualPlatformViewProps> = ({
  students,
  rooms,
  banks,
  transactions,
  maintenance,
  housekeeping,
  complaints,
  notices,
  reviews,
  syncStatus,
  syncPackets,
  onTriggerSync,
  onOpenReportEngine,
  onOpenPoliceModal,
  activeModuleTitle,
  desktopContent,
}) => {
  const [pulseActive, setPulseActive] = useState(false);
  const [lastSyncedAction, setLastSyncedAction] = useState<string>('System Initialized: .exe Workstation & .apk Mobile Hub Connected (12ms)');

  const handleFireBidirectionalSync = () => {
    setPulseActive(true);
    const actionDesc = 'Master Admin synchronized all Master Room pricing, pure veg dining coupons, and police verification data.';
    onTriggerSync('EXE_DESKTOP', 'FULL_BI_DIRECTIONAL_RECONCILE', actionDesc);
    setLastSyncedAction(actionDesc);
    setTimeout(() => setPulseActive(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Real-time Cross-Platform Sync Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <ArrowLeftRight className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">
                Interrelated Windows .EXE Workstation &amp; Android .APK App
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Real-Time CRDT Sync Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Any change made in the mobile APK (or by Master Admin on Desktop .exe) is instantly broadcasted and reflected on both devices with zero data loss.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleFireBidirectionalSync}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            Trigger Live Sync Wave
          </button>
        </div>
      </div>

      {/* Side-by-Side Dual Simulator Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Windows Desktop .exe Workstation (7 Cols) */}
        <div className="xl:col-span-7 space-y-2">
          <div className="flex items-center justify-between px-2 text-xs text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5 text-slate-200">
              <Monitor className="w-4 h-4 text-indigo-400" />
              Windows Native Client (NativeNest_x64.exe)
            </span>
            <span className="font-mono text-emerald-400">Node: 192.168.1.100:3000</span>
          </div>

          <ExeDesktopShell
            syncStatus={syncStatus}
            syncPackets={syncPackets}
            onTriggerSync={onTriggerSync}
            onOpenReportEngine={onOpenReportEngine}
            activeModuleTitle={activeModuleTitle}
          >
            {desktopContent}
          </ExeDesktopShell>
        </div>

        {/* Center Animated Connector (Hidden on Mobile, Visible on Desktop) */}
        <div className="hidden xl:flex flex-col items-center justify-center h-full xl:col-span-1 pt-48 space-y-4">
          <div className={`p-3 rounded-full bg-slate-900 border border-slate-700 transition-all ${
            pulseActive ? 'ring-4 ring-emerald-500 bg-emerald-950 scale-125' : ''
          }`}>
            <ArrowLeftRight className={`w-6 h-6 ${pulseActive ? 'text-emerald-400 animate-spin' : 'text-indigo-400'}`} />
          </div>
          <div className="text-[10px] text-center text-slate-500 font-mono">
            WebSocket<br />&lt;14ms Link
          </div>
        </div>

        {/* Right Column: Android .APK Mobile App (4 Cols) */}
        <div className="xl:col-span-4 space-y-2">
          <div className="flex items-center justify-between px-2 text-xs text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5 text-slate-200">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              Android Mobile Client (NativeNest_v2.6.4.apk)
            </span>
            <span className="font-mono text-emerald-400">Device: SM-G998B (Android 14)</span>
          </div>

          <ApkMobileShell
            students={students}
            rooms={rooms}
            transactions={transactions}
            housekeeping={housekeeping}
            complaints={complaints}
            syncStatus={syncStatus}
            syncPackets={syncPackets}
            onTriggerSync={onTriggerSync}
            onOpenReportEngine={onOpenReportEngine}
            onOpenPoliceModal={onOpenPoliceModal}
          />
        </div>

      </div>
    </div>
  );
};
