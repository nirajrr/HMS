export type UserRole = 'ADMIN' | 'HEAD_CLERK' | 'MESS_ACCOUNTANT' | 'SUPERVISOR' | 'STUDENT' | 'SUPER_ADMIN' | 'HOSTEL_WARDEN' | 'RECEPTIONIST';

export interface User {
  id: string;
  name?: string;
  fullName?: string;
  username?: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  assignedHostelId?: string;
  permissions: string[];
  lastLogin?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName?: string;
  accountType: 'PRIMARY_COLLECTION' | 'PRIMARY_FEES' | 'MESS_FEES' | 'SECURITY_DEPOSIT' | 'CAUTION_DEPOSIT' | 'OPERATIONS' | 'MAINTENANCE_RESERVE';
  balance: number;
  currency?: string;
  isActive: boolean;
  upiId?: string;
  lastReconciledAt?: string;
  lastReconciled?: string;
}

export interface IdentityDocument {
  id: string;
  type: 'AADHAAR' | 'PAN' | 'COLLEGE_COMPANY_ID';
  docNumber: string; // Real or stored value
  maskedNumber: string; // e.g. "XXXX-XXXX-1098", "ABCXX1234F"
  label: string; // e.g. "UIDAI Aadhaar Card", "Income Tax PAN", "College / Corporate ID"
  institutionOrEmployer?: string; // For College/Company ID (e.g. "IIT Delhi", "Infosys Ltd")
  issuedDate?: string;
  expiryDate?: string;
  status: 'VERIFIED' | 'PENDING_REVIEW' | 'FLAGGED';
  verifiedBy?: string;
  verifiedAt?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileHashSha256?: string; // SHA-256 cryptographic integrity seal
  uploadedAt: string;
  isMappedToPoliceForm?: boolean;
}

export interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  mobile: string;
  guardianName: string;
  guardianMobile: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  department: string;
  yearOfStudy: number;
  bloodGroup: string;
  permanentAddress: string;
  city: string;
  state: string;
  pincode: string;
  aadharNumber: string; // Masked / formatted UIDAI
  panNumber?: string; // PAN Number e.g. ABCDE1234F
  collegeOrCompanyId?: string; // ID card number
  institutionOrEmployerName?: string; // e.g. "IIT Delhi" or "Infosys Technologies"
  documents?: IdentityDocument[]; // Stored identity cards & proof with integrity seal
  digitalSignature?: string; // Base64 / SVG signature string for police form
  digitalSignedAt?: string;
  vehicleNumber?: string;
  hostelId: string;
  hostelName: string;
  roomNumber: string;
  bedNumber: string;
  allotmentDate: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'VACATED' | 'SUSPENDED';
  policeVerificationStatus: 'VERIFIED' | 'PENDING' | 'GENERATED' | 'REJECTED';
  policeVerificationRefNo?: string;
  policeStation?: string;
  feeBalance: number;
  messBalance: number;
  depositAmount: number;
}

export type RoomCategory = 'COMPACT' | 'STANDARD' | 'DELUXE' | 'PREMIUM_SUITE' | 'STUDIO_DORM';
export type VentilationType = 'AC_INVERTER' | 'NON_AC' | 'CENTRAL_COOLING' | 'CROSS_VENTILATED';
export type WashroomType = 'ATTACHED_WESTERN' | 'ATTACHED_INDIAN' | 'COMMON_SHARED' | 'DELUXE_ENSUITE';

export interface BedConfig {
  id: string;
  bedNumber: string; // e.g. 'Bed-1', 'Bed-2', 'B1-Window', 'B2-Corner'
  label?: string; // e.g. "Window Side Single Cot", "Lower Bunk Standard"
  bedType?: 'SINGLE_COT' | 'BUNK_LOWER' | 'BUNK_UPPER' | 'PREMIUM_POD' | 'DELUXE_COT';
  position?: 'WINDOW_SIDE' | 'CORNER' | 'DOOR_SIDE' | 'CENTER' | 'BALCONY_FACING';
  monthlyRent: number; // specific monthly rent for this bed
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
  assignedStudentId?: string;
  assignedStudentName?: string;
  assignedStudentRoll?: string;
  features?: string[];
}

export interface Room {
  id: string;
  hostelId: string;
  roomNumber: string;
  floor: number;
  block: string;
  wing?: string;
  
  // Room Size & Physical Specs
  roomSizeSqFt?: number; // e.g., 110, 160, 240, 320, 480 sq ft
  dimensions?: string; // e.g. "12ft x 14ft", "16ft x 20ft"
  roomCategory?: RoomCategory;
  ventilationType?: VentilationType;
  washroomType?: WashroomType;
  
  // Bed Capacity & Occupancy
  type: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'DORMITORY';
  totalBeds: number;
  occupiedBeds: number;
  
  // Financial Structure & Rent Variation
  baseRoomRent?: number; // Whole-room base rental if taken exclusively
  monthlyRent: number; // Average / default monthly rent per bed
  pricingModel?: 'PER_BED' | 'PER_ROOM' | 'VARIABLE_BED_TIER';
  beds?: BedConfig[]; // Individual bed inventory with custom pricing & placement
  
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
  assignedStudentIds: string[];
  amenities: string[];
  notes?: string;
}

export interface FeeTransaction {
  id: string;
  receiptNumber: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  roomNumber: string;
  amount: number;
  paymentType: 'HOSTEL_FEE' | 'MESS_BILL' | 'SECURITY_DEPOSIT' | 'FINE' | 'REFUND';
  bankAccountId: string;
  bankName: string;
  paymentMode: 'UPI' | 'NET_BANKING' | 'CHEQUE' | 'CASH' | 'AUTO_DEBIT';
  transactionRef: string;
  timestamp: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'RECONCILED';
  recordedBy: string;
  notes?: string;
}

export interface MaintenanceRequest {
  id: string;
  ticketNumber?: string;
  hostelId?: string;
  roomNumber: string;
  category: 'PLUMBING' | 'ELECTRICAL' | 'CARPENTRY' | 'CIVIL' | 'PEST_CONTROL' | 'APPLIANCE' | 'HVAC' | 'NETWORK';
  title?: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY' | 'CRITICAL';
  status: 'OPEN' | 'ASSIGNED' | 'PENDING_APPROVAL' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | 'PENDING' | 'COMPLETED';
  estimatedCost: number;
  actualCost?: number;
  requiresAdminApproval: boolean;
  adminApproved?: boolean;
  isApprovedByAdmin?: boolean;
  approvedBy?: string;
  assignedStaff?: string;
  reportedBy?: string;
  studentName?: string;
  createdAt?: string;
  resolvedAt?: string;
  preventiveSchedule?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  module: 'ROOM_MGMT' | 'FINANCE' | 'STUDENT' | 'POLICE_VERIFICATION' | 'RBAC' | 'MAINTENANCE' | 'MESS' | 'ROOM' | 'POLICE' | 'AUTH' | 'SECURITY';
  performedBy: string;
  userRole?: UserRole;
  userId?: string;
  details: string;
  targetEntity?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
}

export interface PoliceVerificationRecord {
  id: string;
  studentId: string;
  rollNumber: string;
  studentName: string;
  applicationNumber: string;
  policeStation: string;
  jurisdictionDistrict: string;
  generatedDate: string;
  status: 'FORM_GENERATED' | 'SUBMITTED_ONLINE' | 'POLICE_ACKNOWLEDGED' | 'CLEARED' | 'FLAGGED';
  submissionMode: 'ONLINE_API' | 'PHYSICAL_SUBMISSION';
  onlineApiTrackingId?: string;
  verifiedAt?: string;
  identifyingOfficer?: string;
}

export interface FinancialAlert {
  id: string;
  type: 'UNRECONCILED_TXN' | 'LARGE_EXPENSE' | 'FEE_OVERDUE' | 'LOW_BANK_BALANCE' | 'MESS_DEFICIT';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  amount?: number;
  bankAccountId?: string;
  studentId?: string;
  createdAt: string;
  resolved: boolean;
}

export interface Review {
  id: string;
  authorName: string;
  userType: 'STUDENT' | 'PARENT' | 'VISITOR' | 'ALUMNI';
  rating: number;
  comment: string;
  isVerifiedStay: boolean;
  helpfulCount: number;
  createdAt?: string;
}

export interface Notice {
  id: string;
  title: string;
  category: 'GENERAL' | 'MESS' | 'MAINTENANCE' | 'EMERGENCY';
  content: string;
  postedBy: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isPinned: boolean;
  postedAt?: string;
}

// ----------------------------------------------------
// RESIDENT COMPLAINT & GRIEVANCE TYPES
// ----------------------------------------------------
export type ComplaintCategory = 
  | 'PLUMBING' 
  | 'ELECTRICAL' 
  | 'HOUSEKEEPING' 
  | 'WIFI_NETWORK' 
  | 'MESS_FOOD' 
  | 'NOISE_DISCIPLINE' 
  | 'CARPENTRY_FURNITURE' 
  | 'WATER_SUPPLY' 
  | 'SECURITY_SAFETY' 
  | 'OTHER';

export type ComplaintSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
export type ComplaintStatus = 'SUBMITTED' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'ESCALATED';

export interface ResidentComplaint {
  id: string;
  ticketId: string; // e.g. "CMP-2026-R101-B1-01"
  studentId: string;
  studentName: string;
  studentRoll: string;
  roomNumber: string;
  bedNumber: string;
  hostelBlock?: string;
  category: ComplaintCategory;
  severity: ComplaintSeverity;
  title: string;
  description: string;
  contactPhone?: string;
  preferredTimeSlot?: string;
  photoAttachmentUrl?: string;
  photoFileName?: string;
  status: ComplaintStatus;
  createdAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  assignedStaff?: string;
  escalatedToAdmin?: boolean;
  feedbackRating?: number;
  feedbackComment?: string;
  linkedWorkOrderId?: string;
}

// ----------------------------------------------------
// HOUSEKEEPING & 3/4 CONSENSUS PROTOCOL TYPES
// ----------------------------------------------------
export type CleaningType = 
  | 'DAILY_SWEEP_MOP' 
  | 'WASHROOM_DEEP_CLEAN' 
  | 'FURNITURE_DUSTING' 
  | 'LINEN_BEDSHEET_CHANGE' 
  | 'WASTE_DISPOSAL_PEST_SPRAY';

export type HousekeepingStatus = 
  | 'SCHEDULED' 
  | 'IN_PROGRESS' 
  | 'CLEANED_AWAITING_STUDENTS' 
  | 'VERIFIED_DONE' 
  | 'FLAGGED_ESCALATED_ADMIN';

export interface StudentCleaningRemark {
  studentId: string;
  studentName: string;
  rollNumber: string;
  bedNumber: string;
  remark: 'DONE_SATISFACTORY' | 'NOT_DONE' | 'POOR_CLEANING';
  rating?: number; // 1 to 5 stars
  feedbackNotes?: string;
  submittedAt: string;
  signatureChecksum?: string;
}

export interface HousekeepingRecord {
  id: string;
  scheduleId: string;
  roomNumber: string;
  block: string;
  floor: number;
  cleaningType: CleaningType;
  cleaningTitle: string;
  assignedStaff: string;
  staffPhone?: string;
  shift: 'MORNING' | 'AFTERNOON' | 'EVENING';
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // e.g. "10:30 AM"
  completedByStaffAt?: string;
  staffNotes?: string;
  proofPhotoUrl?: string;
  status: HousekeepingStatus;
  
  // 3/4 (75%) Quorum Consensus Logic
  totalRoomStudents: number;
  studentRemarks: StudentCleaningRemark[];
  verifiedCount: number; // Students marking DONE_SATISFACTORY
  disputedCount: number; // Students marking NOT_DONE or POOR_CLEANING
  requiredQuorumCount: number; // e.g. Math.ceil(totalRoomStudents * 0.75)
  consensusReached: boolean;
  consensusReachedAt?: string;
  
  // Escalation to Admin if consensus fails or poor remarks
  escalatedToAdmin: boolean;
  escalationReason?: string;
  escalatedAt?: string;
  adminActionNotes?: string;
  adminResolved?: boolean;
  adminResolvedAt?: string;
  penaltyAppliedToStaff?: boolean;
}

// ----------------------------------------------------
// DUAL PLATFORM (.EXE & .APK) & LIVE SYNC ENGINE TYPES
// ----------------------------------------------------
export type PlatformViewMode = 'DESKTOP_EXE' | 'ANDROID_APK' | 'DUAL_SYNC_VIEW';

export type SyncOrigin = 'EXE_DESKTOP' | 'APK_MOBILE' | 'CLOUD_CENTRAL';

export interface SyncPacket {
  id: string;
  timestamp: string;
  source: SyncOrigin;
  destination: SyncOrigin;
  action: string;
  module: string;
  entityId: string;
  operator: string;
  summary: string;
  latencyMs: number;
  hash: string;
  status: 'SYNCED' | 'IN_FLIGHT' | 'CONFLICT_RESOLVED';
}

export interface SyncEngineStatus {
  isConnected: boolean;
  activeMode: PlatformViewMode;
  desktopClientVersion: string;
  androidApkVersion: string;
  lastSyncedTimestamp: string;
  socketPingMs: number;
  totalPacketsExchanged: number;
  autoSyncEnabled: boolean;
  activeNodes: {
    exeDesktopWorkstation: boolean;
    apkMobileHandheld: boolean;
    cloudRelay: boolean;
  };
}

// ----------------------------------------------------
// CUSTOM REPORT ENGINE & PDF EXPORT TYPES
// ----------------------------------------------------
export type ReportType = 
  | 'FINANCIAL_AUDIT'
  | 'POLICE_KYC_COMPLIANCE'
  | 'MESS_VEG_DINING'
  | 'ROOM_BED_OCCUPANCY'
  | 'MAINTENANCE_HOUSEKEEPING_CONSENSUS'
  | 'CUSTOM_AD_HOC';

export interface ReportFilterConfig {
  reportType: ReportType;
  title: string;
  subtitle: string;
  preparedBy: string;
  designation: string;
  dateRangeFrom: string;
  dateRangeTo: string;
  hostelBlock: string;
  floor: string;
  statusFilter: string;
  dietPreferenceFilter?: string;
  includeWatermark: boolean;
  watermarkText: string;
  includeDigitalSignatureSeal: boolean;
  includeQrSeal: boolean;
  includeLetterhead: boolean;
  includeFinancialTotals: boolean;
  orientation: 'PORTRAIT' | 'LANDSCAPE';
}

// ----------------------------------------------------
// ONLINE POLICE SUBMISSION & HYPERLINK PORTAL TYPES
// ----------------------------------------------------
export interface OnlinePoliceSubmissionReceipt {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  roomNumber: string;
  bedNumber: string;
  applicationRefNo: string;
  governmentAckNumber: string;
  policeStationName: string;
  policeStationCode: string;
  shoOfficerName: string;
  onlineHyperlink: string;
  submittedAt: string;
  cctnsStatus: 'ONLINE_SUBMITTED' | 'BEAT_VERIFICATION_PENDING' | 'CLEARED_GREEN' | 'REJECTED';
  digitalSha256Checksum: string;
}

// ----------------------------------------------------
// SECURITY REASSESSMENT, DOUBLE VERIFICATION & DATA INTEGRATION TYPES
// ----------------------------------------------------

export type TwoFactorMethod = 'TOTP_AUTHENTICATOR' | 'SMS_OTP' | 'EMAIL_OTP' | 'HARDWARE_KEY_FIDO2';

export interface UserSecurityProfile {
  userId: string;
  twoFactorEnabled: boolean;
  twoFactorMethod: TwoFactorMethod;
  phoneNumberMasked?: string;
  authenticatorAppLinked: boolean;
  backupCodesRemaining: number;
  lastVerifiedAt?: string;
  ipLockEnabled: boolean;
  trustedDevicesCount: number;
  failedLoginAttempts: number;
  sessionTimeoutMinutes: number;
}

export type DualSignoffAction = 
  | 'FINANCIAL_REFUND' 
  | 'HIGH_VALUE_EXPENSE' 
  | 'TENANT_POLICE_CLEARANCE' 
  | 'SYSTEM_FACTORY_RESET' 
  | 'MASS_DATA_EXPORT' 
  | 'ROOM_TARIFF_OVERRIDE'
  | 'STUDENT_EXPULSION_VACATE';

export interface DualSignoffRequest {
  id: string;
  actionType: DualSignoffAction;
  title: string;
  description: string;
  amount?: number;
  initiatedBy: string;
  initiatorRole: UserRole;
  initiatorTimestamp: string;
  initiatorSignatureHash: string;
  requiredApproverRole: UserRole;
  secondApproverName?: string;
  secondApproverRole?: UserRole;
  secondApproverTimestamp?: string;
  secondApproverOtpCode?: string;
  secondApproverSignatureHash?: string;
  status: 'PENDING_SECOND_VERIFICATION' | 'DOUBLE_VERIFIED_EXECUTED' | 'REJECTED' | 'EXPIRED';
  targetEntityId?: string;
  targetEntityName?: string;
  integrityChecksum: string;
}

export type IntegrationCategory = 
  | 'GOVERNMENT_POLICE_CCTNS' 
  | 'COLLEGE_SIS_ERP' 
  | 'BANKING_BBPS_PAYMENTS' 
  | 'SMS_WHATSAPP_TELECOM' 
  | 'IOT_BIOMETRIC_TURNSTILE' 
  | 'CLOUD_ENCRYPTED_VAULT';

export interface DataIntegrationConnector {
  id: string;
  name: string;
  category: IntegrationCategory;
  protocol: 'REST_WEBHOOK' | 'CCTNS_SOAP_API' | 'BBPS_NPCI_SWITCH' | 'WSS_SOCKET' | 'MQTT_IOT' | 'ENCRYPTED_SFTP';
  endpointUrl: string;
  authMethod: 'OAUTH2_BEARER' | 'MTLS_CERTIFICATE' | 'HMAC_SHA256_APIKEY' | 'IP_WHITELIST';
  status: 'HEALTHY_CONNECTED' | 'SYNCING' | 'ATTENTION_REQUIRED' | 'SIMULATED_ACTIVE';
  lastSyncTimestamp: string;
  syncFrequency: string;
  recordsSyncedTotal: number;
  latencyMs: number;
  encryptionStandard: string;
  payloadSchemaVersion: string;
  ipWhitelistRange: string;
  autoSyncActive: boolean;
  webhookSecretMasked: string;
}

export interface SecurityAuditAssessment {
  overallSecurityScore: number; // 0 - 100
  securityTier: 'TIER_1_ENTERPRISE_GRADE' | 'TIER_2_ENHANCED' | 'TIER_3_BASIC';
  doubleVerificationComplianceScore: number;
  dataIntegrationHealthScore: number;
  encryptionStatus: string;
  activeVulnerabilities: number;
  lastPenTestDate: string;
  sessionSecurity: {
    sessionTimeoutMins: number;
    enforceIpLock: boolean;
    maxFailedAttempts: number;
    mfaEnforcedRoles: UserRole[];
  };
  threatMonitoring: {
    suspiciousLoginsBlocked24h: number;
    integrityMismatchAlerts: number;
    crossPlatformPacketsAudited: number;
  };
}

// ----------------------------------------------------
// STUDENT MISCONDUCT & GUARDIAN NOTIFICATION (WHATSAPP & SMS) TYPES
// ----------------------------------------------------

export type MisconductCategory = 
  | 'CURFEW_LATE_ENTRY' 
  | 'RAGGING_BULLYING' 
  | 'PROPERTY_DAMAGE' 
  | 'UNAUTHORIZED_GUEST' 
  | 'SUBSTANCE_PROHIBITION' 
  | 'NOISE_DISTURBANCE' 
  | 'FIGHT_VIOLENCE' 
  | 'INSUBORDINATION' 
  | 'ACADEMIC_ATTENDANCE' 
  | 'OTHER';

export type MisconductSeverity = 
  | 'MINOR_WARNING' 
  | 'MODERATE_INFRACTION' 
  | 'MAJOR_VIOLATION' 
  | 'CRITICAL_DISCIPLINARY';

export type DisciplinaryActionType = 
  | 'WRITTEN_WARNING' 
  | 'GUARDIAN_SUMMONS' 
  | 'FINE_IMPOSED' 
  | 'PROBATION' 
  | 'ROOM_EXPULSION_SUSPENSION';

export interface DisciplinaryIncident {
  id: string;
  incidentNumber: string; // e.g. "DISC-2026-0812"
  studentId: string;
  studentRoll: string;
  studentName: string;
  roomNumber: string;
  bedNumber: string;
  department?: string;
  guardianName: string;
  guardianMobile: string;
  category: MisconductCategory;
  severity: MisconductSeverity;
  title: string;
  matterDescription: string; // Detailed matter of student misconduct
  incidentDate: string;
  incidentTime: string;
  location: string;
  fineAmount?: number;
  actionProposed: DisciplinaryActionType;
  reportedBy: string;
  witnessInfo?: string;
  smsStatus: 'NOT_SENT' | 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED';
  whatsAppStatus: 'NOT_SENT' | 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ';
  smsMessageContent: string;
  whatsAppMessageContent: string;
  dispatchedAt?: string;
  dltTemplateId?: string;
  whatsAppMessageId?: string;
  sha256AuditHash: string;
  parentAcknowledged?: boolean;
  parentAcknowledgmentNotes?: string;
  status: 'OPEN_INVESTIGATION' | 'NOTICE_SERVED' | 'GUARDIAN_RESOLVED' | 'ESCALATED_CHIEF_WARDEN' | 'CLOSED';
}

// ----------------------------------------------------
// USER AUTHENTICATION & ROLE-WISE ACCESS TYPES
// ----------------------------------------------------

export interface UserCredential {
  userId: string;
  loginId: string; // Username / Login ID
  passwordHash: string;
  plainPasswordHint?: string; // For administrative review / demo display
  role: UserRole;
  fullName: string;
  email: string;
  department: string;
  accessibleTabs: string[];
  restrictedActions: string[];
  mustChangePasswordOnFirstLogin?: boolean;
  failedLoginAttempts: number;
  isAccountLocked: boolean;
  twoFactorSecret?: string;
  isTwoFactorEnabled: boolean;
  lastLoginTimestamp?: string;
}

export interface AuthSession {
  isAuthenticated: boolean;
  user: User | null;
  credential?: UserCredential | null;
  token: string;
  loginTime: string;
  expiresAt: string;
  boundMachineHwid: string;
  ipAddress: string;
}

export interface RoleRightDefinition {
  role: UserRole;
  roleDisplayName: string;
  description: string;
  colorBadge: string;
  accessibleNavTabs: Array<{ id: string; name: string; permission: 'FULL_CONTROL' | 'READ_WRITE' | 'READ_ONLY' }>;
  deniedModules: string[];
  maxHighValueApprovalLimit: number; // in INR
  canManageUsers: boolean;
  canExportPoliceData: boolean;
  canApproveRoomSwap: boolean;
  canCollectFees: boolean;
}

// ----------------------------------------------------
// HARDWARE MACHINE LOCK & NODE-LOCK LICENSING TYPES
// ----------------------------------------------------

export interface HardwareFingerprint {
  machineHwid: string; // e.g. "HWID-88A2-771B-94E0-55C3"
  motherboardUuid: string;
  cpuMicrocodeId: string;
  primaryMacAddress: string;
  diskVolumeSerial: string;
  osHostName: string;
  osPlatform: 'WINDOWS_X64' | 'LINUX_X64' | 'DARWIN_ARM64' | 'ANDROID_ARM64';
  totalRamGb: number;
  generatedTimestamp: string;
  hardwareHashSha256: string;
}

export interface MachineLicense {
  licenseKey: string; // e.g. "NVNEST-PRO-88A2-771B-94E0-ACTIVATED"
  organizationName: string;
  edition: 'ENTERPRISE_STANDALONE_NODE_LOCKED' | 'WARDEN_SINGLE_PC' | 'HOSTEL_CAMPUS_PREMIUM';
  boundHwid: string;
  boundHostName: string;
  activationDate: string;
  expiryDate: string; // e.g. "2029-12-31" or "LIFETIME_PERPETUAL"
  maxConcurrentUsers: number;
  antiTamperSeal: string; // RSA / HMAC signature
  status: 'ACTIVE_BOUND' | 'HARDWARE_MISMATCH_LOCKED' | 'EXPIRED' | 'UNLICENSED_TRIAL';
  lockoutReason?: string;
  allowedOfflineDays: number;
  lastHardwareScanTimestamp: string;
}

export interface StandalonePackagingStep {
  stepNumber: number;
  title: string;
  category: 'ELECTRON_WINDOWS' | 'TAURI_RUST' | 'SQLITE_DATABASE' | 'NODE_LOCK_BINDER' | 'INSTALLER_BUILD';
  command: string;
  description: string;
  codeSnippet?: string;
  fileName?: string;
}



