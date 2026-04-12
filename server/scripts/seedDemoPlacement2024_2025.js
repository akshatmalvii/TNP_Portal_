import bcrypt from "bcrypt";
import { Op } from "sequelize";
import sequelize from "../config/db.js";
import "../utils/associations.js";
import Role from "../models/role.js";
import User from "../models/users.js";
import StaffAdmin from "../models/staff_admin.js";
import Department from "../models/department.js";
import Course from "../models/course.js";
import Company from "../models/company.js";
import CompanyContact from "../models/company_contact.js";
import Drive from "../models/drive.js";
import DriveAllowedDepartment from "../models/drive_allowed_department.js";
import DriveAllowedCourse from "../models/drive_allowed_course.js";
import Student from "../models/student.js";
import StudentVerificationRequest from "../models/student_verification_request.js";
import StudentApplication from "../models/student_application.js";
import Offer from "../models/offer.js";

const DEMO_PASSWORD = "123456";
const DEMO_SEASON = "2024-2025";
const DEMO_EMAIL_DOMAIN = "demo202425.tnp.local";
const YEAR_SUFFIX = "25";

const companySpecs = [
  {
    company_name: "Demo 2024-2025 Atlas Systems",
    company_website: "https://atlas-systems.demo",
    contact_name: "Riya Menon",
    contact_email: "riya.menon@atlas-systems.demo",
    contact_phone: "9876501001",
    designation: "Talent Acquisition Lead",
  },
  {
    company_name: "Demo 2024-2025 SecureGrid Labs",
    company_website: "https://securegrid.demo",
    contact_name: "Amit Vora",
    contact_email: "amit.vora@securegrid.demo",
    contact_phone: "9876501002",
    designation: "Campus Recruitment Manager",
  },
  {
    company_name: "Demo 2024-2025 Prism Labs",
    company_website: "https://prismlabs.demo",
    contact_name: "Neha Shah",
    contact_email: "neha.shah@prismlabs.demo",
    contact_phone: "9876501003",
    designation: "University Program Manager",
  },
  {
    company_name: "Demo 2024-2025 CampusOps",
    company_website: "https://campusops.demo",
    contact_name: "Rahul Patil",
    contact_email: "rahul.patil@campusops.demo",
    contact_phone: "9876501004",
    designation: "HR Business Partner",
  },
  {
    company_name: "Demo 2024-2025 Northstar Tech",
    company_website: "https://northstar.demo",
    contact_name: "Sneha Kulkarni",
    contact_email: "sneha.kulkarni@northstar.demo",
    contact_phone: "9876501005",
    designation: "Senior Recruiter",
  },
  {
    company_name: "Demo 2024-2025 BlueOrbit Services",
    company_website: "https://blueorbit.demo",
    contact_name: "Karan Dube",
    contact_email: "karan.dube@blueorbit.demo",
    contact_phone: "9876501006",
    designation: "Campus Hiring Lead",
  },
  {
    company_name: "Demo 2024-2025 VectorWare Mobility",
    company_website: "https://vectorware.demo",
    contact_name: "Ira Thomas",
    contact_email: "ira.thomas@vectorware.demo",
    contact_phone: "9876501007",
    designation: "People Operations",
  },
];

const driveSpecs = [
  {
    key: "cse-placement-high",
    company_name: "Demo 2024-2025 Atlas Systems",
    dept_code: "CSE",
    course_names: ["B.Tech"],
    role_title: "Software Engineer",
    role_description: "Full-time placement opportunity for backend and platform engineering.",
    offer_type: "Placement",
    package_lpa: 14.0,
    stipend_pm: null,
    has_bond: false,
    bond_months: null,
    has_security_deposit: false,
    security_deposit_amount: null,
    deadline: new Date("2024-08-25T18:00:00.000Z"),
    created_at: new Date("2024-08-05T09:30:00.000Z"),
  },
  {
    key: "cse-placement-low",
    company_name: "Demo 2024-2025 SecureGrid Labs",
    dept_code: "CSE",
    course_names: ["B.Tech"],
    role_title: "Security Operations Analyst",
    role_description: "Placement role with production monitoring, SOC workflows, and enterprise support.",
    offer_type: "Placement",
    package_lpa: 6.5,
    stipend_pm: null,
    has_bond: true,
    bond_months: 18,
    has_security_deposit: true,
    security_deposit_amount: "50000",
    deadline: new Date("2024-09-12T18:00:00.000Z"),
    created_at: new Date("2024-08-18T11:00:00.000Z"),
  },
  {
    key: "cse-internship-ppo",
    company_name: "Demo 2024-2025 Prism Labs",
    dept_code: "CSE",
    course_names: ["B.Tech", "MCA"],
    role_title: "AI Engineering Intern",
    role_description: "Internship with PPO consideration for ML platform and data tooling teams.",
    offer_type: "Internship+PPO",
    package_lpa: 9.75,
    stipend_pm: "45000 / month",
    has_bond: true,
    bond_months: 12,
    has_security_deposit: false,
    security_deposit_amount: null,
    deadline: new Date("2024-10-04T18:00:00.000Z"),
    created_at: new Date("2024-09-08T10:15:00.000Z"),
  },
  {
    key: "cse-internship",
    company_name: "Demo 2024-2025 CampusOps",
    dept_code: "CSE",
    course_names: ["MCA"],
    role_title: "Product Support Intern",
    role_description: "Internship focusing on product operations, support escalation, and reporting.",
    offer_type: "Internship",
    package_lpa: null,
    stipend_pm: "30000 / month",
    has_bond: false,
    bond_months: null,
    has_security_deposit: false,
    security_deposit_amount: null,
    deadline: new Date("2024-11-01T18:00:00.000Z"),
    created_at: new Date("2024-10-05T12:00:00.000Z"),
  },
  {
    key: "it-placement",
    company_name: "Demo 2024-2025 Northstar Tech",
    dept_code: "IT",
    course_names: ["B.Tech"],
    role_title: "Associate Software Engineer",
    role_description: "Full-time placement role for product engineering and cloud applications.",
    offer_type: "Placement",
    package_lpa: 11.0,
    stipend_pm: null,
    has_bond: false,
    bond_months: null,
    has_security_deposit: false,
    security_deposit_amount: null,
    deadline: new Date("2024-08-29T18:00:00.000Z"),
    created_at: new Date("2024-08-10T09:00:00.000Z"),
  },
  {
    key: "it-internship-ppo",
    company_name: "Demo 2024-2025 BlueOrbit Services",
    dept_code: "IT",
    course_names: ["B.Tech", "M.Tech"],
    role_title: "Data Platform Intern",
    role_description: "Internship plus PPO path for analytics engineering and data operations.",
    offer_type: "Internship+PPO",
    package_lpa: 8.25,
    stipend_pm: "40000 / month",
    has_bond: false,
    bond_months: null,
    has_security_deposit: true,
    security_deposit_amount: "25000",
    deadline: new Date("2024-09-20T18:00:00.000Z"),
    created_at: new Date("2024-09-02T10:45:00.000Z"),
  },
  {
    key: "it-internship",
    company_name: "Demo 2024-2025 VectorWare Mobility",
    dept_code: "IT",
    course_names: ["B.Tech"],
    role_title: "QA Automation Intern",
    role_description: "Internship focused on automation suites, release validation, and incident support.",
    offer_type: "Internship",
    package_lpa: null,
    stipend_pm: "28000 / month",
    has_bond: false,
    bond_months: null,
    has_security_deposit: false,
    security_deposit_amount: null,
    deadline: new Date("2024-11-10T18:00:00.000Z"),
    created_at: new Date("2024-10-16T14:20:00.000Z"),
  },
];

const studentSpecs = [
  {
    email: `aarav.cse.bt.${YEAR_SUFFIX}@${DEMO_EMAIL_DOMAIN}`,
    full_name: "Aarav Deshmukh",
    gender: "Male",
    dept_code: "CSE",
    course_name: "B.Tech",
    cgpa: 8.62,
    drive_key: "cse-placement-high",
  },
  {
    email: `riya.cse.bt.${YEAR_SUFFIX}@${DEMO_EMAIL_DOMAIN}`,
    full_name: "Riya Kulkarni",
    gender: "Female",
    dept_code: "CSE",
    course_name: "B.Tech",
    cgpa: 9.14,
    drive_key: "cse-placement-low",
  },
  {
    email: `vihaan.cse.mca.${YEAR_SUFFIX}@${DEMO_EMAIL_DOMAIN}`,
    full_name: "Vihaan Patwardhan",
    gender: "Male",
    dept_code: "CSE",
    course_name: "MCA",
    cgpa: 8.41,
    drive_key: "cse-internship",
  },
  {
    email: `ananya.cse.mca.${YEAR_SUFFIX}@${DEMO_EMAIL_DOMAIN}`,
    full_name: "Ananya Sharma",
    gender: "Female",
    dept_code: "CSE",
    course_name: "MCA",
    cgpa: 8.88,
    drive_key: "cse-internship-ppo",
  },
  {
    email: `isha.cse.bt.${YEAR_SUFFIX}.2@${DEMO_EMAIL_DOMAIN}`,
    full_name: "Isha Choure",
    gender: "Female",
    dept_code: "CSE",
    course_name: "B.Tech",
    cgpa: 8.97,
    drive_key: "cse-placement-high",
  },
  {
    email: `rohan.it.bt.${YEAR_SUFFIX}@${DEMO_EMAIL_DOMAIN}`,
    full_name: "Rohan Bhosale",
    gender: "Male",
    dept_code: "IT",
    course_name: "B.Tech",
    cgpa: 8.31,
    drive_key: "it-placement",
  },
  {
    email: `mira.it.bt.${YEAR_SUFFIX}@${DEMO_EMAIL_DOMAIN}`,
    full_name: "Mira Joseph",
    gender: "Female",
    dept_code: "IT",
    course_name: "B.Tech",
    cgpa: 8.74,
    drive_key: "it-internship",
  },
  {
    email: `aditya.it.mt.${YEAR_SUFFIX}@${DEMO_EMAIL_DOMAIN}`,
    full_name: "Aditya Sen",
    gender: "Male",
    dept_code: "IT",
    course_name: "M.Tech",
    cgpa: 8.56,
    drive_key: "it-internship-ppo",
  },
];

const getRoleByName = async (role_name) => {
  const role = await Role.findOne({ where: { role_name } });
  if (!role) {
    throw new Error(`Required role not found: ${role_name}`);
  }
  return role;
};

const getOrCreateUser = async ({ email, defaults }) => {
  let user = await User.findOne({ where: { email } });
  if (!user) {
    user = await User.create({ email, ...defaults });
    return user;
  }

  const patch = {};
  if (!user.full_name && defaults.full_name) patch.full_name = defaults.full_name;
  if (!user.role_id && defaults.role_id) patch.role_id = defaults.role_id;
  if (!user.account_status && defaults.account_status) patch.account_status = defaults.account_status;

  if (Object.keys(patch).length > 0) {
    await user.update(patch);
  }

  return user;
};

const getOrCreateStaffForDepartment = async ({ dept, role, fullName, email, passwordHash }) => {
  const existing = await StaffAdmin.findOne({
    include: [
      {
        model: User,
        where: { role_id: role.role_id },
        required: true,
      },
    ],
    where: { dept_id: dept.dept_id },
  });

  if (existing) {
    if (!existing.User?.full_name) {
      await existing.User.update({ full_name: fullName });
    }
    return existing;
  }

  const user = await getOrCreateUser({
    email,
    defaults: {
      full_name: fullName,
      password_hash: passwordHash,
      role_id: role.role_id,
      account_status: "Active",
    },
  });

  let staff = await StaffAdmin.findOne({ where: { user_id: user.user_id } });
  if (!staff) {
    staff = await StaffAdmin.create({
      user_id: user.user_id,
      dept_id: dept.dept_id,
    });
  } else if (staff.dept_id !== dept.dept_id) {
    await staff.update({ dept_id: dept.dept_id });
  }

  return staff;
};

const getNextTnpId = async (deptCode) => {
  const matches = await Student.findAll({
    where: {
      tnp_id: {
        [Op.like]: `${deptCode}${YEAR_SUFFIX}%`,
      },
    },
    attributes: ["tnp_id"],
    raw: true,
  });

  const maxSequence = matches.reduce((max, row) => {
    const digits = Number.parseInt(String(row.tnp_id).slice(-3), 10);
    return Number.isNaN(digits) ? max : Math.max(max, digits);
  }, 0);

  return `${deptCode}${YEAR_SUFFIX}${String(maxSequence + 1).padStart(3, "0")}`;
};

const getNextPrn = async (deptIndex) => {
  const existingPrns = new Set(
    (
      await Student.findAll({
        attributes: ["prn"],
        raw: true,
      })
    )
      .map((row) => String(row.prn || "").trim())
      .filter(Boolean)
  );

  let counter = 1;
  while (counter < 1_000_000) {
    const candidate = `8${YEAR_SUFFIX}${deptIndex}${String(counter).padStart(6, "0")}`;
    if (!existingPrns.has(candidate)) {
      return candidate;
    }
    counter += 1;
  }

  throw new Error(`Unable to generate an unused 10-digit PRN for dept index ${deptIndex}`);
};

const ensureCompanyWithContact = async (spec) => {
  let company = await Company.findOne({ where: { company_name: spec.company_name } });
  if (!company) {
    company = await Company.create({
      company_name: spec.company_name,
      company_website: spec.company_website,
      placement_season: DEMO_SEASON,
    });
  } else {
    await company.update({
      company_website: spec.company_website,
      placement_season: DEMO_SEASON,
    });
  }

  let contact = await CompanyContact.findOne({
    where: {
      company_id: company.company_id,
      contact_email: spec.contact_email,
    },
  });

  if (!contact) {
    await CompanyContact.create({
      company_id: company.company_id,
      contact_name: spec.contact_name,
      contact_email: spec.contact_email,
      contact_phone: spec.contact_phone,
      designation: spec.designation,
    });
  } else {
    await contact.update({
      contact_name: spec.contact_name,
      contact_phone: spec.contact_phone,
      designation: spec.designation,
    });
  }

  return company;
};

const ensureDrive = async ({ spec, company, dept, courses, createdByStaff, approvedByStaff }) => {
  let drive = await Drive.findOne({
    where: {
      company_id: company.company_id,
      role_title: spec.role_title,
      placement_season: DEMO_SEASON,
    },
  });

  const drivePayload = {
    company_id: company.company_id,
    role_title: spec.role_title,
    role_description: spec.role_description,
    placement_season: DEMO_SEASON,
    created_by_staff: drive?.created_by_staff || createdByStaff.staff_id,
    approved_by_staff: drive?.approved_by_staff || approvedByStaff.staff_id,
    offer_type: spec.offer_type,
    package_lpa: spec.package_lpa,
    stipend_pm: spec.stipend_pm,
    has_bond: spec.has_bond,
    bond_months: spec.bond_months,
    has_security_deposit: spec.has_security_deposit,
    security_deposit_amount: spec.security_deposit_amount,
    deadline: spec.deadline,
    drive_status: "Completed",
    approval_status: "Approved",
  };

  if (!drive) {
    drive = await Drive.create({
      ...drivePayload,
      created_at: spec.created_at,
      updated_at: spec.created_at,
    });
  } else {
    await drive.update(drivePayload);
  }

  const allowedDept = await DriveAllowedDepartment.findOne({
    where: {
      drive_id: drive.drive_id,
      dept_id: dept.dept_id,
    },
  });

  if (!allowedDept) {
    await DriveAllowedDepartment.create({
      drive_id: drive.drive_id,
      dept_id: dept.dept_id,
    });
  }

  for (const course of courses) {
    const allowedCourse = await DriveAllowedCourse.findOne({
      where: {
        drive_id: drive.drive_id,
        course_id: course.course_id,
      },
    });

    if (!allowedCourse) {
      await DriveAllowedCourse.create({
        drive_id: drive.drive_id,
        course_id: course.course_id,
      });
    }
  }

  return drive;
};

const ensureStudentRecord = async ({
  spec,
  dept,
  course,
  studentRole,
  deptIndex,
  coordinatorStaff,
  tpoStaff,
  passwordHash,
}) => {
  const user = await getOrCreateUser({
    email: spec.email,
    defaults: {
      full_name: spec.full_name,
      password_hash: passwordHash,
      role_id: studentRole.role_id,
      account_status: "Active",
    },
  });

  let student = await Student.findOne({ where: { user_id: user.user_id } });
  if (!student) {
    const tnp_id = await getNextTnpId(dept.dept_code);
    const prn = await getNextPrn(deptIndex);
    const mobile_number = `9${YEAR_SUFFIX}${deptIndex}${String(tnp_id.slice(-3)).padStart(6, "0")}`.slice(0, 10);

    student = await Student.create({
      user_id: user.user_id,
      full_name: spec.full_name,
      gender: spec.gender,
      mobile_number,
      email: spec.email,
      dept_id: dept.dept_id,
      course_id: course.course_id,
      prn,
      cgpa: spec.cgpa,
      tnp_id,
    });
  } else {
    await student.update({
      full_name: spec.full_name,
      gender: spec.gender,
      email: spec.email,
      dept_id: dept.dept_id,
      course_id: course.course_id,
      cgpa: spec.cgpa,
    });
  }

  let verification = await StudentVerificationRequest.findOne({
    where: { student_id: student.student_id },
  });

  if (!verification) {
    verification = await StudentVerificationRequest.create({
      student_id: student.student_id,
      coordinator_status: "Approved",
      tpo_status: "Approved",
      verified_by_coordinator: coordinatorStaff.staff_id,
      approved_by_tpo: tpoStaff.staff_id,
    });
  } else {
    await verification.update({
      coordinator_status: "Approved",
      tpo_status: "Approved",
      verified_by_coordinator: coordinatorStaff.staff_id,
      approved_by_tpo: tpoStaff.staff_id,
    });
  }

  return student;
};

const ensureApplicationAndOffer = async ({ student, drive }) => {
  let application = await StudentApplication.findOne({
    where: {
      student_id: student.student_id,
      drive_id: drive.drive_id,
    },
  });

  if (!application) {
    application = await StudentApplication.create({
      student_id: student.student_id,
      drive_id: drive.drive_id,
      application_status: "SELECTED",
      applied_at: drive.created_at,
      updated_at: drive.created_at,
    });
  } else {
    await application.update({ application_status: "SELECTED" });
  }

  const offeredPackage = drive.offer_type === "Internship" ? null : drive.package_lpa;
  let offer = await Offer.findOne({
    where: {
      application_id: application.application_id,
    },
  });

  if (!offer) {
    await Offer.create({
      application_id: application.application_id,
      offer_category: drive.offer_type,
      offered_package: offeredPackage,
      acceptance_status: "Accepted",
      created_at: drive.created_at,
      updated_at: drive.created_at,
    });
  } else {
    await offer.update({
      offer_category: drive.offer_type,
      offered_package: offeredPackage,
      acceptance_status: "Accepted",
    });
  }
};

const seedDemoPlacement2024_2025 = async () => {
  try {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    const studentRole = await getRoleByName("Student");
    const tpoRole = await getRoleByName("TPO");
    const coordinatorRole = await getRoleByName("Placement_Coordinator");

    const departments = await Department.findAll({
      where: { dept_code: { [Op.in]: ["CSE", "IT"] } },
    });

    if (departments.length === 0) {
      throw new Error("Required demo departments (CSE/IT) were not found.");
    }

    const deptMap = new Map(departments.map((dept) => [dept.dept_code, dept]));
    const courseMap = new Map();

    for (const spec of driveSpecs) {
      const dept = deptMap.get(spec.dept_code);
      if (!dept) continue;

      for (const courseName of spec.course_names) {
        const courseKey = `${spec.dept_code}:${courseName}`;
        if (courseMap.has(courseKey)) continue;

        const course = await Course.findOne({
          where: {
            dept_id: dept.dept_id,
            course_name: courseName,
          },
        });

        if (!course) {
          throw new Error(`Required course not found for demo data: ${courseName} in ${spec.dept_code}`);
        }

        courseMap.set(courseKey, course);
      }
    }

    const deptActors = new Map();
    for (const dept of departments) {
      const coordinator = await getOrCreateStaffForDepartment({
        dept,
        role: coordinatorRole,
        fullName: `${dept.dept_code} Demo Coordinator`,
        email: `demo.${dept.dept_code.toLowerCase()}.coord@${DEMO_EMAIL_DOMAIN}`,
        passwordHash,
      });
      const tpo = await getOrCreateStaffForDepartment({
        dept,
        role: tpoRole,
        fullName: `${dept.dept_code} Demo TPO`,
        email: `demo.${dept.dept_code.toLowerCase()}.tpo@${DEMO_EMAIL_DOMAIN}`,
        passwordHash,
      });

      deptActors.set(dept.dept_code, { coordinator, tpo });
    }

    const companies = new Map();
    for (const spec of companySpecs) {
      const company = await ensureCompanyWithContact(spec);
      companies.set(spec.company_name, company);
    }

    const drives = new Map();
    for (const spec of driveSpecs) {
      const dept = deptMap.get(spec.dept_code);
      if (!dept) continue;

      const actors = deptActors.get(spec.dept_code);
      const company = companies.get(spec.company_name);
      const courses = spec.course_names.map((courseName) =>
        courseMap.get(`${spec.dept_code}:${courseName}`)
      );

      const drive = await ensureDrive({
        spec,
        company,
        dept,
        courses,
        createdByStaff: actors.coordinator,
        approvedByStaff: actors.tpo,
      });

      drives.set(spec.key, drive);
    }

    const deptIndices = { CSE: 1, IT: 2 };

    for (const spec of studentSpecs) {
      const dept = deptMap.get(spec.dept_code);
      const actors = deptActors.get(spec.dept_code);
      const course = courseMap.get(`${spec.dept_code}:${spec.course_name}`);
      const drive = drives.get(spec.drive_key);

      if (!dept || !actors || !course || !drive) {
        throw new Error(`Unable to map demo student ${spec.email} to department/course/drive.`);
      }

      const student = await ensureStudentRecord({
        spec,
        dept,
        course,
        studentRole,
        deptIndex: deptIndices[spec.dept_code] || 9,
        coordinatorStaff: actors.coordinator,
        tpoStaff: actors.tpo,
        passwordHash,
      });

      await ensureApplicationAndOffer({ student, drive });
    }

    console.log(`Demo placement data for ${DEMO_SEASON} inserted safely.`);
    console.log("Records were added without deleting or overwriting unrelated existing data.");
  } catch (error) {
    console.error("Failed to seed 2024-2025 demo placement data:", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

seedDemoPlacement2024_2025();
