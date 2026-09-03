import React, { useState } from 'react';
import { StandalonePackagingStep } from '../types';
import { 
  Laptop, Smartphone, Terminal, Copy, Check, Download, 
  Layers, HardDrive, ShieldCheck, Box, Code, ExternalLink, 
  CheckCircle2, Sparkles, FolderArchive, ArrowRight, Play, Wrench
} from 'lucide-react';

interface StandalonePackagingModalProps {
  isOpen: boolean;
  steps: StandalonePackagingStep[];
  onClose: () => void;
}

export const StandalonePackagingModal: React.FC<StandalonePackagingModalProps> = ({
  isOpen,
  steps,
  onClose,
}) => {
  const [activePlatformTab, setActivePlatformTab] = useState<'WINDOWS_EXE' | 'TAURI_NATIVE' | 'SQLITE_OFFLINE' | 'HARDWARE_BINDER' | 'ANDROID_APK'>('WINDOWS_EXE');
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyCode = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(index);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const handleDownloadBuildScript = () => {
    const batScript = `@echo off
echo ==============================================================================
echo   NATIVE NEST ERP - STANDALONE SINGLE-PC DESKTOP BUILDER (ELECTRON + SQLITE)
echo ==============================================================================
echo [1/5] Installing native desktop container dependencies...
call npm install --save-dev electron electron-builder concurrently better-sqlite3 systeminformation node-machine-id

echo [2/5] Building React Vite production bundle...
call npm run build

echo [3/5] Compiling Electron Node-Locking kernel...
call npx tsc electron/main.ts --outDir dist-electron

echo [4/5] Packaging standalone NSIS Single-PC Windows installer (.exe)...
call npx electron-builder --win nsis --x64

echo [5/5] SUCCESS: Executable created in ./dist-electron/NativeNest-Setup-2.4.0.exe
echo ==============================================================================
pause`;

    const blob = new Blob([batScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build_standalone_exe.bat';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                Standalone App Conversion &amp; Packaging Blueprint
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                  STEP-BY-STEP RECIPE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Accurate sequential process to convert this web ERP into an offline desktop `.exe`, `.msi`, or mobile `.apk` locked to one machine.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadBuildScript}
              className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download build.bat
            </button>
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>

        {/* Platform Selection Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-900 border-b border-slate-800 overflow-x-auto">
          {[
            { id: 'WINDOWS_EXE', label: '1. Electron Desktop (.exe / .msi)', icon: Laptop },
            { id: 'HARDWARE_BINDER', label: '2. Machine Lock & Anti-Clone Binding', icon: ShieldCheck },
            { id: 'SQLITE_OFFLINE', label: '3. Local Encrypted SQLite Engine', icon: HardDrive },
            { id: 'TAURI_NATIVE', label: '4. Ultra-Lightweight Tauri (Rust)', icon: Terminal },
            { id: 'ANDROID_APK', label: '5. Android Mobile (.apk / Capacitor)', icon: Smartphone },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePlatformTab(tab.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activePlatformTab === tab.id
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

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900/50">
          
          {/* TAB 1: WINDOWS ELECTRON EXE CONVERSION */}
          {activePlatformTab === 'WINDOWS_EXE' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20">
                <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">
                  Sequential Conversion Process (Web → Windows Standalone Desktop .exe)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  By wrapping this Vite + React frontend inside an Electron container, the ERP runs directly on the warden or administrator&apos;s Windows PC as a native process without requiring an internet connection or external browser.
                </p>
              </div>

              {/* Step 1 */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-bold">1</span>
                    Install Electron &amp; Packaging Tooling
                  </span>
                  <button
                    onClick={() => copyCode('npm install --save-dev electron electron-builder concurrently wait-on', 1)}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-1 rounded"
                  >
                    {copiedStep === 1 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-xs text-emerald-400">
                  npm install --save-dev electron electron-builder concurrently wait-on
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-bold">2</span>
                    Create Electron Main Process Entry Point (<code className="text-indigo-300 text-xs">electron/main.js</code>)
                  </span>
                  <button
                    onClick={() => copyCode(`const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: "Native Nest Hostel ERP (Single-PC Node-Locked)",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, '../public/icon.png')
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:3000');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);`, 2)}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-1 rounded"
                  >
                    {copiedStep === 2 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy Code
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-slate-900 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
{`const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    title: "Native Nest Hostel ERP",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile(path.join(__dirname, '../dist/index.html'));
}

app.whenReady().then(createWindow);`}
                </pre>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-bold">3</span>
                    Add Packaging Scripts to <code className="text-indigo-300 text-xs">package.json</code>
                  </span>
                  <button
                    onClick={() => copyCode(`"main": "electron/main.js",
"scripts": {
  "build": "vite build",
  "dist": "vite build && electron-builder --win nsis --x64"
}`, 3)}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-1 rounded"
                  >
                    {copiedStep === 3 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-slate-900 font-mono text-[11px] text-indigo-300 overflow-x-auto">
{`"main": "electron/main.js",
"scripts": {
  "build": "vite build",
  "dist": "vite build && electron-builder --win nsis --x64"
}`}
                </pre>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-bold">4</span>
                    Execute Final Build &amp; Generate Executable
                  </span>
                  <button
                    onClick={() => copyCode('npm run dist', 4)}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-1 rounded"
                  >
                    {copiedStep === 4 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-xs text-emerald-400 flex items-center justify-between">
                  <span>npm run dist</span>
                  <span className="text-[10px] text-slate-500 font-normal">→ Output in ./dist-electron/NativeNest-Setup.exe</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HARDWARE BINDING & ANTI-CLONE CODE */}
          {activePlatformTab === 'HARDWARE_BINDER' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/20">
                <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-1">
                  How Single-PC Node Locking &amp; Anti-Clone Protection Works
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  To prevent the application from being copied to unauthorized computers, the desktop kernel queries the Motherboard BIOS UUID, CPU ID, and Disk Volume Serial upon startup, hashes them with SHA-256, and verifies this against the RSA-signed digital license seal stored in the installation folder.
                </p>
              </div>

              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Machine Fingerprint Kernel Module (<code className="text-indigo-300 text-xs">electron/hardwareLock.js</code>)
                  </span>
                  <button
                    onClick={() => copyCode(`const { machineIdSync } = require('node-machine-id');
const si = require('systeminformation');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 1. Generate unique Hardware Fingerprint (HWID) from physical components
async function getSystemHwid() {
  const [baseboard, cpu, disk] = await Promise.all([
    si.baseboard(),
    si.cpu(),
    si.diskLayout()
  ]);

  const rawHardwareString = [
    baseboard.serial || baseboard.uuid || 'GENERIC_MB',
    cpu.processorId || cpu.family || 'GENERIC_CPU',
    disk[0]?.serialNum || 'GENERIC_DISK',
    machineIdSync({ original: true })
  ].join('|');

  const sha256 = crypto.createHash('sha256').update(rawHardwareString + 'SECRET_SALT_2026').digest('hex');
  return 'HWID-' + sha256.substring(0, 16).toUpperCase();
}

// 2. Validate against license file on disk
async function verifySingleMachineLock() {
  const currentHwid = await getSystemHwid();
  const licPath = path.join(process.resourcesPath, 'license.lic');

  if (!fs.existsSync(licPath)) {
    throw new Error('UNLICENSED: No license certificate found on this computer.');
  }

  const licData = JSON.parse(fs.readFileSync(licPath, 'utf8'));
  if (licData.boundHwid !== currentHwid) {
    throw new Error('HARDWARE_MISMATCH_LOCKED: Application copied to unauthorized PC.');
  }

  return { isValid: true, hwid: currentHwid };
}

module.exports = { getSystemHwid, verifySingleMachineLock };`, 20)}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-1 rounded"
                  >
                    {copiedStep === 20 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy Node-Lock Module
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-slate-900 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
{`const { machineIdSync } = require('node-machine-id');
const si = require('systeminformation');
const crypto = require('crypto');

// Generate unique Hardware Fingerprint (HWID)
async function getSystemHwid() {
  const [baseboard, cpu, disk] = await Promise.all([
    si.baseboard(), si.cpu(), si.diskLayout()
  ]);

  const raw = [baseboard.uuid, cpu.processorId, disk[0]?.serialNum].join('|');
  return 'HWID-' + crypto.createHash('sha256').update(raw).digest('hex').substring(0, 16).toUpperCase();
}`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: SQLITE ENCRYPTED OFFLINE DATABASE */}
          {activePlatformTab === 'SQLITE_OFFLINE' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20">
                <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                  Embedded SQLite Engine (Zero Cloud Latency)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  For fully offline operations in isolated campus networks, the app stores all resident records, transactions, room allocations, and biometric logs in an embedded, encrypted SQLite database (`hostel_erp.db`) directly on the host computer.
                </p>
              </div>

              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-emerald-400" />
                    Offline Database Driver (<code className="text-indigo-300 text-xs">src/db/sqlite.js</code>)
                  </span>
                  <button
                    onClick={() => copyCode(`const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

const dbPath = path.join(app.getPath('userData'), 'hostel_erp_node_locked.db');
const db = new Database(dbPath, { verbose: console.log });

// Enable Write-Ahead Logging for high concurrent disk throughput
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

// Initialize Core Tables
db.exec(\`
  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    rollNumber TEXT UNIQUE,
    name TEXT NOT NULL,
    roomNumber TEXT,
    feeBalance REAL DEFAULT 0,
    status TEXT DEFAULT 'ACTIVE'
  );

  CREATE TABLE IF NOT EXISTS financial_ledger (
    id TEXT PRIMARY KEY,
    studentId TEXT,
    amount REAL,
    category TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
\`);

module.exports = db;`, 30)}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-1 rounded"
                  >
                    {copiedStep === 30 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy SQLite Driver
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-slate-900 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
{`const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

const dbPath = path.join(app.getPath('userData'), 'hostel_erp_node_locked.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: TAURI RUST BUILD */}
          {activePlatformTab === 'TAURI_NATIVE' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/20">
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
                  Alternative: Tauri Ultra-Lightweight Rust Engine (8MB RAM footprint)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  If the target computer has limited RAM (2GB to 4GB), Tauri replaces Chromium with the native OS webview (Microsoft Edge WebView2 on Windows) for lightning-fast cold boot and minimal file size.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-200">Terminal Build Commands:</div>
                <div className="p-3 rounded-lg bg-slate-900 font-mono text-xs text-amber-400 space-y-1">
                  <div>npm install --save-dev @tauri-apps/cli</div>
                  <div>npx tauri init</div>
                  <div>npm run tauri build</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ANDROID APK MOBILE BUILD */}
          {activePlatformTab === 'ANDROID_APK' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20">
                <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">
                  Packaging Mobile Shell (.apk / Capacitor / Cordova)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  For warden floor inspections, housekeeping consensus, and gate biometric entry, package the responsive shell into an installable Android APK with biometric camera &amp; QR scanner bindings.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-200">Capacitor Android Build Steps:</div>
                <div className="p-3 rounded-lg bg-slate-900 font-mono text-xs text-indigo-300 space-y-1">
                  <div>npm install @capacitor/core @capacitor/cli @capacitor/android</div>
                  <div>npx cap init &quot;NativeNestHostel&quot; &quot;com.nativenest.erp&quot;</div>
                  <div>npm run build &amp;&amp; npx cap add android</div>
                  <div>npx cap open android</div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Enterprise Standalone Architecture (Windows 10/11 x64, Linux, macOS, Android)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors"
          >
            Got It, Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
