import Department from "../models/department.js";
import Course from "../models/course.js";

const seedCourses = async () => {
    try {
        console.log("Seeding courses (safe - using findOrCreate)...");

        const depts = await Department.findAll();
        
        const getDeptId = (code) => {
            const d = depts.find(d => d.dept_code === code);
            return d ? d.dept_id : null;
        };

        const deptMappings = [
            { code: "CSE", courses: ["B.Tech", "M.Tech", "MCA", "Ph.D"] },
            { code: "IT", courses: ["B.Tech", "M.Tech", "Ph.D"] },
            { code: "MECH", courses: ["B.Tech", "M.Tech", "Diploma"] },
            { code: "CIVIL", courses: ["B.Tech", "M.Tech", "Diploma"] },
            { code: "EEE", courses: ["B.Tech", "M.Tech"] },
            { code: "ECE", courses: ["B.Tech", "M.Tech"] }
        ];

        for (const mapping of deptMappings) {
            const deptId = getDeptId(mapping.code);
            if (deptId) {
                for (const courseName of mapping.courses) {
                    await Course.findOrCreate({
                        where: { course_name: courseName, dept_id: deptId },
                        defaults: { course_name: courseName, dept_id: deptId }
                    });
                }
            }
        }
        
        console.log("✅ Courses seeded successfully.");
    } catch (err) {
        console.error("❌ Course seeding failed:", err);
    }
};

export default seedCourses;
