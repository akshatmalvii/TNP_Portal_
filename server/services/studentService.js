import Student from "../models/student.js";
import Department from "../models/department.js";
import Course from "../models/course.js";
import StudentVerificationRequest from "../models/student_verification_request.js";
import Offer from "../models/offer.js";
import StudentApplication from "../models/student_application.js";
import Drive from "../models/drive.js";
import Company from "../models/company.js";

const getMyProfile = async (user_id) => {
  const student = await Student.findOne({
    where: { user_id },
    include: [
      { model: Department, attributes: ["dept_id", "dept_name", "dept_code"] },
      { model: Course, attributes: ["course_id", "course_name"] },
      { model: StudentVerificationRequest, required: false },
    ],
  });
  return student;
};

const getVerificationStatus = async (user_id) => {
  const student = await Student.findOne({ where: { user_id } });
  if (!student) {
    return { status: "PROFILE_NOT_CREATED" };
  }

  const req = await StudentVerificationRequest.findOne({
    where: { student_id: student.student_id },
    order: [["created_at", "DESC"]],
  });

  if (!req) {
    return { status: "NOT_SUBMITTED" };
  }

  return {
    status: req.coordinator_status,
    coordinator_status: req.coordinator_status,
  };
};

const getAcceptedOffers = async (user_id) => {
  const student = await Student.findOne({ where: { user_id } });
  if (!student) return [];

  const applications = await StudentApplication.findAll({
    where: {
      student_id: student.student_id,
      application_status: "SELECTED",
    },
    include: [
      {
        model: Offer,
        required: false,
      },
      {
        model: Drive,
        include: [{ model: Company, attributes: ["company_name"] }]
      }
    ]
  });

  return applications.map(app => ({
    offer_id: app.Offer?.offer_id || null,
    application_id: app.application_id,
    drive_id: app.drive_id,
    company_name: app.Drive.Company.company_name,
    position: app.Drive.role_title,
    offer_letter_url: app.Offer?.offer_letter_url || null,
    offer_letter_timestamp: app.Offer?.offer_letter_timestamp || null
  }));
};

const ensureMissingAcceptedOffersForSelectedApplications = async (user_id) => {
  const student = await Student.findOne({ where: { user_id } });
  if (!student) return;

  const selectedApplications = await StudentApplication.findAll({
    where: {
      student_id: student.student_id,
      application_status: "SELECTED",
    },
    include: [
      {
        model: Offer,
        required: false,
      },
      {
        model: Drive,
        attributes: ["offer_type", "package_lpa"],
      },
    ],
  });

  for (const application of selectedApplications) {
    if (application.Offer) continue;

    await Offer.create({
      application_id: application.application_id,
      offer_category: application.Drive?.offer_type || "Placement",
      offered_package: application.Drive?.package_lpa || null,
      acceptance_status: "Accepted",
      created_at: new Date(),
      updated_at: new Date(),
    });
  }
};

const uploadOfferLetter = async (user_id, offer_id, offer_letter_url, application_id) => {
  const student = await Student.findOne({ where: { user_id } });
  if (!student) throw new Error("Student not found");

  let offer = null;

  if (offer_id) {
    offer = await Offer.findOne({
      where: { offer_id },
      include: [
        {
          model: StudentApplication,
          where: { student_id: student.student_id }
        }
      ]
    });
  }

  if (!offer) {
    const selectedApplication = await StudentApplication.findOne({
      where: {
        application_id,
        student_id: student.student_id,
        application_status: "SELECTED",
      },
      include: [
        {
          model: Offer,
          required: false,
        },
        {
          model: Drive,
          attributes: ["offer_type", "package_lpa"],
        },
      ],
    });

    if (!selectedApplication) {
      throw new Error("Selected application not found or does not belong to student");
    }

    if (selectedApplication.Offer) {
      offer = selectedApplication.Offer;
    } else {
      offer = await Offer.create({
        application_id: selectedApplication.application_id,
        offer_category: selectedApplication.Drive?.offer_type || "Placement",
        offered_package: selectedApplication.Drive?.package_lpa || null,
        acceptance_status: "Accepted",
        created_at: new Date(),
        updated_at: new Date(),
      });
    }
  }

  if (!offer) throw new Error("Offer not found or does not belong to student");

  offer.offer_letter_url = offer_letter_url;
  offer.offer_letter_timestamp = new Date();
  offer.updated_at = new Date();
  await offer.save();

  return offer;
};

export default {
  getMyProfile,
  getVerificationStatus,
  getAcceptedOffers,
  ensureMissingAcceptedOffersForSelectedApplications,
  uploadOfferLetter,
};
