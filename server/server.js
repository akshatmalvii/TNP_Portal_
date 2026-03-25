import express from 'express';
import cors from 'cors';
import sequelize from './config/db.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

// Models & Associations
import './utils/associations.js';
import User from './models/users.js';
import Role from './models/role.js';
import Department from './models/department.js';
import StaffAdmin from './models/staff_admin.js';
import DepartmentTpoAssignment from './models/department_tpo_assignment.js';
import Student from './models/student.js';
import Course from './models/course.js';
import StudentEducation from './models/student_education.js';
import StudentDocument from './models/student_document.js';
import Company from './models/company.js';
import CompanyContact from './models/company_contact.js';
import CompanyRole from './models/company_role.js';
import Drive from './models/drive.js';
import DriveAllowedDepartment from './models/drive_allowed_department.js';
import DriveAllowedCourse from './models/drive_allowed_course.js';
import DriveEligibility from './models/drive_eligibility.js';
import PlacementPolicyRule from './models/placement_policy_rule.js';
import DepartmentPolicyRule from './models/department_policy_rule.js';
import DrivePolicyOverride from './models/drive_policy_override.js';
import StudentApplication from './models/student_application.js';
import DynamicFormField from './models/dynamic_form_field.js';
import DynamicFormResponse from './models/dynamic_form_response.js';
import DriveSelection from './models/drive_selection.js';
import Offer from './models/offer.js';
import StudentVerificationRequest from './models/student_verification_request.js';
import AuditLog from './models/audit_log.js';
import seedRolesAndAdmin from './seed.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import rolesRoutes from './routes/rolesRoutes.js';
import driveRoutes from './routes/driveRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import driveAllowedCourseRoutes from './routes/driveAllowedCourseRoutes.js';
import studentProfileRoutes from './routes/studentProfileRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'topn-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// JWT Middleware (if needed later)
export const authenticateStudent = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({error: 'Authorization token missing'});
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({error: 'Invalid or expired token'});
    }
};

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/verification', verificationRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/roles', rolesRoutes);
app.use('/api/v1/drives', driveRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/drive-allowed-courses', driveAllowedCourseRoutes);
app.use('/api/v1/student-profile', studentProfileRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('TNP Portal API Running');
});

// Start server + DB sync
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL connected successfully');

        // Sync all tables in dependency order (DEV MODE)
        // 1. Independent tables
        await Role.sync({alter: true});
        await Department.sync({alter: true});
        await Company.sync({alter: true});
        await Course.sync({alter: true});
        await PlacementPolicyRule.sync({alter: true});

        // 2. Tables depending on roles / departments / companies / courses
        await User.sync({alter: true});
        await StaffAdmin.sync({alter: true});
        await DepartmentTpoAssignment.sync({alter: true});
        await Student.sync({alter: true});
        // Fix: Sequelize alter doesn't always drop NOT NULL — force it
        await sequelize.query('ALTER TABLE students ALTER COLUMN dept_id DROP NOT NULL;').catch(() => {});
        await sequelize.query('ALTER TABLE students ALTER COLUMN course_id DROP NOT NULL;').catch(() => {});
        await CompanyContact.sync({alter: true});
        await CompanyRole.sync({alter: true});

        // 3. Tables depending on students / company_roles / staff
        await StudentEducation.sync({alter: true});
        await StudentDocument.sync({alter: true});
        await StudentVerificationRequest.sync({alter: true});
        await Drive.sync({alter: true});

        // 4. Tables depending on drives
        await DriveAllowedDepartment.sync({alter: true});
        await DriveAllowedCourse.sync({alter: true});
        await DriveEligibility.sync({alter: true});
        await DepartmentPolicyRule.sync({alter: true});
        await DrivePolicyOverride.sync({alter: true});
        await DynamicFormField.sync({alter: true});
        await StudentApplication.sync({alter: true});

        // 5. Tables depending on applications / form fields
        await DynamicFormResponse.sync({alter: true});
        await DriveSelection.sync({alter: true});
        await Offer.sync({alter: true});

        // 6. Audit
        await AuditLog.sync({alter: true});

        console.log('All tables synced with database');

        // Seed roles and TPO Head
        await seedRolesAndAdmin();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Unable to connect to DB:', err);
    }
};

startServer();

export default app;
