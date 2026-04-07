import './utils/associations.js';
import driveService from './services/driveService.js';
import StaffAdmin from './models/staff_admin.js';
import Student from './models/student.js';

(async () => {
    try {
        const student = await Student.findOne({ where: { user_id: 22 } });
        console.log("Student course:", student.course_id, "dept:", student.dept_id);

        const newDrive = await driveService.createDriveTransaction({
            company_id: 1, // Assuming company exists
            role_title: "MCA Specific Developer",
            offer_type: "Full Time",
            package_lpa: "8.0",
            deadline: new Date(Date.now() + 864000000),
            allowed_departments: [student.dept_id],
            allowed_courses: [student.course_id]
        }, 1);

        console.log("Created drive:", newDrive.drive_id);

        const drives = await driveService.listOpenDrivesForStudent(22);
        console.log("Open drives for student 22:");
        console.log(drives.map(d => ({id: d.drive_id, title: d.role_title, allowedCourses: d.DriveAllowedCourses})));

    } catch(e) {
        console.error("Error:", e);
    }
    process.exit(0);
})();
