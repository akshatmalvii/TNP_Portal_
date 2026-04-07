import './utils/associations.js';
import driveService from './services/driveService.js';
import Student from './models/student.js';

(async () => {
    try {
        const student = await Student.findOne({ order: [['created_at', 'DESC']] });
        if (!student) {
            console.log("No student found");
            process.exit(0);
        }
        
        const StudentEducation = (await import("./models/student_education.js")).default;
        const educations = await StudentEducation.findAll({ where: { student_id: student.student_id } });
        const ssc = educations.find(e => e.education_type === "SSC");
        const hsc = educations.find(e => e.education_type === "HSC" || e.education_type === "Diploma");
        console.log("Student info:", {
            dept_id: student.dept_id, course_id: student.course_id,
            cgpa: student.cgpa, backlogs: student.running_backlogs, gender: student.gender,
            ssc_percent: ssc ? ssc.percentage : null, hsc_percent: hsc ? hsc.percentage : null
        });

        const Drive = (await import('./models/drive.js')).default;
        const Company = (await import('./models/company.js')).default;
        const DriveAllowedDepartment = (await import('./models/drive_allowed_department.js')).default;
        const DriveAllowedCourse = (await import('./models/drive_allowed_course.js')).default;
        const DriveEligibility = (await import('./models/drive_eligibility.js')).default;
            
        const allDrives = await Drive.findAll({
            where: { drive_status: "Active", approval_status: "Approved" },
            include: [
                { model: Company, attributes: ["company_name"] },
                { model: DriveAllowedDepartment },
                { model: DriveAllowedCourse },
                { model: DriveEligibility }
            ],
            order: [["created_at", "DESC"]]
        });

        for (const drive of allDrives) {
            console.log(`\nEvaluating Drive ${drive.drive_id}`);
            const allowedDepts = drive.DriveAllowedDepartments.map(d => d.dept_id);
            if (allowedDepts.length > 0 && !allowedDepts.includes(student.dept_id)) console.log("Failed: DEPT mismatch");
                
            const allowedCourses = drive.DriveAllowedCourses.map(c => c.course_id);
            if (allowedCourses.length > 0 && !allowedCourses.includes(student.course_id)) console.log("Failed: COURSE mismatch");

            if (drive.DriveEligibility) {
                const e = drive.DriveEligibility;
                if (e.min_cgpa && parseFloat(student.cgpa || 0) < parseFloat(e.min_cgpa)) console.log("Failed: CGPA. Req:", e.min_cgpa, "Stud:", student.cgpa);
                if (e.max_backlogs !== null && (student.running_backlogs || 0) > e.max_backlogs) console.log("Failed: Backlogs");
                if (e.min_10th_percent && (ssc ? parseFloat(ssc.percentage) : 0) < parseFloat(e.min_10th_percent)) console.log("Failed: 10th percent");
                if (e.min_12th_percent && (hsc ? parseFloat(hsc.percentage) : 0) < parseFloat(e.min_12th_percent)) console.log("Failed: 12th percent");
                if (e.gender && e.gender !== "Any" && student.gender !== e.gender) console.log("Failed: Gender");
            }
        }
    } catch(e) {
        console.error("Error:", e);
    }
    process.exit(0);
})();
