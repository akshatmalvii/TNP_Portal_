import bcrypt from 'bcrypt';
import Role from './models/role.js';
import User from './models/users.js';
import StaffAdmin from './models/staff_admin.js';
import Course from './models/course.js';
import Department from './models/department.js';

const ROLES = [
    {role_name: 'TPO_Head'},
    {role_name: 'TPO'},
    {role_name: 'Placement_Coordinator'},
    {role_name: 'Student'},
];

const DEPARTMENTS = [
    {dept_code: 'CSE', dept_name: 'Computer Science and Engineering'},
    {dept_code: 'IT', dept_name: 'Information Technology'},
    {dept_code: 'MECH', dept_name: 'Mechanical Engineering'},
    {dept_code: 'CIVIL', dept_name: 'Civil Engineering'},
    {dept_code: 'EEE', dept_name: 'Electrical and Electronics Engineering'},
    {dept_code: 'ECE', dept_name: 'Electronics and Communication Engineering'},
];

const TPO_HEAD_EMAIL = 'tpohead@tnp.edu.in';
const TPO_HEAD_PASSWORD = 'Admin@123';

const seedRolesAndAdmin = async () => {
    try {
        // Seed departments
        for (const dept of DEPARTMENTS) {
            await Department.findOrCreate({
                where: {dept_code: dept.dept_code},
                defaults: dept,
            });
        }
        console.log('✅ Departments seeded successfully');
        // Seed roles
        for (const role of ROLES) {
            await Role.findOrCreate({
                where: {role_name: role.role_name},
                defaults: role,
            });
        }
        console.log('✅ Roles seeded successfully');

        // Seed TPO Head account
        const tpoHeadRole = await Role.findOne({
            where: {role_name: 'TPO_Head'},
        });
        if (!tpoHeadRole) {
            console.error('❌ TPO_Head role not found after seeding');
            return;
        }

        const [user, created] = await User.findOrCreate({
            where: {email: TPO_HEAD_EMAIL},
            defaults: {
                email: TPO_HEAD_EMAIL,
                password_hash: await bcrypt.hash(TPO_HEAD_PASSWORD, 10),
                role_id: tpoHeadRole.role_id,
                account_status: 'Active',
            },
        });

        if (created) {
            await StaffAdmin.findOrCreate({
                where: {user_id: user.user_id},
                defaults: {
                    user_id: user.user_id,
                    dept_id: null,
                },
            });
            console.log(
                '✅ TPO Head account created (tpohead@tnp.edu.in / Admin@123)',
            );
        } else {
            console.log('ℹ️  TPO Head account already exists');
        }
    } catch (err) {
        console.error('❌ Seed error:', err);
    }
};

export default seedRolesAndAdmin;
