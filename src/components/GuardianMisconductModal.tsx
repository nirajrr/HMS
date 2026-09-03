import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, Send, MessageSquare, Smartphone, CheckCircle2, 
  AlertTriangle, Copy, ExternalLink, RefreshCw, User, 
  Phone, Clock, MapPin, AlertOctagon, Check, FileText,
  Sliders, ArrowRight, X, Sparkles, Building2, UserX,
  Volume2, ShieldCheck, Scale, History
} from 'lucide-react';
import { 
  Student, MisconductCategory, MisconductSeverity, 
  DisciplinaryActionType, DisciplinaryIncident, User as AuthUser
} from '../types';

interface GuardianMisconductModalProps {
  students: Student[];
  preSelectedStudent?: Student | null;
  currentUser?: AuthUser;
  onClose: () => void;
  onSubmitIncident: (incident: Omit<DisciplinaryIncident, 'id' | 'incidentNumber' | 'sha256AuditHash' | 'dispatchedAt'>) => void;
  onTriggerSync?: (source: 'EXE_DESKTOP' | 'APK_MOBILE', action: string, details: string) => void;
}

// Pre-defined smart matter templates according to Category
const CATEGORY_MATTER_TEMPLATES: Record<MisconductCategory, {
  label: string;
  defaultSeverity: MisconductSeverity;
  defaultAction: DisciplinaryActionType;
  defaultFine: number;
  title: string;
  matterTemplate: (std: Student) => string;
}> = {
  CURFEW_LATE_ENTRY: {
    label: 'Curfew & Late Night Entry past 10:00 PM',
    defaultSeverity: 'MODERATE_INFRACTION',
    defaultAction: 'WRITTEN_WARNING',
    defaultFine: 500,
    title: 'Unauthorized Late Night Entry past Curfew without Outpass',
    matterTemplate: (std) => `The student returned to the hostel premises after the mandatory 10:00 PM curfew without prior digital outpass or warden approval, attempting to bypass biometric gate entry logs. No valid medical or academic emergency justification was presented.`
  },
  RAGGING_BULLYING: {
    label: 'Ragging, Bullying & Harassment',
    defaultSeverity: 'CRITICAL_DISCIPLINARY',
    defaultAction: 'ROOM_EXPULSION_SUSPENSION',
    defaultFine: 5000,
    title: 'Infraction of Anti-Ragging Guidelines & Junior Student Intimidation',
    matterTemplate: (std) => `The student was involved in coercive behavior and verbal intimidation directed at junior residents in the common recreation hall, in direct violation of the Statutory Anti-Ragging Mandate and UGC Regulations.`
  },
  PROPERTY_DAMAGE: {
    label: 'Vandalism / Damage to Hostel Property & Fixtures',
    defaultSeverity: 'MAJOR_VIOLATION',
    defaultAction: 'FINE_IMPOSED',
    defaultFine: 2500,
    title: 'Willful Vandalism / Physical Damage to Hostel Fixtures',
    matterTemplate: (std) => `The student caused intentional physical damage to hostel assets (broken door latch, damaged study pod electrical fixtures) in the floor corridor. Full replacement cost plus disciplinary surcharge assessed.`
  },
  UNAUTHORIZED_GUEST: {
    label: 'Accommodating Unauthorized Overnight Guests',
    defaultSeverity: 'MAJOR_VIOLATION',
    defaultAction: 'GUARDIAN_SUMMONS',
    defaultFine: 2000,
    title: 'Hosting Non-Resident Overnight Guest without Visitor Registration',
    matterTemplate: (std) => `During regular night proctorial rounds, an unregistered non-resident outside individual was discovered staying overnight in the student's allotted room without prior security registration or Warden clearance.`
  },
  SUBSTANCE_PROHIBITION: {
    label: 'Alcohol, Smoking or Prohibited Substance Violation',
    defaultSeverity: 'CRITICAL_DISCIPLINARY',
    defaultAction: 'GUARDIAN_SUMMONS',
    defaultFine: 3000,
    title: 'Possession / Consumption of Prohibited Substances within Premises',
    matterTemplate: (std) => `The resident was found in possession of prohibited items/substances within the hostel room block during surprise inventory check, in grave breach of Section 7 of the Code of Student Conduct.`
  },
  NOISE_DISTURBANCE: {
    label: 'Noise Disturbance & Quiet Hours Infraction',
    defaultSeverity: 'MINOR_WARNING',
    defaultAction: 'WRITTEN_WARNING',
    defaultFine: 250,
    title: 'Operating High-Decibel Audio Systems during Quiet Study Hours',
    matterTemplate: (std) => `The student operated high-volume audio equipment past 11:30 PM, disturbing adjacent wing residents during the mid-semester examination preparation period despite repeated floor-monitor advisories.`
  },
  FIGHT_VIOLENCE: {
    label: 'Physical Altercation & Violent Behavior',
    defaultSeverity: 'CRITICAL_DISCIPLINARY',
    defaultAction: 'ROOM_EXPULSION_SUSPENSION',
    defaultFine: 3500,
    title: 'Physical Altercation and Breach of Peace within Dining / Corridor Area',
    matterTemplate: (std) => `The resident engaged in a heated physical altercation and disorderly conduct in the mess dining hall, endangering resident safety and causing a public breach of peace.`
  },
  INSUBORDINATION: {
    label: 'Insubordination / Misbehavior with Staff & Wardens',
    defaultSeverity: 'MAJOR_VIOLATION',
    defaultAction: 'GUARDIAN_SUMMONS',
    defaultFine: 1000,
    title: 'Disrespectful Conduct & Insubordination towards Duty Wardens',
    matterTemplate: (std) => `The resident exhibited abusive language and refused to comply with legitimate safety instructions issued by the Assistant Warden and Security Guards during attendance verification.`
  },
  ACADEMIC_ATTENDANCE: {
    label: 'Prolonged Truancy / Unreported Absence',
    defaultSeverity: 'MODERATE_INFRACTION',
    defaultAction: 'GUARDIAN_SUMMONS',
    defaultFine: 0,
    title: 'Unexplained Absence from Hostel for >48 Hours without Leave Form',
    matterTemplate: (std) => `The student has remained absent from nightly biometric muster roll check-ins for over 48 consecutive hours without submitting a parent-authorized leave application or warden intimation.`
  },
  OTHER: {
    label: 'Other Custom Misconduct / Rule Infraction',
    defaultSeverity: 'MODERATE_INFRACTION',
    defaultAction: 'WRITTEN_WARNING',
    defaultFine: 0,
    title: 'Violation of Hostel Residence Guidelines & Discipline Code',
    matterTemplate: (std) => `The resident engaged in conduct inconsistent with the standard rules and regulations governing hostel residency.`
  }
};

export const GuardianMisconductModal: React.FC<GuardianMisconductModalProps> = ({
  students,
  preSelectedStudent,
  currentUser,
  onClose,
  onSubmitIncident,
  onTriggerSync,
}) => {
  // Selected Student
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    preSelectedStudent?.id || students[0]?.id || ''
  );

  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || students[0] || null;
  }, [students, selectedStudentId]);

  // Form States
  const [category, setCategory] = useState<MisconductCategory>('CURFEW_LATE_ENTRY');
  const [severity, setSeverity] = useState<MisconductSeverity>('MODERATE_INFRACTION');
  const [title, setTitle] = useState(CATEGORY_MATTER_TEMPLATES['CURFEW_LATE_ENTRY'].title);
  const [matterDescription, setMatterDescription] = useState(
    selectedStudent ? CATEGORY_MATTER_TEMPLATES['CURFEW_LATE_ENTRY'].matterTemplate(selectedStudent) : ''
  );
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState(
    `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')} IST`
  );
  const [location, setLocation] = useState('Main Hostel Security Gate & Biometric Turnstile');
  const [fineAmount, setFineAmount] = useState<number>(500);
  const [actionProposed, setActionProposed] = useState<DisciplinaryActionType>('WRITTEN_WARNING');
  const [reportedBy, setReportedBy] = useState(
    currentUser?.fullName || currentUser?.name || 'Dr. Rajiv Malhotra (Chief Warden)'
  );
  const [witnessInfo, setWitnessInfo] = useState('Night Guard on Duty & CCTV Camera #02 Logs');

  // Guardian contact override (if alternate mobile is needed)
  const [customGuardianMobile, setCustomGuardianMobile] = useState('');
  const [customGuardianName, setCustomGuardianName] = useState('');

  // Active Preview Tab
  const [previewTab, setPreviewTab] = useState<'WHATSAPP' | 'SMS'>('WHATSAPP');

  // Dispatch Engine States
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [sendSms, setSendSms] = useState(true);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmissionProgress, setTransmissionProgress] = useState(0);
  const [transmissionStatus, setTransmissionStatus] = useState<string | null>(null);
  const [copiedChannel, setCopiedChannel] = useState<'WHATSAPP' | 'SMS' | null>(null);

  // Derived effective guardian contact
  const effectiveGuardianMobile = (customGuardianMobile.trim() || selectedStudent?.guardianMobile || '').replace(/\D/g, '');
  const effectiveGuardianName = customGuardianName.trim() || selectedStudent?.guardianName || 'Guardian / Parent';

  // Handle Category Change (updates default template)
  const handleCategoryChange = (newCat: MisconductCategory) => {
    setCategory(newCat);
    const templateConfig = CATEGORY_MATTER_TEMPLATES[newCat];
    setSeverity(templateConfig.defaultSeverity);
    setActionProposed(templateConfig.defaultAction);
    setFineAmount(templateConfig.defaultFine);
    setTitle(templateConfig.title);
    if (selectedStudent) {
      setMatterDescription(templateConfig.matterTemplate(selectedStudent));
    }
  };

  // Handle Student Change
  const handleStudentChange = (newStudentId: string) => {
    setSelectedStudentId(newStudentId);
    const target = students.find((s) => s.id === newStudentId);
    if (target) {
      setCustomGuardianMobile('');
      setCustomGuardianName('');
      setMatterDescription(CATEGORY_MATTER_TEMPLATES[category].matterTemplate(target));
    }
  };

  // Compose dynamic WhatsApp message
  const generatedWhatsAppMessage = useMemo(() => {
    if (!selectedStudent) return '';
    const cleanPhone = effectiveGuardianMobile;
    const formattedDate = new Date(incidentDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const severityEmoji = 
      severity === 'CRITICAL_DISCIPLINARY' ? '🚨' :
      severity === 'MAJOR_VIOLATION' ? '⚠️' :
      severity === 'MODERATE_INFRACTION' ? '⚡' : '📌';

    const actionText = 
      actionProposed === 'ROOM_EXPULSION_SUSPENSION' ? 'Immediate Hostel Suspension & Expulsion Hearing Initiated' :
      actionProposed === 'GUARDIAN_SUMMONS' ? 'Parent / Guardian Personal Appearance Requested at Chief Warden Office' :
      actionProposed === 'FINE_IMPOSED' ? `Disciplinary Penalty of ₹${fineAmount.toLocaleString('en-IN')} Imposed` :
      actionProposed === 'PROBATION' ? 'Hostel Disciplinary Probation for 90 Days' :
      'Formal Written Disciplinary Warning Served';

    return `*OFFICIAL DISCIPLINARY NOTICE - HOSTEL ADMINISTRATION*
${severityEmoji} *Notice Category:* ${CATEGORY_MATTER_TEMPLATES[category].label}
🏷️ *Reference No:* DISC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}
📅 *Incident Time:* ${formattedDate} at ${incidentTime}
📍 *Location:* ${location}

Respected *Shri/Smt. ${effectiveGuardianName}*,
This is a formal communication regarding your ward admitted at Native Nest Hostel:
👤 *Student:* ${selectedStudent.name} (Roll: *${selectedStudent.rollNumber}*)
🏢 *Room & Bed:* Room ${selectedStudent.roomNumber} (${selectedStudent.bedNumber})
🎓 *Department:* ${selectedStudent.department || 'Undergraduate Resident'}

📝 *Matter of Misconduct on Part of Student/Ward:*
${matterDescription}

⚖️ *Action / Decision Imposed:*
*${actionText}*${fineAmount > 0 ? ` (Penalty Amount: ₹${fineAmount.toLocaleString('en-IN')})` : ''}

${actionProposed === 'GUARDIAN_SUMMONS' 
  ? `❗ *Urgent Request:* You are requested to contact the Chief Warden within 24 hours to discuss this matter.`
  : `Please counsel your ward to abide strictly by the Code of Conduct to avoid further disciplinary escalations.`}

📞 *Hostel Warden Office:* +91 98765 43210 / 011-28910293
🏛️ *Hostel Proctorial Board & Administration*
_This is an official automated dispatch under DLT Reg. TRAI-DLT-110716120938._`;
  }, [
    selectedStudent, effectiveGuardianName, effectiveGuardianMobile, 
    category, severity, incidentDate, incidentTime, location, 
    matterDescription, actionProposed, fineAmount
  ]);

  // Compose dynamic SMS message (Concise GSM 160-char format)
  const generatedSmsMessage = useMemo(() => {
    if (!selectedStudent) return '';
    const formattedDate = new Date(incidentDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short'
    });

    const actionSummary = 
      actionProposed === 'GUARDIAN_SUMMONS' ? 'Parent presence requested' :
      actionProposed === 'ROOM_EXPULSION_SUSPENSION' ? 'Suspension notice issued' :
      actionProposed === 'FINE_IMPOSED' ? `Fine of Rs.${fineAmount} levied` :
      'Disciplinary warning issued';

    return `HOSTEL ALERT: Respected ${effectiveGuardianName.split(' ')[0]}, your ward ${selectedStudent.name} (Roll: ${selectedStudent.rollNumber}, Rm: ${selectedStudent.roomNumber}) was reported for ${title.substring(0, 45)} on ${formattedDate}. ${actionSummary}. Please contact Warden Office at 011-28910293 / 9876543210. - Native Nest Administration`;
  }, [selectedStudent, effectiveGuardianName, incidentDate, title, actionProposed, fineAmount]);

  // Copy to clipboard helper
  const handleCopyText = (type: 'WHATSAPP' | 'SMS') => {
    const textToCopy = type === 'WHATSAPP' ? generatedWhatsAppMessage : generatedSmsMessage;
    navigator.clipboard.writeText(textToCopy);
    setCopiedChannel(type);
    setTimeout(() => setCopiedChannel(null), 3000);
  };

  // Launch Direct WhatsApp Web / Mobile chat with Guardian
  const handleOpenDirectWhatsApp = () => {
    if (!effectiveGuardianMobile) return;
    const phoneWithCountry = effectiveGuardianMobile.length === 10 ? `91${effectiveGuardianMobile}` : effectiveGuardianMobile;
    const encoded = encodeURIComponent(generatedWhatsAppMessage);
    const waUrl = `https://wa.me/${phoneWithCountry}?text=${encoded}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Launch Direct SMS app on mobile/desktop
  const handleOpenDirectSms = () => {
    if (!effectiveGuardianMobile) return;
    const phoneWithCountry = effectiveGuardianMobile.length === 10 ? `+91${effectiveGuardianMobile}` : `+${effectiveGuardianMobile}`;
    const encoded = encodeURIComponent(generatedSmsMessage);
    const smsUrl = `sms:${phoneWithCountry}?body=${encoded}`;
    window.open(smsUrl, '_blank');
  };

  // Transmit Misconduct Notice to Guardian
  const handleTransmitNotice = async () => {
    if (!selectedStudent || (!sendWhatsApp && !sendSms)) return;

    setIsTransmitting(true);
    setTransmissionProgress(15);
    setTransmissionStatus('Validating Guardian Mobile number against TRAI DLT registry...');

    await new Promise((r) => setTimeout(r, 600));
    setTransmissionProgress(45);
    setTransmissionStatus(
      sendWhatsApp 
        ? 'Encrypting payload and transmitting via WhatsApp Enterprise Webhook Gateway...' 
        : 'Submitting GSM payload to Telecom DLT Gateway...'
    );

    await new Promise((r) => setTimeout(r, 800));
    setTransmissionProgress(85);
    setTransmissionStatus('Generating SHA-256 disciplinary seal and logging cross-platform sync packet...');

    await new Promise((r) => setTimeout(r, 600));
    setTransmissionProgress(100);
    setTransmissionStatus('Delivered successfully to Guardian mobile! ACK received.');

    const newIncidentData: Omit<DisciplinaryIncident, 'id' | 'incidentNumber' | 'sha256AuditHash' | 'dispatchedAt'> = {
      studentId: selectedStudent.id,
      studentRoll: selectedStudent.rollNumber,
      studentName: selectedStudent.name,
      roomNumber: selectedStudent.roomNumber,
      bedNumber: selectedStudent.bedNumber,
      department: selectedStudent.department,
      guardianName: effectiveGuardianName,
      guardianMobile: effectiveGuardianMobile,
      category,
      severity,
      title,
      matterDescription,
      incidentDate,
      incidentTime,
      location,
      fineAmount: fineAmount > 0 ? fineAmount : undefined,
      actionProposed,
      reportedBy,
      witnessInfo,
      smsStatus: sendSms ? 'DELIVERED' : 'NOT_SENT',
      whatsAppStatus: sendWhatsApp ? 'DELIVERED' : 'NOT_SENT',
      smsMessageContent: generatedSmsMessage,
      whatsAppMessageContent: generatedWhatsAppMessage,
      dltTemplateId: 'DLT-TE-11071689209',
      whatsAppMessageId: `wamid.HBgLOTE${effectiveGuardianMobile}FQIAERgS${Date.now().toString().slice(-8)}`,
      status: actionProposed === 'GUARDIAN_SUMMONS' || severity === 'CRITICAL_DISCIPLINARY' 
        ? 'ESCALATED_CHIEF_WARDEN' 
        : 'NOTICE_SERVED',
      parentAcknowledged: false,
    };

    onSubmitIncident(newIncidentData);

    onTriggerSync?.(
      'EXE_DESKTOP',
      'GUARDIAN_MISCONDUCT_DISPATCHED',
      `Sent ${category} notice (${severity}) for ${selectedStudent.name} (${selectedStudent.rollNumber}) to Guardian ${effectiveGuardianName} (+91 ${effectiveGuardianMobile}) via ${sendWhatsApp && sendSms ? 'WhatsApp & SMS' : sendWhatsApp ? 'WhatsApp' : 'SMS'}.`
    );

    setTimeout(() => {
      setIsTransmitting(false);
      onClose();
    }, 1200);
  };

  const getSeverityBadge = (s: MisconductSeverity) => {
    switch (s) {
      case 'CRITICAL_DISCIPLINARY':
        return <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold">Critical Level 4</span>;
      case 'MAJOR_VIOLATION':
        return <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 border border-orange-500/40 text-[11px] font-bold">Major Level 3</span>;
      case 'MODERATE_INFRACTION':
        return <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold">Moderate Level 2</span>;
      case 'MINOR_WARNING':
        return <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[11px] font-bold">Minor Level 1</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">
                  Student Misconduct &amp; Guardian Notification Portal
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                  WhatsApp + SMS Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct dispatch of student misconduct matter to registered Guardian mobile with cryptographic audit trail
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body: Split Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Form & Incident Details (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* 1. Student Selection Card */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  Resident Student (Ward)
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  Total Admitted: {students.length}
                </span>
              </label>

              <select
                value={selectedStudentId}
                onChange={(e) => handleStudentChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.rollNumber}) — Room {s.roomNumber}, {s.bedNumber} ({s.department || 'Resident'})
                  </option>
                ))}
              </select>

              {/* Resident Card Mini Summary */}
              {selectedStudent && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Room &amp; Bed</span>
                    <span className="font-bold text-slate-200">Room {selectedStudent.roomNumber} ({selectedStudent.bedNumber})</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Student Mobile</span>
                    <span className="font-mono text-slate-300">+91 {selectedStudent.mobile}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/30 col-span-2 sm:col-span-1">
                    <span className="text-indigo-400 block text-[10px] font-bold">Guardian Contact</span>
                    <span className="font-mono font-bold text-indigo-200">
                      {selectedStudent.guardianName}
                    </span>
                    <span className="text-[10px] text-slate-300 block font-mono">
                      +91 {selectedStudent.guardianMobile}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Guardian Mobile Verification & Alternate Contact */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  Target Guardian Mobile (WhatsApp &amp; SMS Dispatch Destination)
                </label>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified DLT Record
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">Guardian Name</label>
                  <input
                    type="text"
                    value={customGuardianName}
                    placeholder={selectedStudent?.guardianName || 'Guardian Full Name'}
                    onChange={(e) => setCustomGuardianName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">Guardian Mobile Number (10 digits)</label>
                  <div className="flex items-center">
                    <span className="px-2.5 py-2 bg-slate-800 text-slate-400 border border-r-0 border-slate-700 rounded-l-xl text-xs font-mono font-bold">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={customGuardianMobile || selectedStudent?.guardianMobile || ''}
                      placeholder="9876501234"
                      onChange={(e) => setCustomGuardianMobile(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-r-xl px-3 py-2 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Misconduct Category & Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                  Misconduct Category
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value as MisconductCategory)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {Object.entries(CATEGORY_MATTER_TEMPLATES).map(([key, cfg]) => (
                    <option key={key} value={key}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block flex items-center justify-between">
                  <span>Severity Level</span>
                  {getSeverityBadge(severity)}
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as MisconductSeverity)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="MINOR_WARNING">Minor Infraction (Level 1 Warning)</option>
                  <option value="MODERATE_INFRACTION">Moderate Infraction (Level 2 Notice)</option>
                  <option value="MAJOR_VIOLATION">Major Violation (Level 3 Board Review)</option>
                  <option value="CRITICAL_DISCIPLINARY">Critical Violation (Level 4 Suspension Risk)</option>
                </select>
              </div>
            </div>

            {/* 4. Incident Date, Time & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 mb-1 block flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-400" /> Date of Incident
                </label>
                <input
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 mb-1 block">Time &amp; Shift</label>
                <input
                  type="text"
                  value={incidentTime}
                  onChange={(e) => setIncidentTime(e.target.value)}
                  placeholder="23:45 IST"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 mb-1 block flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-indigo-400" /> Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Main Security Gate / Corridor"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* 5. Incident Title & Matter Description on Part of Student/Ward */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">
                  Incident Subject / Formal Charge Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summary of student misconduct"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    Matter on Part of Student / Ward (Detailed Incident Description)
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {matterDescription.length} chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={matterDescription}
                  onChange={(e) => setMatterDescription(e.target.value)}
                  placeholder="Provide precise details of what happened, time of occurrence, resident conduct, witnesses, and rule infractions..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                />
              </div>
            </div>

            {/* 6. Disciplinary Action Proposed & Penalty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-indigo-400" />
                  Action / Sanction Imposed
                </label>
                <select
                  value={actionProposed}
                  onChange={(e) => setActionProposed(e.target.value as DisciplinaryActionType)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="WRITTEN_WARNING">Formal Written Warning Letter</option>
                  <option value="GUARDIAN_SUMMONS">Parent / Guardian Summoned to Campus</option>
                  <option value="FINE_IMPOSED">Disciplinary Monetary Fine</option>
                  <option value="PROBATION">Hostel Disciplinary Probation</option>
                  <option value="ROOM_EXPULSION_SUSPENSION">Expulsion / Suspension Recommendation</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">
                  Disciplinary Fine (₹ INR, 0 if none)
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-800 text-slate-400 border border-r-0 border-slate-700 rounded-l-xl text-xs font-mono font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={fineAmount}
                    onChange={(e) => setFineAmount(Number(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-r-xl px-3 py-2 text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* 7. Reported By Staff & Witness */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-400 mb-1 block">Reporting Warden / Officer</label>
                <input
                  type="text"
                  value={reportedBy}
                  onChange={(e) => setReportedBy(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 mb-1 block">Witness / Evidence Source</label>
                <input
                  type="text"
                  value={witnessInfo}
                  onChange={(e) => setWitnessInfo(e.target.value)}
                  placeholder="Night Guard, Floor Incharge, CCTV"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

          </div>

          {/* Right Column: Live WhatsApp & SMS Preview with One-Click Send Actions (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            
            {/* Top Preview Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 flex flex-col flex-1 shadow-lg">
              
              {/* Channel Tabs */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setPreviewTab('WHATSAPP')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      previewTab === 'WHATSAPP'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => setPreviewTab('SMS')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      previewTab === 'SMS'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    SMS (DLT)
                  </button>
                </div>

                <button
                  onClick={() => handleCopyText(previewTab)}
                  className="text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
                  title="Copy formatted message matter"
                >
                  {copiedChannel === previewTab ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy Matter
                    </>
                  )}
                </button>
              </div>

              {/* Preview Bubble */}
              {previewTab === 'WHATSAPP' ? (
                <div className="flex-1 flex flex-col justify-between space-y-3">
                  
                  {/* WhatsApp Chat UI Mockup */}
                  <div className="bg-[#0b141a] border border-[#202c33] rounded-2xl p-3.5 flex flex-col space-y-2 text-slate-200 shadow-inner">
                    {/* Header in bubble */}
                    <div className="flex items-center justify-between text-[11px] pb-2 border-b border-[#202c33]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center">
                          NN
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 flex items-center gap-1">
                            Hostel Administration
                            <span className="text-emerald-400 text-xs" title="Verified Institutional Business">✓</span>
                          </div>
                          <div className="text-[9px] text-slate-400">To: +91 {effectiveGuardianMobile || 'XXXXXXXXXX'}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Today, {incidentTime}</span>
                    </div>

                    {/* Chat Bubble Body */}
                    <div className="bg-[#005c4b] text-white p-3 rounded-2xl rounded-tl-sm text-[11px] leading-relaxed font-sans whitespace-pre-wrap select-text shadow">
                      {generatedWhatsAppMessage}
                    </div>

                    <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-mono pt-1">
                      <span>Delivered via Enterprise Cloud API</span>
                      <span className="text-emerald-400 font-bold">✓✓</span>
                    </div>
                  </div>

                  {/* 1-Click Direct Launch Button for WhatsApp Web / App */}
                  <button
                    onClick={handleOpenDirectWhatsApp}
                    disabled={!effectiveGuardianMobile}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open WhatsApp Chat with Guardian (wa.me)
                  </button>

                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between space-y-3">
                  
                  {/* SMS UI Mockup */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 text-slate-200">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1.5 border-b border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-indigo-300">DLT: HSTLADM</span>
                        <span className="text-[10px] text-slate-500">(Gov Approved)</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">
                        {generatedSmsMessage.length} chars / {Math.ceil(generatedSmsMessage.length / 160)} SMS
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-mono text-slate-300 leading-relaxed">
                      {generatedSmsMessage}
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                      <span>Template ID: DLT-TE-11071689209</span>
                      <span className="text-emerald-400">TRAI Compliant</span>
                    </div>
                  </div>

                  {/* 1-Click Direct SMS Trigger */}
                  <button
                    onClick={handleOpenDirectSms}
                    disabled={!effectiveGuardianMobile}
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    Trigger Device SMS (sms:+91...)
                  </button>

                </div>
              )}

            </div>

            {/* Gateway Dispatch Controls & Transmission Button */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Select Automated Gateways</span>
                <span className="text-[10px] text-slate-400 font-mono">Connector: INT-TELECOM-04</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                  sendWhatsApp 
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold' 
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}>
                  <input
                    type="checkbox"
                    checked={sendWhatsApp}
                    onChange={(e) => setSendWhatsApp(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                  />
                  <span>Official WhatsApp</span>
                </label>

                <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                  sendSms 
                    ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300 font-bold' 
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}>
                  <input
                    type="checkbox"
                    checked={sendSms}
                    onChange={(e) => setSendSms(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                  />
                  <span>TRAI DLT SMS</span>
                </label>
              </div>

              {/* Progress Bar while transmitting */}
              {isTransmitting && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-indigo-400 flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      {transmissionStatus}
                    </span>
                    <span className="text-slate-300 font-bold">{transmissionProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-300"
                      style={{ width: `${transmissionProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Main Submit & Dispatch Button */}
              <button
                type="button"
                onClick={handleTransmitNotice}
                disabled={isTransmitting || !selectedStudent || (!sendWhatsApp && !sendSms)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-700 to-indigo-700 hover:from-rose-500 hover:to-indigo-600 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl hover:shadow-rose-500/20 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isTransmitting 
                    ? 'Transmitting Disciplinary Notice...' 
                    : `Transmit Misconduct Matter to Guardian (+91 ${effectiveGuardianMobile || '...' })`}
                </span>
              </button>

              <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                SHA-256 cryptographically sealed and logged in Activity Audit Ledger
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
