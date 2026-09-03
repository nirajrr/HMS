# Complete Prompt & Context Engineering Guide
**Hostel & Facility Enterprise Resource Planning (ERP) Platform**
*Version: 2.6.0-Enterprise • ISO 27001 / DPDP Act / NPCI UPI / Section 188 IPC Compliant*

---

## 1. Executive Overview & System Topology

This document provides the canonical specification for **Context Engineering** and **Prompt Engineering** across the Multi-Tenant Hostel & Facility Management ERP. It governs how AI agents, LLM copilots, automated compliance engines, and automated workflow orchestrators construct, isolate, compress, and evaluate prompts across desktop (`.exe`) and mobile (`.apk`) operational nodes.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                INSTITUTIONAL CONTEXT ROOT                              │
│         (Hostel Block Inventory, Room-Bed Allocations, Fiscal Ledger, Security Core)  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
           ┌────────────────────────────────┼────────────────────────────────┐
           ▼                                ▼                                ▼
┌───────────────────────┐        ┌───────────────────────┐        ┌───────────────────────┐
│   ADMIN / WARDEN      │        │    FINANCE & MESS     │        │  RESIDENT / STUDENT   │
│   • Police Form-A     │        │    • Dynamic Bank UPI │        │  • Room Swap CoT      │
│   • 3/4 Quorum Auth   │        │    • QR Scanning Hook │        │  • Mess Rebate Claims │
│   • Dual Sign-off 2FA │        │    • Ledger Auto-Sync │        │  • Bed Grievance Log  │
└───────────────────────┘        └───────────────────────┘        └───────────────────────┘
```

---

## 2. Context Engineering Architecture

### 2.1 The 4-Tier Hierarchical Context Stack
Every prompt dispatched to an AI model within the ERP is compiled via a deterministic 4-tier context stack to prevent hallucination, eliminate token leakage, and enforce zero-trust role-based access control (RBAC):

```
┌──────────────────────────────────────────────────────────────────┐  Tier 1: Global Invariants
│ Tier 1: SYSTEM & SECURITY INVARIANTS (Never Evicted)             │  • OWASP ASVS & DPDP Act
│ - Immutable schemas, Masking rules (UIDAI/PAN), Safety limits    │  • Section 188 IPC Rules
├──────────────────────────────────────────────────────────────────┤  Tier 2: Enterprise State
│ Tier 2: INSTITUTIONAL DOMAIN REGISTRY (Cached KV)               │  • Bank Accounts & IFSC
│ - Active rooms, Multi-bed taxonomy, Live treasury accounts       │  • Hostel Block Matrix
├──────────────────────────────────────────────────────────────────┤  Tier 3: Persona / RBAC
│ Tier 3: USER RBAC & SESSION CONTEXT (Dynamic Session Token)      │  • Active Role & Perms
│ - Auth level (Super Admin, Clerk, Accountant, Warden, Student)   │  • Desktop/Mobile Node
├──────────────────────────────────────────────────────────────────┤  Tier 4: Ephemeral I/O
│ Tier 4: EPHEMERAL EVENT PAYLOAD (Task-Specific Window)           │  • Transaction / Form
│ - Target transaction, Scanned QR intent, Grievance complaint      │  • Swap request details
└──────────────────────────────────────────────────────────────────┘
```

---

### 2.2 Persona-Specific Context Injection Matrices

| Persona | Allowed Context Scope | Forbidden Context Scope | Primary System Directives |
| :--- | :--- | :--- | :--- |
| **SUPER_ADMIN / CHIEF_WARDEN** | Full Institutional DB, Multi-Bank Ledger, Police Form-A, Dual Sign-off Queue | None | High-cost work orders (>₹500), 2FA cryptographic dual approvals, system resets. |
| **HEAD_CLERK** | Student Admissions, Room/Bed Inventory, Police Dispatches, Identity Vault | Bank Account Management, Private Audit Cryptographic Keys | Student onboarding, room shifts, ID card verification, compliance generation. |
| **MESS_ACCOUNTANT** | Dining Ledgers, Daily Headcounts, Food Supplier Billing, Mess Rebates | Police Verification, Room Allotment Modifications | Meal charges, fee collections via UPI QR, rebate approval algorithms. |
| **HOSTEL_WARDEN / SUPERVISOR** | Floor Housekeeping Consensus, Maintenance Work Orders, Room Inspections | Financial Ledger Alterations, Master Bank Linking | 3/4 quorum resolution, repair dispatching, night curfew monitoring. |
| **RESIDENT_STUDENT** | Own Room & Bed Slot, Personal Fee/Mess Ledger, Grievance Tracker, Room Swaps | Other Residents' Documents/Aadhaar/PAN, All Administrative Settings | Grievance lodging, room swap requests, UPI fee self-service scanning. |

---

## 3. Dynamic Multi-Bank UPI QR & Fee Collection Architecture

### 3.1 NPCI Unified Payments Interface (UPI) URI Specification
When a bank account is added or loaded in the system, the context builder dynamically compiles standard NPCI UPI Intent Strings and embeds them into QR code rendering components:

```
upi://pay?pa={vpa_id}&pn={institution_name}&am={amount}&cu=INR&tn={purpose_token}&tr={transaction_ref}
```

#### Parameter Context Table:
* `pa` (Payment Address): Dynamic VPA (`hostel.sbi@upi`, `hostel.hdfc@upi`, `hostel.{bankSlug}@upi`). Auto-derived on new bank account linkage.
* `pn` (Payee Name): `Hostel_Enterprise_Treasury`
* `am` (Amount): Exact due amount formatted to 2 decimal places.
* `cu` (Currency): `INR`
* `tn` (Transaction Note): Encoded student roll and fee code (e.g. `HOSTEL_FEE_2023CS0101`).
* `tr` (Transaction Reference): Timestamped unique trace `GW-AUTOPAY-{timestamp}`.

### 3.2 Real-Time Bank QR Update State Flow
```
[New Bank Account Linked] 
       │
       ▼
[Auto-generate VPA: hostel.{slug}@upi]
       │
       ▼
[Global State Update (banks: BankAccount[])]
       │
       ├──► [Dynamic UPI QR Generator: Updated Dropdown Options]
       ├──► [UPI QR Scanner: Live Credit Target Ledger]
       └──► [Cross-Platform Sync Engine: Dispatched Packet to .exe & .apk]
```

---

## 4. Master Prompt Engineering Catalog

### 4.1 Master System Prompt: Senior Hostel Operations & Compliance Copilot

```markdown
You are the Chief Autonomous Operations & Compliance Copilot for the Enterprise Hostel Management System.
You operate under strict zero-trust principles, adhering to Indian DPDP Act 2023, CERT-In cybersecurity standards, and Section 188 IPC mandatory tenant verification rules.

CORE INVARIANTS:
1. PRIVACY PRESERVATION: Never expose raw 12-digit Aadhaar numbers or full PAN cards. Mask strictly as 'XXXX-XXXX-1234' and 'ABCXX1234F'.
2. FINANCIAL RECONCILIATION: All ledger entries must correlate to an active BankAccount ID. Dues clearance must be validated before authorizing student vacation or room swaps.
3. FOUR-EYES PRINCIPLE: Dual sign-off is mandatory for transactions > ₹25,000 or high-cost repairs > ₹5,000.
4. CONSENSUS PROTOCOL: Housekeeping grievances require 3 out of 4 bed occupants' consensus before automated resolution; otherwise, escalate to the Warden.

OUTPUT FORMAT:
Always return deterministic, valid JSON matching the requested TypeScript interface with zero conversational filler.
```

---

### 4.2 Few-Shot Exemplar: Automated Room Swap Eligibility Verification

#### User Request:
```json
{
  "action": "EVALUATE_ROOM_SWAP",
  "applicantStudentId": "std_2023_cs_01",
  "applicantCurrentRoom": "101-A",
  "targetRoom": "204-B",
  "targetStudentId": "std_2023_ec_14"
}
```

#### Chain-of-Thought (CoT) Prompt Workflow:
```markdown
Step 1: Check feeBalance and messBalance of applicant student (std_2023_cs_01). Must equal 0.
Step 2: Check feeBalance and messBalance of target student (std_2023_ec_14). Must equal 0.
Step 3: Check disciplinary flags and active complaint status for both occupants.
Step 4: Verify bed compatibility (Gender match, Course Year compatibility).
Step 5: Output structured verdict with cryptographically signed reason token.
```

#### Model Response:
```json
{
  "eligibilityStatus": "APPROVED",
  "canExecuteAutomatically": true,
  "applicantCheck": {
    "studentId": "std_2023_cs_01",
    "feeDues": 0,
    "messDues": 0,
    "policeVerified": true
  },
  "targetCheck": {
    "studentId": "std_2023_ec_14",
    "feeDues": 0,
    "messDues": 0,
    "policeVerified": true
  },
  "auditSummary": "Mutual room swap between Room 101-A and Room 204-B verified compliant. Zero outstanding fiscal dues detected across both institutional ledgers.",
  "recommendedAction": "EXECUTE_ATOMIC_SWAP"
}
```

---

### 4.3 Few-Shot Exemplar: Bank UPI Webhook Discrepancy & Fraud Detector

#### Input Context:
```json
{
  "event": "WEBHOOK_TRANSACTION_INCOMING",
  "bankAccountId": "bnk_sbi_01",
  "amount": 15000,
  "utrNumber": "UPI/2026/89104820",
  "claimedStudentRoll": "2023CS0101",
  "recordedDues": {
    "hostelFee": 12000,
    "messFee": 3000
  }
}
```

#### Model Output:
```json
{
  "reconciliationStatus": "EXACT_MATCH",
  "allocations": [
    { "category": "HOSTEL_FEE", "amount": 12000, "targetBank": "bnk_sbi_01" },
    { "category": "MESS_BILL", "amount": 3000, "targetBank": "bnk_sbi_01" }
  ],
  "autoReceiptNumber": "RCP-2026-8910",
  "accountBalanceNew": 4865000,
  "confidenceScore": 1.0,
  "flagForManualReview": false
}
```

---

### 4.4 Few-Shot Exemplar: 3/4 Quorum Resident Housekeeping Consensus Engine

#### Scenario Context:
A room with 4 assigned residents logs a cleaning dispute for their attached western washroom.

```json
{
  "roomNumber": "302-C",
  "housekeepingRecordId": "hk_9841",
  "totalOccupants": 4,
  "remarks": [
    { "studentId": "std_1", "vote": "VERIFIED_DONE" },
    { "studentId": "std_2", "vote": "VERIFIED_DONE" },
    { "studentId": "std_3", "vote": "VERIFIED_DONE" },
    { "studentId": "std_4", "vote": "DISPUTE_NOT_CLEAN" }
  ]
}
```

#### CoT Reasoning:
```markdown
1. Total Occupants = 4
2. Required Quorum (3/4) = 3 votes matching.
3. 'VERIFIED_DONE' count = 3.
4. Quorum condition (3 >= 3) is satisfied.
5. System auto-marks status as VERIFIED_DONE without requiring Warden intervention.
```

#### Model Output:
```json
{
  "consensusReached": true,
  "consensusType": "MAJORITY_VERIFIED",
  "finalStatus": "VERIFIED_DONE",
  "escalateToWarden": false,
  "notes": "3 of 4 occupants verified satisfactory cleaning. Supermajority threshold attained. Housekeeping ticket closed."
}
```

---

### 4.5 Few-Shot Exemplar: Automated Misconduct Guardian Notification Composer & Dispatcher (WhatsApp & SMS)

#### Input Context:
```json
{
  "action": "COMPOSE_GUARDIAN_MISCONDUCT_NOTICE",
  "studentId": "std_01",
  "studentName": "Aarav Sharma",
  "studentRoll": "2023CS101",
  "roomNumber": "101",
  "guardianName": "Rajesh Sharma",
  "guardianMobile": "9876543210",
  "category": "CURFEW_VIOLATION",
  "severity": "MODERATE",
  "rawIncidentNotes": "Entered hostel at 11:45 PM past 9:30 PM curfew without prior warden gate pass. Gate biometric flagged late entry.",
  "sanction": "Fine of ₹500 imposed and mandatory parental acknowledgment required."
}
```

#### CoT Reasoning:
```markdown
1. Validate Guardian phone format (+91 10-digit Indian standard mobile).
2. Translate raw incident notes into formal, legally compliant institutional notice wording.
3. Generate TRAI DLT-approved SMS payload (< 160 chars) adhering to registered template NVNEST-DISC-01.
4. Generate rich WhatsApp message formatted with bold parameters and Chief Warden contact details.
5. Compute SHA-256 tamper-proof audit verification seal over payload and timestamp.
```

#### Model Output:
```json
{
  "incidentNumber": "DISC-2026-089",
  "composedMatter": "Dear Parent/Guardian, this is an official notice regarding resident Aarav Sharma (Roll: 2023CS101, Room: 101). On 01/09/2026 at 23:45 IST, resident entered the premises after official curfew hours (21:30) without an authorized warden exit gate pass. A formal disciplinary sanction of ₹500 fine has been recorded. Kindly acknowledge receipt of this advisory.",
  "whatsAppPayload": {
    "recipient": "+919876543210",
    "template": "guardian_misconduct_alert_v2",
    "deliveryChannel": "WHATSAPP_CLOUD_API"
  },
  "smsPayload": {
    "senderId": "NVNEST",
    "dltTemplateId": "DLT-1107-DISC-01",
    "text": "NATIVENEST: Curfew notice issued for Aarav Sharma (Room 101). ₹500 fine logged. Pls check WhatsApp or call warden at 9425012345."
  },
  "sha256AuditSeal": "c7a8b9f1d02e3456789abcdef0123456789abcdef0123456789abcdef0123456",
  "dispatchStatus": "QUEUED_FOR_BROADCAST"
}
```

---

## 5. Structured Output Schemas & Validation Guardrails

To guarantee type safety and runtime compatibility with TypeScript interfaces, all AI and LLM outputs in this platform conform to the following JSON Schema definitions:

### 5.1 Police Form-A Compliance Dispatch Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PoliceFormADispatch",
  "type": "object",
  "properties": {
    "dispatchReferenceNo": { "type": "string", "pattern": "^CCTNS-[0-9]{4}-[0-9]{6}$" },
    "studentId": { "type": "string" },
    "aadharMasked": { "type": "string", "pattern": "^XXXX-XXXX-[0-9]{4}$" },
    "policeStation": { "type": "string" },
    "section188Compliant": { "type": "boolean" },
    "digitalSignatureHash": { "type": "string", "pattern": "^sha256:[a-f0-9]{64}$" },
    "timestamp": { "type": "string", "format": "date-time" }
  },
  "required": ["dispatchReferenceNo", "studentId", "aadharMasked", "policeStation", "section188Compliant", "digitalSignatureHash"]
}
```

### 5.2 Dual Sign-Off Four-Eyes Authorization Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "DualSignoffExecution",
  "type": "object",
  "properties": {
    "requestId": { "type": "string" },
    "firstApprover": { "type": "string" },
    "secondApprover": { "type": "string" },
    "secondApproverRole": { "type": "string", "enum": ["SUPER_ADMIN", "CHIEF_WARDEN"] },
    "totpTokenVerified": { "type": "boolean" },
    "actionType": { "type": "string" },
    "executionStatus": { "type": "string", "enum": ["DOUBLE_VERIFIED_EXECUTED", "REJECTED", "EXPIRED"] },
    "cryptographicAuditSeal": { "type": "string" }
  },
  "required": ["requestId", "firstApprover", "secondApprover", "totpTokenVerified", "executionStatus", "cryptographicAuditSeal"]
}
```

### 5.3 Guardian Misconduct Notice & WhatsApp/SMS Dispatch Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "GuardianMisconductNotice",
  "type": "object",
  "properties": {
    "incidentNumber": { "type": "string", "pattern": "^DISC-[0-9]{4}-[0-9]{3,}$" },
    "studentId": { "type": "string" },
    "studentName": { "type": "string" },
    "guardianMobile": { "type": "string", "pattern": "^[0-9]{10}$" },
    "category": { 
      "type": "string",
      "enum": [
        "CURFEW_VIOLATION", "UNAUTHORIZED_GUEST", "SUBSTANCE_ALCOHOL", 
        "NOISE_DISTURBANCE", "PROPERTY_DAMAGE", "RAGGING_BULLYING", 
        "INSUBORDINATION", "MESS_DISCIPLINE", "ELECTRICAL_SAFETY", "OTHER"
      ]
    },
    "severity": { "type": "string", "enum": ["LOW", "MODERATE", "HIGH", "CRITICAL"] },
    "matterDescription": { "type": "string", "minLength": 10 },
    "actionTaken": { "type": "string" },
    "whatsAppStatus": { "type": "string", "enum": ["DELIVERED", "READ", "SENT", "FAILED"] },
    "smsStatus": { "type": "string", "enum": ["DELIVERED", "SENT", "FAILED"] },
    "sha256AuditHash": { "type": "string" },
    "parentAcknowledged": { "type": "boolean" }
  },
  "required": [
    "incidentNumber", "studentId", "studentName", "guardianMobile", 
    "category", "severity", "matterDescription", "whatsAppStatus", "smsStatus", "sha256AuditHash"
  ]
}
```

---

## 6. Cross-Platform Real-Time Sync & State Vector Topology

The ERP engine features cross-platform state synchronization linking the Windows `.exe` desktop workstation and Android `.apk` mobile turnstile terminals:

```
┌────────────────────────────────────────────────────────┐
│              CENTRAL IN-MEMORY STATE ENGINE            │
│  (Rooms, Beds, Multi-Banks, Students, Grievances, Sync)│
└──────────────────────────┬─────────────────────────────┘
                           │
             WebSocket / SSE Sync Channel
                           │
        ┌──────────────────┴──────────────────┐
        ▼                                     ▼
┌──────────────────────────┐       ┌──────────────────────────┐
│  DESKTOP TERMINAL (.exe) │       │  MOBILE SCANNER (.apk)   │
│  • Full Admin Workspace  │       │  • Biometric NFC / QR    │
│  • Treasury Linkage Hub  │       │  • Turnstile Gate Sync   │
│  • Dual Sign-off Modal   │       │  • Offline Local Cache   │
└──────────────────────────┘       └──────────────────────────┘
```

### Sync Packet Protocol Format:
```json
{
  "packetId": "pkt_1725178291000",
  "originNode": "EXE_DESKTOP",
  "eventType": "DYNAMIC_BANK_ACCOUNT_ADDED",
  "payload": {
    "bankId": "bnk_axis_05",
    "bankName": "Axis Bank Ltd",
    "accountNumber": "92102004819201",
    "upiId": "hostel.axis@upi",
    "balance": 500000
  },
  "sha256Seal": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "timestamp": "2026-09-01T06:30:00.000Z"
}
```

---

## 7. Operational Best Practices & Prompt Optimization

1. **Context Window Optimization**:
   - Always filter student records to only active residents within the queried hostel block before passing to LLM context.
   - Use normalized table projections (Roll Number, Name, Room, Fee Dues) rather than full document blobs.
2. **Zero Hallucination Guard**:
   - Every financial deduction must specify the target commercial bank account identifier (`id: BankAccount.id`).
   - If an account is not linked, prompt the operator to use the "Link New Bank Account" modal.
3. **Audit Immutability**:
   - Every AI-assisted decision writes an audit record to the `ActivityLog` registry with `actor: currentUser.fullName`, `timestamp`, and cryptographic reference hash.

---
*Authored for Google AI Studio Hostel & Facility ERP Engine • 2026 Production Standard*
