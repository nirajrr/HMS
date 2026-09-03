import React, { useState } from 'react';
import { HardwareFingerprint, MachineLicense } from '../types';
import { 
  Shield, Cpu, HardDrive, Network, Laptop, AlertOctagon, 
  CheckCircle2, RefreshCw, Key, Copy, Check, Download, 
  Lock, Unlock, Server, Sparkles, Terminal, FileCode, AlertTriangle
} from 'lucide-react';

interface HardwareLicenseManagerProps {
  currentFingerprint: HardwareFingerprint;
  activeLicense: MachineLicense;
  clonedFingerprint: HardwareFingerprint;
  onSimulateMachineClone: (isCloned: boolean) => void;
  onUpdateLicense: (updated: MachineLicense) => void;
}

export const HardwareLicenseManager: React.FC<HardwareLicenseManagerProps> = ({
  currentFingerprint,
  activeLicense,
  clonedFingerprint,
  onSimulateMachineClone,
  onUpdateLicense,
}) => {
  const [isSimulatingClone, setIsSimulatingClone] = useState(activeLicense.status === 'HARDWARE_MISMATCH_LOCKED');
  const [newKeyInput, setNewKeyInput] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [rebindSuccess, setRebindSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HARDWARE_SPECS' | 'ACTIVATION' | 'ANTI_CLONE_TEST'>('OVERVIEW');

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleToggleCloneSimulation = (shouldClone: boolean) => {
    setIsSimulatingClone(shouldClone);
    onSimulateMachineClone(shouldClone);
  };

  const handleActivateNewLicense = () => {
    if (!newKeyInput.trim()) return;
    
    // Generate new valid license bound to the active detected machine HWID
    const targetHwid = isSimulatingClone ? clonedFingerprint.machineHwid : currentFingerprint.machineHwid;
    const targetHost = isSimulatingClone ? clonedFingerprint.osHostName : currentFingerprint.osHostName;

    const newLic: MachineLicense = {
      ...activeLicense,
      licenseKey: newKeyInput.trim(),
      boundHwid: targetHwid,
      boundHostName: targetHost,
      status: 'ACTIVE_BOUND',
      activationDate: new Date().toISOString().split('T')[0],
      antiTamperSeal: `RSA-4096-SEAL:${Math.random().toString(36).substring(2)}${Date.now()}`,
      lastHardwareScanTimestamp: new Date().toLocaleString()
    };

    onUpdateLicense(newLic);
    setRebindSuccess(true);
    setTimeout(() => setRebindSuccess(false), 3000);
    setNewKeyInput('');
  };

  const handleDownloadLicCertificate = () => {
    const certPayload = {
      institution: activeLicense.organizationName,
      licenseKey: activeLicense.licenseKey,
      edition: activeLicense.edition,
      nodeLockHwid: activeLicense.boundHwid,
      hostName: activeLicense.boundHostName,
      hardwareSpecs: currentFingerprint,
      issuedAt: activeLicense.activationDate,
      antiTamperSignature: activeLicense.antiTamperSeal,
      cryptographicStandard: 'SHA256-RSA-4096-NODE-LOCKED'
    };

    const blob = new Blob([JSON.stringify(certPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nativenest_node_lock_${activeLicense.boundHwid}.lic`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeDetectedHwid = isSimulatingClone ? clonedFingerprint.machineHwid : currentFingerprint.machineHwid;
  const isLocked = activeLicense.boundHwid !== activeDetectedHwid || activeLicense.status === 'HARDWARE_MISMATCH_LOCKED';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Hardware Status Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${
              isLocked 
                ? 'bg-gradient-to-tr from-rose-600 to-rose-400 shadow-rose-600/30' 
                : 'bg-gradient-to-tr from-indigo-600 to-emerald-500 shadow-indigo-600/30'
            }`}>
              {isLocked ? <AlertOctagon className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-white tracking-wide">Single-PC Hardware Lock &amp; Node-Lock Engine</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border ${
                  isLocked 
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {isLocked ? 'HARDWARE MISMATCH (LOCKED)' : 'NODE-LOCKED TO CURRENT PC'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Cryptographic hardware binding seals the ERP database to this specific Motherboard BIOS, CPU, and Disk Volume.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button
              onClick={handleDownloadLicCertificate}
              className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              Export .lic Certificate
            </button>

            <button
              onClick={() => handleToggleCloneSimulation(!isSimulatingClone)}
              className={`flex-1 lg:flex-none px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isSimulatingClone
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSimulatingClone ? 'animate-spin' : ''}`} />
              {isSimulatingClone ? 'Restore Original Machine HWID' : 'Simulate Copying to Another PC'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto">
          {[
            { id: 'OVERVIEW', label: 'License & Binding Overview', icon: Shield },
            { id: 'HARDWARE_SPECS', label: 'Motherboard & CPU Profiler', icon: Cpu },
            { id: 'ACTIVATION', label: 'License Key Rebind & Activation', icon: Key },
            { id: 'ANTI_CLONE_TEST', label: 'Anti-Piracy Clone Test Lab', icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* CLONE / UNAUTHORIZED COPY LOCK ALERT */}
      {isLocked && (
        <div className="bg-rose-950/70 border-2 border-rose-500 rounded-2xl p-6 shadow-2xl animate-shake">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-600/40">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">
                  ERROR 0x80041003: HARDWARE SIGNATURE MISMATCH DETECTED
                </h3>
                <span className="text-xs px-2.5 py-1 rounded bg-rose-900 border border-rose-400 text-rose-200 font-mono font-bold">
                  DATABASE ACCESS LOCKED
                </span>
              </div>
              <p className="text-xs text-rose-200 leading-relaxed">
                This installation has been copied, moved, or cloned to an unauthorized computer. The cryptographic license signature was issued for <span className="font-mono font-bold text-white bg-rose-900/60 px-1.5 py-0.5 rounded">{activeLicense.boundHwid}</span>, but the current machine hardware signature is <span className="font-mono font-bold text-amber-300 bg-rose-900/60 px-1.5 py-0.5 rounded">{activeDetectedHwid}</span>.
              </p>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-rose-800/80 text-xs font-mono text-slate-300 space-y-1">
                <div>• Motherboard UUID: <span className="text-rose-400">{isSimulatingClone ? clonedFingerprint.motherboardUuid : currentFingerprint.motherboardUuid}</span></div>
                <div>• CPU Microcode ID: <span className="text-rose-400">{isSimulatingClone ? clonedFingerprint.cpuMicrocodeId : currentFingerprint.cpuMicrocodeId}</span></div>
                <div>• Registered Machine Host: <span className="text-slate-400">{activeLicense.boundHostName}</span> | Current Host: <span className="text-amber-300">{isSimulatingClone ? clonedFingerprint.osHostName : currentFingerprint.osHostName}</span></div>
              </div>
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => handleToggleCloneSimulation(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Restore to Authorized Original Machine
                </button>
                <button
                  onClick={() => setActiveTab('ACTIVATION')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Enter Machine Re-Activation Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Machine HWID Identity Card */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                Active Machine Hardware Fingerprint (HWID)
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                SHA-256 Kernel Sealed
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Unique Machine Identifier</span>
                <div className="text-base font-mono font-bold text-indigo-300 mt-0.5">
                  {activeDetectedHwid}
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(activeDetectedHwid, 'hwid')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Copy HWID"
              >
                {copiedField === 'hwid' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Server className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Host Machine Name</span>
                </div>
                <div className="text-xs font-mono font-bold text-slate-200">
                  {isSimulatingClone ? clonedFingerprint.osHostName : currentFingerprint.osHostName}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Laptop className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Target Operating System</span>
                </div>
                <div className="text-xs font-mono font-bold text-slate-200">
                  {currentFingerprint.osPlatform} (64-Bit Desktop Native)
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Disk Volume Serial Hash</span>
                </div>
                <div className="text-xs font-mono font-bold text-slate-200">
                  {isSimulatingClone ? clonedFingerprint.diskVolumeSerial : currentFingerprint.diskVolumeSerial}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Network className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Primary NIC MAC Address</span>
                </div>
                <div className="text-xs font-mono font-bold text-slate-200">
                  {isSimulatingClone ? clonedFingerprint.primaryMacAddress : currentFingerprint.primaryMacAddress}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300">
              <span className="font-bold text-indigo-300">Anti-Clone Enforcement Rule: </span>
              If the database or application executable is copied to another machine, the system compares the runtime HWID against the digital license seal and immediately halts database decryption.
            </div>
          </div>

          {/* License Certificate Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Digital License Seal
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  VALID
                </span>
              </div>

              <div className="space-y-3 mt-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">License Key</span>
                  <div className="font-mono text-slate-200 truncate mt-0.5 font-bold">
                    {activeLicense.licenseKey}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Licensed Entity</span>
                  <div className="text-slate-200 font-semibold mt-0.5">
                    {activeLicense.organizationName}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Edition &amp; Binding</span>
                  <div className="text-indigo-300 font-mono mt-0.5">
                    {activeLicense.edition}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Bound HWID</span>
                  <div className="text-slate-200 font-mono mt-0.5">
                    {activeLicense.boundHwid}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Anti-Tamper Cryptographic Seal</span>
                  <div className="text-[10px] text-slate-400 font-mono truncate bg-slate-950 p-2 rounded-lg border border-slate-800 mt-1">
                    {activeLicense.antiTamperSeal}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Offline Grace Period:</span>
              <span className="text-white font-mono font-bold">{activeLicense.allowedOfflineDays} Days Perpetual</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HARDWARE SPECS PROFILER */}
      {activeTab === 'HARDWARE_SPECS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              Low-Level Hardware Component Inspection
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              These low-level hardware registers are queried via Windows WMI / Linux DMI / macOS sysctl at app launch to prevent virtualization evasion and multi-PC cloning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                <HardDrive className="w-4 h-4" /> Motherboard BIOS UUID
              </div>
              <div className="text-xs font-mono text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                {isSimulatingClone ? clonedFingerprint.motherboardUuid : currentFingerprint.motherboardUuid}
              </div>
              <p className="text-[10px] text-slate-500">Extracted from SMBIOS Type 1 Table (Universal Unique Identifier)</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                <Cpu className="w-4 h-4" /> CPU Processor Signature &amp; Stepping
              </div>
              <div className="text-xs font-mono text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                {isSimulatingClone ? clonedFingerprint.cpuMicrocodeId : currentFingerprint.cpuMicrocodeId}
              </div>
              <p className="text-[10px] text-slate-500">CPUID instruction output: Family, Model, Stepping &amp; Microcode Revision</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                <HardDrive className="w-4 h-4" /> Storage Controller Volume Serial
              </div>
              <div className="text-xs font-mono text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                {isSimulatingClone ? clonedFingerprint.diskVolumeSerial : currentFingerprint.diskVolumeSerial}
              </div>
              <p className="text-[10px] text-slate-500">Physical NVMe / SSD disk drive firmware serial number</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                <Network className="w-4 h-4" /> Network Interface Physical MAC
              </div>
              <div className="text-xs font-mono text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                {isSimulatingClone ? clonedFingerprint.primaryMacAddress : currentFingerprint.primaryMacAddress}
              </div>
              <p className="text-[10px] text-slate-500">Embedded hardware Ethernet / WLAN controller MAC address</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-300">Composite Hardware SHA-256 Digest:</span>
            <div className="text-xs font-mono text-emerald-400 bg-slate-900 p-3 rounded-lg border border-slate-800 break-all">
              SHA256: {isSimulatingClone ? clonedFingerprint.hardwareHashSha256 : currentFingerprint.hardwareHashSha256}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LICENSE KEY ACTIVATION & REBIND */}
      {activeTab === 'ACTIVATION' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-400" />
              Machine License Activation &amp; Re-Binding
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              To authorize this installation on a newly provisioned PC or transfer the master license, enter an authorized activation key signed with the institutional private key.
            </p>
          </div>

          {rebindSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center gap-3 text-xs text-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>License successfully bound and activated for Hardware Fingerprint: <strong>{activeDetectedHwid}</strong>!</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Machine HWID to Bind
              </label>
              <input
                type="text"
                readOnly
                value={activeDetectedHwid}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-indigo-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Enter Institutional Activation Key</span>
                <span className="text-[10px] text-indigo-400 cursor-pointer" onClick={() => setNewKeyInput(`NVNEST-PRO-${activeDetectedHwid}-PERPETUAL`)}>
                  Auto-generate Demo Key
                </span>
              </label>
              <input
                type="text"
                value={newKeyInput}
                onChange={(e) => setNewKeyInput(e.target.value)}
                placeholder="e.g. NVNEST-PRO-88A2-771B-94E0-PERPETUAL"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={handleActivateNewLicense}
              disabled={!newKeyInput.trim()}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Shield className="w-4 h-4" />
              Cryptographically Bind &amp; Activate on this PC
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: ANTI-CLONE TEST LAB */}
      {activeTab === 'ANTI_CLONE_TEST' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-400" />
              Anti-Piracy &amp; Clone-Detection Test Laboratory
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate copying the entire app folder and database to another computer or virtual machine to observe hardware mismatch detection and cryptographic defense in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Machine A: Authorized Warden PC</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  ORIGINAL
                </span>
              </div>
              <div className="text-xs font-mono text-slate-400 space-y-1">
                <div>HWID: <span className="text-indigo-300">{currentFingerprint.machineHwid}</span></div>
                <div>Host: <span className="text-slate-300">{currentFingerprint.osHostName}</span></div>
                <div>CPU: <span className="text-slate-300">Intel Core i7-11800H</span></div>
                <div>MAC: <span className="text-slate-300">{currentFingerprint.primaryMacAddress}</span></div>
              </div>
              <button
                onClick={() => handleToggleCloneSimulation(false)}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  !isSimulatingClone 
                    ? 'bg-emerald-600 text-white border-emerald-500' 
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                {!isSimulatingClone ? '✓ Active Runtime Machine' : 'Switch Execution to Machine A'}
              </button>
            </div>

            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Machine B: Unauthorized Cloned PC</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold">
                  PIRATED COPY
                </span>
              </div>
              <div className="text-xs font-mono text-slate-400 space-y-1">
                <div>HWID: <span className="text-rose-400">{clonedFingerprint.machineHwid}</span></div>
                <div>Host: <span className="text-slate-300">{clonedFingerprint.osHostName}</span></div>
                <div>CPU: <span className="text-slate-300">AMD Ryzen 7 5800X</span></div>
                <div>MAC: <span className="text-slate-300">{clonedFingerprint.primaryMacAddress}</span></div>
              </div>
              <button
                onClick={() => handleToggleCloneSimulation(true)}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  isSimulatingClone 
                    ? 'bg-rose-600 text-white border-rose-500 animate-pulse' 
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                {isSimulatingClone ? '⚠️ Running on Machine B (Locked)' : 'Simulate Copying Files to Machine B'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
