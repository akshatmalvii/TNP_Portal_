import sequelize from "../config/db.js";
import Department from "../models/department.js";

// Helper to generate [DEPT_CODE][YEAR][SEQUENCE]
export const generateTnpId = async (dept_id) => {
    // Transaction wrapper ensuring atomicity against DB
    return await sequelize.transaction(async (t) => {
        // 1. Get department code
        const dept = await Department.findByPk(dept_id, { transaction: t });
        if (!dept) throw new Error("Department not found");

        const deptCode = dept.dept_code;
        
        // 2. Get current year
        const currentYear = new Date().getFullYear().toString();

        // 3. Count students in that dept with TNP ID
        // Note: Raw query counting sequence with locking could be safer, but for now we'll do a simple count LIKE
        const prefix = `${deptCode}${currentYear}%`;
        
        const countQuery = `
            SELECT COUNT(*) AS count
            FROM students
            WHERE dept_id = :dept_id AND tnp_id LIKE :prefix
        `;

        const [results] = await sequelize.query(countQuery, {
            replacements: { dept_id, prefix },
            transaction: t
        });

        const count = parseInt(results[0].count, 10) || 0;

        // 4. Generate next sequence
        const sequence = (count + 1).toString().padStart(3, '0');

        return `${deptCode}${currentYear}${sequence}`;
    });
};
