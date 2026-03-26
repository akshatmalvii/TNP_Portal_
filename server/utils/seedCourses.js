import sequelize from "../config/db.js";
import Department from "../models/department.js";
import Course from "../models/course.js";

const seedCourses = async () => {
    try {
        console.log("Started reseeding structured Courses...");
        
        // 1. Force drop all previous static courses (cascade eliminates dependent link tables constraints silently)
        await sequelize.query('TRUNCATE TABLE courses CASCADE');

        // 2. Fetch all departments
        const depts = await Department.findAll();
        
        // Helper to find a dept by code
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
                // Insert corresponding courses strictly bound to the dept
                for (const courseName of mapping.courses) {
                    await Course.create({
                        course_name: courseName,
                        dept_id: deptId
                    });
                }
            }
        }
        
        console.log("✅ Courses seeded perfectly with strict Department binding.");
    } catch (err) {
        console.error("❌ Course seeding failed:", err);
    }
};

export default seedCourses;
