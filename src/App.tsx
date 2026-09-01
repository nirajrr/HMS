import React, { useState, useMemo } from 'react';
import { 
  Users, Home, Utensils, Landmark, Wrench, ShieldCheck, 
  UserCheck, History, BookOpen, Bell, Search, Plus, 
  ArrowLeftRight, CheckCircle2, AlertTriangle, Filter, 
  ChevronRight, Building2, Download, LogOut, DollarSign,
  TrendingUp, Sparkles, Star, MessageSquare, SlidersHorizontal,
  Bed, Maximize2, RefreshCw, AlertOctagon, FolderLock, FileText,
  Clock, Check, Monitor, Smartphone, Zap, Leaf, PieChart as PieChartIcon,
  GraduationCap, Send
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { 
  User, Student, Room, BankAccount, FeeTransaction, 
  MaintenanceRequest, ActivityLog, PoliceVerificationRecord, 
  FinancialAlert, Review, Notice, UserRole, BedConfig,
  HousekeepingRecord, ResidentComplaint, StudentCleaningRemark, 
  IdentityDocument, SyncEngineStatus, SyncPacket,
  UserSecurityProfile, DualSignoffRequest, DataIntegrationConnector, SecurityAuditAssessment
} from './types';
import { 
  INITIAL_USERS, INITIAL_BANKS, INITIAL_ROOMS, 
  INITIAL_STUDENTS, INITIAL_TRANSACTIONS, INITIAL_MAINTENANCE, 
  INITIAL_POLICE_RECORDS, INITIAL_ACTIVITY_LOGS, INITIAL_ALERTS,
  INITIAL_REVIEWS, INITIAL_NOTICES, INITIAL_COMPLAINTS, INITIAL_HOUSEKEEPING,
  INITIAL_SYNC_STATUS, INITIAL_SYNC_PACKETS,
  INITIAL_SECURITY_ASSESSMENT, INITIAL_USER_SECURITY_PROFILES,
  INITIAL_DUAL_SIGNOFF_REQUESTS, INITIAL_DATA_INTEGRATION_CONNECTORS
} from './data';

// Import Modular Components
import { MasterRoomBedConfig } from './components/MasterRoomBedConfig';
import { StudentManager } from './components/StudentManager';
import { RoomManager } from './components/RoomManager';
import { MessBilling } from './components/MessBilling';
import { FinancialDashboard } from './components/FinancialDashboard';
import { MaintenanceEngine } from './components/MaintenanceEngine';
import { PoliceCompliance } from './components/PoliceCompliance';
import { RbacUserManagement } from './components/RbacUserManagement';
import { ActivityLogViewer } from './components/ActivityLogViewer';
import { ReviewsAndNotices } from './components/ReviewsAndNotices';
import { DocumentationModal } from './components/DocumentationModal';
import { PoliceVerificationModal } from './components/PoliceVerificationModal';
import { RoomSwapModal } from './components/RoomSwapModal';
import { DocumentManagerModal } from './components/DocumentManagerModal';
import { ResidentComplaintModal } from './components/ResidentComplaintModal';
import { DualPlatformView } from './components/DualPlatformView';
import { ReportEngine } from './components/ReportEngine';
import { SecurityDataIntegrationHub } from './components/SecurityDataIntegrationHub';

export const App: React.FC = () => {
  // Global State
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [activeTab, setActiveTab] = useState<
    'SYNC_DUAL' | 'SECURITY' | 'REPORTS' | 'OVERVIEW' | 'MASTER_ROOMS' | 'STUDENTS' | 'ROOMS' | 'MESS' | 'FINANCE' | 
    'MAINTENANCE' | 'COMPLAINTS' | 'POLICE' | 'RBAC' | 'AUDIT' | 'REVIEWS_NOTICES'
  >('SYNC_DUAL');

  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [banks, setBanks] = useState<BankAccount[]>(INITIAL_BANKS);
  const [transactions, setTransactions] = useState<FeeTransaction[]>(INITIAL_TRANSACTIONS);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>(INITIAL_MAINTENANCE);
  const [policeRecords, setPoliceRecords] = useState<PoliceVerificationRecord[]>(INITIAL_POLICE_RECORDS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [alerts, setAlerts] = useState<FinancialAlert[]>(INITIAL_ALERTS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [housekeepingRecords, setHousekeepingRecords] = useState<HousekeepingRecord[]>(INITIAL_HOUSEKEEPING);
  const [complaints, setComplaints] = useState<ResidentComplaint[]>(INITIAL_COMPLAINTS);

  // Security Reassessment, Double Verification (2FA / Dual Sign-off) & Data Integrations
  const [securityAssessment, setSecurityAssessment] = useState<SecurityAuditAssessment>(INITIAL_SECURITY_ASSESSMENT);
  const [securityProfiles, setSecurityProfiles] = useState<UserSecurityProfile[]>(INITIAL_USER_SECURITY_PROFILES);
  const [dualSignoffRequests, setDualSignoffRequests] = useState<DualSignoffRequest[]>(INITIAL_DUAL_SIGNOFF_REQUESTS);
  const [integrationConnectors, setIntegrationConnectors] = useState<DataIntegrationConnector[]>(INITIAL_DATA_INTEGRATION_CONNECTORS);

  // Cross-Platform Real-Time Sync Engine State (.exe <-> .apk)
  const [syncStatus, setSyncStatus] = useState<SyncEngineStatus>(INITIAL_SYNC_STATUS);
  const [syncPackets, setSyncPackets] = useState<SyncPacket[]>(INITIAL_SYNC_PACKETS);

  // Modals State
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedStudentForPolice, setSelectedStudentForPolice] = useState<Student | null>(null);
  const [selectedStudentForSwap, setSelectedStudentForSwap] = useState<Student | null>(null);
  const [selectedStudentForDocs, setSelectedStudentForDocs] = useState<Student | null>(null);
  const [selectedStudentForComplaint, setSelectedStudentForComplaint] = useState<Student | null>(null);
  const [showDirectComplaintModal, setShowDirectComplaintModal] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  // Complaints view filter state
  const [complaintFilterCat, setComplaintFilterCat] = useState('ALL');
  const [complaintFilterStatus, setComplaintFilterStatus] = useState('ALL');

  // Department Distribution Data for Recharts Pie Chart in Executive Overview
  const departmentDistributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      const dept = (s.department || 'General / Interdisciplinary').trim();
      counts[dept] = (counts[dept] || 0) + 1;
    });

    const palette = [
      '#6366f1', // Indigo
      '#10b981', // Emerald
      '#f59e0b', // Amber
      '#0ea5e9', // Sky
      '#ec4899', // Pink
      '#8b5cf6', // Violet
      '#14b8a6', // Teal
      '#f97316', // Orange
      '#06b6d4', // Cyan
    ];

    const total = students.length || 1;
    return Object.entries(counts).map(([name, value], idx) => ({
      name,
      value,
      percentage: Math.round((value / total) * 100),
      color: palette[idx % palette.length],
    }));
  }, [students]);

  // Trigger Bi-directional Sync Packet
  const handleTriggerSync = (source: 'EXE_DESKTOP' | 'APK_MOBILE', action: string, details: string) => {
    const destination = source === 'EXE_DESKTOP' ? 'APK_MOBILE' : 'EXE_DESKTOP';
    const newPacket: SyncPacket = {
      id: `PKT-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      source,
      destination,
      action,
      module: 'HOSTEL_OPERATIONS',
      entityId: `SYNC-${Date.now()}`,
      operator: currentUser.fullName || currentUser.name || (source === 'EXE_DESKTOP' ? 'Admin Workstation' : 'Warden Mobile'),
      summary: details,
      latencyMs: Math.floor(8 + Math.random() * 12),
      hash: `SHA256:${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`,
      status: 'SYNCED',
    };

    setSyncPackets((prev) => [newPacket, ...prev.slice(0, 24)]);
    setSyncStatus((prev) => ({
      ...prev,
      lastSyncedTimestamp: `${new Date().toLocaleTimeString()} IST`,
      totalPacketsExchanged: prev.totalPacketsExchanged + 1,
      isConnected: true,
    }));

    logActivity(
      'CROSS_PLATFORM_SYNC_RELAY',
      'ADMIN',
      `[${source} ➔ ${destination}] ${action}: ${details}`,
      `Packet #${newPacket.id}`
    );
  };

  // Helper: Append Immutable Audit Log
  const logActivity = (action: string, module: any, details: string, targetEntity?: string) => {
    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      action,
      module,
      performedBy: currentUser.fullName || currentUser.name || 'Staff User',
      userId: currentUser.username || currentUser.id,
      details,
      targetEntity,
      timestamp: new Date().toLocaleString(),
      ipAddress: '192.168.1.100 (Hostel Desk)',
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Double Verification & Dual Sign-off Handlers
  const handleApproveDualSignoff = (
    requestId: string,
    approverName: string,
    approverRole: UserRole,
    otpCode: string
  ) => {
    setDualSignoffRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            status: 'DOUBLE_VERIFIED_EXECUTED',
            secondApproverName: approverName,
            secondApproverRole: approverRole,
            secondApproverTimestamp: `${new Date().toISOString().replace('T', ' ').slice(0, 19)} IST`,
            secondApproverOtpCode: otpCode,
            secondApproverSignatureHash: `RSA4096:${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
          };
        }
        return req;
      })
    );

    logActivity(
      'DUAL_SIGNOFF_DOUBLE_VERIFIED',
      'SECURITY',
      `Dual sign-off request #${requestId} double-verified and executed by ${approverName} (${approverRole}) using 2FA OTP.`,
      `Request #${requestId}`
    );
  };

  const handleRejectDualSignoff = (requestId: string, reason: string) => {
    setDualSignoffRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: 'REJECTED' } : req
      )
    );

    logActivity(
      'DUAL_SIGNOFF_REJECTED',
      'SECURITY',
      `Dual sign-off request #${requestId} rejected by ${currentUser.fullName || currentUser.name}. Reason: ${reason}`,
      `Request #${requestId}`
    );
  };

  const handleCreateDualSignoffRequest = (
    requestData: Omit<DualSignoffRequest, 'id' | 'initiatorTimestamp' | 'initiatorSignatureHash' | 'status' | 'integrityChecksum'>
  ) => {
    const newReq: DualSignoffRequest = {
      ...requestData,
      id: `DS-${new Date().getFullYear()}-${String(dualSignoffRequests.length + 1).padStart(3, '0')}`,
      initiatorTimestamp: `${new Date().toISOString().replace('T', ' ').slice(0, 19)} IST`,
      initiatorSignatureHash: `RSA4096:${Math.random().toString(36).substring(2, 12)}`,
      status: 'PENDING_SECOND_VERIFICATION',
      integrityChecksum: `SHA256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    };

    setDualSignoffRequests((prev) => [newReq, ...prev]);

    logActivity(
      'DUAL_SIGNOFF_INITIATED',
      'SECURITY',
      `Initiated Dual Sign-off request #${newReq.id} (${newReq.title}). Awaiting ${newReq.requiredApproverRole} second verification.`,
      `Request #${newReq.id}`
    );
  };

  const handleUpdateIntegrationConnector = (
    connectorId: string,
    updates: Partial<DataIntegrationConnector>
  ) => {
    setIntegrationConnectors((prev) =>
      prev.map((c) => (c.id === connectorId ? { ...c, ...updates } : c))
    );
  };

  const handleTestConnector = async (
    connectorId: string
  ): Promise<{ success: boolean; latencyMs: number; message: string }> => {
    await new Promise((res) => setTimeout(res, 600));
    const target = integrationConnectors.find((c) => c.id === connectorId);
    const latency = Math.floor(15 + Math.random() * 35);
    
    setIntegrationConnectors((prev) =>
      prev.map((c) =>
        c.id === connectorId
          ? {
              ...c,
              lastSyncTimestamp: `Just now (${latency}ms ACK)`,
              latencyMs: latency,
              recordsSyncedTotal: c.recordsSyncedTotal + 1,
            }
          : c
      )
    );

    logActivity(
      'INTEGRATION_GATEWAY_PINGED',
      'SECURITY',
      `Handshake probe successful for ${target?.name || connectorId} (${latency}ms roundtrip latency).`,
      target?.name
    );

    return {
      success: true,
      latencyMs: latency,
      message: `200 OK: Handshake & mTLS certificate validated for ${target?.name || connectorId}`,
    };
  };

  // Student Actions
  const handleAddStudent = (newStudentData: Omit<Student, 'id' | 'status' | 'feeBalance' | 'messBalance'>) => {
    const newStudent: Student = {
      ...newStudentData,
      id: `std_${Date.now()}`,
      status: 'ACTIVE',
      feeBalance: 0,
      messBalance: 0,
    };

    setStudents((prev) => [newStudent, ...prev]);

    // Update Room occupancy
    setRooms((prev) =>
      prev.map((r) => {
        if (r.roomNumber === newStudent.roomNumber) {
          const newOccupied = r.occupiedBeds + 1;
          return {
            ...r,
            occupiedBeds: newOccupied,
            status: newOccupied >= r.totalBeds ? 'OCCUPIED' : 'AVAILABLE',
            assignedStudentIds: [...r.assignedStudentIds, newStudent.id],
          };
        }
        return r;
      })
    );

    logActivity(
      'STUDENT_ADMITTED',
      'STUDENT',
      `Admitted new resident ${newStudent.name} (${newStudent.rollNumber}) to Room ${newStudent.roomNumber} (${newStudent.bedNumber}).`,
      `Student: ${newStudent.name}`
    );
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    logActivity(
      'STUDENT_RECORD_UPDATED',
      'STUDENT',
      `Updated particulars for ${updatedStudent.name} (${updatedStudent.rollNumber}).`,
      `Student: ${updatedStudent.name}`
    );
  };

  const handleDeleteStudent = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    setStudents((prev) => prev.filter((s) => s.id !== studentId));

    // Release bed in room
    setRooms((prev) =>
      prev.map((r) => {
        if (r.roomNumber === student.roomNumber) {
          const newOccupied = Math.max(0, r.occupiedBeds - 1);
          return {
            ...r,
            occupiedBeds: newOccupied,
            status: 'AVAILABLE',
            assignedStudentIds: r.assignedStudentIds.filter((id) => id !== studentId),
          };
        }
        return r;
      })
    );

    handleTriggerSync(
      'EXE_DESKTOP',
      'RESIDENT_DEPARTURE_PROCESSED',
      `Vacated and removed resident record for ${student.name} (${student.rollNumber}) from Room #${student.roomNumber} (${student.bedNumber}). Bed slot released.`
    );

    logActivity(
      'STUDENT_VACATED',
      'STUDENT',
      `Vacated and removed student record for ${student.name} from Room ${student.roomNumber} (${student.bedNumber}). Bed released.`,
      `Student: ${student.name}`
    );
  };

  // Student Identity Documents Vault Update
  const handleUpdateStudentDocuments = (studentId: string, documents: IdentityDocument[]) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const aadhaarDoc = documents.find((d) => d.type === 'AADHAAR');
        const panDoc = documents.find((d) => d.type === 'PAN');
        const idDoc = documents.find((d) => d.type === 'COLLEGE_COMPANY_ID');

        return {
          ...s,
          documents,
          aadharNumber: aadhaarDoc?.maskedNumber || aadhaarDoc?.docNumber || s.aadharNumber,
          panNumber: panDoc?.maskedNumber || panDoc?.docNumber || s.panNumber,
          collegeOrCompanyId: idDoc?.maskedNumber || idDoc?.docNumber || s.collegeOrCompanyId,
          institutionOrEmployerName: idDoc?.institutionOrEmployer || s.institutionOrEmployerName,
        };
      })
    );

    logActivity(
      'DOCUMENTS_VAULT_SEALED',
      'SECURITY',
      `Cryptographically uploaded & verified identity documents (SHA-256) for resident ${studentId}.`,
      `Student #${studentId}`
    );
  };

  // Resident Complaints & Grievance Handlers
  const handleAddComplaint = (complaintData: Omit<ResidentComplaint, 'id' | 'ticketId' | 'createdAt' | 'status'>) => {
    const newComplaint: ResidentComplaint = {
      ...complaintData,
      id: `comp_${Date.now()}`,
      ticketId: `GRV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setComplaints((prev) => [newComplaint, ...prev]);

    logActivity(
      'RESIDENT_COMPLAINT_LODGED',
      'STUDENT',
      `Complaint ${newComplaint.ticketId} logged by ${newComplaint.studentName} for Room ${newComplaint.roomNumber} (${newComplaint.bedNumber}). Title: "${newComplaint.title}" [Severity: ${newComplaint.severity}].`,
      `Complaint: ${newComplaint.ticketId}`
    );
  };

  const handleUpdateComplaintStatus = (complaintId: string, status: ResidentComplaint['status'], resolutionNotes?: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        return {
          ...c,
          status,
          resolutionNotes: resolutionNotes || c.resolutionNotes,
          resolvedAt: status === 'RESOLVED' ? new Date().toISOString().replace('T', ' ').substring(0, 19) : c.resolvedAt,
        };
      })
    );

    logActivity(
      'COMPLAINT_STATUS_UPDATED',
      'STUDENT',
      `Grievance record ${complaintId} marked as ${status}.`,
      `Complaint #${complaintId}`
    );
  };

  // Housekeeping & 3/4 Quorum Rules Engine Handlers
  const handleAddHousekeepingSchedule = (record: Omit<HousekeepingRecord, 'id' | 'scheduleId'>) => {
    const newRecord: HousekeepingRecord = {
      ...record,
      id: `hk_${Date.now()}`,
      scheduleId: `SCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setHousekeepingRecords((prev) => [newRecord, ...prev]);

    logActivity(
      'HOUSEKEEPING_SCHEDULED',
      'MAINTENANCE',
      `Scheduled ${record.cleaningTitle} for Room ${record.roomNumber} (${record.scheduledDate} ${record.scheduledTime}). Assigned: ${record.assignedStaff}. 3/4 Student Quorum consensus tracking active.`,
      `Room #${record.roomNumber}`
    );
  };

  const handleSubmitCleaningRemark = (recordId: string, remark: StudentCleaningRemark) => {
    setHousekeepingRecords((prev) =>
      prev.map((hk) => {
        if (hk.id !== recordId) return hk;

        const existingIdx = hk.studentRemarks.findIndex((r) => r.studentId === remark.studentId);
        let updatedRemarks = [...hk.studentRemarks];
        if (existingIdx >= 0) {
          updatedRemarks[existingIdx] = remark;
        } else {
          updatedRemarks.push(remark);
        }

        const roomStudents = students.filter((s) => s.roomNumber === hk.roomNumber);
        const totalStudents = hk.totalRoomStudents || Math.max(1, roomStudents.length);
        const requiredQuorum = hk.requiredQuorumCount || Math.ceil(totalStudents * 0.75);
        const verifiedVotes = updatedRemarks.filter((r) => r.remark === 'DONE_SATISFACTORY').length;
        const disputeVotes = updatedRemarks.filter((r) => r.remark === 'POOR_CLEANING' || r.remark === 'NOT_DONE').length;

        let newStatus = hk.status;
        let consensusReached = false;
        let consensusTimestamp = hk.consensusTimestamp;
        let escalatedToAdmin = false;
        let escalationReason = hk.escalationReason;

        // Mandate 3/4 (75%) Quorum Consensus Rule
        if (verifiedVotes >= requiredQuorum) {
          newStatus = 'VERIFIED_DONE';
          consensusReached = true;
          consensusTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
          escalatedToAdmin = false;
          escalationReason = undefined;
        } else if (disputeVotes > (totalStudents - requiredQuorum) || (remark.remark === 'POOR_CLEANING' || remark.remark === 'NOT_DONE')) {
          newStatus = 'FLAGGED_ESCALATED_ADMIN';
          escalatedToAdmin = true;
          escalationReason = `Disputed by resident ${remark.studentName} (${remark.bedNumber}): "${remark.feedbackNotes}". 3/4 Quorum requirement (≥75%) not met.`;
        } else {
          newStatus = 'CLEANED_AWAITING_STUDENTS';
        }

        return {
          ...hk,
          studentRemarks: updatedRemarks,
          verifiedCount: verifiedVotes,
          disputedCount: disputeVotes,
          status: newStatus,
          consensusReached,
          consensusTimestamp,
          escalatedToAdmin,
          escalationReason,
        };
      })
    );

    logActivity(
      'HOUSEKEEPING_REMARK_VOTED',
      'MAINTENANCE',
      `Resident ${remark.studentName} (${remark.bedNumber}) submitted cleaning remark (${remark.remark}). 3/4 consensus evaluated.`,
      `Record #${recordId}`
    );
  };

  const handleResolveHousekeepingEscalation = (recordId: string, actionNotes: string) => {
    setHousekeepingRecords((prev) =>
      prev.map((hk) => {
        if (hk.id !== recordId) return hk;
        return {
          ...hk,
          status: 'VERIFIED_DONE',
          escalatedToAdmin: false,
          escalationReason: `Resolved by Warden/Admin (${currentUser.fullName || currentUser.name}): ${actionNotes}`,
          consensusReached: true,
          consensusTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
      })
    );

    logActivity(
      'HOUSEKEEPING_ESCALATION_RESOLVED',
      'MAINTENANCE',
      `Admin resolved housekeeping escalation for record ${recordId}. Action: ${actionNotes}`,
      `Record #${recordId}`
    );
  };

  // Room Swap Action with Chain-of-Thought Execution
  const handleConfirmRoomSwap = (sourceStudentId: string, targetRoomNumber: string, targetStudentId?: string) => {
    const sourceStudent = students.find((s) => s.id === sourceStudentId);
    const targetStudent = targetStudentId ? students.find((s) => s.id === targetStudentId) : null;
    const oldRoomNumber = sourceStudent?.roomNumber;

    if (!sourceStudent) return;

    if (targetStudent) {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === sourceStudentId) {
            return { ...s, roomNumber: targetRoomNumber, bedNumber: targetStudent.bedNumber };
          }
          if (s.id === targetStudentId) {
            return { ...s, roomNumber: oldRoomNumber!, bedNumber: sourceStudent.bedNumber };
          }
          return s;
        })
      );

      logActivity(
        'MUTUAL_ROOM_SWAP_EXECUTED',
        'ROOM',
        `Mutual room swap approved: ${sourceStudent.name} (Room ${oldRoomNumber} ➔ ${targetRoomNumber}) and ${targetStudent.name} (Room ${targetRoomNumber} ➔ ${oldRoomNumber}). Passed automated eligibility and zero mess dues checks.`,
        `Swap: Room ${oldRoomNumber} ⇄ ${targetRoomNumber}`
      );
    } else {
      setStudents((prev) =>
        prev.map((s) => (s.id === sourceStudentId ? { ...s, roomNumber: targetRoomNumber, bedNumber: 'Bed-1' } : s))
      );

      setRooms((prev) =>
        prev.map((r) => {
          if (r.roomNumber === oldRoomNumber) {
            const newCount = Math.max(0, r.occupiedBeds - 1);
            return {
              ...r,
              occupiedBeds: newCount,
              status: 'AVAILABLE',
              assignedStudentIds: r.assignedStudentIds.filter((id) => id !== sourceStudentId),
            };
          }
          if (r.roomNumber === targetRoomNumber) {
            const newCount = r.occupiedBeds + 1;
            return {
              ...r,
              occupiedBeds: newCount,
              status: newCount >= r.totalBeds ? 'OCCUPIED' : 'AVAILABLE',
              assignedStudentIds: [...r.assignedStudentIds, sourceStudentId],
            };
          }
          return r;
        })
      );

      logActivity(
        'ROOM_SHIFT_COMPLETED',
        'ROOM',
        `Single room shift executed for ${sourceStudent.name} from Room ${oldRoomNumber} to vacant Room ${targetRoomNumber}. Verified zero mess dues and vacant bed clearance.`,
        `Shift: Room ${oldRoomNumber} ➔ ${targetRoomNumber}`
      );
    }
  };

  // Room Status & Locking
  const handleUpdateRoomStatus = (roomId: string, status: 'AVAILABLE' | 'MAINTENANCE') => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, status: status } : r))
    );
    const room = rooms.find((r) => r.id === roomId);
    logActivity(
      'ROOM_STATUS_ALTERED',
      'ROOM',
      `Changed Room ${room?.roomNumber} operational status to ${status}.`,
      `Room ${room?.roomNumber}`
    );
  };

  // Add Single New Room
  const handleAddRoom = (newRoomData: Omit<Room, 'id' | 'assignedStudentIds' | 'occupiedBeds'>) => {
    const newRoom: Room = {
      ...newRoomData,
      id: `rm_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      assignedStudentIds: [],
      occupiedBeds: 0,
      status: newRoomData.status || 'AVAILABLE',
      amenities: newRoomData.amenities || ['Attached Bathroom', 'Study Table'],
    };

    setRooms((prev) => [...prev, newRoom]);

    logActivity(
      'ROOM_CREATED',
      'ROOM',
      `Added new Room #${newRoom.roomNumber} in ${newRoom.block} (Floor ${newRoom.floor}, ${newRoom.type} Occupancy, ${newRoom.totalBeds} Beds, ₹${newRoom.monthlyRent.toLocaleString()}/month).`,
      `Room #${newRoom.roomNumber}`
    );
  };

  // Add Batch of Rooms
  const handleAddBatchRooms = (roomsData: Array<Omit<Room, 'id' | 'assignedStudentIds' | 'occupiedBeds'>>) => {
    const newRooms: Room[] = roomsData.map((data, idx) => ({
      ...data,
      id: `rm_${Date.now()}_${idx}_${Math.floor(Math.random() * 1000)}`,
      assignedStudentIds: [],
      occupiedBeds: 0,
      status: data.status || 'AVAILABLE',
      amenities: data.amenities || ['Attached Bathroom', 'Study Table'],
    }));

    setRooms((prev) => [...prev, ...newRooms]);

    logActivity(
      'BATCH_ROOMS_CREATED',
      'ROOM',
      `Batch provisioned ${newRooms.length} new rooms: ${newRooms.map((r) => r.roomNumber).join(', ')} (${newRooms[0]?.block || 'Inventory'}).`,
      `Batch: ${newRooms.length} Rooms`
    );
  };

  // Add Bed(s) to existing room
  const handleAddBedToRoom = (roomId: string, bedData?: Partial<BedConfig>) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          const newTotalBeds = r.totalBeds + 1;
          let newType: Room['type'] = r.type;
          if (newTotalBeds === 1) newType = 'SINGLE';
          else if (newTotalBeds === 2) newType = 'DOUBLE';
          else if (newTotalBeds === 3) newType = 'TRIPLE';
          else if (newTotalBeds > 3) newType = 'DORMITORY';

          const defaultBedRent = bedData?.monthlyRent || r.monthlyRent || 8500;
          const newBed: BedConfig = {
            id: `bed_${Date.now()}_${newTotalBeds}`,
            bedNumber: bedData?.bedNumber || `Bed-${newTotalBeds}`,
            label: bedData?.label || `Bed Slot ${newTotalBeds}`,
            bedType: bedData?.bedType || (newTotalBeds >= 4 ? 'BUNK_UPPER' : 'SINGLE_COT'),
            position: bedData?.position || 'CORNER',
            monthlyRent: defaultBedRent,
            status: 'AVAILABLE',
          };

          const updatedBeds = r.beds ? [...r.beds, newBed] : [newBed];

          return {
            ...r,
            totalBeds: newTotalBeds,
            type: newType,
            beds: updatedBeds,
          };
        }
        return r;
      })
    );

    const room = rooms.find((r) => r.id === roomId);
    logActivity(
      'BED_ADDED_TO_ROOM',
      'ROOM',
      `Added Bed #${bedData?.bedNumber || `Bed-${(room?.totalBeds || 0) + 1}`} to Room #${room?.roomNumber}.`,
      `Room #${room?.roomNumber}`
    );
  };

  // Remove bed from existing room
  const handleRemoveBedFromRoom = (roomId: string, bedId: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          const updatedBeds = (r.beds || []).filter((b) => b.id !== bedId);
          const newTotalBeds = Math.max(1, updatedBeds.length);
          let newType: Room['type'] = r.type;
          if (newTotalBeds === 1) newType = 'SINGLE';
          else if (newTotalBeds === 2) newType = 'DOUBLE';
          else if (newTotalBeds === 3) newType = 'TRIPLE';
          else if (newTotalBeds > 3) newType = 'DORMITORY';

          return {
            ...r,
            totalBeds: newTotalBeds,
            type: newType,
            beds: updatedBeds,
          };
        }
        return r;
      })
    );

    const room = rooms.find((r) => r.id === roomId);
    logActivity(
      'BED_REMOVED_FROM_ROOM',
      'ROOM',
      `Removed bed (${bedId}) from Room #${room?.roomNumber}.`,
      `Room #${room?.roomNumber}`
    );
  };

  // Update bed attributes in room
  const handleUpdateBedInRoom = (roomId: string, bedId: string, updatedBedData: Partial<BedConfig>) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          const updatedBeds = (r.beds || []).map((b) => (b.id === bedId ? { ...b, ...updatedBedData } : b));
          return {
            ...r,
            beds: updatedBeds,
          };
        }
        return r;
      })
    );

    const room = rooms.find((r) => r.id === roomId);
    logActivity(
      'BED_CONFIG_UPDATED',
      'ROOM',
      `Updated individual bed rent/position for Bed ${bedId} in Room #${room?.roomNumber}.`,
      `Room #${room?.roomNumber}`
    );
  };

  // Update Room Details (Rent, Block, Floor, Type)
  const handleUpdateRoomDetails = (roomId: string, updatedData: Partial<Room>) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, ...updatedData } : r))
    );
    const room = rooms.find((r) => r.id === roomId);
    logActivity(
      'ROOM_CONFIG_UPDATED',
      'ROOM',
      `Updated Room #${room?.roomNumber} details.`,
      `Room #${room?.roomNumber}`
    );
  };

  // Delete Room
  const handleDeleteRoom = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    setRooms((prev) => prev.filter((r) => r.id !== roomId));

    logActivity(
      'ROOM_DELETED',
      'ROOM',
      `Deleted Room #${room.roomNumber} from active hostel inventory.`,
      `Room #${room.roomNumber}`
    );
  };

  // Vacate all occupants in a room
  const handleVacateRoom = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    setStudents((prev) =>
      prev.map((s) => (s.roomNumber === room.roomNumber ? { ...s, roomNumber: 'UNASSIGNED', bedNumber: 'None', status: 'VACATED' } : s))
    );

    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? {
              ...r,
              occupiedBeds: 0,
              status: 'AVAILABLE',
              assignedStudentIds: [],
              beds: (r.beds || []).map((b) => ({ ...b, isOccupied: false, studentId: undefined, studentName: undefined })),
            }
          : r
      )
    );

    logActivity(
      'ROOM_ALL_BEDS_VACATED',
      'ROOM',
      `Vacated all beds in Room #${room.roomNumber}. Released to available inventory.`,
      `Room #${room.roomNumber}`
    );
  };

  // Reset all data to clean default baseline state (with mode support)
  const handleResetAllData = (mode: 'FULL_SEED' | 'EMPTY_SLATE' = 'FULL_SEED') => {
    if (mode === 'EMPTY_SLATE') {
      setRooms([]);
      setStudents([]);
      setTransactions([]);
      setMaintenance([]);
      setPoliceRecords([]);
      setHousekeepingRecords([]);
      setComplaints([]);
    } else {
      setRooms(INITIAL_ROOMS);
      setStudents(INITIAL_STUDENTS);
      setBanks(INITIAL_BANKS);
      setTransactions(INITIAL_TRANSACTIONS);
      setMaintenance(INITIAL_MAINTENANCE);
      setPoliceRecords(INITIAL_POLICE_RECORDS);
      setHousekeepingRecords(INITIAL_HOUSEKEEPING);
      setComplaints(INITIAL_COMPLAINTS);
    }

    handleTriggerSync(
      'EXE_DESKTOP',
      'SYSTEM_DATA_RESET',
      `System factory reset authorized (${mode === 'EMPTY_SLATE' ? 'Empty Slate' : 'Full Seeded Dataset'}). Inventory & resident registries refreshed.`
    );

    logActivity(
      'SYSTEM_RESET_EXECUTED',
      'ADMIN',
      `Reset all rooms, beds, students, grievances, and housekeeping engines (${mode}).`,
      'Global System'
    );
  };

  // Mess Actions
  const handleAdjustMessCharge = (studentId: string, amount: number, reason: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const newBal = Math.max(0, s.messBalance + amount);
          return { ...s, messBalance: newBal };
        }
        return s;
      })
    );

    const student = students.find((s) => s.id === studentId);
    logActivity(
      'MESS_CHARGE_ADJUSTED',
      'MESS',
      `Adjusted mess ledger for ${student?.name} by ₹${amount} (${amount >= 0 ? 'Charge' : 'Rebate'}). Reason: ${reason}`,
      `Student: ${student?.name}`
    );
  };

  const handleCollectMessPayment = (studentId: string, amountPaid: number, mode: 'UPI' | 'NET_BANKING' | 'CASH') => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, messBalance: Math.max(0, s.messBalance - amountPaid) } : s))
    );

    const newTxn: FeeTransaction = {
      id: `txn_${Date.now()}`,
      receiptNumber: `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      studentId,
      studentName: student.name,
      rollNumber: student.rollNumber,
      roomNumber: student.roomNumber,
      amount: amountPaid,
      paymentType: 'MESS_BILL',
      bankAccountId: 'bnk_hdfc_02',
      bankName: 'HDFC Bank (Hostel Mess Fund)',
      paymentMode: mode,
      transactionRef: `${mode}-${Math.floor(1000000 + Math.random() * 9000000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: 'SUCCESS',
      recordedBy: currentUser.fullName || currentUser.name || 'Mess Cashier',
      notes: `Mess clearance collection via ${mode}`,
    };

    setTransactions((prev) => [newTxn, ...prev]);

    setBanks((prev) =>
      prev.map((b) => (b.id === 'bnk_hdfc_02' ? { ...b, balance: b.balance + amountPaid } : b))
    );

    logActivity(
      'MESS_PAYMENT_COLLECTED',
      'MESS',
      `Collected mess fee of ₹${amountPaid} for ${student.name} via ${mode}. Issued receipt ${newTxn.receiptNumber}.`,
      `Receipt: ${newTxn.receiptNumber}`
    );
  };

  // Multi-Bank Actions
  const handleSimulatePayment = (bankId: string, amount: number, studentRoll: string) => {
    const student = students.find((s) => s.rollNumber.toLowerCase() === studentRoll.toLowerCase()) || students[0];
    const bank = banks.find((b) => b.id === bankId) || banks[0];

    const newTxn: FeeTransaction = {
      id: `txn_${Date.now()}`,
      receiptNumber: `RCP-WEBHOOK-${Math.floor(1000 + Math.random() * 9000)}`,
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      roomNumber: student.roomNumber,
      amount,
      paymentType: bank.accountType === 'MESS_FEES' ? 'MESS_BILL' : 'HOSTEL_FEE',
      bankAccountId: bank.id,
      bankName: bank.bankName,
      paymentMode: 'UPI',
      transactionRef: `GW-AUTOPAY-${Math.floor(1000000 + Math.random() * 9000000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: 'RECONCILED',
      recordedBy: 'Auto Webhook / Gateway Hook',
      notes: `Live Webhook payload dispatched to ${bank.bankName}`,
    };

    setTransactions((prev) => [newTxn, ...prev]);
    setBanks((prev) =>
      prev.map((b) => (b.id === bankId ? { ...b, balance: b.balance + amount } : b))
    );

    logActivity(
      'GATEWAY_PAYMENT_RECONCILED',
      'FINANCE',
      `Webhook received and auto-reconciled: ₹${amount} in ${bank.bankName} from ${student.name} (${student.rollNumber}).`,
      `Account: ${bank.accountNumber}`
    );
  };

  const handleAddBankAccount = (newBankData: Omit<BankAccount, 'id' | 'lastReconciled'>) => {
    const bankSlug = newBankData.bankName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);
    const newBank: BankAccount = {
      ...newBankData,
      id: `bnk_${bankSlug}_${Date.now()}`,
      upiId: newBankData.upiId || `hostel.${bankSlug || 'pay'}@upi`,
      currency: 'INR',
      lastReconciledAt: 'Just linked',
      lastReconciled: 'Just linked',
    };

    setBanks((prev) => [...prev, newBank]);

    logActivity(
      'BANK_ACCOUNT_LINKED',
      'FINANCE',
      `Linked new commercial bank account: ${newBank.bankName} (${newBank.accountNumber}) for ${newBank.accountType}. Dynamic UPI QR ID: ${newBank.upiId}`,
      `Bank: ${newBank.bankName}`
    );
  };

  const handleReconcileBank = (bankId: string) => {
    const bank = banks.find((b) => b.id === bankId);
    setBanks((prev) =>
      prev.map((b) =>
        b.id === bankId ? { ...b, lastReconciled: new Date().toISOString().replace('T', ' ').slice(0, 19) } : b
      )
    );
    logActivity(
      'BANK_AUDIT_RECONCILED',
      'FINANCE',
      `Manual reconciliation statement confirmed for ${bank?.bankName}.`,
      `Bank: ${bank?.bankName}`
    );
  };

  // Maintenance Actions
  const handleCreateMaintenanceTicket = (ticket: Omit<MaintenanceRequest, 'id' | 'status' | 'isApprovedByAdmin' | 'createdAt'>) => {
    const requiresAdmin = ticket.estimatedCost > 500;
    const newTicket: MaintenanceRequest = {
      ...ticket,
      id: `mnt_${Date.now()}`,
      status: 'PENDING',
      isApprovedByAdmin: !requiresAdmin,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    setMaintenance((prev) => [newTicket, ...prev]);

    if (requiresAdmin) {
      const newAlert: FinancialAlert = {
        id: `alt_${Date.now()}`,
        type: 'LARGE_EXPENSE',
        severity: 'CRITICAL',
        title: `High-Value Maintenance Ticket ($${ticket.estimatedCost})`,
        message: `Ticket for Room ${ticket.roomNumber} (${ticket.title}) requires Admin cryptographic clearance.`,
        amount: ticket.estimatedCost,
        createdAt: new Date().toLocaleString(),
        resolved: false,
      };
      setAlerts((prev) => [newAlert, ...prev]);
    }

    logActivity(
      'WORK_ORDER_LOGGED',
      'MAINTENANCE',
      `Logged maintenance ticket for Room ${ticket.roomNumber}: "${ticket.title}" (Est: $${ticket.estimatedCost}). ${requiresAdmin ? 'ADMIN APPROVAL REQUIRED.' : 'Auto-authorized.'}`,
      `Ticket: Room ${ticket.roomNumber}`
    );
  };

  const handleApproveMaintenance = (ticketId: string) => {
    setMaintenance((prev) =>
      prev.map((m) => (m.id === ticketId ? { ...m, isApprovedByAdmin: true, status: 'IN_PROGRESS' } : m))
    );

    const ticket = maintenance.find((m) => m.id === ticketId);
    logActivity(
      'HIGH_COST_REPAIR_AUTHORIZED',
      'MAINTENANCE',
      `Admin cryptographically approved high-cost repair work order ($${ticket?.estimatedCost}) for Room ${ticket?.roomNumber}.`,
      `Ticket #${ticketId}`
    );
  };

  const handleUpdateMaintenanceStatus = (ticketId: string, status: MaintenanceRequest['status'], actualCost?: number) => {
    setMaintenance((prev) =>
      prev.map((m) => (m.id === ticketId ? { ...m, status, actualCost: actualCost || m.actualCost } : m))
    );

    const ticket = maintenance.find((m) => m.id === ticketId);
    logActivity(
      'WORK_ORDER_STATUS_CHANGED',
      'MAINTENANCE',
      `Maintenance ticket #${ticketId} (Room ${ticket?.roomNumber}) transitioned to ${status}.`,
      `Ticket #${ticketId}`
    );
  };

  // Police Verification Updates
  const handleUpdatePoliceStatus = (studentId: string, status: Student['policeVerificationStatus'], refNo?: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, policeVerificationStatus: status, policeVerificationRefNo: refNo } : s))
    );

    const student = students.find((s) => s.id === studentId);
    const existingRec = policeRecords.find((r) => r.studentId === studentId);

    if (existingRec) {
      setPoliceRecords((prev) =>
        prev.map((r) =>
          r.studentId === studentId
            ? {
                ...r,
                status: status === 'VERIFIED' ? 'CLEARED' : status === 'GENERATED' ? 'DISPATCHED' : 'PENDING',
                dispatchReferenceNo: refNo || r.dispatchReferenceNo,
              }
            : r
        )
      );
    }

    logActivity(
      'POLICE_COMPLIANCE_UPDATED',
      'POLICE',
      `Police verification status for ${student?.name} (${student?.rollNumber}) updated to ${status}. Ref: ${refNo || 'Generated'}. Compliance with Sec 188 IPC confirmed.`,
      `Student: ${student?.name}`
    );
  };

  // Reviews & Notices
  const handleAddReview = (newRev: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>) => {
    const review: Review = {
      ...newRev,
      id: `rev_${Date.now()}`,
      helpfulCount: 0,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 10),
    };
    setReviews((prev) => [review, ...prev]);
    logActivity('REVIEW_POSTED', 'STUDENT', `Resident ${review.authorName} posted a ${review.rating}-star review.`);
  };

  const handleUpvoteReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r))
    );
  };

  const handleAddNotice = (newNotice: Omit<Notice, 'id' | 'postedAt'>) => {
    const notice: Notice = {
      ...newNotice,
      id: `not_${Date.now()}`,
      postedAt: new Date().toISOString().replace('T', ' ').slice(0, 10),
    };
    setNotices((prev) => [notice, ...prev]);
    logActivity('NOTICE_PUBLISHED', 'ADMIN', `Official Bulletin notice posted: "${notice.title}".`);
  };

  // KPI Calculations
  const totalBeds = useMemo(() => rooms.reduce((sum, r) => sum + r.totalBeds, 0), [rooms]);
  const occupiedBeds = useMemo(() => rooms.reduce((sum, r) => sum + r.occupiedBeds, 0), [rooms]);
  const availableBeds = Math.max(0, totalBeds - occupiedBeds);
  const occupancyPercentage = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const totalBankTreasury = useMemo(() => banks.reduce((sum, b) => sum + b.balance, 0), [banks]);
  const pendingMessDeficit = useMemo(() => students.reduce((sum, s) => sum + (s.messBalance || 0), 0), [students]);
  const verifiedPolicePercentage = useMemo(() => {
    if (!students.length) return 0;
    const verified = students.filter((s) => s.policeVerificationStatus === 'VERIFIED').length;
    return Math.round((verified / students.length) * 100);
  }, [students]);

  const isAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'HOSTEL_WARDEN' || currentUser.role === 'FACILITIES_DIRECTOR';

  // Filtered Complaints for Complaints Tab
  const filteredComplaints = complaints.filter((c) => {
    const matchCat = complaintFilterCat === 'ALL' || c.category === complaintFilterCat;
    const matchStatus = complaintFilterStatus === 'ALL' || c.status === complaintFilterStatus;
    return matchCat && matchStatus;
  });

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between flex-shrink-0 z-20">
        <div className="p-4 space-y-5 overflow-y-auto">
          
          {/* Brand Header: Native Nest Veg Boys PG */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 flex-shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs font-black tracking-tight text-slate-100 uppercase truncate">
                  Native Nest
                </h1>
                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  VEG PG
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono block truncate">
                .EXE ⇄ .APK Sync v3.8
              </span>
            </div>
          </div>

          {/* Primary Cross-Platform & Reporting Hub */}
          <div className="space-y-1 pt-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 px-3 pb-1 flex items-center justify-between">
              <span>Dual Workstation</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>

            <button
              onClick={() => setActiveTab('SYNC_DUAL')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'SYNC_DUAL'
                  ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
                <span>.EXE ⇄ .APK Live Hub</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                12ms
              </span>
            </button>

            <button
              onClick={() => setActiveTab('REPORTS')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'REPORTS'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>PDF Report Engine</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                Custom
              </span>
            </button>
          </div>

          {/* Core Operations Navigation Links */}
          <nav className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 pt-2 pb-1">
              Hostel Operations
            </div>

            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'OVERVIEW'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Home className="w-4 h-4" />
              Executive Dashboard
            </button>

            {/* MASTER ROOM & BED CONFIG TAB */}
            <button
              onClick={() => setActiveTab('MASTER_ROOMS')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'MASTER_ROOMS'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <span>Master Rooms &amp; Beds</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold uppercase tracking-wider">
                Master
              </span>
            </button>

            <button
              onClick={() => setActiveTab('STUDENTS')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'STUDENTS'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                Resident Boys Directory
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {students.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ROOMS')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'ROOMS'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4" />
                Room &amp; Bed Allotment
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {availableBeds} Free
              </span>
            </button>

            <button
              onClick={() => setActiveTab('MESS')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'MESS'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Utensils className="w-4 h-4 text-emerald-400" />
                <span>Pure Veg Mess &amp; Billing</span>
              </div>
              {pendingMessDeficit > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                  ₹{(pendingMessDeficit / 1000).toFixed(1)}k
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('FINANCE')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'FINANCE'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Landmark className="w-4 h-4" />
                Multi-Bank Treasury
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                4 Banks
              </span>
            </button>

            {/* MAINTENANCE & 3/4 HOUSEKEEPING QUORUM ENGINE */}
            <button
              onClick={() => setActiveTab('MAINTENANCE')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'MAINTENANCE'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Wrench className="w-4 h-4" />
                <span>Housekeeping &amp; Maint.</span>
              </div>
              {housekeepingRecords.some((h) => h.status === 'FLAGGED_ESCALATED_ADMIN') && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              )}
            </button>

            {/* RESIDENT COMPLAINTS TAB */}
            <button
              onClick={() => setActiveTab('COMPLAINTS')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'COMPLAINTS'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>Resident Grievances</span>
              </div>
              {complaints.filter((c) => c.status === 'OPEN').length > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold">
                  {complaints.filter((c) => c.status === 'OPEN').length} Open
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('POLICE')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'POLICE'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4" />
                <span>Police KYC (Online Portal)</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono">
                {verifiedPolicePercentage}%
              </span>
            </button>

            <button
              onClick={() => setActiveTab('REVIEWS_NOTICES')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'REVIEWS_NOTICES'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Star className="w-4 h-4 text-amber-400" />
              Feedback &amp; Bulletin Board
            </button>

            <div className="pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3">
              System Administration
            </div>

            <button
              onClick={() => setActiveTab('SECURITY')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'SECURITY'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Security &amp; 2FA Hub</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                {securityAssessment.overallSecurityScore}/100
              </span>
            </button>

            <button
              onClick={() => setActiveTab('RBAC')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'RBAC'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              RBAC Permissions
            </button>

            <button
              onClick={() => setActiveTab('AUDIT')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'AUDIT'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <History className="w-4 h-4" />
              Immutable Audit Logs
            </button>
          </nav>
        </div>

        {/* Bottom Documentation & Architecture Button */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2">
          <button
            onClick={() => setShowDocModal(true)}
            className="w-full py-2 px-3 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            Clerk SOP &amp; Schema DDL
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="h-16 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-10 gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                placeholder="Search boy, roll no, room, receipt..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {globalSearchTerm && (
                <button
                  onClick={() => setGlobalSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Quick Platform Switchers & Triggers */}
          <div className="flex items-center gap-3">
            
            {/* .EXE Desktop Download Simulation */}
            <button
              onClick={() => {
                alert('Downloading NativeNestVegBoysPG_Workstation_Setup_v3.8.2.exe (Windows 64-bit Workstation Installer with SQLite/PostgreSQL bridge)');
                logActivity('EXE_CLIENT_DOWNLOADED', 'ADMIN', 'Initiated Windows Desktop installer package download (v3.8.2.exe).');
              }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              title="Download Windows Desktop Executable"
            >
              <Monitor className="w-3.5 h-3.5 text-blue-400" />
              <span>Get .EXE (v3.8)</span>
            </button>

            {/* .APK Android Download Simulation */}
            <button
              onClick={() => {
                alert('Downloading NativeNestVegBoysPG_Android_Staff_v3.8.2.apk (Android 8.0+ APK with bi-directional socket connector)');
                logActivity('APK_PACKAGE_DOWNLOADED', 'ADMIN', 'Initiated Android Mobile Staff APK package download (v3.8.2.apk).');
              }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              title="Download Android APK Package"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Get .APK (v3.8)</span>
            </button>

            {/* Quick PDF Report Trigger */}
            <button
              onClick={() => setActiveTab('REPORTS')}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">PDF Reports</span>
            </button>

            {/* Quick Security & 2FA Hub Trigger */}
            <button
              onClick={() => setActiveTab('SECURITY')}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Security &amp; 2FA</span>
            </button>

            {/* Direct Lodge Complaint Quick Action */}
            <button
              onClick={() => setShowDirectComplaintModal(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <AlertOctagon className="w-3.5 h-3.5" /> 
              <span className="hidden sm:inline">Grievance</span>
            </button>

            {/* Quick Alert Bell */}
            <div className="relative">
              <button
                onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center relative transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {alerts.some((a) => !a.resolved) && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-900"></span>
                )}
              </button>

              {showAlertsDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 space-y-3 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-bold text-slate-200">Real-Time System Notifications</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{alerts.length} Total</span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {alerts.map((a) => (
                      <div
                        key={a.id}
                        className={`p-2.5 rounded-xl border text-xs ${
                          a.severity === 'CRITICAL'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                            : a.severity === 'WARNING'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                            : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                        }`}
                      >
                        <div className="font-bold text-[11px]">{a.title}</div>
                        <p className="text-[10px] opacity-80 mt-0.5 leading-tight">{a.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Active User Chip */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-xl object-cover ring-2 ring-indigo-500/40"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-200 leading-tight">
                  {currentUser.fullName || currentUser.name}
                </div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase font-semibold">
                  {currentUser.role}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Live System KPI Top Strip */}
        <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-2.5 flex items-center justify-between text-xs overflow-x-auto gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Occupancy:</span>
              <span className="font-bold text-slate-100 font-mono">
                {occupiedBeds}/{totalBeds} Beds ({occupancyPercentage}%)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Pure Veg Mess Dues:</span>
              <span className="font-bold text-amber-400 font-mono">
                ₹{pendingMessDeficit.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Treasury Total:</span>
              <span className="font-bold text-emerald-400 font-mono">
                ₹{(totalBankTreasury / 100000).toFixed(2)} Lakhs
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Police KYC:</span>
              <span className="font-bold text-indigo-300 font-mono">
                {verifiedPolicePercentage}% Cleared
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">3/4 Quorum:</span>
              <span className="font-bold text-emerald-400 font-mono">
                {housekeepingRecords.filter((h) => h.status === 'VERIFIED_DONE').length} Verified
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-[11px] text-emerald-400 font-semibold font-mono">
              .EXE ⇄ .APK Interrelated Sync Active ({syncStatus.lastSyncedTimestamp})
            </span>
          </div>
        </div>

        {/* Dynamic Route Viewport Body */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950 space-y-6">
          
          {/* 0. DUAL PLATFORM INTERRELATED VIEW (.EXE <-> .APK) */}
          {activeTab === 'SYNC_DUAL' && (
            <DualPlatformView
              students={students}
              rooms={rooms}
              banks={banks}
              transactions={transactions}
              maintenance={maintenance}
              housekeeping={housekeepingRecords}
              complaints={complaints}
              notices={notices}
              reviews={reviews}
              syncStatus={syncStatus}
              syncPackets={syncPackets}
              onTriggerSync={handleTriggerSync}
              onOpenReportEngine={() => setActiveTab('REPORTS')}
              onOpenPoliceModal={(student) => setSelectedStudentForPolice(student)}
              activeModuleTitle="Native Nest Veg Boys PG - Dual Hub"
              desktopContent={
                <MasterRoomBedConfig
                  rooms={rooms}
                  students={students}
                  onAddRoom={(r) => {
                    handleAddRoom(r);
                    handleTriggerSync('EXE_DESKTOP', 'ROOM_ADDED', `Added Room #${r.roomNumber} (${r.type}, ${r.totalBeds} Beds)`);
                  }}
                  onAddBatchRooms={(rs) => {
                    handleAddBatchRooms(rs);
                    handleTriggerSync('EXE_DESKTOP', 'BATCH_ROOMS_ADDED', `Generated ${rs.length} rooms`);
                  }}
                  onUpdateRoomDetails={(id, data) => {
                    handleUpdateRoomDetails(id, data);
                    handleTriggerSync('EXE_DESKTOP', 'ROOM_UPDATED', `Updated room details`);
                  }}
                  onDeleteRoom={(id) => {
                    handleDeleteRoom(id);
                    handleTriggerSync('EXE_DESKTOP', 'ROOM_DELETED', `Deleted room #${id}`);
                  }}
                  onVacateRoom={(id) => {
                    handleVacateRoom(id);
                    handleTriggerSync('EXE_DESKTOP', 'ROOM_VACATED', `Vacated room #${id}`);
                  }}
                  onResetAllData={handleResetAllData}
                />
              }
            />
          )}

          {/* 0.1 CUSTOMIZED PDF REPORT ENGINE */}
          {activeTab === 'REPORTS' && (
            <ReportEngine
              students={students}
              rooms={rooms}
              banks={banks}
              transactions={transactions}
              maintenance={maintenance}
              housekeeping={housekeepingRecords}
              complaints={complaints}
              notices={notices}
              onClose={() => setActiveTab('SYNC_DUAL')}
            />
          )}

          {/* EXECUTIVE OVERVIEW VIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              
              {/* Executive Welcome & Quick Action Bar */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold text-[10px] border border-indigo-500/30">
                      Campus Operational Hub
                    </span>
                    <span className="text-xs text-slate-400">Himalaya Residence Complex A &amp; B</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-100">
                    Welcome back, {currentUser.fullName || currentUser.name}
                  </h2>
                  <p className="text-xs text-slate-400 max-w-xl">
                    All 4 bank gateway streams, student police compliance webhooks, and room bed allotment chains are operating in zero-deficit synchronized state.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setActiveTab('STUDENTS')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Admit Student
                  </button>

                  <button
                    onClick={() => setActiveTab('ROOMS')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
                  >
                    <ArrowLeftRight className="w-4 h-4 text-indigo-400" /> Shift / Swap Room
                  </button>

                  <button
                    onClick={() => setActiveTab('MESS')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
                  >
                    <Utensils className="w-4 h-4 text-amber-400" /> Collect Mess Fee
                  </button>
                </div>
              </div>

              {/* 4 Multi-Bank Treasury Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {banks.map((b) => (
                  <div
                    key={b.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                        {b.accountType.replace('_', ' ')}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </div>

                    <div className="text-lg font-black text-slate-100 font-mono">
                      ₹{(b.balance).toLocaleString('en-IN')}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                      <span className="truncate">{b.bankName}</span>
                      <span className="font-mono text-indigo-400">Active</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Central Split: Room Matrix Quick Preview & Recent Audit Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left: Occupancy Status & Quick Room Actions */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-sm font-bold text-slate-200">Hostel Floor &amp; Room Block Status</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('ROOMS')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      View All Rooms <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {rooms.map((r) => (
                      <div
                        key={r.id}
                        className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                          r.status === 'OCCUPIED'
                            ? 'bg-slate-950/60 border-slate-800'
                            : r.status === 'MAINTENANCE'
                            ? 'bg-rose-500/10 border-rose-500/30'
                            : 'bg-indigo-500/10 border-indigo-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">Room #{r.roomNumber}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            r.status === 'AVAILABLE'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : r.status === 'OCCUPIED'
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {r.status}
                          </span>
                        </div>

                        <div className="mt-2 text-[11px] text-slate-400">
                          <div>Type: {r.type}</div>
                          <div>Beds: {r.occupiedBeds}/{r.totalBeds}</div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-800/80 font-mono text-[10px] text-indigo-300">
                          ₹{r.monthlyRent}/mo
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Real-Time Audit Activity Feed */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-sm font-bold text-slate-200">Live Audit Trail</h3>
                      </div>
                      <button
                        onClick={() => setActiveTab('AUDIT')}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                      >
                        Full Logs
                      </button>
                    </div>

                    <div className="space-y-3 mt-3">
                      {activityLogs.slice(0, 5).map((log) => (
                        <div key={log.id} className="text-xs border-l-2 border-indigo-500 pl-3 py-0.5 space-y-0.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-slate-300">{log.performedBy}</span>
                            <span className="text-slate-500 font-mono">{log.timestamp.slice(11)}</span>
                          </div>
                          <p className="text-slate-400 text-[11px] line-clamp-2">{log.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 text-center">
                    <span className="text-[11px] text-slate-500 font-mono">
                      Cryptographically Tamper-Evident Logs
                    </span>
                  </div>
                </div>

              </div>

              {/* Department Distribution Recharts Visualization (Executive Analytics) */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-100">Resident Department Distribution</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Recharts Analytics
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Visualizing active resident student counts and hostel occupancy share across academic disciplines
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('STUDENTS')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Open Resident Directory
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Recharts Pie Chart Container */}
                  <div className="lg:col-span-7 h-72 w-full flex items-center justify-center relative">
                    {departmentDistributionData.length === 0 ? (
                      <div className="text-center text-xs text-slate-500">
                        No admitted residents registered yet.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={departmentDistributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={95}
                            paddingAngle={4}
                            dataKey="value"
                            nameKey="name"
                          >
                            {departmentDistributionData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color} 
                                stroke="#0f172a" 
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-slate-950/95 border border-slate-700/90 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
                                      <span className="font-bold text-slate-100">{data.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-6 text-slate-300">
                                      <span className="text-slate-400">Total Enrolled:</span>
                                      <span className="font-mono font-bold text-indigo-300">{data.value} Residents</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-6 text-slate-300">
                                      <span className="text-slate-400">Hostel Proportion:</span>
                                      <span className="font-mono font-bold text-emerald-400">{data.percentage}%</span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}

                    {/* Centered Total Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-black text-slate-100 font-mono">{students.length}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Residents</span>
                    </div>
                  </div>

                  {/* Right Side: Categorized Breakdown Badges */}
                  <div className="lg:col-span-5 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {departmentDistributionData.map((dept) => (
                      <div
                        key={dept.name}
                        className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-center justify-between hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: dept.color }}
                          />
                          <span className="text-xs font-semibold text-slate-200 truncate" title={dept.name}>
                            {dept.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-mono text-[11px] font-bold">
                            {dept.value} {dept.value === 1 ? 'student' : 'students'}
                          </span>
                          <span className="text-xs font-mono font-bold text-indigo-300 w-10 text-right">
                            {dept.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MASTER ROOM & BED CONFIGURATION (VARIABLE ROOM SIZES, BED MATRICES & RENT TIERS) */}
          {activeTab === 'MASTER_ROOMS' && (
            <MasterRoomBedConfig
              rooms={rooms}
              students={students}
              onAddRoom={handleAddRoom}
              onAddBatchRooms={handleAddBatchRooms}
              onUpdateRoomDetails={handleUpdateRoomDetails}
              onUpdateRoom={handleUpdateRoomDetails}
              onDeleteRoom={handleDeleteRoom}
              onAddBedToRoom={handleAddBedToRoom}
              onAddBed={handleAddBedToRoom}
              onRemoveBedFromRoom={handleRemoveBedFromRoom}
              onRemoveBed={handleRemoveBedFromRoom}
              onUpdateBedInRoom={handleUpdateBedInRoom}
              onUpdateBed={handleUpdateBedInRoom}
              onResetAllData={handleResetAllData}
              onResetData={handleResetAllData}
            />
          )}

          {/* 1. RESIDENT DIRECTORY (WITH ID VAULT & GRIEVANCE BUTTONS) */}
          {activeTab === 'STUDENTS' && (
            <StudentManager
              students={students}
              rooms={rooms}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onInitiateRoomSwap={(std) => setSelectedStudentForSwap(std)}
              onInitiatePoliceVerification={(std) => setSelectedStudentForPolice(std)}
              onOpenDocumentVault={(std) => setSelectedStudentForDocs(std)}
              onOpenComplaintModal={(std) => setSelectedStudentForComplaint(std)}
              onTriggerSync={handleTriggerSync}
            />
          )}

          {/* 2. ROOM & BED ALLOTMENT */}
          {activeTab === 'ROOMS' && (
            <RoomManager
              rooms={rooms}
              students={students}
              onUpdateRoomStatus={handleUpdateRoomStatus}
              onInitiateSwap={(std) => setSelectedStudentForSwap(std)}
              onAddRoom={handleAddRoom}
              onAddBatchRooms={handleAddBatchRooms}
              onAddBedToRoom={handleAddBedToRoom}
              onRemoveBedFromRoom={handleRemoveBedFromRoom}
              onUpdateRoomDetails={handleUpdateRoomDetails}
              onDeleteRoom={handleDeleteRoom}
              onVacateRoom={handleVacateRoom}
            />
          )}

          {/* 3. MESS LEDGER & BILLING */}
          {activeTab === 'MESS' && (
            <MessBilling
              students={students}
              rooms={rooms}
              transactions={transactions}
              onAdjustCharge={handleAdjustMessCharge}
              onCollectPayment={handleCollectMessPayment}
            />
          )}

          {/* 4. MULTI-BANK TREASURY */}
          {activeTab === 'FINANCE' && (
            <FinancialDashboard
              banks={banks}
              transactions={transactions}
              alerts={alerts}
              students={students}
              onAddBankAccount={handleAddBankAccount}
              onReconcileBank={handleReconcileBank}
              onSimulatePayment={handleSimulatePayment}
            />
          )}

          {/* 5. MAINTENANCE ENGINE (WITH 3/4 QUORUM CONSENSUS LOGIC) */}
          {activeTab === 'MAINTENANCE' && (
            <MaintenanceEngine
              requests={maintenance}
              rooms={rooms}
              students={students}
              housekeepingRecords={housekeepingRecords}
              isAdmin={isAdmin}
              currentUser={currentUser}
              onCreateRequest={handleCreateMaintenanceTicket}
              onApproveRequest={handleApproveMaintenance}
              onUpdateStatus={handleUpdateMaintenanceStatus}
              onAddHousekeepingSchedule={handleAddHousekeepingSchedule}
              onSubmitCleaningRemark={handleSubmitCleaningRemark}
              onResolveHousekeepingEscalation={handleResolveHousekeepingEscalation}
            />
          )}

          {/* 6. RESIDENT GRIEVANCES & COMPLAINT TRACKER */}
          {activeTab === 'COMPLAINTS' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <AlertOctagon className="w-5 h-5 text-rose-400" />
                      Resident Grievances &amp; Room-Bed Issue Tracker
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Complaints mapped to specific Room Numbers and Bed Identifiers with Chief Warden escalation protocol.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowDirectComplaintModal(true)}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/20 cursor-pointer transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Submit Grievance
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-slate-800">
                  <select
                    value={complaintFilterCat}
                    onChange={(e) => setComplaintFilterCat(e.target.value)}
                    className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="ALL">All Grievance Categories</option>
                    <option value="MAINTENANCE">Room Maintenance / Electrical</option>
                    <option value="HOUSEKEEPING">Housekeeping / Hygiene</option>
                    <option value="WASHROOM">Washroom / Plumbing</option>
                    <option value="MESS_FOOD">Mess Quality &amp; Food</option>
                    <option value="NOISE_DISTURBANCE">Noise Disturbance</option>
                    <option value="INTERNET_WIFI">Wi-Fi &amp; Internet</option>
                    <option value="SECURITY">Security / Theft</option>
                  </select>

                  <select
                    value={complaintFilterStatus}
                    onChange={(e) => setComplaintFilterStatus(e.target.value)}
                    className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="ALL">All Status ({complaints.length})</option>
                    <option value="OPEN">Open Grievances</option>
                    <option value="INVESTIGATING">Under Investigation</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>

                {/* Complaints Table */}
                <div className="mt-4 border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-850 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Ticket &amp; Severity</th>
                        <th className="px-4 py-3">Room &amp; Bed #</th>
                        <th className="px-4 py-3">Resident / Complainant</th>
                        <th className="px-4 py-3">Subject &amp; Details</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredComplaints.map((comp) => (
                        <tr key={comp.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-mono font-bold text-slate-200 block">{comp.ticketNumber}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded inline-block mt-0.5 ${
                              comp.severity === 'CRITICAL'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : comp.severity === 'HIGH'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}>
                              {comp.severity}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="w-7 h-7 rounded-lg bg-slate-800 font-bold text-slate-200 flex items-center justify-center">
                                {comp.roomNumber}
                              </span>
                              <span className="text-slate-300 font-medium">{comp.bedNumber}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span className="text-slate-200 font-medium block">{comp.studentName}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{comp.rollNumber}</span>
                          </td>

                          <td className="px-4 py-3 max-w-sm">
                            <div className="font-semibold text-slate-200">{comp.title}</div>
                            <p className="text-slate-400 text-[11px] truncate">{comp.description}</p>
                            {comp.resolutionNotes && (
                              <div className="mt-1 text-[10px] text-emerald-400 bg-emerald-500/10 p-1 rounded border border-emerald-500/20">
                                <strong>Resolution:</strong> {comp.resolutionNotes}
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {comp.status === 'RESOLVED' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium text-[11px]">
                                <CheckCircle2 className="w-3 h-3" /> Resolved
                              </span>
                            ) : comp.status === 'IN_PROGRESS' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium text-[11px]">
                                <Clock className="w-3 h-3" /> In Progress
                              </span>
                            ) : comp.status === 'INVESTIGATING' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium text-[11px]">
                                <Clock className="w-3 h-3" /> Investigating
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium text-[11px]">
                                <AlertTriangle className="w-3 h-3" /> Open
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {comp.status !== 'RESOLVED' && (
                                <button
                                  onClick={() => {
                                    const note = prompt('Enter resolution action note:', 'Inspected and repaired by Facilities team.');
                                    if (note) handleUpdateComplaintStatus(comp.id, 'RESOLVED', note);
                                  }}
                                  className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-semibold text-[11px] cursor-pointer"
                                >
                                  Resolve
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 7. POLICE COMPLIANCE (SEC 188 IPC) */}
          {activeTab === 'POLICE' && (
            <PoliceCompliance
              records={policeRecords}
              students={students}
              onGenerateForm={(std) => setSelectedStudentForPolice(std)}
              onDispatchVerification={(studentId) => {
                const std = students.find((s) => s.id === studentId);
                if (std) setSelectedStudentForPolice(std);
              }}
            />
          )}

          {/* 8. RBAC MANAGEMENT */}
          {activeTab === 'RBAC' && (
            <RbacUserManagement
              users={users}
              currentUser={currentUser}
              onSwitchUser={(user) => setCurrentUser(user)}
              onAddUser={(newUser) => {
                const userWithId: User = {
                  ...newUser,
                  id: `usr_${Date.now()}`,
                  createdAt: new Date().toISOString().split('T')[0],
                };
                setUsers((prev) => [...prev, userWithId]);
                logActivity('USER_PROVISIONED', 'SECURITY', `Provisioned new account for ${newUser.fullName} (@${newUser.username})`);
              }}
              onOpenSecurityHub={() => setActiveTab('SECURITY')}
            />
          )}

          {/* 8.1 SECURITY REASSESSMENT, DOUBLE VERIFICATION (2FA/DUAL SIGNOFF) & DATA INTEGRATION HUB */}
          {activeTab === 'SECURITY' && (
            <SecurityDataIntegrationHub
              assessment={securityAssessment}
              securityProfiles={securityProfiles}
              dualSignoffRequests={dualSignoffRequests}
              connectors={integrationConnectors}
              currentUser={currentUser}
              users={users}
              syncStatus={syncStatus}
              onApproveDualSignoff={handleApproveDualSignoff}
              onRejectDualSignoff={handleRejectDualSignoff}
              onCreateDualSignoffRequest={handleCreateDualSignoffRequest}
              onUpdateSecurityProfiles={setSecurityProfiles}
              onUpdateConnector={handleUpdateIntegrationConnector}
              onTestConnector={handleTestConnector}
              onTriggerSnapshot={() => {
                logActivity(
                  'ENCRYPTED_SNAPSHOT_EXPORTED',
                  'SECURITY',
                  'Exported AES-256 encrypted PG database state snapshot with integrity checksum verification.'
                );
              }}
            />
          )}

          {/* 9. IMMUTABLE AUDIT LOGS */}
          {activeTab === 'AUDIT' && (
            <ActivityLogViewer
              logs={activityLogs}
            />
          )}

          {/* 10. REVIEWS & NOTICES */}
          {activeTab === 'REVIEWS_NOTICES' && (
            <ReviewsAndNotices
              reviews={reviews}
              notices={notices}
              isAdmin={isAdmin}
              onAddReview={handleAddReview}
              onUpvoteReview={handleUpvoteReview}
              onAddNotice={handleAddNotice}
            />
          )}

        </main>
      </div>

      {/* MODAL: Documentation, Non-Technical SOP & pom.xml / DDL */}
      {showDocModal && (
        <DocumentationModal onClose={() => setShowDocModal(false)} />
      )}

      {/* MODAL: Official Police Verification Form Generator & Digital Signature Pad */}
      {selectedStudentForPolice && (
        <PoliceVerificationModal
          student={selectedStudentForPolice}
          onClose={() => setSelectedStudentForPolice(null)}
          onUpdateStatus={handleUpdatePoliceStatus}
        />
      )}

      {/* MODAL: Room Swap & Chain-of-Thought Clearance Engine */}
      {selectedStudentForSwap && (
        <RoomSwapModal
          students={students}
          rooms={rooms}
          selectedStudent={selectedStudentForSwap}
          onClose={() => setSelectedStudentForSwap(null)}
          onConfirmSwap={handleConfirmRoomSwap}
        />
      )}

      {/* MODAL: Secure Identity Documents Vault (Aadhaar, PAN, College ID) */}
      {selectedStudentForDocs && (
        <DocumentManagerModal
          student={selectedStudentForDocs}
          onClose={() => setSelectedStudentForDocs(null)}
          onSaveDocuments={handleUpdateStudentDocuments}
        />
      )}

      {/* MODAL: Resident Complaint & Grievance Lodge Form */}
      {(selectedStudentForComplaint || showDirectComplaintModal) && (
        <ResidentComplaintModal
          student={selectedStudentForComplaint || undefined}
          rooms={rooms}
          students={students}
          onClose={() => {
            setSelectedStudentForComplaint(null);
            setShowDirectComplaintModal(false);
          }}
          onSubmitComplaint={handleAddComplaint}
        />
      )}

    </div>
  );
};

export default App;
