import React, { useState, useMemo } from 'react';
import { Student, Room, DisciplinaryIncident, MisconductCategory, MisconductSeverity } from '../types';
import { 
  Search, Plus, UserPlus, Filter, ShieldCheck, ArrowLeftRight, CreditCard, 
  Eye, Edit3, Trash2, CheckCircle2, AlertCircle, Phone, Mail, MapPin, 
  Car, FileText, Download, Building2, AlertOctagon, FolderLock, FileCheck, Check,
  Bell, Send, CheckSquare, Square, Smartphone, Zap, Sparkles, MessageSquare, X,
  ShieldAlert, AlertTriangle, ExternalLink, Printer, Scale, RefreshCw, MessageCircle
} from 'lucide-react';

interface StudentManagerProps {
  students?: Student[];
  rooms?: Room[];
  disciplinaryIncidents?: DisciplinaryIncident[];
  onAddStudent?: (student: Omit<Student, 'id'>) => void;
  onUpdateStudent?: (student: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
  onOpenPoliceModal?: (student: Student) => void;
  onInitiatePoliceVerification?: (student: Student) => void;
  onOpenSwapModal?: (student: Student) => void;
  onInitiateRoomSwap?: (student: Student) => void;
  onOpenMessPayModal?: (student: Student) => void;
  onOpenDocumentVault?: (student: Student) => void;
  onOpenComplaintModal?: (student: Student) => void;
  onOpenMisconductModal?: (student?: Student) => void;
  onUpdateIncident?: (incident: DisciplinaryIncident) => void;
  onTriggerSync?: (source: 'EXE_DESKTOP' | 'APK_MOBILE', action: string, details: string) => void;
}

export const StudentManager: React.FC<StudentManagerProps> = ({
  students = [],
  rooms = [],
  disciplinaryIncidents = [],
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onOpenPoliceModal,
  onInitiatePoliceVerification,
  onOpenSwapModal,
  onInitiateRoomSwap,
  onOpenMessPayModal,
  onOpenDocumentVault,
  onOpenComplaintModal,
  onOpenMisconductModal,
  onUpdateIncident,
  onTriggerSync,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'DIRECTORY' | 'DISCIPLINARY'>('DIRECTORY');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedVerification, setSelectedVerification] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Disciplinary Filters & Incident Viewer Modal
  const [selectedIncidentDetail, setSelectedIncidentDetail] = useState<DisciplinaryIncident | null>(null);
  const [discFilterCategory, setDiscFilterCategory] = useState<string>('ALL');
  const [discFilterSeverity, setDiscFilterSeverity] = useState<string>('ALL');
  const [discFilterStatus, setDiscFilterStatus] = useState<string>('ALL');
  const [discSearchTerm, setDiscSearchTerm] = useState('');


  // Multi-select & Bulk Notification State
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [showBulkNotifyModal, setShowBulkNotifyModal] = useState(false);
  const [bulkNotificationType, setBulkNotificationType] = useState<
    'FEE_REMINDER' | 'POLICE_VERIFICATION' | 'INSPECTION' | 'MESS_UPDATE' | 'CUSTOM'
  >('FEE_REMINDER');
  const [bulkCustomTitle, setBulkCustomTitle] = useState('');
  const [bulkCustomMessage, setBulkCustomMessage] = useState('');
  const [bulkChannels, setBulkChannels] = useState({
    syncEngine: true,
    smsGateway: true,
    whatsApp: true,
  });
  const [bulkToastMessage, setBulkToastMessage] = useState<string | null>(null);

  // Multi-select helpers
  const handleToggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredStudents.map((s) => s.id);
    const allSelected = filteredIds.every((id) => selectedStudentIds.includes(id));
    if (allSelected) {
      setSelectedStudentIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleSelectWithPendingFees = () => {
    const feeDueIds = filteredStudents.filter((s) => s.feeBalance > 0 || s.messBalance > 0).map((s) => s.id);
    setSelectedStudentIds(feeDueIds);
    setBulkNotificationType('FEE_REMINDER');
  };

  const handleSelectPendingPolice = () => {
    const pendingIds = filteredStudents.filter((s) => s.policeVerificationStatus !== 'VERIFIED').map((s) => s.id);
    setSelectedStudentIds(pendingIds);
    setBulkNotificationType('POLICE_VERIFICATION');
  };

  const selectedStudents = useMemo(() => {
    return students.filter((s) => selectedStudentIds.includes(s.id));
  }, [students, selectedStudentIds]);

  // Filtered Disciplinary Incidents Memo
  const filteredIncidents = useMemo(() => {
    return disciplinaryIncidents.filter((inc) => {
      const matchSearch =
        discSearchTerm === '' ||
        inc.studentName.toLowerCase().includes(discSearchTerm.toLowerCase()) ||
        inc.studentRoll.toLowerCase().includes(discSearchTerm.toLowerCase()) ||
        inc.incidentNumber.toLowerCase().includes(discSearchTerm.toLowerCase()) ||
        inc.guardianMobile.includes(discSearchTerm) ||
        inc.matterDescription.toLowerCase().includes(discSearchTerm.toLowerCase());

      const matchCat = discFilterCategory === 'ALL' || inc.category === discFilterCategory;
      const matchSev = discFilterSeverity === 'ALL' || inc.severity === discFilterSeverity;
      const matchStatus = discFilterStatus === 'ALL' || inc.status === discFilterStatus;

      return matchSearch && matchCat && matchSev && matchStatus;
    });
  }, [disciplinaryIncidents, discSearchTerm, discFilterCategory, discFilterSeverity, discFilterStatus]);

  // Handle Parent Acknowledgment Toggle
  const handleToggleParentAck = (incident: DisciplinaryIncident) => {
    if (!onUpdateIncident) return;
    const isAck = !incident.parentAcknowledged;
    onUpdateIncident({
      ...incident,
      parentAcknowledged: isAck,
      status: isAck ? 'GUARDIAN_RESOLVED' : 'NOTICE_SERVED',
      parentAcknowledgmentNotes: isAck 
        ? `Guardian acknowledged and verified on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString()} IST.`
        : undefined,
    });
  };

  // Handle Dispatch of Bulk Notification
  const handleDispatchNotification = () => {
    if (selectedStudents.length === 0) return;

    const channelList: string[] = [];
    if (bulkChannels.syncEngine) channelList.push('Cross-Platform Sync Engine');
    if (bulkChannels.smsGateway) channelList.push('SMS Gateway');
    if (bulkChannels.whatsApp) channelList.push('WhatsApp Bot');

    let templateTitle = '';
    let templateSummary = '';

    if (bulkNotificationType === 'FEE_REMINDER') {
      const totalDue = selectedStudents.reduce((acc, s) => acc + s.feeBalance + s.messBalance, 0);
      templateTitle = 'HOSTEL_FEE_MESS_DUE_REMINDER';
      templateSummary = `Fee payment reminder issued to ${selectedStudents.length} residents (Total pending: ₹${totalDue.toLocaleString('en-IN')}). UPI & Bank gateway links attached.`;
    } else if (bulkNotificationType === 'POLICE_VERIFICATION') {
      templateTitle = 'POLICE_VERIFICATION_KYC_NOTICE';
      templateSummary = `Statutory police tenant verification request issued to ${selectedStudents.length} residents. Form #2 download and submission mandate broadcasted.`;
    } else if (bulkNotificationType === 'INSPECTION') {
      templateTitle = 'HOSTEL_ROOM_INSPECTION_ADVISORY';
      templateSummary = `Hostel floor inspection and safety compliance advisory broadcasted to ${selectedStudents.length} residents.`;
    } else if (bulkNotificationType === 'MESS_UPDATE') {
      templateTitle = 'MESS_MENU_DINING_SCHEDULE_UPDATE';
      templateSummary = `Mess committee dining update and weekly menu notification dispatched to ${selectedStudents.length} residents.`;
    } else {
      templateTitle = (bulkCustomTitle || 'HOSTEL_GENERAL_CIRCULAR').toUpperCase().replace(/\s+/g, '_');
      templateSummary = bulkCustomMessage || `Custom hostel administrative bulletin dispatched to ${selectedStudents.length} residents.`;
    }

    if (onTriggerSync) {
      onTriggerSync(
        'EXE_DESKTOP',
        templateTitle,
        `${templateSummary} [Dispatched across: ${channelList.join(', ')}]`
      );
    }

    setBulkToastMessage(
      `Dispatched "${templateTitle}" to ${selectedStudents.length} residents via ${channelList.join(', ')}!`
    );

    setShowBulkNotifyModal(false);
    setSelectedStudentIds([]);
    setBulkCustomTitle('');
    setBulkCustomMessage('');

    setTimeout(() => {
      setBulkToastMessage(null);
    }, 5000);
  };
  const [formData, setFormData] = useState({
    rollNumber: '',
    name: '',
    email: '',
    mobile: '',
    guardianName: '',
    guardianMobile: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    department: 'Computer Science & Engineering',
    yearOfStudy: 1,
    bloodGroup: 'O+',
    permanentAddress: '',
    city: '',
    state: '',
    pincode: '',
    aadharNumber: '',
    panNumber: '',
    collegeIdCardNumber: '',
    companyNameOrCollege: 'Indian Institute of Information Technology',
    vehicleNumber: '',
    hostelId: 'H1',
    hostelName: 'Native Nest Residence Hall A',
    roomNumber: '',
    bedNumber: 'Bed-1',
    allotmentDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE' as 'ACTIVE' | 'ON_LEAVE' | 'VACATED' | 'SUSPENDED',
    policeStation: 'City Police Station',
    depositAmount: 15000,
    feeBalance: 0,
    messBalance: 0,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Dynamic unique department options extracted from current students
  const departmentOptions = useMemo(() => {
    const defaultDepts = [
      'Computer Science & Engineering',
      'Information Technology',
      'Electronics & Communication',
      'Mechanical Engineering',
      'Civil Engineering',
      'Commerce & Management',
      'Data Science & AI',
    ];
    const existingDepts = students.map((s) => s.department).filter(Boolean);
    return Array.from(new Set([...defaultDepts, ...existingDepts]));
  }, [students]);

  // Fast search-as-you-type filter
  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      s.name.toLowerCase().includes(term) ||
      s.rollNumber.toLowerCase().includes(term) ||
      s.roomNumber.toLowerCase().includes(term) ||
      s.department.toLowerCase().includes(term) ||
      s.mobile.includes(term) ||
      (s.vehicleNumber && s.vehicleNumber.toLowerCase().includes(term)) ||
      s.city.toLowerCase().includes(term) ||
      (s.aadharNumber && s.aadharNumber.toLowerCase().includes(term)) ||
      (s.panNumber && s.panNumber.toLowerCase().includes(term));

    const matchesDept = selectedDepartment === 'ALL' || s.department === selectedDepartment;
    const matchesYear = selectedYear === 'ALL' || s.yearOfStudy.toString() === selectedYear;
    const matchesVerif = selectedVerification === 'ALL' || s.policeVerificationStatus === selectedVerification;

    return matchesSearch && matchesDept && matchesYear && matchesVerif;
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.rollNumber.trim()) {
      errors.rollNumber = 'Roll number is mandatory';
    }

    if (!formData.name.trim()) {
      errors.name = 'Student name is required';
    }

    if (!formData.department.trim()) {
      errors.department = 'Department name is mandatory';
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.mobile.trim())) {
      errors.mobile = 'Enter a valid 10-digit Indian mobile number (e.g., 9876543210)';
    }

    if (!phoneRegex.test(formData.guardianMobile.trim())) {
      errors.guardianMobile = 'Enter a valid 10-digit guardian mobile number';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Valid institutional email is required';
    }

    const pinRegex = /^[1-9][0-9]{5}$/;
    if (formData.pincode && !pinRegex.test(formData.pincode.trim())) {
      errors.pincode = 'Valid 6-digit Indian PIN code required';
    }

    if (formData.vehicleNumber && formData.vehicleNumber.trim()) {
      const vehicleRegex = /^[A-Z]{2}[-\s]?[0-9]{1,2}[-\s]?[A-Z]{1,3}[-\s]?[0-9]{4}$/i;
      if (!vehicleRegex.test(formData.vehicleNumber.trim())) {
        errors.vehicleNumber = 'Invalid Indian vehicle registration format (e.g., RJ-14-EA-9921)';
      }
    }

    if (!formData.roomNumber) {
      errors.roomNumber = 'Room allotment is mandatory';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      rollNumber: student.rollNumber,
      name: student.name,
      email: student.email,
      mobile: student.mobile,
      guardianName: student.guardianName,
      guardianMobile: student.guardianMobile,
      gender: student.gender,
      department: student.department,
      yearOfStudy: student.yearOfStudy,
      bloodGroup: student.bloodGroup || 'O+',
      permanentAddress: student.permanentAddress,
      city: student.city,
      state: student.state,
      pincode: student.pincode,
      aadharNumber: student.aadharNumber || '',
      panNumber: student.panNumber || '',
      collegeOrCompanyId: student.collegeOrCompanyId || '',
      institutionOrEmployerName: student.institutionOrEmployerName || 'Indian Institute of Information Technology',
      vehicleNumber: student.vehicleNumber || '',
      hostelId: student.hostelId || 'H1',
      hostelName: student.hostelName || 'Himalaya Residence Hall A',
      roomNumber: student.roomNumber,
      bedNumber: student.bedNumber,
      allotmentDate: student.allotmentDate,
      status: student.status,
      policeStation: student.policeStation || 'City Police Station',
      depositAmount: student.depositAmount || 15000,
      feeBalance: student.feeBalance || 0,
      messBalance: student.messBalance || 0,
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleCreateClick = () => {
    setEditingStudent(null);
    setFormData({
      rollNumber: '',
      name: '',
      email: '',
      mobile: '',
      guardianName: '',
      guardianMobile: '',
      gender: 'MALE',
      department: 'Computer Science & Engineering',
      yearOfStudy: 1,
      bloodGroup: 'O+',
      permanentAddress: '',
      city: '',
      state: '',
      pincode: '',
      aadharNumber: '',
      panNumber: '',
      collegeOrCompanyId: '',
      institutionOrEmployerName: 'Indian Institute of Information Technology',
      vehicleNumber: '',
      hostelId: 'H1',
      hostelName: 'Himalaya Residence Hall A',
      roomNumber: rooms[0]?.roomNumber || '',
      bedNumber: 'Bed-1',
      allotmentDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      policeStation: 'City Police Station',
      depositAmount: 15000,
      feeBalance: 0,
      messBalance: 0,
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingStudent) {
      if (onUpdateStudent) {
        onUpdateStudent({
          ...editingStudent,
          ...formData,
        });
      }
    } else {
      if (onAddStudent) {
        onAddStudent({
          ...formData,
          documents: [],
          policeVerificationStatus: 'PENDING',
        });
      }
    }

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Navigation Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                CAMPUS PROTOCOL COMPLIANT
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                <Smartphone className="w-3 h-3" /> WhatsApp &amp; SMS DLT Linked
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              Resident Student Management &amp; Disciplinary Protocol Hub
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Aadhaar &amp; identity vault, police compliance, room association, and instant automated WhatsApp/SMS misconduct dispatches to parents.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onOpenMisconductModal?.()}
              className="px-3.5 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/25 cursor-pointer transition-all border border-rose-500/30"
              title="Issue Formal Misconduct Notice & Alert Guardian via WhatsApp / SMS"
            >
              <ShieldAlert className="w-4 h-4 text-white" />
              <span>Issue Disciplinary Notice</span>
            </button>
            <button
              onClick={handleCreateClick}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer transition-colors"
            >
              <UserPlus className="w-4 h-4" /> Admit Resident
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="mt-5 flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveSubTab('DIRECTORY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'DIRECTORY'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Resident Directory</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60 text-slate-300">
              {students.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('DISCIPLINARY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'DISCIPLINARY'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Guardian Misconduct &amp; SMS/WhatsApp Notices</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-950/80 text-rose-300 font-mono border border-rose-500/30">
              {disciplinaryIncidents.length}
            </span>
          </button>
        </div>

        {/* Search & Filter Bar (Only for Directory Tab) */}
        {activeSubTab === 'DIRECTORY' && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, roll, room, Aadhaar..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Departments ({students.length})</option>
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Academic Years</option>
              <option value="1">1st Year (Freshers)</option>
              <option value="2">2nd Year (Sophomores)</option>
              <option value="3">3rd Year (Juniors)</option>
              <option value="4">4th Year (Seniors)</option>
            </select>

            <select
              value={selectedVerification}
              onChange={(e) => setSelectedVerification(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Police Status</option>
              <option value="VERIFIED">✓ Verified by Police</option>
              <option value="GENERATED">📄 Form Ready for Sign</option>
              <option value="PENDING">⚠️ Verification Pending</option>
            </select>
          </div>
        )}
      </div>

      {/* DIRECTORY VIEW */}
      {activeSubTab === 'DIRECTORY' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Notification Toast Alert */}
          {bulkToastMessage && (
            <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-200 animate-fadeIn">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{bulkToastMessage}</span>
              </div>
              <button
                onClick={() => setBulkToastMessage(null)}
                className="text-emerald-400 hover:text-emerald-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

        {/* Multi-Selection Sticky Action Bar */}
        {selectedStudentIds.length > 0 && (
          <div className="mt-4 p-3.5 bg-gradient-to-r from-indigo-950/90 via-slate-900 to-indigo-950/90 border border-indigo-500/40 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-fadeIn shadow-lg">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow">
                {selectedStudentIds.length}
              </span>
              <div>
                <span className="text-xs font-bold text-slate-100">
                  {selectedStudentIds.length} {selectedStudentIds.length === 1 ? 'Resident' : 'Residents'} Selected
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Targeted for batch broadcast and synchronization
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSelectWithPendingFees}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
              >
                Select Fee Dues ({filteredStudents.filter((s) => s.feeBalance > 0 || s.messBalance > 0).length})
              </button>
              <button
                type="button"
                onClick={handleSelectPendingPolice}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
              >
                Select Pending Police ({filteredStudents.filter((s) => s.policeVerificationStatus !== 'VERIFIED').length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedStudentIds([])}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Clear Selection
              </button>
              <button
                type="button"
                onClick={() => setShowBulkNotifyModal(true)}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Send Bulk Notification</span>
              </button>
            </div>
          </div>
        )}

        {/* Student Table */}
        <div className="mt-4 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-3 py-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredStudents.length > 0 &&
                      filteredStudents.every((s) => selectedStudentIds.includes(s.id))
                    }
                    onChange={handleSelectAllFiltered}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer accent-indigo-600"
                    title="Select / Deselect all filtered residents"
                  />
                </th>
                <th className="px-4 py-3">Resident &amp; Roll #</th>
                <th className="px-4 py-3">Room &amp; Bed</th>
                <th className="px-4 py-3">Identity Docs Vault</th>
                <th className="px-4 py-3">Police Compliance</th>
                <th className="px-4 py-3">Fee / Mess Balance</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.map((s) => {
                const isSelected = selectedStudentIds.includes(s.id);
                const hasAadhaar = Boolean(s.aadharNumber || (s.documents && s.documents.some(d => d.type === 'AADHAAR_CARD')));
                const hasPan = Boolean(s.panNumber || (s.documents && s.documents.some(d => d.type === 'PAN_CARD')));
                const hasCollegeId = Boolean(s.collegeIdCardNumber || (s.documents && s.documents.some(d => d.type === 'COLLEGE_ID' || d.type === 'COMPANY_ID')));

                return (
                  <tr
                    key={s.id}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-indigo-950/30 hover:bg-indigo-950/40'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="px-3 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectStudent(s.id)}
                        className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer accent-indigo-600"
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center">
                          {s.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100">{s.name}</div>
                          <span className="text-[11px] font-mono text-slate-400">{s.rollNumber}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-slate-800 font-bold text-slate-200 flex items-center justify-center">
                          {s.roomNumber}
                        </span>
                        <div>
                          <span className="text-slate-300 font-semibold">{s.bedNumber}</span>
                          <span className="text-[10px] text-slate-500 block">Since {s.allotmentDate}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 ${
                          hasAadhaar ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {hasAadhaar ? '✓ Aadhaar' : '✕ Aadhaar'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 ${
                          hasPan ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {hasPan ? '✓ PAN' : '✕ PAN'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 ${
                          hasCollegeId ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {hasCollegeId ? '✓ ID Card' : '✕ ID Card'}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      {s.policeVerificationStatus === 'VERIFIED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      ) : s.policeVerificationStatus === 'GENERATED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                          <FileText className="w-3 h-3" />
                          Form Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                          <AlertCircle className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        <div className="text-[11px]">
                          <span className="text-slate-500">Hostel Fee: </span>
                          <strong className={s.feeBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                            {s.feeBalance > 0 ? `₹${s.feeBalance.toLocaleString()}` : 'Cleared'}
                          </strong>
                        </div>
                        <div className="text-[11px]">
                          <span className="text-slate-500">Mess: </span>
                          <strong className={s.messBalance > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                            {s.messBalance > 0 ? `₹${s.messBalance.toLocaleString()}` : '₹0'}
                          </strong>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Issue Disciplinary Misconduct Notice to Guardian (WhatsApp & SMS) */}
                        <button
                          onClick={() => onOpenMisconductModal?.(s)}
                          title="Issue Misconduct Notice & Alert Guardian via WhatsApp / SMS"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600/20 text-rose-400 border border-slate-700 hover:border-rose-500/40 transition-colors cursor-pointer"
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>

                        {/* ID Vault Modal */}
                        <button
                          onClick={() => onOpenDocumentVault?.(s)}
                          title="Manage Aadhaar / PAN / College ID Vault"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/20 text-indigo-400 border border-slate-700 hover:border-indigo-500/40 transition-colors cursor-pointer"
                        >
                          <FolderLock className="w-4 h-4" />
                        </button>

                        {/* Lodge Grievance / Complaint */}
                        <button
                          onClick={() => onOpenComplaintModal?.(s)}
                          title="Lodge Resident Grievance / Complaint"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600/20 text-rose-400 border border-slate-700 hover:border-rose-500/40 transition-colors cursor-pointer"
                        >
                          <AlertOctagon className="w-4 h-4" />
                        </button>

                        {/* Police Verification Button */}
                        <button
                          onClick={() => (onOpenPoliceModal ? onOpenPoliceModal(s) : onInitiatePoliceVerification?.(s))}
                          title="Police Verification (Form & Digital Sign)"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-600/20 text-amber-400 border border-slate-700 hover:border-amber-500/40 transition-colors cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>

                        {/* Room Swap / Shift Button */}
                        <button
                          onClick={() => (onOpenSwapModal ? onOpenSwapModal(s) : onInitiateRoomSwap?.(s))}
                          title="Shift or Swap Room"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600/20 text-blue-400 border border-slate-700 hover:border-blue-500/40 transition-colors cursor-pointer"
                        >
                          <ArrowLeftRight className="w-4 h-4" />
                        </button>

                        {/* Edit Details */}
                        <button
                          onClick={() => handleEditClick(s)}
                          title="Update Student Records"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete/Vacate Record Button */}
                        {onDeleteStudent && (
                          <button
                            type="button"
                            onClick={() => setStudentToDelete(s)}
                            title="Vacate Bed & Remove Record"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-rose-400 border border-slate-700 hover:border-rose-500/40 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* GUARDIAN MISCONDUCT & DISCIPLINARY NOTICES HUB */}
      {activeSubTab === 'DISCIPLINARY' && (
        <div className="space-y-5 animate-fadeIn">
          {/* KPI Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Notices Dispatched</div>
                <div className="text-xl font-black text-slate-100 mt-0.5">{disciplinaryIncidents.length}</div>
                <div className="text-[10px] text-rose-400">Official Guardian Records</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">WhatsApp Dispatches</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">
                  {disciplinaryIncidents.filter(i => i.whatsAppStatus === 'DELIVERED' || i.whatsAppStatus === 'READ').length}
                </div>
                <div className="text-[10px] text-slate-400">Direct Parent WhatsApp Alert</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">TRAI DLT SMS Gateway</div>
                <div className="text-xl font-black text-purple-400 mt-0.5">
                  {disciplinaryIncidents.filter(i => i.smsStatus === 'DELIVERED' || i.smsStatus === 'SENT').length}
                </div>
                <div className="text-[10px] text-slate-400">Header: NVNEST-DISC</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Escalated / Summons</div>
                <div className="text-xl font-black text-amber-400 mt-0.5">
                  {disciplinaryIncidents.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH').length}
                </div>
                <div className="text-[10px] text-amber-400/90">Warden Hearing Required</div>
              </div>
            </div>
          </div>

          {/* Disciplinary Search & Filters */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={discSearchTerm}
                  onChange={(e) => setDiscSearchTerm(e.target.value)}
                  placeholder="Search student, roll, guardian mobile, ref..."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <select
                value={discFilterCategory}
                onChange={(e) => setDiscFilterCategory(e.target.value)}
                className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="ALL">All Misconduct Categories</option>
                <option value="CURFEW_VIOLATION">Curfew &amp; Gate Breach</option>
                <option value="UNAUTHORIZED_GUEST">Unauthorized Overnight Guest</option>
                <option value="SUBSTANCE_ALCOHOL">Substance / Alcohol Contraband</option>
                <option value="NOISE_DISTURBANCE">Quiet Hours / Noise Disturbance</option>
                <option value="PROPERTY_DAMAGE">Hostel Property Damage</option>
                <option value="RAGGING_BULLYING">Anti-Ragging / Bullying</option>
                <option value="INSUBORDINATION">Insubordination to Staff</option>
                <option value="MESS_DISCIPLINE">Mess Protocol Violation</option>
                <option value="ELECTRICAL_SAFETY">Electrical / Fire Hazard</option>
                <option value="OTHER">Other Misconduct</option>
              </select>

              <select
                value={discFilterSeverity}
                onChange={(e) => setDiscFilterSeverity(e.target.value)}
                className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="ALL">All Severities</option>
                <option value="LOW">Low (Verbal Warning / 1st Notice)</option>
                <option value="MODERATE">Moderate (Written Warning / Fine)</option>
                <option value="HIGH">High (Parent Summons / Fine &gt;₹1k)</option>
                <option value="CRITICAL">Critical (Expulsion Hearing)</option>
              </select>

              <select
                value={discFilterStatus}
                onChange={(e) => setDiscFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="ALL">All Incident Statuses</option>
                <option value="NOTICE_SERVED">Notice Served to Guardian</option>
                <option value="GUARDIAN_ACKNOWLEDGED">Parent Acknowledged</option>
                <option value="UNDER_INVESTIGATION">Under Investigation</option>
                <option value="FINE_COLLECTED">Fine Collected</option>
                <option value="GUARDIAN_RESOLVED">Resolved with Guardian</option>
              </select>
            </div>
          </div>

          {/* Incidents Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="px-5 py-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-slate-200">
                  Disciplinary Misconduct Ledger &amp; Guardian Delivery Log ({filteredIncidents.length})
                </span>
              </div>
              <button
                onClick={() => onOpenMisconductModal?.()}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Misconduct Notice</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Incident Ref</th>
                    <th className="px-4 py-3">Resident &amp; Room</th>
                    <th className="px-4 py-3">Guardian Contact</th>
                    <th className="px-4 py-3">Category &amp; Severity</th>
                    <th className="px-4 py-3">Matter Sent to Guardian</th>
                    <th className="px-4 py-3 text-center">WhatsApp Delivery</th>
                    <th className="px-4 py-3 text-center">SMS DLT Delivery</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredIncidents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <ShieldCheck className="w-8 h-8 text-emerald-500/40" />
                          <p className="text-xs font-medium text-slate-400">No disciplinary incidents match the selected filters.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredIncidents.map((inc) => (
                      <tr key={inc.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-[11px] text-slate-300">
                          <div className="font-bold text-rose-400">{inc.incidentNumber}</div>
                          <div className="text-[10px] text-slate-500">{new Date(inc.incidentDate).toLocaleDateString('en-IN')} {inc.incidentTime}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-100">{inc.studentName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Roll: {inc.studentRoll} &bull; Room {inc.roomNumber}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-200">{inc.guardianName}</div>
                          <div className="text-[10px] text-indigo-300 flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            +91 {inc.guardianMobile}
                          </div>
                          <div className="text-[9px] text-slate-500 uppercase">{inc.guardianRelation}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {inc.category.replace(/_/g, ' ')}
                          </div>
                          <div className="mt-1">
                            <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              inc.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                              inc.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              inc.severity === 'MODERATE' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                              'bg-slate-700 text-slate-300'
                            }`}>
                              {inc.severity} SEVERITY
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 max-w-xs">
                          <p className="text-[11px] text-slate-300 line-clamp-2 italic">
                            "{inc.matterDescription}"
                          </p>
                          {inc.actionTaken && (
                            <div className="text-[10px] text-rose-400 font-medium mt-0.5">
                              Sanction: {inc.actionTaken}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                            <MessageSquare className="w-3 h-3 text-emerald-400" />
                            {inc.whatsAppStatus}
                          </span>
                          <div className="text-[9px] text-slate-500 font-mono mt-0.5">Meta API Logged</div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-500/30">
                            <Smartphone className="w-3 h-3 text-purple-400" />
                            {inc.smsStatus}
                          </span>
                          <div className="text-[9px] text-slate-500 font-mono mt-0.5">{inc.smsDltTemplateId || 'DLT-1107'}</div>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedIncidentDetail(inc)}
                              title="View Full Matter &amp; Audit Certificate"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/20 text-indigo-400 border border-slate-700 hover:border-indigo-500/40 transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <a
                              href={`https://wa.me/91${inc.guardianMobile.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `*OFFICIAL DISCIPLINARY NOTICE - NATIVE NEST RESIDENCE HALL*\n\nIncident Ref: ${inc.incidentNumber}\nStudent: ${inc.studentName} (Roll: ${inc.studentRoll}, Room: ${inc.roomNumber})\nCategory: ${inc.category}\n\n*Matter Details:*\n${inc.matterDescription}\n\nAction Imposed: ${inc.actionTaken || 'Formal Warning Recorded'}\n\nChief Warden Office\nContact: +91 94250 12345`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Direct WhatsApp to Guardian"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600/20 text-emerald-400 border border-slate-700 hover:border-emerald-500/40 transition-colors cursor-pointer"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </a>

                            <button
                              onClick={() => handleToggleParentAck(inc)}
                              title={inc.parentAcknowledged ? "Mark Pending Parent Acknowledgment" : "Mark Parent Acknowledged"}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                inc.parentAcknowledged
                                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900/40'
                                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-emerald-400'
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* Modal: Admit or Edit Student Form */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    {editingStudent ? 'Update Student Record' : 'Admit New Hostel Resident'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Aadhaar, PAN, and College/Company ID mapping with Police Verification
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Section 1: Academic & Identity */}
              <div>
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">
                  1. Academic &amp; Identity Particulars
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">University Roll Number *</label>
                    <input
                      type="text"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      placeholder="e.g. 2026-CS-101"
                      className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none ${
                        formErrors.rollNumber ? 'border-rose-500' : 'border-slate-700 focus:border-indigo-500'
                      }`}
                    />
                    {formErrors.rollNumber && <p className="text-[10px] text-rose-400 mt-1">{formErrors.rollNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Student full legal name"
                      className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none ${
                        formErrors.name ? 'border-rose-500' : 'border-slate-700 focus:border-indigo-500'
                      }`}
                    />
                    {formErrors.name && <p className="text-[10px] text-rose-400 mt-1">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Department *</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g. Computer Science, Mechanical, IT, MBA, Commerce"
                      className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none ${
                        formErrors.department ? 'border-rose-500' : 'border-slate-700 focus:border-indigo-500'
                      }`}
                    />
                    {formErrors.department && <p className="text-[10px] text-rose-400 mt-1">{formErrors.department}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Year of Study *</label>
                    <select
                      value={formData.yearOfStudy}
                      onChange={(e) => setFormData({ ...formData, yearOfStudy: parseInt(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value={1}>1st Year (Freshman)</option>
                      <option value={2}>2nd Year (Sophomore)</option>
                      <option value={3}>3rd Year (Junior)</option>
                      <option value={4}>4th Year (Senior)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Gender &amp; Blood Group</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                        className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                      <select
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                        className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="O+">O+</option>
                        <option value="A+">A+</option>
                        <option value="B+">B+</option>
                        <option value="AB+">AB+</option>
                        <option value="O-">O-</option>
                        <option value="A-">A-</option>
                        <option value="B-">B-</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">College / Company / Employer</label>
                    <input
                      type="text"
                      value={formData.companyNameOrCollege}
                      onChange={(e) => setFormData({ ...formData, companyNameOrCollege: e.target.value })}
                      placeholder="e.g. IIIT / Infosys / TCS"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Statutory Identity & Verification Documents */}
              <div>
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">
                  2. Statutory Identity Numbers (Mapped to Police Verification)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Aadhaar Card (12 Digits)</label>
                    <input
                      type="text"
                      value={formData.aadharNumber}
                      onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                      placeholder="XXXX-XXXX-1234"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">PAN Card (10 Chars)</label>
                    <input
                      type="text"
                      value={formData.panNumber}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                      placeholder="ABCDE1234F"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">College / Company ID #</label>
                    <input
                      type="text"
                      value={formData.collegeIdCardNumber}
                      onChange={(e) => setFormData({ ...formData, collegeIdCardNumber: e.target.value })}
                      placeholder="ID-2026-CS-99"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Contact & Emergency Details */}
              <div>
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">
                  3. Contact &amp; Vehicle Registration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Student Mobile (10 Digits) *</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none ${
                        formErrors.mobile ? 'border-rose-500' : 'border-slate-700 focus:border-indigo-500'
                      }`}
                    />
                    {formErrors.mobile && <p className="text-[10px] text-rose-400 mt-1">{formErrors.mobile}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Institutional Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="student@hostel-erp.edu"
                      className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none ${
                        formErrors.email ? 'border-rose-500' : 'border-slate-700 focus:border-indigo-500'
                      }`}
                    />
                    {formErrors.email && <p className="text-[10px] text-rose-400 mt-1">{formErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Vehicle Registration #</label>
                    <input
                      type="text"
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                      placeholder="e.g. RJ-14-EA-9921"
                      className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none font-mono ${
                        formErrors.vehicleNumber ? 'border-rose-500' : 'border-slate-700 focus:border-indigo-500'
                      }`}
                    />
                    {formErrors.vehicleNumber && <p className="text-[10px] text-rose-400 mt-1">{formErrors.vehicleNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Guardian Name *</label>
                    <input
                      type="text"
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      placeholder="Parent / Legal guardian"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Guardian Mobile *</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={formData.guardianMobile}
                      onChange={(e) => setFormData({ ...formData, guardianMobile: e.target.value })}
                      placeholder="e.g. 9876500000"
                      className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none ${
                        formErrors.guardianMobile ? 'border-rose-500' : 'border-slate-700 focus:border-indigo-500'
                      }`}
                    />
                    {formErrors.guardianMobile && <p className="text-[10px] text-rose-400 mt-1">{formErrors.guardianMobile}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Police Station Jurisdiction</label>
                    <input
                      type="text"
                      value={formData.policeStation}
                      onChange={(e) => setFormData({ ...formData, policeStation: e.target.value })}
                      placeholder="Local Police Station"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Permanent Address */}
              <div>
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">
                  4. Permanent Address (For Police Compliance)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={formData.permanentAddress}
                      onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                      placeholder="House/Plot, Street, Landmark"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">City / District</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Jaipur"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">PIN Code (6 digits) *</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="e.g. 302006"
                      className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none ${
                        formErrors.pincode ? 'border-rose-500' : 'border-slate-700 focus:border-indigo-500'
                      }`}
                    />
                    {formErrors.pincode && <p className="text-[10px] text-rose-400 mt-1">{formErrors.pincode}</p>}
                  </div>
                </div>
              </div>

              {/* Section 5: Room Allotment */}
              <div>
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">
                  5. Hostel Accommodation Allotment
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Allotted Room *</label>
                    <select
                      value={formData.roomNumber}
                      onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Choose Room --</option>
                      {rooms.map((r) => (
                        <option key={r.id} value={r.roomNumber}>
                          Room {r.roomNumber} ({r.type} - {r.occupiedBeds}/{r.totalBeds} Occupied) [{r.status}]
                        </option>
                      ))}
                    </select>
                    {formErrors.roomNumber && <p className="text-[10px] text-rose-400 mt-1">{formErrors.roomNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Bed Identifier</label>
                    <select
                      value={formData.bedNumber}
                      onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      {(() => {
                        const selectedRoom = rooms.find((r) => r.roomNumber === formData.roomNumber);
                        const bedSlots = selectedRoom ? Math.max(1, selectedRoom.totalBeds) : 3;
                        return Array.from({ length: bedSlots }).map((_, i) => (
                          <option key={i} value={`Bed-${i + 1}`}>
                            Bed {i + 1} {i === 0 ? '(Window)' : i === 1 ? '(Door)' : `(Slot ${i + 1})`}
                          </option>
                        ));
                      })()}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Caution Deposit (INR)</label>
                    <input
                      type="number"
                      value={formData.depositAmount}
                      onChange={(e) => setFormData({ ...formData, depositAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Controls */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  {editingStudent ? 'Save & Update Record' : 'Complete Admission & Allot Bed'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* In-App Confirmation Modal: Delete / Vacate Resident */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Vacate &amp; Remove Resident</h3>
                <p className="text-xs text-slate-400">Departure &amp; Bed Release Confirmation</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Resident Name:</span>
                <span className="font-bold text-slate-200">{studentToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Roll Number:</span>
                <span className="font-mono text-slate-300">{studentToDelete.rollNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Department:</span>
                <span className="text-slate-300">{studentToDelete.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Allotment:</span>
                <span className="font-semibold text-indigo-300">Room #{studentToDelete.roomNumber} ({studentToDelete.bedNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hostel Fee Balance:</span>
                <span className={`font-bold ${studentToDelete.feeBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {studentToDelete.feeBalance > 0 ? `₹${studentToDelete.feeBalance.toLocaleString('en-IN')}` : 'Cleared'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mess Fee Balance:</span>
                <span className={`font-bold ${studentToDelete.messBalance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {studentToDelete.messBalance > 0 ? `₹${studentToDelete.messBalance.toLocaleString('en-IN')}` : 'Cleared'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-200">{studentToDelete.name}</strong>? This will release <span className="text-indigo-400 font-semibold">{studentToDelete.bedNumber} in Room {studentToDelete.roomNumber}</span>, mark the bed slot as available, and archive the resident record in the immutable audit log.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteStudent && studentToDelete) {
                    onDeleteStudent(studentToDelete.id);
                  }
                  setStudentToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Confirm &amp; Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Resident Notification & Sync Engine Modal */}
      {showBulkNotifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl w-full max-w-2xl max-h-[92vh] shadow-2xl overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    Bulk Resident Notification &amp; Sync Dispatch
                  </h3>
                  <p className="text-xs text-slate-400">
                    Broadcast simulated multi-channel notices and trigger cross-platform sync packet
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBulkNotifyModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Recipients Badge Overview */}
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Target Recipients ({selectedStudents.length} Selected):
                </span>
                <span className="text-[11px] font-medium text-indigo-400">
                  Total Dues: ₹
                  {selectedStudents
                    .reduce((acc, s) => acc + s.feeBalance + s.messBalance, 0)
                    .toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
                {selectedStudents.map((s) => (
                  <span
                    key={s.id}
                    className="px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700/80 text-[11px] text-slate-300 flex items-center gap-1"
                  >
                    <span className="font-semibold text-slate-200">{s.name}</span>
                    <span className="text-[10px] text-slate-400">({s.roomNumber || 'No Room'})</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Template Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Notification Template / Category:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    id: 'FEE_REMINDER',
                    label: 'Hostel & Mess Fee Due Reminder',
                    desc: 'Prompt payment reminder with total balances',
                  },
                  {
                    id: 'POLICE_VERIFICATION',
                    label: 'Police Tenant KYC Compliance',
                    desc: 'Mandatory verification form submission request',
                  },
                  {
                    id: 'INSPECTION',
                    label: 'Room & Safety Inspection Advisory',
                    desc: 'Notice of upcoming warden room checks',
                  },
                  {
                    id: 'MESS_UPDATE',
                    label: 'Mess Dining Schedule & Menu',
                    desc: 'Meal timing and menu changes announcement',
                  },
                  {
                    id: 'CUSTOM',
                    label: 'Custom Announcement',
                    desc: 'Compose a custom administrative bulletin',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBulkNotificationType(item.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      bulkNotificationType === item.id
                        ? 'bg-indigo-600/15 border-indigo-500 text-slate-100 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-200">{item.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom inputs if Custom is selected */}
            {bulkNotificationType === 'CUSTOM' && (
              <div className="space-y-3 p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Announcement Subject / Title:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Annual Sports Meet & Hostel Gate Timings..."
                    value={bulkCustomTitle}
                    onChange={(e) => setBulkCustomTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Custom Message Content:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Type the message to broadcast to all selected residents..."
                    value={bulkCustomMessage}
                    onChange={(e) => setBulkCustomMessage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Channels Checklist */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Broadcast &amp; Delivery Channels:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label className="flex items-center gap-2 p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl cursor-pointer hover:border-indigo-500/40">
                  <input
                    type="checkbox"
                    checked={bulkChannels.syncEngine}
                    onChange={(e) =>
                      setBulkChannels((prev) => ({ ...prev, syncEngine: e.target.checked }))
                    }
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 accent-indigo-600"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      Sync Engine
                    </div>
                    <div className="text-[10px] text-slate-400">Warden APK &amp; Portal</div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl cursor-pointer hover:border-indigo-500/40">
                  <input
                    type="checkbox"
                    checked={bulkChannels.smsGateway}
                    onChange={(e) =>
                      setBulkChannels((prev) => ({ ...prev, smsGateway: e.target.checked }))
                    }
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 accent-indigo-600"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-emerald-400" />
                      SMS Gateway
                    </div>
                    <div className="text-[10px] text-slate-400">Carrier SMS Alert</div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl cursor-pointer hover:border-indigo-500/40">
                  <input
                    type="checkbox"
                    checked={bulkChannels.whatsApp}
                    onChange={(e) =>
                      setBulkChannels((prev) => ({ ...prev, whatsApp: e.target.checked }))
                    }
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 accent-indigo-600"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-emerald-400" />
                      WhatsApp Bot
                    </div>
                    <div className="text-[10px] text-slate-400">Direct WhatsApp Notification</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Live Message Preview Card */}
            <div className="p-3.5 bg-indigo-950/30 border border-indigo-500/20 rounded-xl space-y-1.5">
              <span className="text-[11px] font-mono text-indigo-300 font-semibold uppercase tracking-wider block">
                Broadcast Preview
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {bulkNotificationType === 'FEE_REMINDER' && (
                  <>
                    <strong>[NATIVENEST HOSTEL NOTICE]</strong> Dear Resident, your hostel &amp; mess dues for the current term are pending. Kindly complete payment via the UPI / NetBanking portal or at the administrative desk within 3 days.
                  </>
                )}
                {bulkNotificationType === 'POLICE_VERIFICATION' && (
                  <>
                    <strong>[POLICE KYC COMPLIANCE]</strong> Dear Resident, pursuant to local statutory regulations, please submit your signed Form #2 along with Aadhaar photocopy to the Chief Warden desk within 48 hours.
                  </>
                )}
                {bulkNotificationType === 'INSPECTION' && (
                  <>
                    <strong>[HOSTEL INSPECTION ADVISORY]</strong> Dear Residents, standard hygiene and room compliance inspection will be conducted tomorrow between 10:00 AM and 1:00 PM. Please ensure rooms are orderly.
                  </>
                )}
                {bulkNotificationType === 'MESS_UPDATE' && (
                  <>
                    <strong>[MESS COMMITTEE UPDATE]</strong> Dining schedule and upcoming weekend special buffet menu have been updated on the resident portal.
                  </>
                )}
                {bulkNotificationType === 'CUSTOM' && (
                  <>
                    <strong>[{bulkCustomTitle || 'HOSTEL CIRCULAR'}]</strong> {bulkCustomMessage || 'Custom administrative notice broadcasted to selected residents.'}
                  </>
                )}
              </p>
              <span className="text-[10px] text-slate-400 block pt-1">
                — Issued by Chief Warden Office &bull; Native Nest Residence Hall
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowBulkNotifyModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDispatchNotification}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Dispatch to {selectedStudents.length} Residents</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISCIPLINARY INCIDENT DETAIL & AUDIT CERTIFICATE MODAL */}
      {selectedIncidentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-100">
                      Disciplinary Notice #{selectedIncidentDetail.incidentNumber}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedIncidentDetail.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      selectedIncidentDetail.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {selectedIncidentDetail.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Officially served to Guardian via WhatsApp Bot &amp; TRAI DLT SMS Gateway
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedIncidentDetail(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-300">
              {/* Resident & Guardian Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Student / Ward Particulars
                  </span>
                  <div className="font-bold text-slate-100 text-sm">{selectedIncidentDetail.studentName}</div>
                  <div className="text-slate-400 font-mono">
                    Roll: <span className="text-slate-200">{selectedIncidentDetail.studentRoll}</span> &bull; Room <span className="text-slate-200">{selectedIncidentDetail.roomNumber}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Incident Time: {new Date(selectedIncidentDetail.incidentDate).toLocaleDateString('en-IN')} at {selectedIncidentDetail.incidentTime}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                    Parent / Guardian Contact
                  </span>
                  <div className="font-bold text-slate-100 text-sm">{selectedIncidentDetail.guardianName}</div>
                  <div className="text-indigo-300 font-mono font-semibold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    +91 {selectedIncidentDetail.guardianMobile}
                    <span className="text-[10px] text-slate-400 font-normal">({selectedIncidentDetail.guardianRelation})</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Language: {selectedIncidentDetail.languagePreference || 'ENGLISH'}
                  </div>
                </div>
              </div>

              {/* Notice Matter Formal Letterhead Display */}
              <div className="p-4 bg-slate-950 border border-rose-500/30 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-rose-400" />
                    <span className="font-bold text-slate-200 uppercase tracking-wide text-[11px]">
                      Official Matter Dispatched to Guardian
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-850 text-slate-400 border border-slate-700">
                    {selectedIncidentDetail.category.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="p-3 bg-slate-900/90 rounded-lg text-slate-200 leading-relaxed font-serif text-[12px] border border-slate-800/80">
                  {selectedIncidentDetail.matterDescription}
                </div>

                {selectedIncidentDetail.actionTaken && (
                  <div className="p-2.5 bg-rose-950/30 border border-rose-500/20 rounded-lg flex items-center justify-between">
                    <span className="text-slate-300 font-medium">Disciplinary Sanction Imposed:</span>
                    <span className="font-bold text-rose-400 font-mono">{selectedIncidentDetail.actionTaken}</span>
                  </div>
                )}
              </div>

              {/* Delivery Channels Verification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Business Bot
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-500/40">
                      {selectedIncidentDetail.whatsAppStatus}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Msg ID: {selectedIncidentDetail.whatsAppMessageId || 'wamid.HBgLOTE4ODcyNTI...'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Sent to: +91 {selectedIncidentDetail.guardianMobile}
                  </div>
                </div>

                <div className="p-3 bg-purple-950/30 border border-purple-500/20 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-300 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5" /> TRAI DLT SMS Gateway
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-900/60 text-purple-300 border border-purple-500/40">
                      {selectedIncidentDetail.smsStatus}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Template: {selectedIncidentDetail.smsDltTemplateId || 'DLT-1107-DISC-01'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Header: NVNEST-DISC (Transactional)
                  </div>
                </div>
              </div>

              {/* Tamper-Proof Audit Hash */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                  SHA-256 Digital Verification &amp; Tamper-Proof Seal
                </span>
                <p className="font-mono text-[10px] text-indigo-300 break-all select-all">
                  {selectedIncidentDetail.sha256AuditHash || 'e89f81a7b4528cd902194bcf9301948df920194bc029384719284710293847a1'}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Issued By: {selectedIncidentDetail.reportedBy} ({selectedIncidentDetail.reporterDesignation})</span>
                  <span>Parent Ack: {selectedIncidentDetail.parentAcknowledged ? '✅ Verified' : '⏳ Pending Contact'}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-850 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => handleToggleParentAck(selectedIncidentDetail)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  selectedIncidentDetail.parentAcknowledged
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{selectedIncidentDetail.parentAcknowledged ? 'Mark Pending Acknowledgment' : 'Mark Parent Acknowledged'}</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/91${selectedIncidentDetail.guardianMobile.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `*OFFICIAL DISCIPLINARY NOTICE - NATIVE NEST RESIDENCE HALL*\n\nIncident Ref: ${selectedIncidentDetail.incidentNumber}\nStudent: ${selectedIncidentDetail.studentName} (Roll: ${selectedIncidentDetail.studentRoll}, Room: ${selectedIncidentDetail.roomNumber})\nCategory: ${selectedIncidentDetail.category}\n\n*Matter Details:*\n${selectedIncidentDetail.matterDescription}\n\nAction Imposed: ${selectedIncidentDetail.actionTaken || 'Formal Warning'}\n\nChief Warden Office\nContact: +91 94250 12345`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Open WhatsApp Web</span>
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedIncidentDetail(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
