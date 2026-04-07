# TNP Portal Database Schema Documentation

**Document Date:** March 26, 2026  
**Project:** TNP (Training and Placement) Portal  
**Database:** PostgreSQL  
**ORM:** Sequelize (Node.js)

---

## Table of Contents

1. [User & Authentication Tables](#user--authentication-tables)
2. [Student & Education Tables](#student--education-tables)
3. [Company & Recruitment Tables](#company--recruitment-tables)
4. [Drive & Placement Tables](#drive--placement-tables)
5. [Application & Selection Tables](#application--selection-tables)
6. [Policy & Rules Tables](#policy--rules-tables)
7. [Audit & System Tables](#audit--system-tables)
8. [Database Triggers](#database-triggers)
9. [Database Functions (Procedures)](#database-functions-procedures)

---

## User & Authentication Tables

### 1. **users**
| Column | Type | Purpose |
|--------|------|---------|
| user_id | INTEGER (PK) | Primary identifier for all system users |
| email | STRING (255) | Unique email for login and communication |
| password_hash | TEXT | BCrypt-hashed password for authentication |
| role_id | INTEGER (FK) | Link to roles table for RBAC |
| account_status | STRING (20) | Values: 'Active', 'Inactive' |
| created_at | DATE | Account creation timestamp |
| updated_at | DATE | Last account update timestamp |

**Purpose:** Central authentication and authorization table storing all users (Students, Staff, Coordinators, TPO, TPO Head).

**Constraints:** 
- Unique email constraint for preventing duplicate accounts
- Foreign key relationship with roles table

---

### 2. **roles**
| Column | Type | Purpose |
|--------|------|---------|
| role_id | INTEGER (PK) | Unique role identifier |
| role_name | STRING (50) | Role name (e.g., 'STUDENT', 'TPO', 'COORDINATOR', 'TPO_Head', 'Admin') |

**Purpose:** Define role-based access control (RBAC) structure. Maps user roles to their permissions.

**Constraints:** Unique role_name to prevent duplicate role definitions

---

### 3. **staff_admins**
| Column | Type | Purpose |
|--------|------|---------|
| staff_id | INTEGER (PK) | Primary identifier for staff members |
| user_id | INTEGER (FK, UNIQUE) | Reference to users table for authentication |
| dept_id | INTEGER | Department assignment for staff |
| created_at | DATE | Staff account creation timestamp |

**Purpose:** Maps staff/admin users to their departments. Acts as the bridge between users and departments for administrative functions.

**Constraints:** One-to-one relationship with users table (unique user_id)

---

## Student & Education Tables

### 4. **students**
| Column | Type | Purpose |
|--------|------|---------|
| student_id | INTEGER (PK) | Primary identifier for each student |
| user_id | INTEGER (FK, UNIQUE) | Reference to authentication in users table |
| full_name | STRING (255) | Student's full name |
| gender | STRING (20) | Student's gender |
| marital_status | STRING (20) | Marital status |
| date_of_birth | DATE | Student's DOB |
| mobile_number | STRING (20) | Primary contact number |
| parent_mobile_number | STRING (20) | Parent/Guardian contact number |
| email | STRING (255) | Email address |
| blood_group | STRING (10) | Blood group (for emergency info) |
| category | STRING (50) | Category (General/OBC/SC/ST/etc.) |
| nationality | STRING (50) | Student's nationality |
| height_cm | INTEGER | Physical height measurement |
| weight_kg | INTEGER | Physical weight measurement |
| present_address | TEXT | Current residential address |
| permanent_address | TEXT | Permanent home address |
| dept_id | INTEGER (FK) | Department enrollment |
| course_id | INTEGER (FK) | Course enrollment |
| program | STRING (100) | Program name (B.Tech, B.Sc, etc.) |
| stream | STRING (100) | Program stream (CS, IT, Mech, etc.) |
| cgpa | DECIMAL (4,2) | Current cumulative GPA |
| running_backlogs | INTEGER | Number of pending/running backlogs |
| is_verified | BOOLEAN | Verification status for placement eligibility |
| tnp_id | STRING (20) | Unique TNP ID (auto-generated on verification) |
| created_at | DATE | Account creation timestamp |
| updated_at | DATE | Last profile update timestamp |

**Purpose:** Comprehensive student profile storing personal, academic, and contact information. Central hub for all student-related queries.

**Constraints:** 
- Unique user_id relationship
- Foreign keys to departments and courses

---

### 5. **student_education**
| Column | Type | Purpose |
|--------|------|---------|
| education_id | INTEGER (PK) | Unique identifier for education record |
| student_id | INTEGER (FK) | Reference to student table |
| education_type | STRING (20) | Type: 'SSC' (10th), 'HSC' (12th), 'Diploma' |
| institution_name | STRING (255) | Name of institution attended |
| board_or_university | STRING (255) | Board/University name |
| course_name | STRING (255) | Course taken |
| program | STRING (100) | Program name |
| stream | STRING (100) | Stream name |
| passing_year | INTEGER | Year of completion |
| percentage | DECIMAL (5,2) | Percentage obtained |
| cgpa | DECIMAL (4,2) | CGPA obtained |

**Purpose:** Track student's educational history across multiple levels (SSC, HSC, Diploma, UG). Used for eligibility verification in drives.

**Constraints:** Multiple records per student (one per education level)

---

### 6. **student_documents**
| Column | Type | Purpose |
|--------|------|---------|
| document_id | INTEGER (PK) | Unique document identifier |
| student_id | INTEGER (FK) | Reference to student table |
| document_type | STRING (50) | Type: 'Aadhaar', 'SSC_Marksheet', 'HSC_Marksheet', 'Diploma_Marksheet', 'UG_Marksheet', 'Photo', 'Resume' |
| file_url | TEXT | URL/path to uploaded document (stored in cloud) |
| uploaded_at | DATE | Document upload timestamp |

**Purpose:** Store references to all student-submitted documents for verification and background checks.

**Constraints:** Types are enum-validated to predefined document categories

---

### 7. **student_verification_requests**
| Column | Type | Purpose |
|--------|------|---------|
| verification_id | INTEGER (PK) | Unique verification request ID |
| student_id | INTEGER (FK, UNIQUE) | Reference to student table (one per student) |
| coordinator_status | STRING (20) | Values: 'Pending', 'Approved', 'Rejected' |
| tpo_status | STRING (20) | Values: 'Pending', 'Approved', 'Rejected' |
| verified_by_coordinator | INTEGER | Staff ID of verifying coordinator |
| approved_by_tpo | INTEGER | Staff ID of TPO approver |
| created_at | DATE | Request creation timestamp |
| updated_at | DATE | Last status update timestamp |

**Purpose:** Multi-stage verification workflow managing student eligibility for placements. Triggers TNP ID generation upon final approval.

**Constraints:** 
- One verification per student (unique student_id)
- Triggers TNP ID generation when coordinator_status becomes 'Approved'

**Important Trigger:** When `coordinator_status` is updated to 'Approved', the `trigger_generate_tnp_id` trigger fires to assign a unique TNP ID to the student.

---

## Company & Recruitment Tables

### 8. **companies**
| Column | Type | Purpose |
|--------|------|---------|
| company_id | INTEGER (PK) | Unique company identifier |
| company_name | STRING (255) | Company name (unique) |
| company_website | TEXT | Company website URL |
| created_at | DATE | Company registration timestamp |

**Purpose:** Master company database. Stores all recruiting companies partnering with the institution.

**Constraints:** Unique company_name to prevent duplicate entries

---

### 9. **company_contacts**
| Column | Type | Purpose |
|--------|------|---------|
| contact_id | INTEGER (PK) | Unique contact identifier |
| company_id | INTEGER (FK) | Reference to company table |
| contact_name | STRING (255) | HR/Recruiter name |
| contact_email | STRING (255) | Contact email address |
| contact_phone | STRING (20) | Contact phone number |
| designation | STRING (100) | Job designation (e.g., 'HR Manager', 'Recruiter') |
| created_at | DATE | Contact entry creation timestamp |

**Purpose:** Track multiple HR contacts and coordinators per company for drive management and communications.

**Constraints:** Multiple contacts per company (many-to-one relationship)

---

### 10. **company_roles**
| Column | Type | Purpose |
|--------|------|---------|
| company_role_id | INTEGER (PK) | Unique role identifier |
| company_id | INTEGER (FK) | Reference to company table |
| role_title | STRING (255) | Job title offered by company |
| role_description | TEXT | Detailed role description |
| created_at | DATE | Role listing creation timestamp |

**Purpose:** Store job roles/positions offered by companies (can be reused across multiple drives).

**Constraints:** Multiple roles per company

---

## Drive & Placement Tables

### 11. **drives**
| Column | Type | Purpose |
|--------|------|---------|
| drive_id | INTEGER (PK) | Unique drive identifier |
| company_id | INTEGER (FK) | Reference to recruiting company |
| role_title | STRING (255) | Job title for this drive |
| role_description | TEXT | Detailed description of the position |
| created_by_staff | INTEGER | Staff ID of drive creator (usually TPO) |
| approved_by_staff | INTEGER | Staff ID of drive approver |
| offer_type | STRING (20) | Values: 'Internship', 'Placement', 'Internship+PPO' |
| package_lpa | DECIMAL (6,2) | Salary package in LPA (Lakhs Per Annum) |
| deadline | DATE | Application deadline for this drive |
| drive_status | STRING (20) | Values: 'Draft', 'Active', 'Completed' |
| approval_status | STRING (20) | Values: 'Pending', 'Approved', 'Rejected' |
| created_at | DATE | Drive creation timestamp |
| updated_at | DATE | Last modification timestamp |

**Purpose:** Core table for job drive/placement campaigns. Tracks recruitment events and their properties.

**Constraints:** 
- Foreign key to companies table
- Triggers for audit logging and timestamp updates

**Important Trigger:** 
- `trigger_audit_create_drive` logs drive creation to audit_logs
- `trigger_update_drives_timestamp` maintains updated_at

---

### 12. **drive_allowed_departments**
| Column | Type | Purpose |
|--------|------|---------|
| id | INTEGER (PK) | Primary key |
| drive_id | INTEGER (FK) | Reference to drives table |
| dept_id | INTEGER (FK) | Reference to departments table |

**Purpose:** Many-to-many junction table defining which departments are eligible for a drive.

**Constraints:** Multiple rows per drive (one per allowed department)

---

### 13. **drive_allowed_courses**
| Column | Type | Purpose |
|--------|------|---------|
| id | INTEGER (PK) | Primary key |
| drive_id | INTEGER (FK) | Reference to drives table |
| course_id | INTEGER (FK) | Reference to courses table |

**Purpose:** Many-to-many junction table defining which courses/programs are eligible for a drive.

**Constraints:** 
- Multiple rows per drive
- ON DELETE CASCADE from drives table
- Unique(drive_id, course_id)

---

### 14. **drive_eligibility**
| Column | Type | Purpose |
|--------|------|---------|
| eligibility_id | INTEGER (PK) | Unique eligibility criteria ID |
| drive_id | INTEGER (FK, UNIQUE) | Reference to drives table (one per drive) |
| min_cgpa | DECIMAL (4,2) | Minimum CGPA required |
| max_backlogs | INTEGER | Maximum allowed running backlogs |
| min_10th_percent | DECIMAL (5,2) | Minimum 10th board percentage |
| min_12th_percent | DECIMAL (5,2) | Minimum 12th/Diploma percentage |
| gender | STRING (10) | Gender restriction ('Male', 'Female', 'Any') |
| passing_year | INTEGER | Expected graduation year |

**Purpose:** Store placement-specific eligibility criteria for each drive. Used for automated student filtering.

**Constraints:** One eligibility criteria per drive (unique drive_id)

---

### 15. **drive_policy_override**
| Column | Type | Purpose |
|--------|------|---------|
| id | INTEGER (PK) | Primary key |
| drive_id | INTEGER (FK, UNIQUE) | Reference to drives table |
| policy_id | INTEGER (FK) | Reference to placement_policy_rules table |

**Purpose:** Override global placement policies for specific drives (optional customization).

**Constraints:** Zero or one policy override per drive

---

## Application & Selection Tables

### 16. **student_applications**
| Column | Type | Purpose |
|--------|------|---------|
| application_id | INTEGER (PK) | Unique application identifier |
| student_id | INTEGER (FK) | Reference to students table |
| drive_id | INTEGER (FK) | Reference to drives table |
| application_status | STRING (20) | Values: 'APPLIED', 'WITHDRAWN', 'IN_PROGRESS', 'SHORTLISTED', 'SELECTED', 'REJECTED' |
| applied_at | DATE | Application submission timestamp |
| updated_at | DATE | Last status update timestamp |

**Purpose:** Central table tracking student applications to placement drives.

**Constraints:** 
- Unique(student_id, drive_id) - One application per student per drive
- Foreign keys to students and drives

---

### 17. **dynamic_form_fields**
| Column | Type | Purpose |
|--------|------|---------|
| field_id | INTEGER (PK) | Unique form field identifier |
| drive_id | INTEGER (FK) | Reference to drives table |
| field_label | STRING (255) | Display name for the form field |
| field_key | STRING (100) | Internal field identifier |
| field_type | STRING (20) | Values: 'TEXT', 'NUMBER', 'FILE' |
| is_required | BOOLEAN | Whether field is mandatory |
| field_order | INTEGER | Display order in form |
| created_at | DATE | Field creation timestamp |

**Purpose:** Define custom application form fields per drive (e.g., GitHub URL, Cover Letter, Portfolio).

**Constraints:** Multiple fields per drive, ordered by field_order

---

### 18. **dynamic_form_responses**
| Column | Type | Purpose |
|--------|------|---------|
| response_id | INTEGER (PK) | Unique response identifier |
| application_id | INTEGER (FK) | Reference to student_applications table |
| field_id | INTEGER (FK) | Reference to dynamic_form_fields table |
| text_value | TEXT | Response if field_type is TEXT |
| number_value | DECIMAL | Response if field_type is NUMBER |
| file_url | TEXT | URL to uploaded file if field_type is FILE |

**Purpose:** Store student responses to custom form fields for each application.

**Constraints:** 
- Unique(application_id, field_id)
- Only one value type should be populated per response

---

### 19. **drive_selections**
| Column | Type | Purpose |
|--------|------|---------|
| selection_id | INTEGER (PK) | Unique selection record ID |
| application_id | INTEGER (FK, UNIQUE) | Reference to student_applications table |
| selection_status | STRING (20) | Values: 'Selected', 'Rejected', 'Waitlisted' |
| updated_at | DATE | Status update timestamp |

**Purpose:** Track final selection outcomes for applications (used during final results).

**Constraints:** One selection status per application (unique application_id)

---

### 20. **offers**
| Column | Type | Purpose |
|--------|------|---------|
| offer_id | INTEGER (PK) | Unique offer identifier |
| application_id | INTEGER (FK, UNIQUE) | Reference to student_applications table |
| offer_category | STRING (30) | Values: 'Internship', 'Placement', 'Internship+PPO', 'PPO_Conversion' |
| offered_package | DECIMAL (6,2) | Final offered salary/stipend in LPA |
| acceptance_status | STRING (20) | Values: 'Pending', 'Accepted', 'Rejected' |
| created_at | DATE | Offer creation timestamp |
| updated_at | DATE | Last status update timestamp |

**Purpose:** Formal offer letters generated after student selection. Tracks acceptance/rejection.

**Constraints:** One offer per application (unique application_id)

---

## Policy & Rules Tables

### 21. **placement_policy_rules**
| Column | Type | Purpose |
|--------|------|---------|
| policy_id | INTEGER (PK) | Unique policy identifier |
| rule_name | STRING (255) | Policy name (unique) |
| allow_apply_after_internship | BOOLEAN | Can students apply to placements after accepting internships? |
| allow_apply_after_placement | BOOLEAN | Can students apply to other placements after one placement? |
| min_package_difference | DECIMAL (6,2) | Minimum package increase required between placements |
| ignore_package_condition | BOOLEAN | Can students ignore package condition? |
| created_at | DATE | Policy creation timestamp |

**Purpose:** Define global placement policies at institution level (flexible rules about multiple placements, internships, etc.).

**Constraints:** Unique rule_name

---

### 22. **department_policy_rules**
| Column | Type | Purpose |
|--------|------|---------|
| id | INTEGER (PK) | Primary key |
| dept_id | INTEGER (FK, UNIQUE) | Reference to departments table |
| policy_id | INTEGER (FK) | Reference to placement_policy_rules table |

**Purpose:** Assign policies to specific departments (many policies can have department-specific variations).

**Constraints:** One policy per department (unique dept_id)

---

## Academic Structure Tables

### 23. **departments**
| Column | Type | Purpose |
|--------|------|---------|
| dept_id | INTEGER (PK) | Unique department identifier |
| dept_code | STRING (20) | Department code (e.g., 'CSE', 'IT', 'MECH', 'EC') - used in TNP ID generation |
| dept_name | STRING (100) | Full department name |
| created_at | DATE | Department entry creation timestamp |

**Purpose:** Define academic departments in the institution.

**Constraints:** 
- Unique dept_code
- Unique dept_name

---

### 24. **courses**
| Column | Type | Purpose |
|--------|------|---------|
| course_id | INTEGER (PK) | Unique course identifier |
| course_name | STRING (100) | Course/program name (e.g., 'B.Tech', 'B.Sc') |
| dept_id | INTEGER (FK) | Department offering this course |
| created_at | DATE | Course entry creation timestamp |

**Purpose:** Courses/programs offered by departments.

**Constraints:** 
- Unique(course_name, dept_id)
- Foreign key to departments

---

### 25. **department_tpo_assignment**
| Column | Type | Purpose |
|--------|------|---------|
| id | INTEGER (PK) | Primary key |
| dept_id | INTEGER (FK, UNIQUE) | Reference to departments table |
| tpo_staff_id | INTEGER (FK) | Reference to staff_admins table (staff_id) |
| assigned_at | DATE | Assignment timestamp |

**Purpose:** Assign TPO (Training and Placement Officer) to each department.

**Constraints:** One TPO per department (unique dept_id)

---

## Audit & System Tables

### 26. **audit_logs**
| Column | Type | Purpose |
|--------|------|---------|
| log_id | INTEGER (PK) | Unique log entry identifier |
| staff_id | INTEGER | ID of staff member performing action |
| action_type | STRING | Category of action (e.g., 'CREATE_DRIVE', 'CREATE_COMPANY', 'VERIFY_STUDENT') |
| action_description | TEXT | Detailed description of the action |
| logged_at | DATE | Timestamp of the action |

**Purpose:** Comprehensive audit trail for all administrative and system actions. Used for compliance, debugging, and accountability.

**Constraints:** No unique constraints (all log entries are unique by nature)

---

### 27. **tnp_id_sequence** (System Table)
| Column | Type | Purpose |
|--------|------|---------|
| id | SERIAL (PK) | Primary key |
| year | INTEGER | Year of TNP ID generation (e.g., 2026) |
| dept_id | INTEGER | Department generating the ID |
| last_seq | INTEGER | Last sequence number used for that (year, dept_id) |

**Purpose:** Atomic counter for TNP ID sequence generation. Ensures unique TNP IDs are generated without conflicts.

**Constraints:** Unique(year, dept_id)

**Note:** This table is created and managed by the `generate_tnp_id()` PL/pgSQL function.

---

## Database Triggers

### Trigger 1: `trigger_generate_tnp_id`
**Table:** `student_verification_requests`  
**Event:** AFTER UPDATE  
**Condition:** When `coordinator_status` changes to 'Approved'

**Function:** `trigger_fn_generate_tnp_id()`

```sql
TRIGGER: trigger_generate_tnp_id
ON: student_verification_requests
AFTER UPDATE
FOR EACH ROW
WHEN: NEW.coordinator_status = 'Approved' AND OLD.coordinator_status IS DISTINCT FROM 'Approved'
ACTION: EXECUTE FUNCTION trigger_fn_generate_tnp_id()
```

**Purpose:** Automatically generate a unique TNP ID when a student is verified by the coordinator.

**TNP ID Format:** `DEPTCODE + YY + SEQ(3 digits)`
- Example: `CSE26001`, `IT26002`

---

### Trigger 2: `trigger_audit_create_drive`
**Table:** `drives`  
**Event:** AFTER INSERT

**Function:** `log_drive_creation()`

```sql
TRIGGER: trigger_audit_create_drive
ON: drives
AFTER INSERT
FOR EACH ROW
ACTION: Insert audit log entry with action_type = 'CREATE_DRIVE'
```

**Purpose:** Log all new drive creation to audit_logs table for compliance and tracking.

**Logged Information:**
- Created by staff ID
- Role title
- Timestamp

---

### Trigger 3: `trigger_update_drives_timestamp`
**Table:** `drives`  
**Event:** BEFORE UPDATE

**Function:** `update_drives_updated_at()`

```sql
TRIGGER: trigger_update_drives_timestamp
ON: drives
BEFORE UPDATE
FOR EACH ROW
ACTION: Set NEW.updated_at = NOW()
```

**Purpose:** Automatically maintain the `updated_at` timestamp whenever a drive record is modified.

---

## Database Functions (Procedures)

### Function 1: `generate_tnp_id(p_student_id INTEGER)`
**Type:** PL/pgSQL Function  
**Returns:** TEXT (TNP ID)

**Purpose:** Atomically generate a unique TNP ID for a verified student.

**Algorithm:**
1. Check if student already has TNP ID (idempotent - returns existing if present)
2. Retrieve student's department and department code
3. Get current 2-digit year (e.g., 26 for 2026)
4. Atomically increment sequence for (year, dept_id):
   - INSERT if first time: starts at 1
   - UPDATE if exists: increments last_seq
5. Build TNP ID: `DEPTCODE || YY || LPAD(SEQ, 3, '0')`
6. Update student record with new TNP ID
7. Return generated TNP ID

**Example Generation:**
- Input: Student from CSE department in 2026
- Year = 2026, YY = "26"
- DEPTCODE = "CSE"
- Sequence = 5
- Output: "CSE26005"

**Error Handling:** Raises exception if student has no department assigned

---

### Function 2: `trigger_fn_generate_tnp_id()`
**Type:** PL/pgSQL Trigger Function  
**Returns:** TRIGGER

**Purpose:** Trigger function wrapper that calls `generate_tnp_id()` when student is verified.

**Logic:**
```
IF NEW.coordinator_status = 'Approved' 
   AND OLD.coordinator_status IS NOT 'Approved'
THEN
   PERFORM generate_tnp_id(NEW.student_id)
END IF
```

**Note:** Only fires on state transition to 'Approved', not on every update

---

### Function 3: `log_drive_creation()`
**Type:** PL/pgSQL Trigger Function  
**Returns:** TRIGGER

**Purpose:** Log drive creation events to audit_logs.

**Inserts:** 
- staff_id: NEW.created_by_staff
- action_type: 'CREATE_DRIVE'
- action_description: Formatted as "Drive created: {ROLE_TITLE}"
- logged_at: NOW()

---

### Function 4: `update_drives_updated_at()`
**Type:** PL/pgSQL Trigger Function  
**Returns:** TRIGGER

**Purpose:** Automatically update the updated_at timestamp.

**Action:** Sets `NEW.updated_at = NOW()` before INSERT/UPDATE operations

---

## Database Relationships Summary

### Foreign Key Relationships

```
users (user_id) 
  ├─→ students (user_id)
  ├─→ staff_admins (user_id)
  └─→ roles (role_id)

students (dept_id, course_id)
  ├─→ departments (dept_id)
  ├─→ courses (course_id)
  └─→ student_verification_requests (student_id)

student_verification_requests
  └─→ students (student_id)

departments (dept_id)
  ├─→ staff_admins (dept_id)
  ├─→ courses (dept_id)
  ├─→ drive_allowed_departments (dept_id)
  ├─→ department_policy_rules (dept_id)
  └─→ department_tpo_assignment (dept_id)

courses (course_id)
  └─→ drive_allowed_courses (course_id)

drives (drive_id)
  ├─→ company_contacts (company_id)
  ├─→ drive_allowed_departments (drive_id)
  ├─→ drive_allowed_courses (drive_id)
  ├─→ drive_eligibility (drive_id)
  ├─→ drive_policy_override (drive_id)
  └─→ student_applications (drive_id)

student_applications (student_id, drive_id)
  ├─→ dynamic_form_responses (application_id)
  ├─→ drive_selections (application_id)
  └─→ offers (application_id)

dynamic_form_fields (drive_id)
  └─→ dynamic_form_responses (field_id)
```

---

## Data Integrity & Constraints

### Unique Constraints
- `users.email` - Prevents duplicate user accounts
- `roles.role_name` - Prevents duplicate role definitions
- `companies.company_name` - Prevents duplicate company entries
- `departments.dept_code` - Prevents duplicate department codes
- `departments.dept_name` - Prevents duplicate department names
- `courses.course_name + dept_id` - One course name per department
- `student_applications.student_id + drive_id` - One application per student per drive
- `drive_selections.application_id` - One selection per application
- `offers.application_id` - One offer per application
- `student_verification_requests.student_id` - One verification per student
- `drive_allowed_courses.drive_id + course_id` - One entry per drive-course pair
- `placement_policy_rules.rule_name` - Unique policy names
- `drive_eligibility.drive_id` - One eligibility criteria per drive
- `tnp_id_sequence.year + dept_id` - One sequence entry per department per year
- `drive_policy_override.drive_id` - One policy override per drive
- `department_policy_rules.dept_id` - One policy per department
- `department_tpo_assignment.dept_id` - One TPO per department

### Cascade Constraints
- `drive_allowed_courses` has ON DELETE CASCADE from `drives`
  - When a drive is deleted, all allowed course entries are automatically removed

---

## Table Statistics

| Category | Count | Tables |
|----------|-------|--------|
| User & Auth | 3 | users, roles, staff_admins |
| Student & Education | 3 | students, student_education, student_documents |
| Verification | 1 | student_verification_requests |
| Company & Recruitment | 3 | companies, company_contacts, company_roles |
| Drives | 5 | drives, drive_allowed_departments, drive_allowed_courses, drive_eligibility, drive_policy_override |
| Applications & Selection | 4 | student_applications, dynamic_form_fields, dynamic_form_responses, drive_selections |
| Offers | 1 | offers |
| Policy | 2 | placement_policy_rules, department_policy_rules |
| Academic Structure | 3 | departments, courses, department_tpo_assignment |
| Audit & System | 2 | audit_logs, tnp_id_sequence |
| **TOTAL** | **27** | **Tables** |

---

## Triggers Summary

| Trigger Name | Table | Event | Purpose |
|--------------|-------|-------|---------|
| trigger_generate_tnp_id | student_verification_requests | AFTER UPDATE | Generate unique TNP ID on student verification |
| trigger_audit_create_drive | drives | AFTER INSERT | Log drive creation to audit_logs |
| trigger_update_drives_timestamp | drives | BEFORE UPDATE | Maintain updated_at timestamp |

**Total Triggers:** 3

---

## Functions Summary

| Function Name | Type | Returns | Purpose |
|---------------|------|---------|---------|
| generate_tnp_id(p_student_id) | PL/pgSQL | TEXT | Generate unique TNP ID atomically |
| trigger_fn_generate_tnp_id() | Trigger Function | TRIGGER | Trigger wrapper for TNP ID generation |
| log_drive_creation() | Trigger Function | TRIGGER | Log drive creation events |
| update_drives_updated_at() | Trigger Function | TRIGGER | Update timestamp on record changes |

**Total Functions:** 4

---

## System Architecture Notes

### Data Flow

1. **User Registration Flow:**
   - User created in `users` table
   - Role assigned via `role_id`
   - If Student: corresponding record created in `students`
   - If Staff: corresponding record created in `staff_admins`

2. **Student Verification Flow:**
   - Student verification request submitted to `student_verification_requests`
   - Coordinator approves request
   - `trigger_generate_tnp_id` fires automatically
   - Unique TNP ID generated via `generate_tnp_id()` function
   - TNP ID atomically inserted into sequence table and updated in students table

3. **Drive Creation Flow:**
   - TPO creates drive in `drives` table
   - `trigger_audit_create_drive` fires, logs to `audit_logs`
   - Eligibility criteria stored in `drive_eligibility`
   - Allowed departments/courses stored in junction tables
   - Dynamic form fields stored in `dynamic_form_fields`

4. **Application Flow:**
   - Student applies to drive: record created in `student_applications`
   - Custom form responses stored in `dynamic_form_responses`
   - Selection status tracked in `drive_selections`
   - Offer generated in `offers` table if selected

### Atomicity & Thread Safety

- TNP ID generation uses PostgreSQL's atomic INSERT OR UPDATE mechanism
- Sequence table ensures no duplicate TNP IDs even with concurrent requests
- Unique constraints on student_id + drive_id prevent duplicate applications
- Transaction support via Sequelize ensures multi-step operations complete atomically

---

## Performance Considerations

### Indexes (Recommended)
- `student_verification_requests(coordinator_status)` - Fast filtering for pending approvals
- `student_applications(student_id)` - Fast lookup of student's applications
- `student_applications(drive_id)` - Fast lookup of applicants for a drive
- `student_applications(application_status)` - Fast filtering by status
- `drives(drive_status, approval_status)` - Fast filtering of active drives
- `audit_logs(logged_at)` - Fast chronological retrieval
- `dynamic_form_responses(application_id)` - Fast retrieval of all form responses

### Query Optimization
- Use `drive_allowed_departments` and `drive_allowed_courses` for quick eligibility checks
- Leverage `drive_eligibility` union with application data for filtering
- Cache department/course listings (rarely change)
- Archive old/completed drives to maintain performance

---

## Compliance & Security

### Audit Trail
- All administrative actions logged in `audit_logs`
- Staff ID tracked for accountability
- Timestamps maintained on all records
- Trigger-based automatic logging ensures no gaps

### Data Protection
- Sensitive data (documents, contacts) stored in secure URLs
- Password hashes only (no plaintext passwords)
- Role-based access control preventing unauthorized operations
- Unique constraints prevent data corruption

---

**Document Version:** 1.0  
**Last Updated:** March 26, 2026  
**Maintained By:** Development Team
