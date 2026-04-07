import './utils/associations.js';
import Drive from './models/drive.js';
import DriveAllowedDepartment from './models/drive_allowed_department.js';
import DriveAllowedCourse from './models/drive_allowed_course.js';
import Student from './models/student.js';
import Course from './models/course.js';

(async () => {
    try {
        const student = await Student.findOne({ where: { email: 'student12@gmail.com' } }); // Try to get an example student, if none matches MCA we'll query by course
        const mcaCourse = await Course.findOne({ where: { course_name: 'MCA' } });
        
        console.log("MCA Course:", mcaCourse?.toJSON());
        
        const drives = await Drive.findAll({
            where: { drive_status: "Active", approval_status: "Approved" },
            include: [
              { model: DriveAllowedDepartment },
              { model: DriveAllowedCourse }
            ]
        });
        
        console.log("Drives:");
        drives.forEach(d => {
            const row = d.toJSON();
            console.log(`Drive ${row.drive_id}: depts=${row.DriveAllowedDepartments.map(x=>x.dept_id)}, courses=${row.DriveAllowedCourses.map(x=>x.course_id)}`);
        });

    } catch(e) {
        console.error(e);
    }
    process.exit(0);
})();
