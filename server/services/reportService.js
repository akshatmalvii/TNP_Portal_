import sequelize from "../config/db.js";
import Drive from "../models/drive.js";
import DriveAllowedDepartment from "../models/drive_allowed_department.js";
import Company from "../models/company.js";
import Student from "../models/student.js";
import StudentApplication from "../models/student_application.js";
import Offer from "../models/offer.js";

const getAvailableSeasons = async (dept_id) => {
  const drives = await Drive.findAll({
    include: [{
      model: DriveAllowedDepartment,
      where: { dept_id },
      attributes: []
    }],
    attributes: [
      [sequelize.fn("DISTINCT", sequelize.col("placement_season")), "placement_season"]
    ],
    raw: true
  });
  return drives.map(d => d.placement_season).filter(Boolean).sort().reverse();
};

const getPlacementReport = async (dept_id, season) => {
  // 1. Total Registered Students in Department
  const totalStudents = await Student.count({ where: { dept_id } });

  // 2. Fetch all drives for this department in the given season
  const drives = await Drive.findAll({
    where: { placement_season: season },
    include: [
      {
        model: DriveAllowedDepartment,
        where: { dept_id },
        attributes: []
      },
      {
        model: Company,
        attributes: ["company_name"]
      }
    ]
  });

  const driveIds = drives.map(d => d.drive_id);
  const companiesVisited = [...new Set(drives.map(d => d.Company?.company_name).filter(Boolean))];

  // If no drives, return empty report early
  if (driveIds.length === 0) {
    return {
      season,
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
        where: { dept_id },
        attributes: ["student_id", "full_name", "tnp_id", "gender", "prn"]
      },
      {
        model: Drive,
        include: [{ model: Company, attributes: ["company_name"] }],
        attributes: ["company_id", "role_title", "stipend_pm", "has_bond", "bond_months", "has_security_deposit", "security_deposit_amount", "package_lpa"]
      },
      {
        model: Offer,
        where: { acceptance_status: "Accepted" },
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
      gender: student.gender,
      company_name: drive.Company?.company_name || "Unknown",
      role_title: drive.role_title,
      offer_category: offerCat,
      package_lpa: pkg || null,
      stipend_pm: drive.stipend_pm,
      has_bond: drive.has_bond,
      bond_months: drive.bond_months,
      has_security_deposit: drive.has_security_deposit,
      security_deposit_amount: drive.security_deposit_amount
    });
  }

  const highest = validPackages.length > 0 ? Math.max(...validPackages) : 0;
  const lowest = validPackages.length > 0 ? Math.min(...validPackages) : 0;
  const average = validPackages.length > 0 ? (validPackages.reduce((a, b) => a + b, 0) / validPackages.length).toFixed(2) : 0;

  return {
    season,
    totalStudents,
    totalPlaced,
    genderBreakdown: { male: malePlaced, female: femalePlaced },
    offerBreakdown: { placement: placementCount, internship: internshipCount, internship_ppo: internshipPpoCount },
    packageMetrics: { highest, lowest, average },
    companiesVisited,
    placedStudents: placedStudentsList
  };
};

const getSubmittedOfferLetters = async (dept_id) => {
  const applications = await StudentApplication.findAll({
    include: [
      {
        model: Student,
        where: { dept_id },
        attributes: ["student_id", "full_name", "tnp_id", "prn"]
      },
      {
        model: Offer,
        where: { 
          acceptance_status: "Accepted",
          offer_letter_url: { [sequelize.Op.ne]: null }
        },
        required: true
      },
      {
        model: Drive,
        include: [{ model: Company, attributes: ["company_name"] }],
        attributes: ["position"]
      }
    ],
    order: [[Offer, "offer_letter_timestamp", "DESC"]]
  });

  return applications.map(app => ({
    offer_id: app.Offer.offer_id,
    tnp_id: app.Student.tnp_id,
    prn: app.Student.prn,
    full_name: app.Student.full_name,
    company_name: app.Drive.Company.company_name,
    position: app.Drive.position,
    offer_letter_url: app.Offer.offer_letter_url,
    offer_letter_timestamp: app.Offer.offer_letter_timestamp
  }));
};

export default {
  getAvailableSeasons,
  getPlacementReport,
  getSubmittedOfferLetters
};
