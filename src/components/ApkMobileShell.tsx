import React, { useState } from 'react';
import { 
  Smartphone, Wifi, Battery, Signal, RefreshCw, QrCode, 
  Utensils, Bed, ShieldCheck, Wrench, DollarSign, Bell, 
  Plus, CheckCircle2, AlertTriangle, ChevronRight, Download,
  Camera, ArrowLeftRight, User, Home, Sparkles, SlidersHorizontal,
  Check, FileText, Calendar
} from 'lucide-react';
import { 
  Student, Room, FeeTransaction, HousekeepingRecord, 
  ResidentComplaint, SyncEngineStatus, SyncPacket 
} from '../types';

interface ApkMobileShellProps {
  students: Student[];
  rooms: Room[];
  transactions: FeeTransaction[];
  housekeeping: HousekeepingRecord[];
  complaints: ResidentComplaint[];
  syncStatus: SyncEngineStatus;
  syncPackets: SyncPacket[];
  onTriggerSync: (source: 'EXE_DESKTOP' | 'APK_MOBILE', action: string, details: string) => void;
  onOpenReportEngine: () => void;
  onOpenPoliceModal?: (student: Student) => void;
}

export const ApkMobileShell: React.FC<ApkMobileShellProps> = ({
  students,
  rooms,
  transactions,
  housekeeping,
  complaints,
  syncStatus,
  syncPackets,
  onTriggerSync,
  onOpenReportEngine,
  onOpenPoliceModal,
}) => {
  const [mobileTab, setMobileTab] = useState<'HOME' | 'VEG_MESS' | 'ROOMS' | 'CLEANING_QUORUM' | 'POLICE_KYC' | 'SYNC_HUB'>('HOME');
  const [showQrScanModal, setShowQrScanModal] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [downloadingApk, setDownloadingApk] = useState(false);
  const [apkDownloaded, setApkDownloaded] = useState('');
  const [votedCleaningId, setVotedCleaningId] = useState<string | null>(null);
  const [voteFeedback, setVoteFeedback] = useState('');

  // Quick Action triggers sync to Desktop EXE
  const handleQuickMobileAction = (actionName: string, desc: string) => {
    onTriggerSync('APK_MOBILE', actionName, desc);
  };

  const handleVoteQuorumFromMobile = (hkId: string, isSatisfactory: boolean) => {
    setVotedCleaningId(hkId);
    const text = isSatisfactory 
      ? 'Marked Room Cleaning as DONE & SATISFACTORY from Android Mobile App (Quorum updated).'
      : 'Flagged Room Cleaning as DISPUTED / POOR from Android Mobile App (Escalated).';
    
    setVoteFeedback(text);
    onTriggerSync(
      'APK_MOBILE',
      isSatisfactory ? 'HOUSEKEEPING_QUORUM_VERIFIED' : 'HOUSEKEEPING_DISPUTE_RAISED',
      text
    );
    setTimeout(() => setVoteFeedback(''), 4000);
  };

  const handleDownloadApk = () => {
    setDownloadingApk(true);
    setTimeout(() => {
      setDownloadingApk(false);
      setApkDownloaded('NativeNest_Veg_Boys_PG_v2.6.4.apk packaged & ready! Scan QR code or install directly on Android 14.');
      setTimeout(() => setApkDownloaded(''), 5000);
    }, 1200);
  };

  const handleSimulateQrScan = () => {
    setShowQrScanModal(true);
    setTimeout(() => {
      setScanResult('MEAL PUNCH APPROVED: Pure Veg Thali Coupon #NNV-DIN-8921 Validated for Aarav Sharma (Room 101-Bed 1).');
      onTriggerSync('APK_MOBILE', 'QR_MEAL_PUNCH_VALIDATED', 'Aarav Sharma scanned meal QR code on Android Handheld Terminal.');
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 md:p-4">
      {/* Handheld Device Outer Frame */}
      <div className="w-full max-w-sm sm:max-w-md bg-slate-900 border-[10px] border-slate-800 rounded-[48px] shadow-2xl overflow-hidden flex flex-col relative ring-1 ring-slate-700/50">
        
        {/* Android 14 Dynamic Island / Punch Hole Notch & Status Bar */}
        <div className="bg-slate-950 px-6 pt-3 pb-2 flex items-center justify-between text-slate-300 select-none">
          <div className="font-mono text-xs font-bold tracking-tight">09:41</div>
          
          {/* Front Camera Cutout */}
          <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-950"></div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="text-[10px] font-bold text-emerald-400">5G</span>
            <Signal className="w-3.5 h-3.5 text-slate-300" />
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Mobile App Bar */}
        <div className="bg-slate-900/90 backdrop-blur-md px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-xs text-white shadow-md">
              NN
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1">
                Native Nest Veg PG
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-normal">
                  .apk
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">Boys Pure Veg Residence App</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateQrScan}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 flex items-center justify-center transition-colors cursor-pointer"
              title="Camera QR Meal Scanner"
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleQuickMobileAction('MOBILE_APP_PULSE', 'Manual sync pulse fired from Android')}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 flex items-center justify-center transition-colors cursor-pointer"
              title="Sync with Desktop .exe"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
            </button>
          </div>
        </div>

        {/* Sync Status Banner */}
        <div className="bg-emerald-950/80 px-4 py-1.5 border-b border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Linked to Windows .exe</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400">{syncStatus.socketPingMs}ms Ping</span>
        </div>

        {/* Feedback / Notification Toasts */}
        {apkDownloaded && (
          <div className="bg-indigo-950 border-b border-indigo-500/40 p-2.5 text-indigo-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px]">{apkDownloaded}</span>
          </div>
        )}

        {voteFeedback && (
          <div className="bg-emerald-950 border-b border-emerald-500/40 p-2.5 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px]">{voteFeedback}</span>
          </div>
        )}

        {/* QR Scan Result Modal Simulation */}
        {showQrScanModal && (
          <div className="bg-slate-950/95 p-4 border-b border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <span>Biometric &amp; QR Meal Scanner</span>
              <button onClick={() => { setShowQrScanModal(false); setScanResult(''); }} className="text-slate-500 hover:text-slate-300">✕</button>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center text-center">
              <QrCode className="w-12 h-12 text-indigo-400 animate-pulse mb-1" />
              <span className="text-[11px] text-slate-400">Point phone camera at Resident Dining QR Code</span>
            </div>
            {scanResult && (
              <div className="p-2.5 rounded-lg bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 text-[11px]">
                {scanResult}
              </div>
            )}
          </div>
        )}

        {/* Mobile Viewport Body */}
        <div className="flex-1 bg-slate-950 p-3.5 overflow-y-auto max-h-[580px] space-y-4">
          
          {/* TAB 1: MOBILE HOME / DASHBOARD */}
          {mobileTab === 'HOME' && (
            <div className="space-y-3.5">
              {/* Resident Welcome Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/30 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-400">Today's Dining &amp; Room Pass</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                    Active Resident
                  </span>
                </div>
                <h4 className="text-base font-bold mt-1">Aarav Sharma</h4>
                <p className="text-xs text-slate-300 font-mono">Room 101 • Bed-1 (Window Deluxe)</p>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-emerald-500/20 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400">Pure Veg Mess Pass:</span>
                    <div className="text-emerald-400 font-bold">4 Meals Active</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Police Verification:</span>
                    <div className="text-emerald-400 font-bold">✓ Cleared</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setMobileTab('VEG_MESS')}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 flex flex-col items-center justify-center text-center transition-all cursor-pointer"
                >
                  <Utensils className="w-5 h-5 text-amber-400 mb-1" />
                  <span className="text-[11px] font-bold text-slate-200">Veg Mess</span>
                  <span className="text-[9px] text-slate-500">Today's Menu</span>
                </button>

                <button
                  onClick={() => setMobileTab('CLEANING_QUORUM')}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 flex flex-col items-center justify-center text-center transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 text-purple-400 mb-1" />
                  <span className="text-[11px] font-bold text-slate-200">3/4 Quorum</span>
                  <span className="text-[9px] text-slate-500">Vote Clean</span>
                </button>

                <button
                  onClick={() => setMobileTab('POLICE_KYC')}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 flex flex-col items-center justify-center text-center transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5 text-blue-400 mb-1" />
                  <span className="text-[11px] font-bold text-slate-200">Police KYC</span>
                  <span className="text-[9px] text-slate-500">Hyperlink</span>
                </button>
              </div>

              {/* Today's Special Veg Menu Alert */}
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs">
                <div className="flex items-center justify-between text-amber-400 font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Utensils className="w-4 h-4" /> Today's Pure Veg Special
                  </span>
                  <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-300">Dinner 20:00</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  <strong>Paneer Butter Masala</strong>, Slow-Cooked Dal Makhani, Ghee Phulka, Jeera Basmati Rice, and Hot Gulab Jamun.
                </p>
                <div className="mt-2 text-[10px] text-amber-300 font-medium">
                  • Jain counter ready (No Onion / No Garlic)
                </div>
              </div>

              {/* Housekeeping Quorum Pending Alert */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-indigo-400" />
                    Room 101 Morning Clean
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    Awaiting Quorum
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Housekeeping staff Sunil finished sweeping &amp; washroom sanitization at 10:30 AM. Tap to vote.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleVoteQuorumFromMobile('hk_001', true)}
                    className="py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Satisfactory
                  </button>
                  <button
                    onClick={() => handleVoteQuorumFromMobile('hk_001', false)}
                    className="py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-rose-300 border border-rose-700 font-bold text-[11px] flex items-center justify-center gap-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Dispute
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PURE VEG MESS */}
          {mobileTab === 'VEG_MESS' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-200">
                <span className="font-bold block text-xs">100% Pure Vegetarian Mess Facility</span>
                <span className="text-[10px] text-emerald-300">Zero Non-Veg • Dedicated Jain &amp; High Protein Counters</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="font-bold text-slate-200 block text-xs">Daily 4-Meal Schedule</span>
                
                <div className="space-y-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-start">
                    <div>
                      <span className="font-bold text-amber-400 block">Breakfast (07:30 - 09:30 AM)</span>
                      <span className="text-slate-300">Aloo Paratha, Dahi, Fresh Sprouts, Tea/Milk</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">Served</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-start">
                    <div>
                      <span className="font-bold text-blue-400 block">Lunch (12:30 - 02:30 PM)</span>
                      <span className="text-slate-300">Jammu Rajma Masala, Jeera Rice, Phulka, Boondi Raita</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">Served</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-start">
                    <div>
                      <span className="font-bold text-orange-400 block">Snacks (05:00 - 06:00 PM)</span>
                      <span className="text-slate-300">Gujarati Dhokla, Mint Chutney, Masala Chai</span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-bold">Upcoming</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-start">
                    <div>
                      <span className="font-bold text-purple-400 block">Dinner (08:00 - 10:00 PM)</span>
                      <span className="text-slate-300">Shahi Paneer, Dal Tadka, Tawa Roti, Kheer</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold">Upcoming</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onTriggerSync('APK_MOBILE', 'LEAVE_REBATE_SUBMITTED', 'Resident Aarav applied for 4-day mess leave rebate from mobile.');
                  setVoteFeedback('Mess Leave Rebate applied successfully! Deducted ₹440 from next month bill.');
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-700"
              >
                <Calendar className="w-4 h-4 text-indigo-400" />
                Apply for Mess Leave Rebate (₹110/day)
              </button>
            </div>
          )}

          {/* TAB 3: ROOMS & BEDS */}
          {mobileTab === 'ROOMS' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-bold">Bed Inventory &amp; Cots</span>
                <span className="text-[10px] text-slate-500">{rooms.length} Rooms</span>
              </div>

              <div className="space-y-2">
                {rooms.map((r) => (
                  <div key={r.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100">Room #{r.roomNumber}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {r.type} • {r.roomSizeSqFt || 190} sq ft
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        r.occupiedBeds >= r.totalBeds ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {r.occupiedBeds}/{r.totalBeds} Beds Full
                      </span>
                    </div>

                    <div className="space-y-1">
                      {r.beds?.map((b) => (
                        <div key={b.id} className="flex items-center justify-between text-[11px] p-1.5 rounded bg-slate-950 border border-slate-800/80">
                          <span className="text-slate-300">{b.bedNumber} ({b.position || 'Corner'})</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-emerald-400">₹{b.monthlyRent}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              b.status === 'OCCUPIED' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                            }`}>
                              {b.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CLEANING QUORUM VOTING */}
          {mobileTab === 'CLEANING_QUORUM' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-200">
                <span className="font-bold block text-xs">3/4 (75%) Resident Consensus Engine</span>
                <span className="text-[10px] text-purple-300">Cleaning is sealed ONLY when 75% occupants approve on mobile.</span>
              </div>

              <div className="space-y-2">
                {housekeeping.map((hk) => (
                  <div key={hk.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100">Room #{hk.roomNumber} — {hk.cleaningTitle}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        hk.status === 'VERIFIED_DONE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {hk.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Staff: {hk.assignedStaff}</span>
                      <span className="font-mono text-indigo-400 font-bold">{hk.verifiedCount}/{hk.requiredQuorumCount} Quorum</span>
                    </div>

                    {hk.status !== 'VERIFIED_DONE' && (
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                        <button
                          onClick={() => handleVoteQuorumFromMobile(hk.id, true)}
                          className="py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Approve (Satisfied)
                        </button>
                        <button
                          onClick={() => handleVoteQuorumFromMobile(hk.id, false)}
                          className="py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-rose-300 border border-rose-700 font-bold text-[11px] flex items-center justify-center gap-1"
                        >
                          <AlertTriangle className="w-3 h-3" /> Dispute Clean
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: POLICE KYC & HYPERLINK */}
          {mobileTab === 'POLICE_KYC' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/30 text-blue-200">
                <span className="font-bold block text-xs">Statutory Tenant Verification (Sec 188 IPC)</span>
                <span className="text-[10px] text-blue-300">Direct integration with online police portal via encrypted hyperlink.</span>
              </div>

              <div className="space-y-2">
                {students.slice(0, 4).map((s) => (
                  <div key={s.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-100 block">{s.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Rm {s.roomNumber} ({s.bedNumber}) • {s.rollNumber}</span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        s.policeVerificationStatus === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {s.policeVerificationStatus}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center justify-between">
                      <span className="truncate max-w-[200px]">https://police.portal.gov.in/verify?ref={s.policeVerificationRefNo || 'PENDING'}</span>
                      <a 
                        href={`https://delhipolice.gov.in/tenant-verification/online-verify?ref=${s.policeVerificationRefNo || 'NNV-2026-981'}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 font-bold underline"
                      >
                        Open
                      </a>
                    </div>

                    <button
                      onClick={() => onOpenPoliceModal && onOpenPoliceModal(s)}
                      className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                      View Full Police Form &amp; Sign
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SYNC HUB & APK PACKAGER */}
          {mobileTab === 'SYNC_HUB' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="font-bold text-slate-200 block text-xs">Live Bi-Directional Packet Stream</span>
                <p className="text-[11px] text-slate-400">
                  Every change made on this Android App immediately reflects on the Windows .exe Desktop Workstation in under 20ms.
                </p>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {syncPackets.slice(0, 6).map((pkt) => (
                    <div key={pkt.id} className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-[10px]">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-bold text-emerald-400">{pkt.source} → {pkt.destination}</span>
                        <span className="font-mono">{pkt.latencyMs}ms</span>
                      </div>
                      <div className="text-slate-200 mt-0.5 font-medium">{pkt.summary}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center space-y-2">
                <QrCode className="w-16 h-16 text-emerald-400" />
                <span className="font-bold text-slate-200 text-xs">Direct Android .APK Download</span>
                <p className="text-[10px] text-slate-400">Scan this QR code with any Android phone to install Native Nest PG App v2.6.4</p>
                
                <button
                  onClick={handleDownloadApk}
                  disabled={downloadingApk}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  {downloadingApk ? 'Compiling APK...' : 'Download .apk Installer (v2.6.4)'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Android Material 3 Bottom Navigation Bar */}
        <div className="bg-slate-900 border-t border-slate-800 px-2 py-2 grid grid-cols-5 gap-1 select-none">
          <button
            onClick={() => setMobileTab('HOME')}
            className={`py-1.5 flex flex-col items-center justify-center rounded-xl transition-colors cursor-pointer ${
              mobileTab === 'HOME' ? 'text-emerald-400 bg-slate-800/80 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[9px] mt-0.5">Home</span>
          </button>

          <button
            onClick={() => setMobileTab('VEG_MESS')}
            className={`py-1.5 flex flex-col items-center justify-center rounded-xl transition-colors cursor-pointer ${
              mobileTab === 'VEG_MESS' ? 'text-emerald-400 bg-slate-800/80 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span className="text-[9px] mt-0.5">Veg Mess</span>
          </button>

          <button
            onClick={() => setMobileTab('ROOMS')}
            className={`py-1.5 flex flex-col items-center justify-center rounded-xl transition-colors cursor-pointer ${
              mobileTab === 'ROOMS' ? 'text-emerald-400 bg-slate-800/80 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bed className="w-4 h-4" />
            <span className="text-[9px] mt-0.5">Beds</span>
          </button>

          <button
            onClick={() => setMobileTab('CLEANING_QUORUM')}
            className={`py-1.5 flex flex-col items-center justify-center rounded-xl transition-colors cursor-pointer ${
              mobileTab === 'CLEANING_QUORUM' ? 'text-emerald-400 bg-slate-800/80 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[9px] mt-0.5">Quorum</span>
          </button>

          <button
            onClick={() => setMobileTab('SYNC_HUB')}
            className={`py-1.5 flex flex-col items-center justify-center rounded-xl transition-colors cursor-pointer ${
              mobileTab === 'SYNC_HUB' ? 'text-emerald-400 bg-slate-800/80 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span className="text-[9px] mt-0.5">Sync Hub</span>
          </button>
        </div>

        {/* Android Gesture Bar */}
        <div className="bg-slate-950 py-1.5 flex justify-center">
          <div className="w-32 h-1 rounded-full bg-slate-600/60"></div>
        </div>

      </div>
    </div>
  );
};
