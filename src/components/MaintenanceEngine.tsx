import React, { useState } from 'react';
import { MaintenanceRequest, Room, HousekeepingRecord, Student, StudentCleaningRemark } from '../types';
import { 
  Wrench, AlertTriangle, ShieldCheck, CheckCircle2, Clock, 
  DollarSign, Plus, UserCheck, Calendar, Filter, Sparkles, 
  CheckCheck, AlertOctagon, ThumbsUp, ThumbsDown, MessageSquare, 
  ShieldAlert, RefreshCw, User, Bed, Phone, FileText, Check
} from 'lucide-react';

interface MaintenanceEngineProps {
  requests?: MaintenanceRequest[];
  rooms?: Room[];
  students?: Student[];
  housekeepingRecords?: HousekeepingRecord[];
  isAdmin?: boolean;
  currentUser?: any;
  onAddRequest?: (req: Omit<MaintenanceRequest, 'id' | 'createdAt'>) => void;
  onCreateRequest?: (req: Omit<MaintenanceRequest, 'id' | 'status' | 'isApprovedByAdmin' | 'createdAt'>) => void;
  onApproveHighCost?: (requestId: string) => void;
  onApproveRequest?: (requestId: string) => void;
  onUpdateRequestStatus?: (requestId: string, status: MaintenanceRequest['status'], actualCost?: number) => void;
  onUpdateStatus?: (requestId: string, status: any) => void;
  onAddHousekeepingSchedule?: (record: Omit<HousekeepingRecord, 'id' | 'scheduleId'>) => void;
  onSubmitCleaningRemark?: (recordId: string, remark: StudentCleaningRemark) => void;
  onResolveHousekeepingEscalation?: (recordId: string, actionNotes: string) => void;
}

export const MaintenanceEngine: React.FC<MaintenanceEngineProps> = ({
  requests = [],
  rooms = [],
  students = [],
  housekeepingRecords = [],
  isAdmin = true,
  currentUser,
  onAddRequest,
  onCreateRequest,
  onApproveHighCost,
  onApproveRequest,
  onUpdateRequestStatus,
  onUpdateStatus,
  onAddHousekeepingSchedule,
  onSubmitCleaningRemark,
  onResolveHousekeepingEscalation,
}) => {
  const [activeEngineTab, setActiveEngineTab] = useState<'HOUSEKEEPING' | 'WORK_ORDERS' | 'PREVENTIVE'>('HOUSEKEEPING');
  
  // Work orders filters
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Housekeeping filters & modals
  const [hkFilterStatus, setHkFilterStatus] = useState('ALL');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedHkRecord, setSelectedHkRecord] = useState<HousekeepingRecord | null>(null);
  const [showVoteModal, setShowVoteModal] = useState(false);

  // Student voting remark state
  const [votingStudentId, setVotingStudentId] = useState('');
  const [cleaningRemark, setCleaningRemark] = useState<StudentCleaningRemark['remark']>('DONE_SATISFACTORY');
  const [cleaningRating, setCleaningRating] = useState<number>(5);
  const [cleaningFeedback, setCleaningFeedback] = useState('');

  // New Housekeeping schedule form
  const [newHkRoom, setNewHkRoom] = useState('101');
  const [newHkType, setNewHkType] = useState<HousekeepingRecord['cleaningType']>('DAILY_SWEEP_MOP');
  const [newHkStaff, setNewHkStaff] = useState('Sunil Kumar (Housekeeping Staff)');
  const [newHkDate, setNewHkDate] = useState(new Date().toISOString().split('T')[0]);
  const [newHkTime, setNewHkTime] = useState('10:00 AM');
  const [newHkShift, setNewHkShift] = useState<'MORNING' | 'AFTERNOON' | 'EVENING'>('MORNING');

  // Work Order Form State
  const [formData, setFormData] = useState({
    roomNumber: '102',
    category: 'PLUMBING' as MaintenanceRequest['category'],
    priority: 'HIGH' as MaintenanceRequest['priority'],
    description: '',
    estimatedCost: 350,
    assignedStaff: 'Ramesh Sharma (Senior Plumber)',
  });

  const filteredRequests = (requests || []).filter((r) => {
    const matchesCat = filterCategory === 'ALL' || r.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    return matchesCat && matchesStatus;
  });

  const filteredHkRecords = housekeepingRecords.filter((hk) => {
    if (hkFilterStatus === 'ALL') return true;
    return hk.status === hkFilterStatus;
  });

  const highCostLockedCount = (requests || []).filter(r => r.requiresAdminApproval && !r.isApprovedByAdmin).length;
  const totalRepairSpend = (requests || []).reduce((sum, r) => sum + (r.actualCost || r.estimatedCost || 0), 0);

  // Housekeeping metrics
  const verifiedDoneCount = housekeepingRecords.filter(h => h.status === 'VERIFIED_DONE').length;
  const escalatedAdminCount = housekeepingRecords.filter(h => h.status === 'FLAGGED_ESCALATED_ADMIN').length;
  const pendingQuorumCount = housekeepingRecords.filter(h => h.status === 'CLEANED_AWAITING_STUDENTS').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description) return;

    const requiresAdminApproval = formData.estimatedCost > 500;

    const payload = {
      roomNumber: formData.roomNumber,
      category: formData.category,
      priority: formData.priority,
      description: formData.description,
      estimatedCost: formData.estimatedCost,
      requiresAdminApproval,
      title: `${formData.category} issue in Room ${formData.roomNumber}`,
      isApprovedByAdmin: !requiresAdminApproval,
      status: requiresAdminApproval ? ('PENDING' as const) : ('IN_PROGRESS' as const),
      assignedStaff: formData.assignedStaff,
    };

    if (onAddRequest) {
      onAddRequest(payload);
    } else if (onCreateRequest) {
      onCreateRequest(payload);
    }

    setShowAddModal(false);
    setFormData({
      roomNumber: '102',
      category: 'PLUMBING',
      priority: 'MEDIUM',
      description: '',
      estimatedCost: 350,
      assignedStaff: 'Ramesh Sharma (Senior Plumber)',
    });
  };

  const handleOpenVoteModal = (record: HousekeepingRecord) => {
    setSelectedHkRecord(record);
    const roomStudents = students.filter(s => s.roomNumber === record.roomNumber);
    // Find a student who hasn't voted yet, or first student
    const unvotedStudent = roomStudents.find(
      s => !record.studentRemarks.some(r => r.studentId === s.id)
    );
    setVotingStudentId(unvotedStudent ? unvotedStudent.id : (roomStudents[0]?.id || ''));
    setCleaningRemark('DONE_SATISFACTORY');
    setCleaningRating(5);
    setCleaningFeedback('');
    setShowVoteModal(true);
  };

  const handleSubmitVote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHkRecord || !votingStudentId) return;

    const student = students.find(s => s.id === votingStudentId);
    if (!student) return;

    const remarkObj: StudentCleaningRemark = {
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      bedNumber: student.bedNumber,
      remark: cleaningRemark,
      rating: cleaningRating,
      feedbackNotes: cleaningFeedback.trim() || (cleaningRemark === 'DONE_SATISFACTORY' ? 'Cleaned satisfactorily.' : 'Needs improvement.'),
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      signatureChecksum: `CHK-${student.rollNumber.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString(16).toUpperCase()}`,
    };

    if (onSubmitCleaningRemark) {
      onSubmitCleaningRemark(selectedHkRecord.id, remarkObj);
    }

    setShowVoteModal(false);
  };

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const roomObj = rooms.find(r => r.roomNumber === newHkRoom);
    const roomStudents = students.filter(s => s.roomNumber === newHkRoom);
    const totalStudents = Math.max(1, roomStudents.length);
    const requiredQuorum = Math.ceil(totalStudents * 0.75);

    const typeTitles: Record<HousekeepingRecord['cleaningType'], string> = {
      DAILY_SWEEP_MOP: 'Daily Floor Sweep & Disinfectant Mop',
      WASHROOM_DEEP_CLEAN: 'Attached Washroom & Tile Deep Sanitization',
      FURNITURE_DUSTING: 'Study Desks, Wardrobes & AC Filter Dusting',
      LINEN_BEDSHEET_CHANGE: 'Bed Linen & Mattress Disinfection',
      WASTE_DISPOSAL_PEST_SPRAY: 'Waste Disposal & Herbal Pest Spray',
    };

    if (onAddHousekeepingSchedule) {
      onAddHousekeepingSchedule({
        roomNumber: newHkRoom,
        block: roomObj?.block || 'A-Block (North Wing)',
        floor: roomObj?.floor || 1,
        cleaningType: newHkType,
        cleaningTitle: typeTitles[newHkType],
        assignedStaff: newHkStaff,
        shift: newHkShift,
        scheduledDate: newHkDate,
        scheduledTime: newHkTime,
        status: 'SCHEDULED',
        totalRoomStudents: totalStudents,
        studentRemarks: [],
        verifiedCount: 0,
        disputedCount: 0,
        requiredQuorumCount: requiredQuorum,
        consensusReached: false,
        escalatedToAdmin: false,
      });
    }

    setShowScheduleModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">3/4 Quorum Verified</span>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{verifiedDoneCount} Cleanings</div>
            <span className="text-[11px] text-slate-500">≥75% Student consensus</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Escalated to Admin</span>
            <div className="text-xl font-bold text-rose-400 mt-0.5">{escalatedAdminCount} Flagged</div>
            <span className="text-[11px] text-rose-400/80">Quorum failed / poor service</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Awaiting Student Remarks</span>
            <div className="text-xl font-bold text-blue-400 mt-0.5">{pendingQuorumCount} Rooms</div>
            <span className="text-[11px] text-slate-500">Pending voting quorum</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Facilities Work Orders</span>
            <div className="text-xl font-bold text-amber-400 mt-0.5">{requests.length} Active</div>
            <span className="text-[11px] text-slate-500">${totalRepairSpend.toLocaleString()} spend</span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveEngineTab('HOUSEKEEPING')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeEngineTab === 'HOUSEKEEPING'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Housekeeping Schedule &amp; 3/4 Quorum Engine
          {escalatedAdminCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
              {escalatedAdminCount} alert
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveEngineTab('WORK_ORDERS')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeEngineTab === 'WORK_ORDERS'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Facilities Work Orders &amp; High-Cost Locks ({requests.length})
        </button>

        <button
          onClick={() => setActiveEngineTab('PREVENTIVE')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeEngineTab === 'PREVENTIVE'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Preventive Safety &amp; Water Tank Protocols
        </button>
      </div>

      {/* Tab 1: Housekeeping Engine with 3/4 Quorum Rule */}
      {activeEngineTab === 'HOUSEKEEPING' && (
        <div className="space-y-6">
          {/* Housekeeping Control Header */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  Housekeeping Quorum &amp; Student Consensus Engine
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mandate: If ≥3/4 (75%) of room residents remark cleaning done satisfactorily, status is marked <strong>Done</strong>. Else, automatically escalated to Admin/Chief Warden.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" /> Schedule Housekeeping
                </button>
              </div>
            </div>

            {/* Quorum Filter Bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="flex flex-wrap gap-2">
                <select
                  value={hkFilterStatus}
                  onChange={(e) => setHkFilterStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="ALL">All Housekeeping Records ({housekeepingRecords.length})</option>
                  <option value="VERIFIED_DONE">✓ 3/4 Consensus Verified Done</option>
                  <option value="CLEANED_AWAITING_STUDENTS">⏳ Awaiting Student Remarks</option>
                  <option value="FLAGGED_ESCALATED_ADMIN">⚠️ Escalated to Admin (Dispute)</option>
                  <option value="SCHEDULED">📅 Scheduled / In Progress</option>
                </select>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span className="font-mono text-indigo-400">Rule: ceil(Occupants × 0.75) Approvals</span>
              </div>
            </div>

            {/* Housekeeping Records Table */}
            <div className="mt-4 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-850 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Room &amp; Block</th>
                    <th className="px-4 py-3">Cleaning Task</th>
                    <th className="px-4 py-3">Assigned Staff</th>
                    <th className="px-4 py-3">3/4 Student Quorum Status</th>
                    <th className="px-4 py-3">Consensus / Result</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredHkRecords.map((hk) => {
                    const roomStudents = students.filter(s => s.roomNumber === hk.roomNumber);
                    const totalStudents = hk.totalRoomStudents || Math.max(1, roomStudents.length);
                    const requiredQuorum = hk.requiredQuorumCount || Math.ceil(totalStudents * 0.75);
                    const verifiedVotes = hk.studentRemarks.filter(r => r.remark === 'DONE_SATISFACTORY').length;
                    const disputeVotes = hk.studentRemarks.filter(r => r.remark === 'POOR_CLEANING' || r.remark === 'NOT_DONE').length;
                    const quorumPct = Math.round((verifiedVotes / totalStudents) * 100);

                    return (
                      <tr key={hk.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-slate-800 font-bold text-slate-200 flex items-center justify-center">
                              {hk.roomNumber}
                            </span>
                            <div>
                              <span className="font-semibold text-slate-200 block">{hk.block}</span>
                              <span className="text-[10px] text-slate-500 font-mono">Floor {hk.floor} • {totalStudents} Residents</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-200 block">{hk.cleaningTitle}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {hk.scheduledDate} ({hk.scheduledTime}) • {hk.shift}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span className="text-slate-200 font-medium block">{hk.assignedStaff}</span>
                          {hk.completedByStaffAt && (
                            <span className="text-[10px] text-emerald-400 font-mono block">
                              Staff done: {hk.completedByStaffAt.split(' ')[1]}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 min-w-[200px]">
                          <div>
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="font-semibold text-slate-300">
                                {verifiedVotes} / {totalStudents} Approved ({quorumPct}%)
                              </span>
                              <span className="text-[10px] text-indigo-400 font-mono">
                                Req: {requiredQuorum} of {totalStudents} (≥75%)
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                              <div
                                style={{ width: `${Math.min(100, (verifiedVotes / totalStudents) * 100)}%` }}
                                className={`h-full ${
                                  verifiedVotes >= requiredQuorum ? 'bg-emerald-500' : 'bg-blue-500'
                                }`}
                              />
                              {disputeVotes > 0 && (
                                <div
                                  style={{ width: `${Math.min(100, (disputeVotes / totalStudents) * 100)}%` }}
                                  className="h-full bg-rose-500"
                                />
                              )}
                            </div>

                            {/* Student Remarks pills */}
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {hk.studentRemarks.map((rem, idx) => (
                                <span
                                  key={idx}
                                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                                    rem.remark === 'DONE_SATISFACTORY'
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  }`}
                                  title={`${rem.studentName} (${rem.bedNumber}): ${rem.feedbackNotes}`}
                                >
                                  {rem.bedNumber}: {rem.remark === 'DONE_SATISFACTORY' ? '✓ Done' : '✕ Dispute'}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          {hk.status === 'VERIFIED_DONE' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              VERIFIED (3/4 Quorum)
                            </span>
                          ) : hk.status === 'FLAGGED_ESCALATED_ADMIN' ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold text-[11px] animate-pulse">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                ESCALATED TO ADMIN
                              </span>
                              <span className="text-[10px] text-rose-300 block truncate max-w-[170px]" title={hk.escalationReason}>
                                {hk.escalationReason || 'Failed Quorum / Resident Dispute'}
                              </span>
                            </div>
                          ) : hk.status === 'CLEANED_AWAITING_STUDENTS' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium text-[11px]">
                              <Clock className="w-3.5 h-3.5" />
                              Awaiting Remarks
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium text-[11px]">
                              {hk.status}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {hk.status !== 'VERIFIED_DONE' && (
                              <button
                                onClick={() => handleOpenVoteModal(hk)}
                                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Cast Remark
                              </button>
                            )}

                            {hk.status === 'FLAGGED_ESCALATED_ADMIN' && onResolveHousekeepingEscalation && (
                              <button
                                onClick={() => {
                                  const note = prompt('Admin action taken to resolve dispute:', 'Ordered immediate re-cleaning under Senior Supervisor inspection.');
                                  if (note) onResolveHousekeepingEscalation(hk.id, note);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                Admin Action
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
        </div>
      )}

      {/* Tab 2: Work Orders & High-Cost Lock */}
      {activeEngineTab === 'WORK_ORDERS' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-indigo-400" />
                  Hostel Facilities Maintenance &amp; Asset Management
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  High-Cost Lock: Repairs exceeding $500 strictly require Warden/Admin approval
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" /> Create Work Order
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-slate-800">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="PLUMBING">Plumbing</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="CARPENTRY">Carpentry</option>
                <option value="HVAC">HVAC / Cooling</option>
                <option value="NETWORK">Network / Wi-Fi</option>
                <option value="CIVIL">Civil Works</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending Action</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Requests Table */}
            <div className="mt-4 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-850 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Room / Item</th>
                    <th className="px-4 py-3">Category &amp; Priority</th>
                    <th className="px-4 py-3">Problem Description</th>
                    <th className="px-4 py-3">Est. Cost</th>
                    <th className="px-4 py-3">Assigned Staff</th>
                    <th className="px-4 py-3">Approval &amp; Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRequests.map((req) => {
                    const isHighCostLocked = req.requiresAdminApproval && !req.isApprovedByAdmin;

                    return (
                      <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3">
                          <span className="w-8 h-8 rounded-lg bg-slate-800 font-bold text-slate-200 flex items-center justify-center">
                            {req.roomNumber}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-200 block">{req.category}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded inline-block mt-0.5 ${
                            req.priority === 'CRITICAL' || req.priority === 'HIGH'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : req.priority === 'MEDIUM'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {req.priority}
                          </span>
                        </td>

                        <td className="px-4 py-3 max-w-xs">
                          <p className="text-slate-300 font-medium truncate">{req.description}</p>
                          <span className="text-[10px] text-slate-500 font-mono">Logged: {req.createdAt}</span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-mono font-bold">
                            <span className={req.estimatedCost > 500 ? 'text-rose-400' : 'text-slate-200'}>
                              ${req.estimatedCost}
                            </span>
                            {req.estimatedCost > 500 && (
                              <span className="text-[10px] text-rose-500 block">High Cost (&gt;$500)</span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-slate-300">
                          {req.assignedStaff || <span className="text-slate-500 italic">Unassigned</span>}
                        </td>

                        <td className="px-4 py-3">
                          {isHighCostLocked ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-bold animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              Locked: Admin Approval Req.
                            </span>
                          ) : req.status === 'COMPLETED' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              Completed
                            </span>
                          ) : req.status === 'IN_PROGRESS' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-medium">
                              <Clock className="w-3 h-3" />
                              In Progress
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-medium">
                              Pending
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isHighCostLocked && (
                              <button
                                onClick={() => (onApproveHighCost ? onApproveHighCost(req.id) : onApproveRequest?.(req.id))}
                                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] shadow cursor-pointer"
                              >
                                Approve ($500+)
                              </button>
                            )}

                            {!isHighCostLocked && req.status !== 'COMPLETED' && (
                              <button
                                onClick={() => (onUpdateRequestStatus ? onUpdateRequestStatus(req.id, 'COMPLETED', req.estimatedCost) : onUpdateStatus?.(req.id, 'COMPLETED'))}
                                className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-semibold text-[11px] cursor-pointer"
                              >
                                Mark Done
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
        </div>
      )}

      {/* Tab 3: Preventive Protocols */}
      {activeEngineTab === 'PREVENTIVE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Mandatory Hostel Preventive Maintenance &amp; Safety Protocols
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-200">Overhead Water Tank Chlorination</span>
                <span className="text-emerald-400 font-mono">Passed (12 Aug)</span>
              </div>
              <p className="text-[11px] text-slate-400">Quarterly health &amp; water purity certification</p>
              <div className="mt-2 text-[10px] text-indigo-400">Next due: 12 Nov 2026</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-200">Fire Safety &amp; Extinguisher Audit</span>
                <span className="text-emerald-400 font-mono">Passed (01 Sep)</span>
              </div>
              <p className="text-[11px] text-slate-400">Pressure testing of 24 ABC powder extinguishers</p>
              <div className="mt-2 text-[10px] text-indigo-400">Next due: 01 March 2027</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-200">Diesel Generator (DG) &amp; Lift Servicing</span>
                <span className="text-emerald-400 font-mono">Completed</span>
              </div>
              <p className="text-[11px] text-slate-400">125kVA Backup genset load testing and oil change</p>
              <div className="mt-2 text-[10px] text-indigo-400">Monthly inspection schedule</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cast Student Cleaning Remark (3/4 Quorum Voting) */}
      {showVoteModal && selectedHkRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Verify Housekeeping in Room #{selectedHkRecord.roomNumber}
                  </h3>
                  <p className="text-xs text-slate-400">
                    3/4 Quorum Rule: Your vote determines verification or admin escalation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVoteModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitVote} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Your Name / Bed (Room {selectedHkRecord.roomNumber}) *</label>
                <select
                  value={votingStudentId}
                  onChange={(e) => setVotingStudentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
                >
                  {students.filter(s => s.roomNumber === selectedHkRecord.roomNumber).map(s => {
                    const alreadyVoted = selectedHkRecord.studentRemarks.some(r => r.studentId === s.id);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.bedNumber} - {s.rollNumber}) {alreadyVoted ? '[Update Previous Vote]' : '[Pending Vote]'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Cleaning Inspection Remark *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCleaningRemark('DONE_SATISFACTORY')}
                    className={`p-3 rounded-xl border flex items-center gap-2 font-bold cursor-pointer transition-all ${
                      cleaningRemark === 'DONE_SATISFACTORY'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 ring-2 ring-emerald-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4 text-emerald-400" />
                    <span>✓ Done Satisfactory</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCleaningRemark('POOR_CLEANING')}
                    className={`p-3 rounded-xl border flex items-center gap-2 font-bold cursor-pointer transition-all ${
                      cleaningRemark === 'POOR_CLEANING'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500 ring-2 ring-rose-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4 text-rose-400" />
                    <span>✕ Poor / Not Cleaned</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setCleaningRating(star)}
                      className={`w-9 h-9 rounded-xl font-bold text-sm cursor-pointer transition-all ${
                        cleaningRating >= star
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-slate-950 text-slate-600 border border-slate-800'
                      }`}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Feedback Notes / Specific Observations</label>
                <textarea
                  rows={2}
                  value={cleaningFeedback}
                  onChange={(e) => setCleaningFeedback(e.target.value)}
                  placeholder="e.g. Floor was mopped cleanly and dustbin cleared."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowVoteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  Submit Remark &amp; Seal Quorum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Schedule Housekeeping */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Schedule Housekeeping Routine</h3>
                  <p className="text-xs text-slate-400">Deploy staff &amp; activate student consensus tracking</p>
                </div>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Room *</label>
                  <select
                    value={newHkRoom}
                    onChange={(e) => setNewHkRoom(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.roomNumber}>Room #{r.roomNumber} ({r.block})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cleaning Type *</label>
                  <select
                    value={newHkType}
                    onChange={(e) => setNewHkType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                  >
                    <option value="DAILY_SWEEP_MOP">Daily Sweep &amp; Mop</option>
                    <option value="WASHROOM_DEEP_CLEAN">Washroom Deep Clean</option>
                    <option value="FURNITURE_DUSTING">Furniture &amp; AC Dusting</option>
                    <option value="DEEP_ROOM_SANITIZATION">Full Room Deep Sanitization</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={newHkDate}
                    onChange={(e) => setNewHkDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={newHkTime}
                    onChange={(e) => setNewHkTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Shift</label>
                  <select
                    value={newHkShift}
                    onChange={(e) => setNewHkShift(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                  >
                    <option value="MORNING">Morning Shift</option>
                    <option value="AFTERNOON">Afternoon Shift</option>
                    <option value="EVENING">Evening Shift</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Assigned Housekeeping Personnel</label>
                <input
                  type="text"
                  value={newHkStaff}
                  onChange={(e) => setNewHkStaff(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  Deploy Housekeeping Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Maintenance Request */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Log Facility Work Order</h3>
                  <p className="text-xs text-slate-400">Auto-triggers supervisor assignment</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Room Number *</label>
                  <select
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.roomNumber}>Room {r.roomNumber}</option>
                    ))}
                    <option value="MESS_HALL">Mess Hall &amp; Kitchen</option>
                    <option value="CORRIDOR_A">Common Corridor Block A</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                  >
                    <option value="PLUMBING">Plumbing (Pipes, Taps, Geysers)</option>
                    <option value="ELECTRICAL">Electrical (Fans, MCB, Lights)</option>
                    <option value="CARPENTRY">Carpentry (Doors, Bed, Tables)</option>
                    <option value="HVAC">HVAC / Desert Coolers</option>
                    <option value="NETWORK">Wi-Fi &amp; LAN Access Points</option>
                    <option value="CIVIL">Civil / Waterproofing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                  >
                    <option value="LOW">Low (Routine)</option>
                    <option value="MEDIUM">Medium (Within 24 hrs)</option>
                    <option value="HIGH">High (Urgent)</option>
                    <option value="CRITICAL">Critical (Immediate Hazard)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Estimated Cost ($ USD)</label>
                  <input
                    type="number"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-slate-100 focus:outline-none"
                  />
                  {formData.estimatedCost > 500 && (
                    <span className="text-[10px] text-rose-400 block mt-1">
                      ⚠️ Exceeds $500: Will be locked for Admin Approval
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Problem Description *</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide precise details of the issue..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Assigned Technician</label>
                <input
                  type="text"
                  value={formData.assignedStaff}
                  onChange={(e) => setFormData({ ...formData, assignedStaff: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  Authorize &amp; Issue Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
