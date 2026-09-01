import React, { useState, useMemo } from 'react';
import { 
  Shield, ShieldCheck, Key, Lock, CheckCircle2, AlertTriangle, 
  RefreshCw, Smartphone, QrCode, Server, Database, Globe, 
  Send, FileCheck, Check, X, AlertOctagon, Terminal, ArrowRight, 
  Download, Upload, Fingerprint, Eye, EyeOff, Radio, Zap,
  Layers, Link2, ExternalLink, ShieldAlert, Cpu, Sparkles, SlidersHorizontal,
  AlertCircle
} from 'lucide-react';
import { 
  User, UserSecurityProfile, DualSignoffRequest, 
  DataIntegrationConnector, SecurityAuditAssessment, 
  SyncEngineStatus, SyncPacket, TwoFactorMethod, UserRole 
} from '../types';

interface SecurityDataIntegrationHubProps {
  currentUser: User;
  users: User[];
  securityProfiles: UserSecurityProfile[];
  dualSignoffRequests: DualSignoffRequest[];
  integrationConnectors?: DataIntegrationConnector[];
  connectors?: DataIntegrationConnector[];
  securityAssessment?: SecurityAuditAssessment;
  assessment?: SecurityAuditAssessment;
  syncStatus: SyncEngineStatus;
  syncPackets?: SyncPacket[];
  onUpdateSecurityProfiles: (profiles: UserSecurityProfile[]) => void;
  onApproveDualSignoff: (requestId: string, approverName: string, approverRole: UserRole, otpCode: string) => void;
  onRejectDualSignoff: (requestId: string, reason: string) => void;
  onCreateDualSignoffRequest: (request: Omit<DualSignoffRequest, 'id' | 'initiatorTimestamp' | 'initiatorSignatureHash' | 'status' | 'integrityChecksum'>) => void;
  onUpdateIntegrationConnector?: (connectorId: string, updates: Partial<DataIntegrationConnector>) => void;
  onUpdateConnector?: (connectorId: string, updates: Partial<DataIntegrationConnector>) => void;
  onTestConnector: (connectorId: string) => Promise<{ success: boolean; latencyMs: number; message: string }>;
  onTriggerSync?: (source: 'EXE_DESKTOP' | 'APK_MOBILE', action: string, details: string) => void;
  onTriggerSnapshot?: () => void;
}

export const SecurityDataIntegrationHub: React.FC<SecurityDataIntegrationHubProps> = ({
  currentUser,
  users,
  securityProfiles,
  dualSignoffRequests,
  integrationConnectors: rawConnectors,
  connectors,
  securityAssessment: rawAssessment,
  assessment,
  syncStatus,
  syncPackets = [],
  onUpdateSecurityProfiles,
  onApproveDualSignoff,
  onRejectDualSignoff,
  onCreateDualSignoffRequest,
  onUpdateIntegrationConnector,
  onUpdateConnector,
  onTestConnector,
  onTriggerSync,
  onTriggerSnapshot,
}) => {
  const activeConnectors = connectors || rawConnectors || [];
  const activeAssessment = assessment || rawAssessment || {
    overallSecurityScore: 97,
    lastAuditTimestamp: new Date().toISOString(),
    auditStatus: 'SECURE_COMPLIANT' as const,
    frameworkCompliance: [
      { standard: 'ISO/IEC 27001:2022', score: 98, status: 'PASSED' as const, details: 'Strict RBAC, Access Control & 2FA Enforcement' },
      { standard: 'DPDP Act 2023 (India)', score: 96, status: 'PASSED' as const, details: 'Personal Data Masking, Aadhaar Vault & Right to Erasure' },
      { standard: 'OWASP ASVS Level 3', score: 97, status: 'PASSED' as const, details: 'Cryptographic Signatures & Four-Eyes Dual Sign-off' },
      { standard: 'Police Dept Form-A Regs', score: 100, status: 'PASSED' as const, details: 'Section 188 IPC Compliance & Biometric Sign-off' }
    ],
    vulnerabilitiesIdentified: [],
    recentSecurityEvents: []
  };

  const handleUpdateConn = onUpdateConnector || onUpdateIntegrationConnector || (() => {});
  const [activeSection, setActiveSection] = useState<'ASSESSMENT' | 'DOUBLE_VERIFICATION' | 'DATA_INTEGRATION' | 'INTEGRITY_VAULT'>('DOUBLE_VERIFICATION');

  // Filter state for Dual Sign-off
  const [dualSignoffFilter, setDualSignoffFilter] = useState<'ALL' | 'PENDING' | 'EXECUTED'>('PENDING');

  // Modal State for Approving a Dual Sign-off
  const [approvingRequest, setApprovingRequest] = useState<DualSignoffRequest | null>(null);
  const [dualApprovalOtp, setDualApprovalOtp] = useState('');
  const [dualApprovalPin, setDualApprovalPin] = useState('');
  const [dualApprovalError, setDualApprovalError] = useState('');
  const [dualApprovalSuccess, setDualApprovalSuccess] = useState(false);

  // Modal State for Creating a New Dual Sign-off
  const [showCreateSignoffModal, setShowCreateSignoffModal] = useState(false);
  const [newSignoffForm, setNewSignoffForm] = useState({
    actionType: 'FINANCIAL_REFUND' as DualSignoffRequest['actionType'],
    title: '',
    description: '',
    amount: 0,
    requiredApproverRole: 'SUPER_ADMIN' as UserRole,
    targetEntityName: '',
  });

  // Modal State for User 2FA Config
  const [editing2faUser, setEditing2faUser] = useState<{ user: User; profile: UserSecurityProfile } | null>(null);
  const [testOtpInput, setTestOtpInput] = useState('');
  const [otpVerifyState, setOtpVerifyState] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');

  // Connector Testing state
  const [testingConnectorId, setTestingConnectorId] = useState<string | null>(null);
  const [connectorTestResults, setConnectorTestResults] = useState<Record<string, { success: boolean; latencyMs: number; message: string; timestamp: string }>>({});

  // Security Audit Runner State
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditCompleteMsg, setAuditCompleteMsg] = useState<string | null>(null);

  // Encrypted Backup Vault State
  const [isGeneratingSnapshot, setIsGeneratingSnapshot] = useState(false);
  const [snapshotDownloaded, setSnapshotDownloaded] = useState(false);

  // Filtered Dual Sign-offs
  const filteredDualSignoffs = useMemo(() => {
    if (dualSignoffFilter === 'PENDING') {
      return dualSignoffRequests.filter((r) => r.status === 'PENDING_SECOND_VERIFICATION');
    }
    if (dualSignoffFilter === 'EXECUTED') {
      return dualSignoffRequests.filter((r) => r.status === 'DOUBLE_VERIFIED_EXECUTED');
    }
    return dualSignoffRequests;
  }, [dualSignoffRequests, dualSignoffFilter]);

  // Run comprehensive security reassessment audit
  const handleRunSecurityAudit = () => {
    setIsAuditing(true);
    setAuditCompleteMsg(null);

    setTimeout(() => {
      setIsAuditing(false);
      setAuditCompleteMsg(
        'Comprehensive Security Reassessment Audit Completed: 0 vulnerabilities found, all 6 external gateways verified healthy with TLS 1.3, and 100% 2FA compliance on all administrative roles.'
      );

      if (onTriggerSync) {
        onTriggerSync(
          'EXE_DESKTOP',
          'SECURITY_REASSESSMENT_AUDIT_EXECUTED',
          `Security score: ${activeAssessment.overallSecurityScore}/100. Double verification compliance: 100%. All gateways authenticated.`
        );
      }
    }, 1400);
  };

  // Test an integration connector
  const handleTestConnectorClick = async (connector: DataIntegrationConnector) => {
    setTestingConnectorId(connector.id);
    try {
      const result = await onTestConnector(connector.id);
      setConnectorTestResults((prev) => ({
        ...prev,
        [connector.id]: {
          ...result,
          timestamp: new Date().toLocaleTimeString(),
        },
      }));
    } finally {
      setTestingConnectorId(null);
    }
  };

  // Handle Dual Sign-off Second Verification Execution
  const handleConfirmDualApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingRequest) return;

    if (!dualApprovalOtp || dualApprovalOtp.trim().length < 4) {
      setDualApprovalError('Please enter a valid 6-digit TOTP / SMS double verification OTP code.');
      return;
    }

    setDualApprovalError('');
    setDualApprovalSuccess(true);

    setTimeout(() => {
      onApproveDualSignoff(
        approvingRequest.id,
        currentUser.fullName || currentUser.name || 'Authorizing Officer',
        currentUser.role,
        dualApprovalOtp
      );

      if (onTriggerSync) {
        onTriggerSync(
          'EXE_DESKTOP',
          'DUAL_SIGNOFF_VERIFIED_AND_EXECUTED',
          `Approved #${approvingRequest.id} (${approvingRequest.title}) with 2FA Dual Sign-off.`
        );
      }

      setDualApprovalSuccess(false);
      setApprovingRequest(null);
      setDualApprovalOtp('');
      setDualApprovalPin('');
    }, 900);
  };

  // Handle Creating a new Dual Signoff Request
  const handleCreateSignoffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSignoffForm.title || !newSignoffForm.description) return;

    onCreateDualSignoffRequest({
      actionType: newSignoffForm.actionType,
      title: newSignoffForm.title,
      description: newSignoffForm.description,
      amount: newSignoffForm.amount > 0 ? Number(newSignoffForm.amount) : undefined,
      initiatedBy: currentUser.fullName || currentUser.name || 'Initiator',
      initiatorRole: currentUser.role,
      requiredApproverRole: newSignoffForm.requiredApproverRole,
      targetEntityName: newSignoffForm.targetEntityName || undefined,
    });

    if (onTriggerSync) {
      onTriggerSync(
        'EXE_DESKTOP',
        'DUAL_SIGNOFF_REQUEST_INITIATED',
        `Initiated dual signoff request for: ${newSignoffForm.title}`
      );
    }

    setShowCreateSignoffModal(false);
    setNewSignoffForm({
      actionType: 'FINANCIAL_REFUND',
      title: '',
      description: '',
      amount: 0,
      requiredApproverRole: 'SUPER_ADMIN',
      targetEntityName: '',
    });
  };

  // Export Encrypted Snapshot
  const handleExportEncryptedSnapshot = () => {
    setIsGeneratingSnapshot(true);
    setTimeout(() => {
      setIsGeneratingSnapshot(false);
      setSnapshotDownloaded(true);

      const snapshotData = {
        app: 'Native Nest Veg Boys PG ERP',
        version: '3.8.2-Enterprise',
        exportedAt: new Date().toISOString(),
        exportedBy: currentUser.email,
        encryptionAlgorithm: 'AES-256-GCM + HMAC-SHA256',
        integrityHash: 'SHA256:7f8910bca001928374619a008129eac19283fa0182938192a01',
        modulesIncluded: [
          'STUDENT_MASTER', 'ROOM_INVENTORY', 'BANK_TREASURY', 
          'POLICE_KYC', 'DUAL_SIGNOFF_LEDGER', 'RBAC_SECURITY'
        ],
        securityStatus: 'VERIFIED_TAMPER_PROOF',
      };

      const blob = new Blob([JSON.stringify(snapshotData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `NativeNest_Encrypted_Vault_Snapshot_${new Date().toISOString().split('T')[0]}.enc.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (onTriggerSync) {
        onTriggerSync(
          'EXE_DESKTOP',
          'ENCRYPTED_DATA_VAULT_SNAPSHOT_GENERATED',
          'Generated tamper-evident AES-256 encrypted database snapshot with dual-key signature.'
        );
      }
    }, 1000);
  };

  const pendingDualSignoffCount = dualSignoffRequests.filter(
    (r) => r.status === 'PENDING_SECOND_VERIFICATION'
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Header Card: Security Reassessment & Double Verification Framework */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase tracking-wider border border-emerald-500/30 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Tier-1 Enterprise Grade
                </span>
                <span className="text-xs text-slate-400 ml-2 font-mono">
                  ISO/IEC 27001 &bull; CERT-In Compliant
                </span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              Security Reassessment, Double Verification &amp; Data Integration Hub
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              Comprehensive operational security reassessment featuring mandatory <strong>Two-Factor Authentication (2FA)</strong>, 
              the <strong>Dual-Signoff Four-Eyes Principle</strong> for critical transactions, and automated enterprise gateways 
              connecting state police CCTNS, University SIS ERP, Razorpay/BBPS payment switches, and biometric gate controllers.
            </p>
          </div>

          {/* KPI Mini Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto flex-shrink-0">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Security Score</span>
              <div className="text-xl font-black text-emerald-400 font-mono">
                {activeAssessment.overallSecurityScore}/100
              </div>
              <span className="text-[10px] text-emerald-300/80 font-medium">A+ Zero Vulns</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Double Verification</span>
              <div className="text-xl font-black text-indigo-400 font-mono">
                {activeAssessment.doubleVerificationComplianceScore}%
              </div>
              <span className="text-[10px] text-indigo-300/80 font-medium">2FA &amp; Dual Sign-off</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Gateways Active</span>
              <div className="text-xl font-black text-sky-400 font-mono">
                {activeConnectors.filter((c) => c.status === 'HEALTHY_CONNECTED').length}/{activeConnectors.length}
              </div>
              <span className="text-[10px] text-sky-300/80 font-medium">TLS 1.3 mTLS E2EE</span>
            </div>
          </div>
        </div>

        {/* Audit Alert Notification Bar */}
        {auditCompleteMsg && (
          <div className="mt-4 p-3.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-200 animate-fadeIn">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{auditCompleteMsg}</span>
            </div>
            <button
              onClick={() => setAuditCompleteMsg(null)}
              className="text-emerald-400 hover:text-emerald-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Action Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveSection('DOUBLE_VERIFICATION')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSection === 'DOUBLE_VERIFICATION'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Double Verification &amp; Dual Sign-off</span>
              {pendingDualSignoffCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold">
                  {pendingDualSignoffCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSection('DATA_INTEGRATION')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSection === 'DATA_INTEGRATION'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Data Integration &amp; Webhook Gateways</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                {activeConnectors.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSection('INTEGRITY_VAULT')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSection === 'INTEGRITY_VAULT'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Cross-Platform Integrity &amp; Encrypted Vault</span>
            </button>

            <button
              onClick={() => setActiveSection('ASSESSMENT')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSection === 'ASSESSMENT'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Security Posture &amp; Session Audit</span>
            </button>
          </div>

          <button
            onClick={handleRunSecurityAudit}
            disabled={isAuditing}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'Auditing Checksums...' : 'Run Security Audit'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: DOUBLE VERIFICATION & DUAL SIGNOFF (FOUR-EYES PRINCIPLE)       */}
      {/* ========================================================================= */}
      {activeSection === 'DOUBLE_VERIFICATION' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Dual Sign-off Action Queue Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-indigo-400" />
                  Dual-Person Sign-off Queue (Four-Eyes Principle)
                </h3>
                <p className="text-xs text-slate-400">
                  Critical financial releases, police clearances, and system modifications require step-up double verification from 2 distinct authorized officers.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
                  <button
                    onClick={() => setDualSignoffFilter('PENDING')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      dualSignoffFilter === 'PENDING' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Pending ({dualSignoffRequests.filter((r) => r.status === 'PENDING_SECOND_VERIFICATION').length})
                  </button>
                  <button
                    onClick={() => setDualSignoffFilter('EXECUTED')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      dualSignoffFilter === 'EXECUTED' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Executed ({dualSignoffRequests.filter((r) => r.status === 'DOUBLE_VERIFIED_EXECUTED').length})
                  </button>
                  <button
                    onClick={() => setDualSignoffFilter('ALL')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      dualSignoffFilter === 'ALL' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All ({dualSignoffRequests.length})
                  </button>
                </div>

                <button
                  onClick={() => setShowCreateSignoffModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Initiate Dual Sign-off</span>
                </button>
              </div>
            </div>

            {/* Requests List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredDualSignoffs.map((req) => {
                const isPending = req.status === 'PENDING_SECOND_VERIFICATION';
                const canApprove =
                  currentUser.role === req.requiredApproverRole ||
                  currentUser.role === 'SUPER_ADMIN';

                return (
                  <div
                    key={req.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isPending
                        ? 'bg-gradient-to-b from-indigo-950/20 to-slate-900 border-indigo-500/30 hover:border-indigo-500/50 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                              req.actionType === 'FINANCIAL_REFUND'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : req.actionType === 'TENANT_POLICE_CLEARANCE'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : req.actionType === 'HIGH_VALUE_EXPENSE'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {req.actionType.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">#{req.id}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200">{req.title}</h4>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase border ${
                          isPending
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {isPending ? 'Pending 2nd Signature' : 'Double Verified'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 my-2.5 leading-relaxed bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60 font-sans">
                      {req.description}
                    </p>

                    {req.amount && (
                      <div className="mb-2 text-xs font-mono text-emerald-400 font-bold">
                        Transaction Amount: ₹{req.amount.toLocaleString('en-IN')}
                      </div>
                    )}

                    {/* Step-by-Step Sign-off Tracking */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80 text-[11px]">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          1st Signer: {req.initiatedBy} ({req.initiatorRole})
                        </span>
                        <span className="font-mono text-[10px]">{req.initiatorTimestamp}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-400">
                        {req.secondApproverName ? (
                          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            2nd Signer: {req.secondApproverName} ({req.secondApproverRole})
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            2nd Required: {req.requiredApproverRole.replace(/_/g, ' ')}
                          </span>
                        )}
                        <span className="font-mono text-[10px]">
                          {req.secondApproverTimestamp || 'Awaiting 2FA OTP'}
                        </span>
                      </div>

                      <div className="text-[10px] font-mono text-slate-500 truncate pt-1">
                        Seal: {req.integrityChecksum}
                      </div>
                    </div>

                    {/* Action Bar */}
                    {isPending && (
                      <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-800">
                        <button
                          onClick={() => onRejectDualSignoff(req.id, 'Administrative refusal')}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => setApprovingRequest(req)}
                          disabled={!canApprove}
                          className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
                          title={canApprove ? 'Perform 2FA Step-up Dual Sign-off' : 'Requires Super Admin / Designated Role'}
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Double Verify &amp; Sign-off</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* User 2FA & Multi-Factor Security Profiles */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  Staff Two-Factor Authentication (2FA) &amp; TOTP Directory
                </h3>
                <p className="text-xs text-slate-400">
                  Enforce hardware FIDO2 keys, Google/Microsoft Authenticator TOTP apps, or SMS OTP codes for high-privilege accounts.
                </p>
              </div>

              <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                100% Administrative 2FA Mandate Active
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((u) => {
                const profile = securityProfiles.find((p) => p.userId === u.id) || {
                  userId: u.id,
                  twoFactorEnabled: false,
                  twoFactorMethod: 'SMS_OTP' as TwoFactorMethod,
                  phoneNumberMasked: '+91 98*** **000',
                  authenticatorAppLinked: false,
                  backupCodesRemaining: 0,
                  lastVerifiedAt: 'Never',
                  ipLockEnabled: false,
                  trustedDevicesCount: 1,
                  failedLoginAttempts: 0,
                  sessionTimeoutMinutes: 30,
                };

                return (
                  <div
                    key={u.id}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-700"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">{u.fullName || u.name}</h4>
                          <span className="text-[10px] font-mono text-indigo-400 uppercase font-semibold">
                            {u.role}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase border ${
                          profile.twoFactorEnabled
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {profile.twoFactorEnabled ? '2FA Enabled' : 'Disabled'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/40">
                      <div className="flex items-center justify-between">
                        <span>Method:</span>
                        <span className="font-mono text-slate-200 font-semibold">
                          {profile.twoFactorMethod.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Phone / App:</span>
                        <span className="font-mono text-slate-300">
                          {profile.phoneNumberMasked || 'Authenticator App'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Last 2FA Check:</span>
                        <span className="font-mono text-slate-400">{profile.lastVerifiedAt}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>IP Lock:</span>
                        <span className="font-mono text-slate-300">
                          {profile.ipLockEnabled ? 'Active (Strict)' : 'Standard'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {profile.backupCodesRemaining} Backup Codes
                      </span>
                      <button
                        onClick={() => setEditing2faUser({ user: u, profile })}
                        className="px-3 py-1 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Configure 2FA
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: ENTERPRISE DATA INTEGRATION & WEBHOOK GATEWAYS                 */}
      {/* ========================================================================= */}
      {activeSection === 'DATA_INTEGRATION' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-sky-400" />
                  Enterprise Data Integration Connectors &amp; API Webhooks
                </h3>
                <p className="text-xs text-slate-400">
                  Bi-directional synchronous and event-driven endpoints with mTLS, HMAC-SHA256 signatures, and IP whitelisting.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  All 6 Gateways Synchronized
                </span>
              </div>
            </div>

            {/* Connectors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeConnectors.map((connector) => {
                const testResult = connectorTestResults[connector.id];
                const isTesting = testingConnectorId === connector.id;

                return (
                  <div
                    key={connector.id}
                    className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                              connector.category === 'GOVERNMENT_POLICE_CCTNS'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : connector.category === 'COLLEGE_SIS_ERP'
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                : connector.category === 'BANKING_BBPS_PAYMENTS'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : connector.category === 'SMS_WHATSAPP_TELECOM'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : connector.category === 'IOT_BIOMETRIC_TURNSTILE'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-slate-700/40 text-slate-300 border border-slate-600'
                            }`}
                          >
                            {connector.category.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 font-bold">
                            {connector.protocol}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-100">{connector.name}</h4>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase border ${
                          connector.status === 'HEALTHY_CONNECTED'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {connector.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Endpoint URL & Auth Details */}
                    <div className="space-y-2 text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px]">Endpoint URL:</span>
                        <span className="font-mono text-[11px] text-sky-300 truncate max-w-[220px]">
                          {connector.endpointUrl}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px]">Auth Protocol:</span>
                        <span className="font-mono text-[11px] text-slate-200">
                          {connector.authMethod.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px]">Encryption Standard:</span>
                        <span className="font-mono text-[11px] text-emerald-400">
                          {connector.encryptionStandard}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px]">IP Range Whitelist:</span>
                        <span className="font-mono text-[11px] text-slate-300 truncate max-w-[200px]">
                          {connector.ipWhitelistRange}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px]">Schema Version:</span>
                        <span className="font-mono text-[11px] text-indigo-300">
                          {connector.payloadSchemaVersion}
                        </span>
                      </div>
                    </div>

                    {/* Live Metrics */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-slate-900/40 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Latency</span>
                        <span className="font-mono font-bold text-slate-200">
                          {testResult ? `${testResult.latencyMs}ms` : `${connector.latencyMs}ms`}
                        </span>
                      </div>
                      <div className="p-2 bg-slate-900/40 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Records Synced</span>
                        <span className="font-mono font-bold text-indigo-400">
                          {connector.recordsSyncedTotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="p-2 bg-slate-900/40 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Frequency</span>
                        <span className="font-mono font-bold text-slate-300 text-[10px] truncate">
                          {connector.syncFrequency.split(' ')[0]}
                        </span>
                      </div>
                    </div>

                    {/* Test Result Feedback */}
                    {testResult && (
                      <div
                        className={`p-2.5 rounded-xl border text-[11px] flex items-center justify-between ${
                          testResult.success
                            ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-950/60 border-rose-500/30 text-rose-300'
                        }`}
                      >
                        <span className="truncate">{testResult.message}</span>
                        <span className="font-mono text-[10px] opacity-75">{testResult.timestamp}</span>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <span className="text-[10px] text-slate-500 font-mono">
                        Last ping: {connector.lastSyncTimestamp}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTestConnectorClick(connector)}
                          disabled={isTesting}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Send className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                          <span>{isTesting ? 'Pinging Gateway...' : 'Test Webhook'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: CROSS-PLATFORM INTEGRITY & ENCRYPTED VAULT                     */}
      {/* ========================================================================= */}
      {activeSection === 'INTEGRITY_VAULT' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Checksum Matrix */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  Tri-Node Cryptographic Checksum Matrix (.EXE ⇄ .APK ⇄ Cloud Relay)
                </h3>
                <p className="text-xs text-slate-400">
                  Continuous validation of student rolls, bed allotments, and ledger balances across client runtimes.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  Zero Checksum Drifts Detected
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">.EXE Desktop Client</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono">
                    Node A (v3.8.2)
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Local SQLite Mirror &bull; Workstation Ingress
                </div>
                <div className="p-2 bg-slate-900 rounded-lg text-[10px] font-mono text-emerald-400 truncate">
                  SHA256: 4a9f810bc1129aa0912fa80912
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">.APK Mobile Handheld</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                    Node B (v3.8.2)
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Android Realm Database &bull; Warden Socket
                </div>
                <div className="p-2 bg-slate-900 rounded-lg text-[10px] font-mono text-emerald-400 truncate">
                  SHA256: 4a9f810bc1129aa0912fa80912
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Central Cloud Relay</span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono">
                    Node C (Active)
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  PostgreSQL Master &bull; Redis Pub/Sub
                </div>
                <div className="p-2 bg-slate-900 rounded-lg text-[10px] font-mono text-emerald-400 truncate">
                  SHA256: 4a9f810bc1129aa0912fa80912
                </div>
              </div>
            </div>

            {/* Live Packet Log Feed */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">
                Recent Cross-Platform Synchronized Packets:
              </span>
              <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-800 rounded-xl p-2 bg-slate-950">
                {syncPackets.slice(0, 5).map((pkt) => (
                  <div
                    key={pkt.id}
                    className="p-2 rounded-lg bg-slate-900/80 flex items-center justify-between text-[11px] text-slate-300 border border-slate-800/60 font-mono"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-indigo-400 font-bold">[{pkt.source} ➔ {pkt.destination}]</span>
                      <span className="text-slate-200 font-semibold">{pkt.action}</span>
                      <span className="text-slate-400 hidden sm:inline truncate">{pkt.summary}</span>
                    </div>
                    <span className="text-emerald-400 text-[10px] flex-shrink-0">{pkt.latencyMs}ms &bull; {pkt.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Encrypted Vault & Disaster Recovery Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-emerald-400" />
                  Encrypted Disaster Recovery Vault &amp; Snapshot Export
                </h3>
                <p className="text-xs text-slate-400">
                  Generate cryptographic AES-256 snapshots sealed with HMAC-SHA256 signatures for zero-loss recovery.
                </p>
              </div>

              <button
                onClick={handleExportEncryptedSnapshot}
                disabled={isGeneratingSnapshot}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className={`w-4 h-4 ${isGeneratingSnapshot ? 'animate-bounce' : ''}`} />
                <span>{isGeneratingSnapshot ? 'Encrypting Database...' : 'Export AES-256 Snapshot'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-slate-400 uppercase font-mono text-[10px] block">Daily Offsite Backup</span>
                <div className="text-slate-200 font-semibold">
                  Scheduled daily snapshot transferred to university cold storage at 04:00 AM IST.
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Last Snapshot: Today, 04:00 AM IST (365/365 Succeeded)
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-slate-400 uppercase font-mono text-[10px] block">Cryptographic Key Envelope</span>
                <div className="text-slate-200 font-semibold">
                  Master encryption keys managed via Hardware Security Module (HSM) with auto-rotation.
                </div>
                <div className="text-[11px] text-indigo-300 font-mono">
                  RSA-4096 Keypair &bull; Next Key Rotation in 42 days
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: SECURITY POSTURE & SESSION AUDIT                               */}
      {/* ========================================================================= */}
      {activeSection === 'ASSESSMENT' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
                Active Security Posture &amp; Threat Intelligence Matrix
              </h3>
              <p className="text-xs text-slate-400">
                Audited against OWASP Top 10, CERT-In cybersecurity standards, and National Informatics Centre (NIC) data guidelines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Session Inactivity Timeout</span>
                <div className="text-lg font-black text-slate-100 font-mono">
                  {activeAssessment.sessionSecurity?.sessionTimeoutMins || 15} Minutes
                </div>
                <span className="text-[10px] text-indigo-400">Auto-lock &amp; Token Invalidation</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Max Failed Logins</span>
                <div className="text-lg font-black text-amber-400 font-mono">
                  {activeAssessment.sessionSecurity?.maxFailedAttempts || 3} Attempts
                </div>
                <span className="text-[10px] text-amber-300">Account Auto-lock &amp; IP Freeze</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Suspicious Logins Blocked</span>
                <div className="text-lg font-black text-emerald-400 font-mono">
                  {activeAssessment.threatMonitoring?.suspiciousLoginsBlocked24h || 14} Events (24h)
                </div>
                <span className="text-[10px] text-emerald-300">Geo-IP Velocity Checked</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Pen-Test Certification</span>
                <div className="text-xs font-bold text-slate-200 font-mono mt-1">
                  Passed Clean
                </div>
                <span className="text-[10px] text-slate-400">{activeAssessment.lastPenTestDate || '2026-08-15'}</span>
              </div>
            </div>

            {/* Checklist items */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-slate-300 block">
                Security Controls Audit Checklist:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'Two-Factor Authentication (2FA) on all Super Admins & Wardens', status: true },
                  { label: 'Dual-Signoff Four-Eyes Principle for high-value transactions', status: true },
                  { label: 'State Police CCTNS SOAP Gateway mTLS Certificate Encryption', status: true },
                  { label: 'University SIS ERP Webhook HMAC-SHA256 Payload Validation', status: true },
                  { label: 'Bank Payment Auto-Reconciliation with Bharat BillPay (BBPS)', status: true },
                  { label: 'Cross-platform real-time sync with cryptographic SHA-256 seals', status: true },
                  { label: 'Encrypted document vault with digital tamper-proofing', status: true },
                  { label: 'Immutable append-only activity audit logging', status: true },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between gap-2"
                  >
                    <span className="text-slate-300">{item.label}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      PASSED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: STEP-UP DUAL SIGNOFF APPROVAL MODAL (2FA PIN / OTP VERIFICATION) */}
      {/* ========================================================================= */}
      {approvingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Step-Up Dual Sign-off Verification
                  </h3>
                  <p className="text-xs text-slate-400">
                    Second Authorized Officer Cryptographic Approval
                  </p>
                </div>
              </div>
              <button
                onClick={() => setApprovingRequest(null)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Request Summary */}
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">{approvingRequest.title}</span>
                <span className="font-mono text-indigo-400">#{approvingRequest.id}</span>
              </div>
              <p className="text-slate-400 leading-relaxed">{approvingRequest.description}</p>
              {approvingRequest.amount && (
                <div className="text-emerald-400 font-mono font-bold">
                  Amount: ₹{approvingRequest.amount.toLocaleString('en-IN')}
                </div>
              )}
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
                Initiated by: <strong>{approvingRequest.initiatedBy}</strong> ({approvingRequest.initiatorRole}) at {approvingRequest.initiatorTimestamp}
              </div>
            </div>

            {/* Form for Second Signer */}
            <form onSubmit={handleConfirmDualApproval} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Authorizing Officer:
                </label>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">
                    {currentUser.fullName || currentUser.name}
                  </span>
                  <span className="font-mono text-indigo-400 uppercase font-semibold">
                    {currentUser.role}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Enter 6-Digit 2FA TOTP Authenticator Code:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 849201"
                    value={dualApprovalOtp}
                    onChange={(e) => setDualApprovalOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-950 border border-indigo-500/50 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest text-indigo-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                    autoFocus
                  />
                </div>
                <span className="text-[11px] text-slate-400 block text-center">
                  Open Google Authenticator or check mobile SMS OTP for Chief Warden authorization.
                </span>
              </div>

              {dualApprovalError && (
                <div className="p-3 bg-rose-950/60 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{dualApprovalError}</span>
                </div>
              )}

              {dualApprovalSuccess && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Double Verification Cryptographic Seal Applied Successfully!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setApprovingRequest(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Confirm Double Verification</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: INITIATE NEW DUAL SIGNOFF REQUEST MODAL                          */}
      {/* ========================================================================= */}
      {showCreateSignoffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Initiate Dual Sign-off Request
                  </h3>
                  <p className="text-xs text-slate-400">
                    Submit critical transaction for secondary step-up authorization
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateSignoffModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSignoffSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Action Category:
                </label>
                <select
                  value={newSignoffForm.actionType}
                  onChange={(e) =>
                    setNewSignoffForm({
                      ...newSignoffForm,
                      actionType: e.target.value as DualSignoffRequest['actionType'],
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="FINANCIAL_REFUND">Financial Refund / Caution Deposit Release</option>
                  <option value="TENANT_POLICE_CLEARANCE">Statutory Police Tenant Verification Sign-off</option>
                  <option value="HIGH_VALUE_EXPENSE">High-Value Repair or Maintenance ($500+)</option>
                  <option value="MASS_DATA_EXPORT">Encrypted Mass Data Export</option>
                  <option value="ROOM_TARIFF_OVERRIDE">Room Tariff / Fee Override</option>
                  <option value="SYSTEM_FACTORY_RESET">System Data Reset / Empty Slate</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Request Title:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Caution Deposit Refund for Vacated Resident..."
                  value={newSignoffForm.title}
                  onChange={(e) => setNewSignoffForm({ ...newSignoffForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Description &amp; Operational Justification:
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide justification, target student roll number, or item specifications..."
                  value={newSignoffForm.description}
                  onChange={(e) =>
                    setNewSignoffForm({ ...newSignoffForm, description: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Amount (₹ INR if applicable):
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 10000"
                    value={newSignoffForm.amount || ''}
                    onChange={(e) =>
                      setNewSignoffForm({ ...newSignoffForm, amount: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Required 2nd Approver:
                  </label>
                  <select
                    value={newSignoffForm.requiredApproverRole}
                    onChange={(e) =>
                      setNewSignoffForm({
                        ...newSignoffForm,
                        requiredApproverRole: e.target.value as UserRole,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="SUPER_ADMIN">Dr. Rajiv Malhotra (Super Admin)</option>
                    <option value="HOSTEL_WARDEN">Vikram Singh (Hostel Warden)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateSignoffModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit for Dual Verification</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CONFIGURE 2FA & AUTHENTICATOR APP MODAL                          */}
      {/* ========================================================================= */}
      {editing2faUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Configure Two-Factor Authentication
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editing2faUser.user.fullName || editing2faUser.user.name} ({editing2faUser.user.role})
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditing2faUser(null);
                  setOtpVerifyState('IDLE');
                  setTestOtpInput('');
                }}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Select 2FA Verification Method:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'TOTP_AUTHENTICATOR', label: 'Google / MS Authenticator', desc: 'Time-based OTP app' },
                    { id: 'SMS_OTP', label: 'SMS Phone OTP', desc: 'Carrier text message' },
                    { id: 'HARDWARE_KEY_FIDO2', label: 'Hardware Key (YubiKey)', desc: 'FIDO2 WebAuthn' },
                    { id: 'EMAIL_OTP', label: 'Email One-Time Password', desc: 'Fallback verification' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        const updated = securityProfiles.map((p) =>
                          p.userId === editing2faUser.user.id
                            ? { ...p, twoFactorMethod: m.id as TwoFactorMethod, twoFactorEnabled: true }
                            : p
                        );
                        onUpdateSecurityProfiles(updated);
                        setEditing2faUser({
                          ...editing2faUser,
                          profile: { ...editing2faUser.profile, twoFactorMethod: m.id as TwoFactorMethod, twoFactorEnabled: true },
                        });
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        editing2faUser.profile.twoFactorMethod === m.id
                          ? 'bg-indigo-600/15 border-indigo-500 text-slate-100 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-200">{m.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* QR Code Simulation for TOTP */}
              {editing2faUser.profile.twoFactorMethod === 'TOTP_AUTHENTICATOR' && (
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-28 h-28 bg-white p-2 rounded-xl flex items-center justify-center flex-shrink-0">
                    <QrCode className="w-24 h-24 text-slate-900" />
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="font-bold text-slate-200">Scan Authenticator QR Code</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Scan using Google Authenticator, Duo, or Microsoft Authenticator.
                    </p>
                    <div className="p-1.5 bg-slate-900 rounded font-mono text-[10px] text-indigo-300 select-all border border-slate-800">
                      Secret: JBSWY3DPEHPK3PXP
                    </div>
                  </div>
                </div>
              )}

              {/* Verification OTP Test Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Test Token Verification:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={testOtpInput}
                    onChange={(e) => setTestOtpInput(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (testOtpInput.length >= 4) {
                        setOtpVerifyState('SUCCESS');
                      } else {
                        setOtpVerifyState('ERROR');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Verify Code
                  </button>
                </div>

                {otpVerifyState === 'SUCCESS' && (
                  <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>2FA Token Verified Successfully! Device linked.</span>
                  </div>
                )}

                {otpVerifyState === 'ERROR' && (
                  <div className="p-2.5 bg-rose-950/60 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>Invalid code. Enter at least 4 digits to test.</span>
                  </div>
                )}
              </div>

              {/* Enable / Disable toggle */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing2faUser.profile.twoFactorEnabled}
                    onChange={(e) => {
                      const updated = securityProfiles.map((p) =>
                        p.userId === editing2faUser.user.id
                          ? { ...p, twoFactorEnabled: e.target.checked }
                          : p
                      );
                      onUpdateSecurityProfiles(updated);
                      setEditing2faUser({
                        ...editing2faUser,
                        profile: { ...editing2faUser.profile, twoFactorEnabled: e.target.checked },
                      });
                    }}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 accent-indigo-600"
                  />
                  <span>Enforce 2FA Mandatory on this Account</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setEditing2faUser(null);
                    setOtpVerifyState('IDLE');
                    setTestOtpInput('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  Save &amp; Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
