import React, { useState } from 'react';
import { 
  BookOpen, Code2, Database, Terminal, FileCode, Check, 
  Copy, Layers, ShieldCheck, CreditCard, ArrowLeftRight
} from 'lucide-react';
import { POSTGRES_SCHEMA_SQL, POM_XML_TEMPLATE, API_DOCS_MARKDOWN } from '../schema';

interface DocumentationModalProps {
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'GUIDE' | 'SCHEMA' | 'POM' | 'API'>('GUIDE');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Hostel ERP System Architecture &amp; User Manual</h3>
              <p className="text-xs text-slate-400">
                Non-Technical Clerk SOP • Spring Boot &amp; JavaFX Desktop pom.xml • PostgreSQL DDL • REST APIs
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

        {/* Navigation Tabs */}
        <div className="px-6 bg-slate-900 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs py-2">
          <button
            onClick={() => setActiveTab('GUIDE')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'GUIDE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Non-Technical Clerk SOP Guide
          </button>

          <button
            onClick={() => setActiveTab('SCHEMA')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'SCHEMA' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" /> PostgreSQL DDL (V1__init.sql)
          </button>

          <button
            onClick={() => setActiveTab('POM')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'POM' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" /> Java / Spring Boot pom.xml
          </button>

          <button
            onClick={() => setActiveTab('API')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'API' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> REST &amp; Webhook API Docs
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-300 space-y-4">
          {activeTab === 'GUIDE' && (
            <div className="space-y-6 leading-relaxed">
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-200">
                <h4 className="font-bold text-sm text-indigo-300 mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Standard Operating Procedure (SOP) for Hostel Clerks &amp; Wardens
                </h4>
                <p className="text-xs text-indigo-300/80">
                  This simplified guide explains day-to-day operations with no technical jargon required.
                </p>
              </div>

              {/* Step 1 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h5 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</span>
                  Admitting a New Student &amp; Allotting a Bed
                </h5>
                <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
                  <li>Navigate to <strong>Resident Directory</strong> and click <strong>Admit New Student</strong>.</li>
                  <li>Fill in the student's legal name, 10-digit mobile number, university roll number, and permanent address.</li>
                  <li>Select an available room and designated bed (Bed 1 Window, Bed 2 Door, etc.).</li>
                  <li>Click <em>Complete Admission</em>. The system automatically updates room occupancy and initializes the caution deposit ledger.</li>
                </ul>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h5 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</span>
                  Room Swapping &amp; Chain-of-Thought Validation
                </h5>
                <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
                  <li>To shift or swap a resident, click the <ArrowLeftRight className="w-3.5 h-3.5 inline text-indigo-400" /> icon next to their name.</li>
                  <li>The system runs an automated <strong>Chain-of-Thought clearance verification</strong>:
                    <ol className="list-decimal pl-5 mt-1 space-y-0.5 text-slate-300 font-mono text-[11px]">
                      <li>Step 1: Checks if the target room has an empty bed or mutual occupant agreement.</li>
                      <li>Step 2: Verifies gender-block segregation rules.</li>
                      <li>Step 3: Confirms student has no outstanding overdue mess or caution deficit.</li>
                    </ol>
                  </li>
                  <li>Click <em>Execute Room Shift</em> to finalize the transfer.</li>
                </ul>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h5 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">3</span>
                  Mess Bill Adjustments &amp; Receipt Generation
                </h5>
                <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
                  <li>Switch to <strong>Mess Billing</strong> or search by Room Number.</li>
                  <li>Click <strong>Adjust Charge</strong> to add feast charges or deduct leave rebates. A reason is mandatory for the audit log.</li>
                  <li>Click <strong>Collect Bill</strong> to record payment via UPI, Cash, or NetBanking with instant printable receipt.</li>
                </ul>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h5 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">4</span>
                  Police Verification Compliance (Section 188 IPC)
                </h5>
                <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
                  <li>Go to <strong>Police Compliance</strong> tab.</li>
                  <li>Click <strong>Generate / Dispatch</strong> on any pending student.</li>
                  <li>Preview the official government tenant verification form with student photograph and institution seal.</li>
                  <li>Click <em>Submit to State CCTNS Police Portal</em> for automated digital clearance.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'SCHEMA' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400">PostgreSQL Migration DDL: V1__init_schema.sql</span>
                <button
                  onClick={() => copyToClipboard(POSTGRES_SCHEMA_SQL, 'SCHEMA')}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 text-xs cursor-pointer"
                >
                  {copiedSection === 'SCHEMA' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === 'SCHEMA' ? 'Copied to Clipboard' : 'Copy DDL SQL'}
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] font-mono text-indigo-300 overflow-x-auto max-h-[60vh]">
                {POSTGRES_SCHEMA_SQL}
              </pre>
            </div>
          )}

          {activeTab === 'POM' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400">Desktop &amp; Spring Boot Maven Build File: pom.xml</span>
                <button
                  onClick={() => copyToClipboard(POM_XML_TEMPLATE, 'POM')}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 text-xs cursor-pointer"
                >
                  {copiedSection === 'POM' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === 'POM' ? 'Copied to Clipboard' : 'Copy pom.xml'}
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-[60vh]">
                {POM_XML_TEMPLATE}
              </pre>
            </div>
          )}

          {activeTab === 'API' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400">REST API &amp; Webhook Specification</span>
                <button
                  onClick={() => copyToClipboard(API_DOCS_MARKDOWN, 'API')}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 text-xs cursor-pointer"
                >
                  {copiedSection === 'API' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === 'API' ? 'Copied to Clipboard' : 'Copy API Spec'}
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] font-mono text-amber-300 overflow-x-auto max-h-[60vh] whitespace-pre-wrap">
                {API_DOCS_MARKDOWN}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-850 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
          >
            Close Documentation
          </button>
        </div>

      </div>
    </div>
  );
};
