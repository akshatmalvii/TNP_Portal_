import bcrypt from "bcrypt";
import sequelize from "../config/db.js";
import { Op } from "sequelize";
import User from "../models/users.js";
import StaffAdmin from "../models/staff_admin.js";
import Student from "../models/student.js";
import Course from "../models/course.js";
import Department from "../models/department.js";
import Role from "../models/role.js";
import Company from "../models/company.js";
import Drive from "../models/drive.js";
import DriveAllowedDepartment from "../models/drive_allowed_department.js";
import DriveAllowedCourse from "../models/drive_allowed_course.js";
import StudentApplication from "../models/student_application.js";
import Offer from "../models/offer.js";
import StudentVerificationRequest from "../models/student_verification_request.js";

const seedMockData = async () => {
  try {
    console.log("🌱 Starting Robust Dummy Data Seeding...");

    // 1. Fetch Core Metadata
    const cseDept = await Department.findOne({ where: { dept_code: "CSE" } });
    const itDept = await Department.findOne({ where: { dept_code: "IT" } });
    
    const btechCse = await Course.findOne({ where: { course_name: "B.Tech", dept_id: cseDept.dept_id } });
    const btechIt = await Course.findOne({ where: { course_name: "B.Tech", dept_id: itDept.dept_id } });

    const studentRole = await Role.findOne({ where: { role_name: "Student" } });
    const tpoRole = await Role.findOne({ where: { role_name: "TPO" } });
    const coordRole = await Role.findOne({ where: { role_name: "Placement_Coordinator" } });

    const passwordHash = await bcrypt.hash("123456", 10);

    if (!cseDept || !btechCse || !studentRole) {
      console.log("Core defaults missing!", { cseDept: !!cseDept, btechCse: !!btechCse, studentRole: !!studentRole });
      return;
    }

    // 2. Comprehensive Cleanup
    // We identify dummy data by the @dummy.edu.in domain
    const dummyUsers = await User.findAll({ where: { email: { [Op.like]: "%@dummy.edu.in" } }});
    const dummyUserIds = dummyUsers.map(u => u.user_id);

    if (dummyUserIds.length > 0) {
      console.log("🧹 Thoroughly cleaning up old mock records...");
      const dummyStudents = await Student.findAll({ where: { user_id: dummyUserIds } });
      const dummyStudentIds = dummyStudents.map(s => s.student_id);

      // Delete in order of dependency
      await Offer.destroy({ where: {} });
      await StudentApplication.destroy({ where: { student_id: dummyStudentIds } });
      await StudentVerificationRequest.destroy({ where: { student_id: dummyStudentIds } });
      await DriveAllowedDepartment.destroy({ where: {} });
      await DriveAllowedCourse.destroy({ where: {} });
      
      const StaffAdminModel = (await import("../models/staff_admin.js")).default;
      const dummyStaff = await StaffAdminModel.findAll({ where: { user_id: dummyUserIds }});
      const dummyStaffIds = dummyStaff.map(s => s.staff_id);
      
      // Clear drives created by dummy staff
      await Drive.destroy({ where: { created_by_staff: dummyStaffIds } });
      
      // Clear residual drives just in case (e.g. dummy companies)
      await Drive.destroy({ where: { placement_season: { [Op.in]: ["2024-2025", "2025-2026"] } } });
      await Company.destroy({ where: { placement_season: { [Op.in]: ["2024-2025", "2025-2026"] } } });

      await Student.destroy({ where: { user_id: dummyUserIds } });
      await StaffAdmin.destroy({ where: { user_id: dummyUserIds } });
      await User.destroy({ where: { user_id: [ ...dummyUserIds ] } });
    }

    // 3. Create Multi-Season Companies
    console.log("🏢 Seeding Companies for 2024-2025 & 2025-2026...");
    const companiesData = [
      { company_name: "Google (Mock)", placement_season: "2024-2025" },
      { company_name: "Microsoft (Mock)", placement_season: "2024-2025" },
      { company_name: "Amazon (Mock)", placement_season: "2025-2026" },
      { company_name: "Netflix (Mock)", placement_season: "2025-2026" }
    ];
    const generatedCompanies = await Company.bulkCreate(companiesData, { returning: true });

    // 4. Create Staff (Required for Drive ownership)
    const staffParams = [
      { email: "tpo_cse@dummy.edu.in", role: tpoRole.role_id, dept: cseDept.dept_id },
      { email: "coord_cse@dummy.edu.in", role: coordRole.role_id, dept: cseDept.dept_id },
      { email: "tpo_it@dummy.edu.in", role: tpoRole.role_id, dept: itDept.dept_id },
    ];
    
    let createdStaff = [];
    for (let sp of staffParams) {
      const user = await User.create({ email: sp.email, password_hash: passwordHash, role_id: sp.role, account_status: "Active" });
      const staff = await StaffAdmin.create({ user_id: user.user_id, dept_id: sp.dept });
      createdStaff.push(staff);
    }
    const [cseTpo, cseCoord, itTpo] = createdStaff;

    // 5. Create Job Drives (2 for each season)
    console.log("🎯 Seeding Job Drives...");
    const drivesData = [
      {
         company_id: generatedCompanies[0].company_id, // Google 24-25
         role_title: "Product Engineer",
         placement_season: "2024-2025",
         offer_type: "Placement",
         package_lpa: 28.0,
         drive_status: "Completed",
         approval_status: "Approved",
         created_by_staff: cseTpo.staff_id
      },
      {
        company_id: generatedCompanies[1].company_id, // Microsoft 24-25
        role_title: "Support Engineer",
        placement_season: "2024-2025",
        offer_type: "Placement",
        package_lpa: 12.0,
        drive_status: "Completed",
        approval_status: "Approved",
        created_by_staff: cseTpo.staff_id
      },
      {
        company_id: generatedCompanies[2].company_id, // Amazon 25-26
        role_title: "ML Intern",
        placement_season: "2025-2026",
        offer_type: "Internship+PPO",
        package_lpa: 40.0,
        drive_status: "Completed",
        approval_status: "Approved",
        created_by_staff: itTpo.staff_id
      },
      {
        company_id: generatedCompanies[3].company_id, // Netflix 25-26
        role_title: "Fullstack Dev",
        placement_season: "2025-2026",
        offer_type: "Placement",
        package_lpa: 35.0,
        drive_status: "Completed",
        approval_status: "Approved",
        created_by_staff: itTpo.staff_id
      }
    ];

    const drives = [];
    for (let driveParams of drivesData) {
       const drive = await Drive.create(driveParams);
       drives.push(drive);
       // Link to both Departments for maximum testing visibility
       await DriveAllowedDepartment.create({ drive_id: drive.drive_id, dept_id: cseDept.dept_id });
       await DriveAllowedDepartment.create({ drive_id: drive.drive_id, dept_id: itDept.dept_id });
       await DriveAllowedCourse.create({ drive_id: drive.drive_id, course_id: btechCse.course_id });
       await DriveAllowedCourse.create({ drive_id: drive.drive_id, course_id: btechIt.course_id });
    }

    // 6. Create Students with Mixed Statuses (Manual Verification logic)
    console.log("🎓 Seeding 20 Students with mixed statuses...");
    let studentsToCreate = [];
    
    for (let i = 1; i <= 20; i++) {
        const isCSE = i <= 10;
        const dept = isCSE ? cseDept : itDept;
        const course = isCSE ? btechCse : btechIt;
        const gender = i % 2 === 0 ? "Female" : "Male";
        
        const user = await User.create({ 
            email: `student${i}_${dept.dept_code.toLowerCase()}@dummy.edu.in`, 
            password_hash: passwordHash, 
            role_id: studentRole.role_id, 
            account_status: "Active" 
        });

        const student = await Student.create({
            user_id: user.user_id,
            email: user.email,
            full_name: `Test Student ${i}`,
            gender: gender,
            prn: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
            tnp_id: `${dept.dept_code}26${i.toString().padStart(3, '0')}`,
            dept_id: dept.dept_id,
            course_id: course.course_id,
            cgpa: 8.5 + (i % 10) / 10,
            mobile_number: `98765432${i.toString().padStart(2, '0')}`
        });

        studentsToCreate.push(student);

        // Mix Statuses: 1-10 Approved, 11-15 Pending, 16-20 Rejected
        let status = "Approved";
        if (i > 10 && i <= 15) status = "Pending";
        else if (i > 15) status = "Rejected";

        await StudentVerificationRequest.create({
            student_id: student.student_id,
            staff_id: isCSE ? cseTpo.staff_id : itTpo.staff_id,
            coordinator_status: status,
            tpo_status: status === "Approved" ? "Approved" : "Pending"
        });
    }

    // 7. Seed Placements for Approved Students across seasons
    console.log("📝 Seeding Placements & Offers...");
    const placements = [
        { stdIdx: 0, driveIdx: 0 }, { stdIdx: 1, driveIdx: 0 }, // 24-25 Google
        { stdIdx: 2, driveIdx: 1 }, { stdIdx: 3, driveIdx: 1 }, // 24-25 Microsoft
        { stdIdx: 10, driveIdx: 2 }, { stdIdx: 11, driveIdx: 2 }, // 25-26 Amazon (Wait, 10 is Approved, 11 is Pending... let's only use 0-9)
        // Adjust stdIdx to only use Approved ones (0-9)
        { stdIdx: 4, driveIdx: 2 }, { stdIdx: 5, driveIdx: 2 }, // 25-26 Amazon
        { stdIdx: 6, driveIdx: 3 }, { stdIdx: 7, driveIdx: 3 }, // 25-26 Netflix
    ];

    for (const p of placements) {
        const drive = drives[p.driveIdx];
        const student = studentsToCreate[p.stdIdx];
        const app = await StudentApplication.create({
            student_id: student.student_id,
            drive_id: drive.drive_id,
            application_status: "SELECTED",
            applied_at: new Date()
        });
        await Offer.create({
            application_id: app.application_id,
            offer_category: drive.offer_type,
            offered_package: drive.package_lpa,
            acceptance_status: "Accepted"
        });
    }

    console.log(`✅ successfully seeded data for both 2024-2025 and 2025-2026!`);
    console.log("Coordinator Students Page will show 10 Verified students.");
    console.log("TPO Reports will now have both seasons in the dropdown.");

  } catch (error) {
    console.error("❌ Problem seeding mock data:", error);
  }
};

export default seedMockData;
