import bcrypt from 'bcrypt';
import Role from './models/role.js';
import User from './models/users.js';
import StaffAdmin from './models/staff_admin.js';
import Course from './models/course.js';

const ROLES = [
    {role_name: 'TPO_Head'},
    {role_name: 'TPO'},
    {role_name: 'Placement_Coordinator'},
    {role_name: 'Student'},
];

const COURSES = [
    {course_name: 'B.Tech'},
    {course_name: 'MCA'},
    {course_name: 'BCA'},
    {course_name: 'Diploma'},
    {course_name: 'M.Tech'},
];

const TPO_HEAD_EMAIL = 'tpohead@tnp.edu.in';
const TPO_HEAD_PASSWORD = 'Admin@123';

const seedRolesAndAdmin = async () => {
    try {
        // Seed courses
        for (const course of COURSES) {
            await Course.findOrCreate({
                where: {course_name: course.course_name},
                defaults: course,
            });
        }
        console.log('✅ Courses seeded successfully');
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
