import { Op } from "sequelize";
import * as XLSX from "xlsx";
import sequelize from "../config/db.js";
import Drive from "../models/drive.js";
import DriveAllowedDepartment from "../models/drive_allowed_department.js";
import DriveAllowedCourse from "../models/drive_allowed_course.js";
import Company from "../models/company.js";
import Student from "../models/student.js";
import StudentApplication from "../models/student_application.js";
import Offer from "../models/offer.js";
import Course from "../models/course.js";
import Department from "../models/department.js";

const FINAL_PLACEMENT_CATEGORIES = new Set(["Placement", "Internship+PPO", "PPO_Conversion"]);

const formatContractRestrictions = (student) => {
  const restrictions = [];

  if (student.has_bond) {
    restrictions.push(`Bond: ${student.bond_months || 0} Months`);
  }

  if (student.has_security_deposit) {
    restrictions.push(`Cheque: ${student.security_deposit_amount || 0}`);
  }

  if (restrictions.length === 0) {
    return "Standard / None";
  }

  return restrictions.join(" | ");
};

const setSheetColumns = (worksheet, columns) => {
  worksheet["!cols"] = columns.map((width) => ({ wch: width }));
};

const getOfferRecordedAt = (record) => {
  return (
    record.offer_letter_timestamp ||
    record.offer_updated_at ||
    record.offer_created_at ||
    record.application_updated_at ||
    record.application_applied_at ||
    null
  );
};

const compareOfferRecency = (left, right) => {
  const leftTime = getOfferRecordedAt(left) ? new Date(getOfferRecordedAt(left)).getTime() : 0;
  const rightTime = getOfferRecordedAt(right) ? new Date(getOfferRecordedAt(right)).getTime() : 0;

  if (leftTime !== rightTime) {
    return rightTime - leftTime;
  }

  const leftUpdated = left.offer_updated_at ? new Date(left.offer_updated_at).getTime() : 0;
  const rightUpdated = right.offer_updated_at ? new Date(right.offer_updated_at).getTime() : 0;
  if (leftUpdated !== rightUpdated) {
    return rightUpdated - leftUpdated;
  }

  const leftCreated = left.offer_created_at ? new Date(left.offer_created_at).getTime() : 0;
  const rightCreated = right.offer_created_at ? new Date(right.offer_created_at).getTime() : 0;
  if (leftCreated !== rightCreated) {
    return rightCreated - leftCreated;
  }

  if ((left.offer_id || 0) !== (right.offer_id || 0)) {
    return (right.offer_id || 0) - (left.offer_id || 0);
  }

  return (right.application_id || 0) - (left.application_id || 0);
};

const annotateFinalPlacements = (placedStudentsList) => {
  const recordsByStudent = new Map();

  for (const record of placedStudentsList) {
    const existing = recordsByStudent.get(record.student_id) || [];
    existing.push(record);
    recordsByStudent.set(record.student_id, existing);
  }

  for (const records of recordsByStudent.values()) {
    const placementCandidates = records.filter((record) =>
      FINAL_PLACEMENT_CATEGORIES.has(record.offer_category)
    );
    const rankingPool = placementCandidates.length > 0 ? placementCandidates : records;
    const [finalRecord] = [...rankingPool].sort(compareOfferRecency);

    const chronologicalRecords = [...records].sort((left, right) => compareOfferRecency(right, left));
    const previousCompanyNames = chronologicalRecords
      .filter((record) => record !== finalRecord)
      .map((record) => record.company_name)
      .filter(Boolean);

    const previousCompanies = [...new Set(previousCompanyNames)];

    for (const record of records) {
      const isFinalPlacement = record === finalRecord;
      record.is_final_placement = isFinalPlacement;
      record.placement_status = isFinalPlacement ? "Final Placement" : "Previous Offer";
      record.previous_companies = isFinalPlacement ? previousCompanies : [];
      record.offer_recorded_at = getOfferRecordedAt(record);
    }
  }

  return placedStudentsList;
};

const getAvailableSeasons = async (dept_id = null) => {
  const drives = await Drive.findAll({
    include: dept_id
      ? [{
          model: DriveAllowedDepartment,
          where: { dept_id },
          attributes: []
        }]
      : [],
    attributes: [
      [sequelize.fn("DISTINCT", sequelize.col("placement_season")), "placement_season"]
    ],
    raw: true
  });
  return drives.map(d => d.placement_season).filter(Boolean).sort().reverse();
};

const getPlacementReport = async (dept_id, season, filters = {}) => {
  const { course_id } = filters;
  const selectedDepartment = await Department.findByPk(dept_id, {
    attributes: ["dept_id", "dept_name", "dept_code"],
  });

  if (!selectedDepartment) {
    throw { status: 404, message: "Department not found" };
  }

  let selectedCourse = null;
  if (course_id) {
    selectedCourse = await Course.findOne({
      where: { course_id, dept_id },
      attributes: ["course_id", "course_name"],
    });

    if (!selectedCourse) {
      throw { status: 404, message: "Course not found for your department" };
    }
  }

  const studentWhere = {
    dept_id,
    ...(course_id ? { course_id } : {}),
  };

  // 1. Total Registered Students in Department/Course
  const totalStudents = await Student.count({ where: studentWhere });

  // 2. Fetch all drives for this department in the given season
  const seasonDrives = await Drive.findAll({
    where: { placement_season: season },
    include: [
      {
        model: DriveAllowedDepartment,
        where: { dept_id },
        attributes: []
      },
      {
        model: DriveAllowedCourse,
        required: false,
        attributes: ["course_id"],
      },
      {
        model: Company,
        attributes: ["company_name"]
      }
    ]
  });

  const drives = !course_id
    ? seasonDrives
    : seasonDrives.filter((drive) => {
        const allowedCourses = drive.DriveAllowedCourses || [];
        return (
          allowedCourses.length === 0 ||
          allowedCourses.some((course) => Number(course.course_id) === Number(course_id))
        );
      });

  const driveIds = drives.map(d => d.drive_id);
  const companiesVisited = [...new Set(drives.map(d => d.Company?.company_name).filter(Boolean))];

  // If no drives, return empty report early
  if (driveIds.length === 0) {
    return {
      season,
      department: {
        dept_id: selectedDepartment.dept_id,
        dept_name: selectedDepartment.dept_name,
        dept_code: selectedDepartment.dept_code,
      },
      course: selectedCourse
        ? {
            course_id: selectedCourse.course_id,
            course_name: selectedCourse.course_name,
          }
        : null,
      totalStudents,
      totalPlaced: 0,
      genderBreakdown: { male: 0, female: 0 },
      offerBreakdown: { placement: 0, internship: 0, internship_ppo: 0 },
      packageMetrics: { highest: 0, lowest: 0, average: 0 },
      companiesVisited,
      placedStudents: []
    };
  }

  // 3. Fetch all accepted offers correlating to these drives for students in this department
  const applications = await StudentApplication.findAll({
    where: { drive_id: driveIds },
    include: [
      {
        model: Student,
        where: studentWhere,
        attributes: ["student_id", "full_name", "tnp_id", "gender", "prn", "course_id"],
        include: [
          {
            model: Course,
            attributes: ["course_name"],
            required: false,
          },
        ],
      },
      {
        model: Drive,
        include: [{ model: Company, attributes: ["company_name"] }],
        attributes: ["company_id", "role_title", "stipend_pm", "has_bond", "bond_months", "has_security_deposit", "security_deposit_amount", "package_lpa"]
      },
      {
        model: Offer,
        where: { acceptance_status: "Accepted" },
        attributes: [
          "offer_id",
          "offer_category",
          "offered_package",
          "acceptance_status",
          "offer_letter_timestamp",
          "created_at",
          "updated_at",
        ],
        required: true // only accepted offers
      }
    ]
  });

  // Calculate Aggregates
  let totalPlaced = 0;
  let malePlaced = 0;
  let femalePlaced = 0;
  
  let placementCount = 0;
  let internshipCount = 0;
  let internshipPpoCount = 0;

  const validPackages = [];
  const placedStudentsList = [];
  const uniquePlacedStudentIds = new Set();

  for (const app of applications) {
    const student = app.Student;
    const actualOffer = app.Offer;
    const drive = app.Drive;

    if (!actualOffer) continue;

    if (!uniquePlacedStudentIds.has(student.student_id)) {
      uniquePlacedStudentIds.add(student.student_id);
      totalPlaced++;
      if (student.gender === "Male" || student.gender === "male") malePlaced++;
      else if (student.gender === "Female" || student.gender === "female") femalePlaced++;
    }

    const offerCat = actualOffer.offer_category;
    if (offerCat === "Placement") placementCount++;
    else if (offerCat === "Internship") internshipCount++;
    else if (offerCat === "Internship+PPO") internshipPpoCount++;

    const pkg = parseFloat(actualOffer.offered_package || drive.package_lpa);
    if (!isNaN(pkg) && pkg > 0 && offerCat !== "Internship") {
      validPackages.push(pkg);
    }

    placedStudentsList.push({
      tnp_id: student.tnp_id,
      prn: student.prn,
      full_name: student.full_name,
      student_id: student.student_id,
      application_id: app.application_id,
      offer_id: actualOffer.offer_id,
      gender: student.gender,
      dept_name: selectedDepartment.dept_name,
      dept_code: selectedDepartment.dept_code,
      course_name: student.Course?.course_name || selectedCourse?.course_name || "",
      company_name: drive.Company?.company_name || "Unknown",
      role_title: drive.role_title,
      offer_category: offerCat,
      package_lpa: pkg || null,
      stipend_pm: drive.stipend_pm,
      has_bond: drive.has_bond,
      bond_months: drive.bond_months,
      has_security_deposit: drive.has_security_deposit,
      security_deposit_amount: drive.security_deposit_amount,
      application_applied_at: app.applied_at || null,
      application_updated_at: app.updated_at || null,
      offer_created_at: actualOffer.created_at || null,
      offer_updated_at: actualOffer.updated_at || null,
      offer_letter_timestamp: actualOffer.offer_letter_timestamp || null,
    });
  }

  annotateFinalPlacements(placedStudentsList);

  const highest = validPackages.length > 0 ? Math.max(...validPackages) : 0;
  const lowest = validPackages.length > 0 ? Math.min(...validPackages) : 0;
  const average = validPackages.length > 0 ? (validPackages.reduce((a, b) => a + b, 0) / validPackages.length).toFixed(2) : 0;

  return {
    season,
    department: {
      dept_id: selectedDepartment.dept_id,
      dept_name: selectedDepartment.dept_name,
      dept_code: selectedDepartment.dept_code,
    },
    course: selectedCourse
      ? {
          course_id: selectedCourse.course_id,
          course_name: selectedCourse.course_name,
        }
      : null,
    totalStudents,
    totalPlaced,
    genderBreakdown: { male: malePlaced, female: femalePlaced },
    offerBreakdown: { placement: placementCount, internship: internshipCount, internship_ppo: internshipPpoCount },
    packageMetrics: { highest, lowest, average },
    companiesVisited,
    placedStudents: placedStudentsList
  };
};

const getSubmittedOfferLetters = async (dept_id, filters = {}) => {
  const { season, course_id } = filters;

  const applications = await StudentApplication.findAll({
    include: [
      {
        model: Student,
        where: {
          dept_id,
          ...(course_id ? { course_id } : {}),
        },
        attributes: ["student_id", "full_name", "tnp_id", "prn", "course_id"],
        include: [
          {
            model: Course,
            attributes: ["course_id", "course_name"],
            required: false,
          },
        ],
      },
      {
        model: Offer,
        where: { 
          acceptance_status: "Accepted",
          offer_letter_url: { [Op.ne]: null }
        },
        required: true
      },
      {
        model: Drive,
        include: [{ model: Company, attributes: ["company_name"] }],
        attributes: ["role_title", "placement_season"],
        where: season ? { placement_season: season } : undefined,
      }
    ],
    order: [[Offer, "offer_letter_timestamp", "DESC"]]
  });

  return applications.map(app => ({
    offer_id: app.Offer.offer_id,
    tnp_id: app.Student.tnp_id,
    prn: app.Student.prn,
    full_name: app.Student.full_name,
    course_id: app.Student.course_id,
    course_name: app.Student.Course?.course_name || "Unknown Course",
    company_name: app.Drive.Company.company_name,
    position: app.Drive.role_title,
    placement_season: app.Drive.placement_season || null,
    offer_letter_url: app.Offer.offer_letter_url,
    offer_letter_timestamp: app.Offer.offer_letter_timestamp
  }));
};

const buildPlacementReportWorkbook = (report) => {
  const workbook = XLSX.utils.book_new();
  const courseLabel = report.course?.course_name || "All Courses";
  const departmentLabel = report.department?.dept_name || "";
  const departmentCode = report.department?.dept_code || "";

  const overviewRows = [
    { Metric: "Placement Season", Value: report.season || "" },
    { Metric: "Department", Value: departmentLabel },
    { Metric: "Department Code", Value: departmentCode },
    { Metric: "Course", Value: courseLabel },
    { Metric: "Total Registered Students", Value: report.totalStudents || 0 },
    { Metric: "Total Placements", Value: report.totalPlaced || 0 },
    { Metric: "Highest CTC (LPA)", Value: report.packageMetrics?.highest || 0 },
    { Metric: "Average CTC (LPA)", Value: report.packageMetrics?.average || 0 },
    { Metric: "Lowest CTC (LPA)", Value: report.packageMetrics?.lowest || 0 },
    { Metric: "Total Companies Visited", Value: report.companiesVisited?.length || 0 },
    { Metric: "Direct Placement Offers", Value: report.offerBreakdown?.placement || 0 },
    { Metric: "Internship + PPO Offers", Value: report.offerBreakdown?.internship_ppo || 0 },
    { Metric: "Only Internship Offers", Value: report.offerBreakdown?.internship || 0 },
    { Metric: "Male Students Placed", Value: report.genderBreakdown?.male || 0 },
    { Metric: "Female Students Placed", Value: report.genderBreakdown?.female || 0 },
  ];

  const overviewSheet = XLSX.utils.json_to_sheet(overviewRows);
  setSheetColumns(overviewSheet, [32, 18]);
  XLSX.utils.book_append_sheet(workbook, overviewSheet, "Overview");

  const companyRows = (report.companiesVisited || []).map((companyName, index) => ({
    "Sr. No.": index + 1,
    "Company Name": companyName,
  }));
  const companiesSheet = XLSX.utils.json_to_sheet(
    companyRows.length > 0 ? companyRows : [{ "Sr. No.": "", "Company Name": "No companies recorded" }]
  );
  setSheetColumns(companiesSheet, [10, 40]);
  XLSX.utils.book_append_sheet(workbook, companiesSheet, "Companies");

  const placedStudentRows = (report.placedStudents || []).map((student, index) => ({
    "Sr. No.": index + 1,
    "Student Name": student.full_name || "",
    Department: student.dept_name || departmentLabel,
    "Department Code": student.dept_code || departmentCode,
    Course: student.course_name || report.course?.course_name || "",
    Gender: student.gender || "",
    "TNP ID": student.tnp_id || "",
    PRN: student.prn || "",
    Company: student.company_name || "",
    "Role Title": student.role_title || "",
    "Placement Status": student.placement_status || "",
    "Offer Recorded At": student.offer_recorded_at || "",
    "Previous Companies": (student.previous_companies || []).join(", "),
    "Offer Category": student.offer_category || "",
    "Package (LPA)": student.package_lpa ?? "",
    "Stipend Per Month": student.stipend_pm ?? "",
    "Contract Restrictions": formatContractRestrictions(student),
    "Has Bond": student.has_bond ? "Yes" : "No",
    "Bond Months": student.bond_months ?? "",
    "Has Security Deposit": student.has_security_deposit ? "Yes" : "No",
    "Security Deposit Amount": student.security_deposit_amount ?? "",
  }));

  const placedStudentsSheet = XLSX.utils.json_to_sheet(
    placedStudentRows.length > 0
      ? placedStudentRows
      : [{
          "Sr. No.": "",
          "Student Name": "No placements recorded for this season",
          Department: departmentLabel,
          "Department Code": departmentCode,
          Course: report.course?.course_name || "",
          Gender: "",
          "TNP ID": "",
          PRN: "",
          Company: "",
          "Role Title": "",
          "Placement Status": "",
          "Offer Recorded At": "",
          "Previous Companies": "",
          "Offer Category": "",
          "Package (LPA)": "",
          "Stipend Per Month": "",
          "Contract Restrictions": "",
          "Has Bond": "",
          "Bond Months": "",
          "Has Security Deposit": "",
          "Security Deposit Amount": "",
        }]
  );
  setSheetColumns(placedStudentsSheet, [10, 28, 24, 16, 20, 12, 18, 18, 22, 22, 28, 18, 16, 18, 30, 12, 14, 20, 24]);
  XLSX.utils.book_append_sheet(workbook, placedStudentsSheet, "Placed Students");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
};

export default {
  getAvailableSeasons,
  getPlacementReport,
  getSubmittedOfferLetters,
  buildPlacementReportWorkbook
};
