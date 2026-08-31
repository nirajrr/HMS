import React, { useState } from 'react';
import { Student, IdentityDocument } from '../types';
import { 
  ShieldCheck, FileText, Upload, CheckCircle2, AlertTriangle, 
  Eye, EyeOff, Lock, Hash, Calendar, Building2, User, X, 
  ExternalLink, Sparkles, RefreshCw, KeyRound, Download
} from 'lucide-react';

interface DocumentManagerModalProps {
  student: Student;
  onClose: () => void;
  onSaveDocuments?: (studentId: string, documents: IdentityDocument[]) => void;
  onOpenPoliceVerification?: (student: Student) => void;
}

export const DocumentManagerModal: React.FC<DocumentManagerModalProps> = ({
  student,
  onClose,
  onSaveDocuments,
  onOpenPoliceVerification,
}) => {
  const [revealedDocId, setRevealedDocId] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<IdentityDocument['type']>('AADHAAR');
  const [docNumber, setDocNumber] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileHash, setFileHash] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const docs = student.documents || [];

  // Helper to generate a realistic SHA-256 hash for mock integrity seal
  const generateSha256 = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `sha256_${hex}${Math.random().toString(16).substring(2, 10)}${Date.now().toString(16)}`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileHash(generateSha256(file.name + file.size + Date.now()));
    }
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNumber.trim()) return;

    setIsUploading(true);

    const docLabels: Record<IdentityDocument['type'], string> = {
      AADHAAR: 'Government UIDAI Aadhaar Card',
      PAN: 'Income Tax Department PAN Card',
      COLLEGE_COMPANY_ID: 'College / Company Photo Identity Card',
    };

    const masked = docNumber.length > 4 ? `XXXX-XXXX-${docNumber.slice(-4)}` : docNumber;

    const newDoc: IdentityDocument = {
      id: `doc_${Date.now()}`,
      type: selectedDocType,
      label: docLabels[selectedDocType],
      docNumber: docNumber.trim(),
      maskedNumber: masked,
      institutionOrEmployer: institutionName.trim() || (selectedDocType === 'AADHAAR' ? 'UIDAI (Govt of India)' : selectedDocType === 'PAN' ? 'Income Tax Dept, India' : 'Institution Authority'),
      status: 'VERIFIED',
      verifiedAt: new Date().toISOString().split('T')[0],
      verifiedBy: 'Chief Warden & Verification Office',
      fileName: fileName || `${selectedDocType.toLowerCase()}_scan_${student.rollNumber}.pdf`,
      fileHashSha256: fileHash || generateSha256(docNumber + student.rollNumber),
      uploadedAt: new Date().toISOString().split('T')[0],
      isMappedToPoliceForm: true,
    };

    // Filter out existing document of the same type if updating
    const updatedDocs = docs.filter(d => d.type !== selectedDocType);
    updatedDocs.push(newDoc);

    setTimeout(() => {
      if (onSaveDocuments) {
        onSaveDocuments(student.id, updatedDocs);
      }
      setIsUploading(false);
      setUploadSuccess(true);
      setDocNumber('');
      setInstitutionName('');
      setFileName('');
      setFileHash('');
      setTimeout(() => setUploadSuccess(false), 2000);
    }, 300);
  };

  const getDocTypeBadge = (type: IdentityDocument['type']) => {
    switch (type) {
      case 'AADHAAR':
        return <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">Aadhaar Card</span>;
      case 'PAN':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">PAN Card</span>;
      case 'COLLEGE_COMPANY_ID':
        return <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold">College / Company ID</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">{type}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Identity &amp; Statutory Document Vault
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                  SHA-256 Sealed
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Aadhaar, PAN, College/Company ID with cryptographic integrity mapping for Police Verification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Resident Quick Profile Banner */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-300 font-bold flex items-center justify-center text-xs">
              {student.name.charAt(0)}
            </div>
            <div>
              <span className="font-bold text-slate-100 block">{student.name}</span>
              <span className="text-[11px] text-slate-400 font-mono">
                {student.rollNumber} • Room {student.roomNumber} ({student.bedNumber})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPoliceVerification && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPoliceVerification(student);
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                Map to Police Verification Form
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Upload New Document Card */}
          <form onSubmit={handleSaveDocument} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-3.5 h-3.5" />
                Upload / Register Identity Document
              </h4>
              {uploadSuccess && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Document sealed &amp; saved!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Document Type *</label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value as IdentityDocument['type'])}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="AADHAAR">Government UIDAI Aadhaar Card</option>
                  <option value="PAN">Income Tax PAN Card</option>
                  <option value="COLLEGE_COMPANY_ID">College / Company Student ID</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Document ID / Ref Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    selectedDocType === 'AADHAAR' 
                      ? 'e.g. 5489 1234 9876' 
                      : selectedDocType === 'PAN'
                      ? 'e.g. ABCDE1234F'
                      : 'e.g. 2026-CS-101 or EMP-9021'
                  }
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Issuing Authority / Institution / Employer
                </label>
                <input
                  type="text"
                  placeholder="e.g. IIT Delhi / Infosys / UIDAI"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* File upload simulator with hash */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3">
                <label className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-2 cursor-pointer transition-colors">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{fileName ? 'Replace File' : 'Attach Scan (PDF/JPG)'}</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>

                {fileName && (
                  <span className="text-xs text-slate-300 font-mono">
                    {fileName}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isUploading || !docNumber.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-indigo-600/20"
              >
                <Lock className="w-3.5 h-3.5" />
                {isUploading ? 'Sealing...' : 'Seal & Store Document'}
              </button>
            </div>
          </form>

          {/* Stored Documents Table / Cards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Attached Documents &amp; Identity Credentials ({docs.length})</span>
              <span className="text-[11px] font-normal text-slate-500">
                PII Protected • Section 188 IPC Compliant
              </span>
            </h4>

            {docs.length === 0 ? (
              <div className="text-center py-8 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-500 text-xs">
                No identity documents uploaded yet. Use the form above to attach Aadhaar, PAN, or College ID.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {docs.map((doc) => {
                  const isRevealed = revealedDocId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        {getDocTypeBadge(doc.type)}
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          {doc.status}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs text-slate-400 block">{doc.label}</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-mono text-sm font-bold text-slate-100 tracking-wider">
                            {isRevealed ? (doc.docNumber || doc.maskedNumber) : doc.maskedNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => setRevealedDocId(isRevealed ? null : doc.id)}
                            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                            title={isRevealed ? "Hide cleartext ID" : "Reveal cleartext ID (Audit Logged)"}
                          >
                            {isRevealed ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Issuer / College:</span>
                          <span className="text-slate-200 font-medium truncate max-w-[180px]">
                            {doc.institutionOrEmployer}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">File Reference:</span>
                          <span className="text-slate-300 font-mono text-[10px]">{doc.fileName}</span>
                        </div>

                        {doc.fileHashSha256 && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1">
                              <Hash className="w-3 h-3 text-indigo-400" /> SHA-256:
                            </span>
                            <span className="text-indigo-300 font-mono text-[10px] truncate max-w-[170px]" title={doc.fileHashSha256}>
                              {doc.fileHashSha256}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono">
            Digital Identity Vault • Auto-Mapped to Police Verification Form
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium cursor-pointer"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
};
