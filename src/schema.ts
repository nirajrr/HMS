export const SQL_MIGRATION_V1 = `-- ====================================================================
-- PostgreSQL Master Schema Migration: Hostel ERP & Financial Suite
-- Version: V1__init_schema.sql
-- Modules: Multi-Bank Linkage, Room Swapping, Police Verification, RBAC
-- ====================================================================

-- 1. EXTENSIONS & SECURITY
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. RBAC & PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS rbac_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name VARCHAR(50) NOT NULL,
    permission_key VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS erp_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. MULTI-BANK INTEGRATION LAYER
CREATE TABLE IF NOT EXISTS banks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_name VARCHAR(150) NOT NULL,
    account_number VARCHAR(50) NOT NULL UNIQUE,
    ifsc_code VARCHAR(20) NOT NULL,
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('PRIMARY_COLLECTION', 'MESS_FEES', 'SECURITY_DEPOSIT', 'OPERATIONS', 'PRIMARY_FEES', 'CAUTION_DEPOSIT', 'MAINTENANCE_RESERVE')),
    current_balance NUMERIC(15, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'INR',
    upi_id VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_reconciled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. HOSTEL ROOMS & BEDS
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hostel_code VARCHAR(20) NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    floor_number INT NOT NULL,
    block_name VARCHAR(50) NOT NULL,
    room_type VARCHAR(30) NOT NULL CHECK (room_type IN ('SINGLE', 'DOUBLE', 'TRIPLE', 'DORMITORY')),
    total_beds INT NOT NULL DEFAULT 2,
    occupied_beds INT NOT NULL DEFAULT 0,
    monthly_rent NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED')),
    amenities JSONB DEFAULT '[]'::jsonb,
    CONSTRAINT uq_hostel_room UNIQUE (hostel_code, room_number)
);

-- 5. STUDENTS & METADATA (PII Encrypted at Rest)
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    guardian_name VARCHAR(150) NOT NULL,
    guardian_mobile VARCHAR(20) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    department VARCHAR(100) NOT NULL,
    year_of_study INT NOT NULL,
    blood_group VARCHAR(10),
    permanent_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    encrypted_aadhar TEXT NOT NULL, -- PII Security
    vehicle_number VARCHAR(50),
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    room_number VARCHAR(20),
    bed_identifier VARCHAR(20),
    allotment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ON_LEAVE', 'VACATED', 'SUSPENDED')),
    fee_balance NUMERIC(10, 2) DEFAULT 0.00,
    mess_balance NUMERIC(10, 2) DEFAULT 0.00,
    deposit_amount NUMERIC(10, 2) DEFAULT 15000.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. POLICE VERIFICATION COMPLIANCE TABLE (Section 188 IPC)
CREATE TABLE IF NOT EXISTS police_verification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    application_number VARCHAR(100) UNIQUE NOT NULL,
    police_station VARCHAR(150) NOT NULL,
    jurisdiction_district VARCHAR(100) NOT NULL,
    submission_mode VARCHAR(50) DEFAULT 'ONLINE_API' CHECK (submission_mode IN ('ONLINE_API', 'PHYSICAL_SUBMISSION')),
    status VARCHAR(50) DEFAULT 'FORM_GENERATED' CHECK (status IN ('FORM_GENERATED', 'SUBMITTED_ONLINE', 'POLICE_ACKNOWLEDGED', 'CLEARED', 'FLAGGED')),
    online_api_tracking_id VARCHAR(150),
    generated_payload JSONB NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    identifying_officer VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. FEE TRANSACTIONS & MULTI-BANK RECONCILIATION
CREATE TABLE IF NOT EXISTS fee_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    student_id UUID NOT NULL REFERENCES students(id),
    bank_account_id UUID NOT NULL REFERENCES banks(id),
    amount NUMERIC(12, 2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('HOSTEL_FEE', 'MESS_BILL', 'SECURITY_DEPOSIT', 'FINE', 'REFUND')),
    payment_mode VARCHAR(50) NOT NULL CHECK (payment_mode IN ('UPI', 'NET_BANKING', 'CHEQUE', 'CASH', 'AUTO_DEBIT')),
    transaction_ref VARCHAR(150) UNIQUE NOT NULL,
    status VARCHAR(30) DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'PENDING', 'FAILED', 'RECONCILED')),
    recorded_by VARCHAR(150) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. MAINTENANCE & ADMIN APPROVAL ENGINE ($500 Threshold Rule)
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(30) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY', 'CRITICAL')),
    status VARCHAR(40) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ASSIGNED', 'PENDING_APPROVAL', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'PENDING', 'COMPLETED')),
    estimated_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    actual_cost NUMERIC(10, 2),
    requires_admin_approval BOOLEAN DEFAULT FALSE,
    admin_approved BOOLEAN DEFAULT FALSE,
    approved_by VARCHAR(150),
    assigned_staff VARCHAR(150),
    reported_by VARCHAR(150) NOT NULL,
    preventive_schedule VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 9. IMMUTABLE ACTIVITY LOGS (AUDIT TRAIL)
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    performed_by VARCHAR(150) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    details TEXT NOT NULL,
    metadata JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- FAST SEARCH INDEXES ("Search-as-you-type" optimization for 10k+ records)
CREATE INDEX idx_students_search_composite ON students (roll_number text_pattern_ops, full_name text_pattern_ops, vehicle_number text_pattern_ops, mobile text_pattern_ops);
CREATE INDEX idx_rooms_lookup ON rooms (room_number, block_name, status);
CREATE INDEX idx_fee_receipt ON fee_transactions (receipt_number, transaction_ref);
CREATE INDEX idx_activity_timestamp ON activity_logs (created_at DESC);
`;

export const POSTGRES_SCHEMA_SQL = SQL_MIGRATION_V1;

export const POM_XML_PREVIEW = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.hostel.erp</groupId>
    <artifactId>hostel-erp-system</artifactId>
    <version>2.5.0-RELEASE</version>
    <packaging>jar</packaging>

    <name>Hostel ERP &amp; Financial Analytics System</name>
    <description>Enterprise Desktop (JavaFX) &amp; Spring Boot Backend with PostgreSQL, Multi-Bank Linkage &amp; Police Verification</description>

    <properties>
        <java.version>21</java.version>
        <javafx.version>21.0.2</javafx.version>
        <spring.boot.version>3.2.3</spring.boot.version>
        <postgresql.version>42.7.2</postgresql.version>
        <flyway.version>10.8.1</flyway.version>
        <jjwt.version>0.12.5</jjwt.version>
        <itext.version>8.0.3</itext.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Starter Web & JPA -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
            <version>\${spring.boot.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
            <version>\${spring.boot.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
            <version>\${spring.boot.version}</version>
        </dependency>

        <!-- PostgreSQL Driver & Flyway Migrations -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <version>\${postgresql.version}</version>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
            <version>\${flyway.version}</version>
        </dependency>

        <!-- JavaFX Desktop UI Controls & FXML -->
        <dependency>
            <groupId>org.openjfx</groupId>
            <artifactId>javafx-controls</artifactId>
            <version>\${javafx.version}</version>
        </dependency>
        <dependency>
            <groupId>org.openjfx</groupId>
            <artifactId>javafx-fxml</artifactId>
            <version>\${javafx.version}</version>
        </dependency>

        <!-- iText PDF Generation for Police Verification & Receipts -->
        <dependency>
            <groupId>com.itextpdf</groupId>
            <artifactId>itext7-core</artifactId>
            <version>\${itext.version}</version>
            <type>pom</type>
        </dependency>

        <!-- JSON Web Token for Mobile & Web API -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>\${jjwt.version}</version>
        </dependency>
    </dependencies>
</project>`;

export const POM_XML_TEMPLATE = POM_XML_PREVIEW;

export const API_DOCS_MARKDOWN = `# Hostel ERP System REST & Webhook API Endpoints

## 1. Multi-Bank Treasury & Webhook Listener
- **POST** \`/api/v1/finance/webhooks/bank-payment\`
  - Headers: \`X-Bank-Signature: HMAC-SHA256\`, \`Content-Type: application/json\`
  - Body: \`{ "accountNumber": "389201948201", "transactionRef": "SBI-992019", "amount": 51000, "studentRoll": "2023-CS-041" }\`
  - Response: \`{ "status": "RECONCILED", "receiptNumber": "RCP-2026-0801" }\`

## 2. Police CCTNS Portal Dispatch
- **POST** \`/api/v1/compliance/police-verify/dispatch\`
  - Body: \`{ "studentId": "std_001", "jurisdictionPoliceStation": "Civil Lines PS" }\`
  - Response: \`{ "trackingId": "CCTNS-RAJ-99210041", "status": "CLEARED" }\`

## 3. Chain-of-Thought Room Swap Engine
- **POST** \`/api/v1/rooms/swap-execute\`
  - Body: \`{ "sourceStudentId": "std_001", "targetRoomNumber": "101", "targetStudentId": "std_002" }\`
  - Validation: Automated vacancy, zero-mess deficit, and disciplinary clearance chain.
`;
