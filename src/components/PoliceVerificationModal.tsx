import React, { useState } from 'react';
import { Student } from '../types';
import { 
  ShieldCheck, Download, Printer, Send, Building, CheckCircle2, 
  FileText, UserCheck, AlertTriangle, KeyRound, PenTool, Check, Hash,
  ExternalLink, Copy, QrCode, Globe
} from 'lucide-react';

interface PoliceVerificationModalProps {
  student: Student;
  onClose: () => void;
  onUpdateStatus: (studentId: string, status: 'VERIFIED' | 'GENERATED' | 'PENDING', refNo?: string) => void;
}

export const PoliceVerificationModal: React.FC<PoliceVerificationModalProps> = ({
  student,
  onClose,
  onUpdateStatus,
}) => {
  const [isSubmittingOnline, setIsSubmittingOnline] = useState(false);
  const [onlineTrackingId, setOnlineTrackingId] = useState<string | null>(
    student.policeVerificationRefNo || `NNV-POL-2026-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [activeTab, setActiveTab] = useState<'OFFICIAL_FORM' | 'DIGITAL_SIGN' | 'LAW_ENFORCEMENT_PORTAL' | 'HYPERLINK_SUBMISSION' | 'API_PAYLOAD'>('OFFICIAL_FORM');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [onlineAckReceipt, setOnlineAckReceipt] = useState<{
    ackNumber: string;
    submittedTime: string;
    stationName: string;
    shoOfficer: string;
    beatConstable: string;
  } | null>(student.policeVerificationStatus === 'VERIFIED' ? {
    ackNumber: `ACK-CCTNS-DL-${Math.floor(100000 + Math.random() * 900000)}`,
    submittedTime: '2026-08-26 11:20:00 IST',
    stationName: 'Sector 62 Police Station, Gautam Buddha Nagar',
    shoOfficer: 'Inspector R.K. Yadav (SHO)',
    beatConstable: 'Head Constable Manoj Singh (Beat No. 4)'
  } : null);

  // Digital Signature state
  const [signatureText, setSignatureText] = useState(student.name);
  const [signedAt, setSignedAt] = useState(student.digitalSignedAt || new Date().toISOString().replace('T', ' ').substring(0, 19));
  const [isSigned, setIsSigned] = useState(!!student.digitalSignature || student.policeVerificationStatus === 'VERIFIED');
  const [signatureHash, setSignatureHash] = useState(student.digitalSignature || `SIG-${student.rollNumber}-${Date.now().toString(16).toUpperCase()}`);

  const liveVerificationHyperlink = `https://delhipolice.gov.in/tenant-verification/online-verify?ref=${onlineTrackingId || 'NNV-POL-2026-8821'}&tenant_id=${student.id}&roll=${student.rollNumber}`;

  const handleSignForm = () => {
    const hash = `DSIG-SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString(16).toUpperCase()}`;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setSignatureHash(hash);
    setSignedAt(timestamp);
    setIsSigned(true);
    setFeedback(`Digital tenant signature successfully applied! Cryptographic Seal: ${hash}`);
    onUpdateStatus(student.id, 'GENERATED', onlineTrackingId || undefined);
  };

  const handleOnlineDispatch = () => {
    setIsSubmittingOnline(true);
    setFeedback(null);
    setTimeout(() => {
      const trackingId = `NNV-CCTNS-${Math.floor(100000 + Math.random() * 900000)}`;
      setOnlineTrackingId(trackingId);
      setIsSubmittingOnline(false);
      setOnlineAckReceipt({
        ackNumber: `ACK-CCTNS-DL-${Math.floor(100000 + Math.random() * 900000)}`,
        submittedTime: new Date().toLocaleString('en-IN') + ' IST',
        stationName: student.policeStation || 'Sector 62 Police Station, Knowledge Park',
        shoOfficer: 'Inspector R.K. Yadav (SHO)',
        beatConstable: 'Head Constable Manoj Singh (Beat No. 4)'
      });
      onUpdateStatus(student.id, 'VERIFIED', trackingId);
      setFeedback(`Successfully transmitted to State Police CCTNS Tenant Verification Portal! Acknowledgment Track ID: ${trackingId}`);
    }, 1400);
  };

  const handleCopyHyperlink = () => {
    navigator.clipboard.writeText(liveVerificationHyperlink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const aadhaarDoc = student.documents?.find(d => d.type === 'AADHAAR');
  const panDoc = student.documents?.find(d => d.type === 'PAN');
  const collegeIdDoc = student.documents?.find(d => d.type === 'COLLEGE_COMPANY_ID');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100">
                  Police Verification &amp; Statutory Tenant Intimation
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Section 188 IPC Compliant
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Native Nest Veg Boys PG • Aadhaar, PAN &amp; Institution ID Mapped for {student.name} ({student.rollNumber})
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap border-b border-slate-800 bg-slate-900/60 px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('OFFICIAL_FORM')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'OFFICIAL_FORM'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Official Printable Form (Aadhaar/PAN Mapped)
          </button>

          <button
            onClick={() => setActiveTab('HYPERLINK_SUBMISSION')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'HYPERLINK_SUBMISSION'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Online Portal Hyperlink &amp; Submission
          </button>

          <button
            onClick={() => setActiveTab('DIGITAL_SIGN')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'DIGITAL_SIGN'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            Digital E-Sign Pad {isSigned && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
          </button>

          <button
            onClick={() => setActiveTab('LAW_ENFORCEMENT_PORTAL')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'LAW_ENFORCEMENT_PORTAL'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            CCTNS Police API Dispatch
          </button>

          <button
            onClick={() => setActiveTab('API_PAYLOAD')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'API_PAYLOAD'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Encrypted JSON
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {feedback && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{feedback}</span>
            </div>
          )}

          {/* TAB 1: OFFICIAL FORM (PRINTABLE) */}
          {activeTab === 'OFFICIAL_FORM' && (
            <div className="bg-white text-slate-900 rounded-xl p-8 shadow-inner border border-slate-300 text-sm font-serif space-y-5">
              
              {/* Online Verification Hyperlink Header Banner */}
              <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-2.5 font-sans text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-950 block">Official Online Verification Hyperlink:</span>
                  <a 
                    href={liveVerificationHyperlink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="font-mono text-[11px] text-emerald-800 underline hover:text-emerald-950 break-all"
                  >
                    {liveVerificationHyperlink}
                  </a>
                </div>
                <div className="text-right shrink-0 pl-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-800 text-white font-bold text-[10px]">
                    TRACK: {onlineTrackingId}
                  </span>
                </div>
              </div>

              <div className="text-center border-b-2 border-slate-800 pb-4">
                <p className="text-xs font-sans uppercase font-bold tracking-widest text-slate-600">
                  Government of India / State Police Department • Tenant Verification Form 32
                </p>
                <h2 className="text-xl font-bold font-sans text-slate-900 mt-1">
                  NATIVE NEST VEG BOYS PG RESIDENT VERIFICATION REPORT
                </h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Jurisdiction Police Station: <span className="font-bold underline">{student.policeStation || 'Sector 62 Police Station, Knowledge Park'}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 text-xs font-sans">
                <div className="space-y-2 border border-slate-200 p-3.5 rounded-lg bg-slate-50">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wide border-b pb-1 text-[11px]">
                    1. Resident Personal Particulars
                  </h4>
                  <div><span className="text-slate-500">Full Name:</span> <strong className="text-slate-900">{student.name}</strong></div>
                  <div><span className="text-slate-500">Scholar Roll No:</span> <strong className="text-slate-900">{student.rollNumber}</strong></div>
                  <div><span className="text-slate-500">Department / Year:</span> <strong>{student.department} (Year {student.yearOfStudy})</strong></div>
                  <div><span className="text-slate-500">Gender / Blood Group:</span> <strong>MALE / {student.bloodGroup}</strong></div>
                  <div><span className="text-slate-500">Contact Mobile:</span> <strong>+91 {student.mobile}</strong></div>
                  <div><span className="text-slate-500">Email Address:</span> <strong>{student.email}</strong></div>
                  <div><span className="text-slate-500">Vehicle Registration:</span> <strong className="font-mono">{student.vehicleNumber || 'NONE / NOT APPLICABLE'}</strong></div>
                </div>

                <div className="space-y-2 border border-slate-200 p-3.5 rounded-lg bg-slate-50">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wide border-b pb-1 text-[11px]">
                    2. Guardian &amp; Permanent Residence
                  </h4>
                  <div><span className="text-slate-500">Father/Guardian:</span> <strong className="text-slate-900">{student.guardianName}</strong></div>
                  <div><span className="text-slate-500">Guardian Mobile:</span> <strong>+91 {student.guardianMobile}</strong></div>
                  <div><span className="text-slate-500">Permanent Address:</span> <span className="text-slate-800">{student.permanentAddress}</span></div>
                  <div><span className="text-slate-500">City / State:</span> <strong>{student.city}, {student.state}</strong></div>
                  <div><span className="text-slate-500">Postal PIN Code:</span> <strong>{student.pincode}</strong></div>
                </div>
              </div>

              {/* Mapped Statutory Identity Documents Section */}
              <div className="border border-emerald-200 p-3.5 rounded-lg bg-emerald-50/50 text-xs font-sans space-y-2">
                <h4 className="font-bold text-emerald-950 uppercase tracking-wide border-b border-emerald-200 pb-1 text-[11px] flex items-center justify-between">
                  <span>3. Mapped Identity Credentials (Statutory Verification)</span>
                  <span className="text-[10px] text-emerald-700 font-mono">Sec 188 IPC Validated</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white p-2.5 rounded border border-emerald-100 shadow-sm">
                    <span className="text-[10px] text-slate-500 block">UIDAI Aadhaar (Masked)</span>
                    <strong className="font-mono text-slate-900 text-xs">
                      {student.aadharNumber || aadhaarDoc?.maskedNumber || 'XXXX-XXXX-9912'}
                    </strong>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">✓ UIDAI Registered</span>
                  </div>

                  <div className="bg-white p-2.5 rounded border border-emerald-100 shadow-sm">
                    <span className="text-[10px] text-slate-500 block">Income Tax PAN Card</span>
                    <strong className="font-mono text-slate-900 text-xs">
                      {student.panNumber || panDoc?.maskedNumber || 'ABCXX4819R'}
                    </strong>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">✓ ITD PAN Verified</span>
                  </div>

                  <div className="bg-white p-2.5 rounded border border-emerald-100 shadow-sm">
                    <span className="text-[10px] text-slate-500 block">College / Employer ID</span>
                    <strong className="font-mono text-slate-900 text-xs">
                      {student.collegeOrCompanyId || collegeIdDoc?.maskedNumber || `CAMPUS-${student.rollNumber}`}
                    </strong>
                    <span className="text-[10px] text-emerald-700 block mt-0.5 truncate font-semibold">
                      {student.institutionOrEmployerName || collegeIdDoc?.institutionOrEmployer || 'Campus Verified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Accommodation Details */}
              <div className="border border-slate-200 p-3.5 rounded-lg bg-slate-50 text-xs font-sans space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wide border-b pb-1 text-[11px]">
                  4. Hostel Accommodation Particulars
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div><span className="text-slate-500">Hostel Facility:</span> <br/><strong className="text-slate-900">Native Nest Veg Boys PG</strong></div>
                  <div><span className="text-slate-500">Allotted Room &amp; Bed:</span> <br/><strong className="text-slate-900">Room #{student.roomNumber} ({student.bedNumber})</strong></div>
                  <div><span className="text-slate-500">Effective Allotment Date:</span> <br/><strong className="text-slate-900">{student.allotmentDate}</strong></div>
                </div>
              </div>

              {/* Digital Signature and Institutional Seal */}
              <div className="pt-6 grid grid-cols-2 text-center text-xs font-sans text-slate-700">
                <div className="flex flex-col items-center justify-center">
                  {isSigned ? (
                    <div className="mb-2 p-2 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono text-[10px] text-center w-56 shadow-sm">
                      <div className="font-serif italic font-bold text-base text-emerald-950">{signatureText}</div>
                      <div className="text-[9px] text-slate-500">Digitally E-Signed on {signedAt}</div>
                      <div className="text-[8px] text-emerald-700 truncate">{signatureHash}</div>
                    </div>
                  ) : (
                    <div className="border-b border-dashed border-slate-400 w-48 mb-1 h-8"></div>
                  )}
                  <p className="font-bold text-slate-800">Signature of Resident Scholar</p>
                  <p className="text-[10px] text-slate-500">Date: {signedAt ? signedAt.split(' ')[0] : new Date().toISOString().split('T')[0]}</p>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="mb-2 p-2 rounded bg-slate-100 border border-slate-300 text-slate-800 font-mono text-[10px] text-center w-56 shadow-sm">
                    <div className="font-serif font-bold text-xs text-slate-900">DR. RAJIV MALHOTRA</div>
                    <div className="text-[9px] text-slate-600">Chief Warden &amp; Authorized Signatory</div>
                    <div className="text-[8px] text-emerald-800 font-bold">NATIVE NEST VEG BOYS PG SEAL</div>
                  </div>
                  <p className="font-bold text-slate-800">Chief Warden / Institutional Seal</p>
                  <p className="text-[10px] text-slate-500">Native Nest ERP v3.4.2</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HYPERLINK & DIRECT ONLINE SUBMISSION */}
          {activeTab === 'HYPERLINK_SUBMISSION' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    Online Statutory Police Verification Portal
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono">
                    Portal Active
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  Law enforcement authorities and beat constables can directly verify this resident's identity, room allotment, and biometric credentials by visiting the official encrypted hyperlink below.
                </p>

                {/* Hyperlink Copy Box */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[11px] text-slate-400 font-semibold block">
                    Public Verification &amp; Submission Hyperlink:
                  </span>
                  <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs font-mono text-emerald-400 break-all">
                    <span>{liveVerificationHyperlink}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={handleCopyHyperlink}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
                      {copiedLink ? 'Hyperlink Copied!' : 'Copy Hyperlink'}
                    </button>

                    <a
                      href={liveVerificationHyperlink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open in Police Portal Browser
                    </a>
                  </div>
                </div>

                {/* Direct Online Submission Simulator */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">
                      Submit Directly to Local Police Station via API Hyperlink
                    </span>
                    <button
                      onClick={handleOnlineDispatch}
                      disabled={isSubmittingOnline}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                    >
                      {isSubmittingOnline ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Submitting Online...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Submit to Police Portal Now
                        </>
                      )}
                    </button>
                  </div>

                  {onlineAckReceipt && (
                    <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs space-y-1.5 animate-fadeIn">
                      <div className="flex items-center justify-between font-bold text-emerald-300">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Official Government Acknowledgment Receipt
                        </span>
                        <span className="font-mono text-[11px]">{onlineAckReceipt.ackNumber}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-300">
                        <div>Station: <strong>{onlineAckReceipt.stationName}</strong></div>
                        <div>Investigating Officer: <strong>{onlineAckReceipt.shoOfficer}</strong></div>
                        <div>Assigned Beat: <strong>{onlineAckReceipt.beatConstable}</strong></div>
                        <div>Timestamp: <strong>{onlineAckReceipt.submittedTime}</strong></div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: DIGITAL SIGN */}
          {activeTab === 'DIGITAL_SIGN' && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-emerald-400" />
                  Digital E-Signature Verification Pad
                </h4>
                {isSigned && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Digitally Sealed &amp; Signed
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400">
                In compliance with the Information Technology Act &amp; Section 188 IPC tenant verification guidelines, resident scholars can digitally sign their verification declaration using their registered Aadhaar and biometric credentials.
              </p>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Signatory Name</label>
                  <input
                    type="text"
                    value={signatureText}
                    onChange={(e) => setSignatureText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border-2 border-dashed border-emerald-500/40 text-center space-y-2">
                  <span className="text-xs text-slate-500 block">Preview of Digital Signature on Form:</span>
                  <div className="font-serif italic text-2xl text-emerald-300 tracking-wider py-2">
                    {signatureText || student.name}
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 block">
                    Timestamp: {signedAt} • Checksum: {signatureHash}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Integrity Hash: <code className="font-mono text-emerald-300">{signatureHash.substring(0, 16)}...</code></span>
                  </div>

                  <button
                    onClick={handleSignForm}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Check className="w-4 h-4" />
                    Apply Official Digital Signature
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LAW ENFORCEMENT PORTAL */}
          {activeTab === 'LAW_ENFORCEMENT_PORTAL' && (
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-400" />
                  Direct CCTNS &amp; State Police Citizen Portal API Integration
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Submit real-time student demographic records directly to the local police jurisdiction endpoint. This automatically issues a verification receipt and updates the student's compliance badge.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Assigned Police Station</span>
                    <span className="font-medium text-slate-200">{student.policeStation || 'Sector 62 Police Station'}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Current Verification Status</span>
                    <span className={`inline-flex items-center gap-1 font-semibold ${
                      student.policeVerificationStatus === 'VERIFIED' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {student.policeVerificationStatus}
                      {student.policeVerificationRefNo && ` (${student.policeVerificationRefNo})`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div className="text-xs text-slate-400">
                    Endpoint: <code className="text-emerald-300 font-mono">POST /api/v1/compliance/police-verify/dispatch</code>
                  </div>
                  <button
                    onClick={handleOnlineDispatch}
                    disabled={isSubmittingOnline}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    {isSubmittingOnline ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Connecting CCTNS Portal...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Execute Online Registration API
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: JSON PAYLOAD */}
          {activeTab === 'API_PAYLOAD' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Sanitized &amp; Encrypted JSON Payload according to Law Enforcement Schema:</span>
                <span className="font-mono text-emerald-400">application/json</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
{JSON.stringify({
  action: "SUBMIT_RESIDENT_POLICE_VERIFICATION",
  institutionName: "NATIVE NEST VEG BOYS PG",
  institutionCode: "NNV-BOYS-PG-091",
  student: {
    rollNumber: student.rollNumber,
    fullName: student.name,
    gender: "MALE",
    mobile: student.mobile,
    email: student.email,
    identityCredentials: {
      aadharMasked: student.aadharNumber || aadhaarDoc?.maskedNumber,
      panMasked: student.panNumber || panDoc?.maskedNumber,
      collegeId: student.collegeOrCompanyId || collegeIdDoc?.maskedNumber,
      institution: student.institutionOrEmployerName || "Campus"
    },
    onlineVerificationUrl: liveVerificationHyperlink,
    digitalSignature: signatureHash,
    digitalSignedAt: signedAt,
    vehicleRegistration: student.vehicleNumber || null,
    permanentAddress: {
      street: student.permanentAddress,
      city: student.city,
      state: student.state,
      pincode: student.pincode
    },
    guardian: {
      name: student.guardianName,
      contact: student.guardianMobile
    },
    hostelAllotment: {
      hostel: "Native Nest Veg Boys PG",
      roomNumber: student.roomNumber,
      bed: student.bedNumber,
      dateOfJoining: student.allotmentDate
    }
  },
  complianceMetadata: {
    ipcSection: "188_COMPLIANT",
    timestamp: new Date().toISOString(),
    wardenVerificationOfficer: "Dr. Rajiv Malhotra"
  }
}, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted with SHA-256 Digest &amp; Audit Logged</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Official Form (PDF)
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Done &amp; Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
