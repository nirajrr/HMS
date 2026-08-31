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

