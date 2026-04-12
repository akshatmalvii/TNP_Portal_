import * as XLSX from "xlsx";
import sequelize from "../config/db.js";
import StaffAdmin from "../models/staff_admin.js";
import Drive from "../models/drive.js";
import Company from "../models/company.js";
import DriveAllowedDepartment from "../models/drive_allowed_department.js";
import StudentApplication from "../models/student_application.js";
import Student from "../models/student.js";
import DriveRound from "../models/drive_round.js";
import DriveRoundResult from "../models/drive_round_result.js";
import StudentNotification from "../models/student_notification.js";
import Offer from "../models/offer.js";

const ACTIVE_APPLICATION_STATUSES = ["APPLIED", "SHORTLISTED", "IN_PROGRESS"];

const formatSchedule = (value) =>
  new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const normalizeHeader = (value = "") =>
  String(value).trim().toLowerCase().replace(/[^a-z0-9]/g, "");

const getCoordinatorContext = async (userId) => {
  const staffUser = await StaffAdmin.findOne({ where: { user_id: userId } });

  if (!staffUser) {
    throw { status: 403, message: "Coordinator mapping not found" };
  }

  if (!staffUser.dept_id) {
    throw { status: 400, message: "Coordinator department is not assigned" };
  }

  return staffUser;
};

const getScopedDrive = async (driveId, deptId) => {
  const drive = await Drive.findOne({
    where: { drive_id: driveId },
    include: [
      { model: Company, attributes: ["company_id", "company_name"] },
      {
        model: DriveAllowedDepartment,
        where: { dept_id: deptId },
        required: true,
        attributes: ["dept_id"],
      },
    ],
  });

  if (!drive) {
    throw {
      status: 404,
      message: "Drive not found for your department",
    };
  }

  return drive;
};

const getActiveApplicationsForDrive = async (driveId, transaction) =>
  StudentApplication.findAll({
    where: {
      drive_id: driveId,
      application_status: ACTIVE_APPLICATION_STATUSES,
    },
    include: [
      {
        model: Student,
        attributes: [
          "student_id",
          "full_name",
          "email",
          "tnp_id",
          "prn",
          "dept_id",
        ],
      },
    ],
    transaction,
  });

const getQualifiedApplicationStatus = (round) => {
  if (round.is_final_round) {
    return "SELECTED";
  }

  return round.round_number === 1 ? "SHORTLISTED" : "IN_PROGRESS";
};

const parseQualifiedTnpIds = (fileBuffer) => {
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw { status: 400, message: "The uploaded Excel file is empty" };
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

  if (!rows.length) {
    throw { status: 400, message: "The uploaded Excel file does not contain any rows" };
  }

  const resolvedHeader = Object.keys(rows[0]).find((key) =>
    ["tnpid", "tnpidno", "studenttnpid"].includes(normalizeHeader(key))
  );

  if (!resolvedHeader) {
    throw {
      status: 400,
      message: "Excel sheet must contain a 'TNP ID' column",
    };
  }

  const tnpIds = rows
    .map((row) => String(row[resolvedHeader] || "").trim())
    .filter(Boolean);

  if (!tnpIds.length) {
    throw {
      status: 400,
      message: "No TNP IDs were found in the uploaded Excel sheet",
    };
  }

  return [...new Set(tnpIds)];
};

const createNotifications = async (payloads, transaction) => {
  if (!payloads.length) return;
  await StudentNotification.bulkCreate(payloads, { transaction });
};

const listCoordinatorDrives = async (userId) => {
  const staffUser = await getCoordinatorContext(userId);
  const drives = await Drive.findAll({
    include: [
      { model: Company, attributes: ["company_name"] },
      {
        model: DriveAllowedDepartment,
        where: { dept_id: staffUser.dept_id },
        required: true,
        attributes: [],
      },
      { model: DriveRound, required: false },
    ],
    order: [["created_at", "DESC"]],
  });

  const drivesWithCounts = await Promise.all(
    drives.map(async (drive) => {
      const [totalApplicants, activeApplicants] = await Promise.all([
        StudentApplication.count({ where: { drive_id: drive.drive_id } }),
        StudentApplication.count({
          where: {
            drive_id: drive.drive_id,
            application_status: ACTIVE_APPLICATION_STATUSES,
          },
        }),
      ]);

      return {
        ...drive.get({ plain: true }),
        company_name: drive.Company?.company_name || "Unknown Company",
        totalApplicants,
        activeApplicants,
        roundsCount: drive.DriveRounds?.length || 0,
      };
    })
  );

  return drivesWithCounts;
};

const getDriveProcess = async (userId, driveId) => {
  const staffUser = await getCoordinatorContext(userId);
  const drive = await getScopedDrive(driveId, staffUser.dept_id);

  const [rounds, applications] = await Promise.all([
    DriveRound.findAll({
      where: { drive_id: drive.drive_id },
      include: [{ model: DriveRoundResult, required: false }],
      order: [["round_number", "ASC"]],
    }),
    StudentApplication.findAll({
      where: { drive_id: drive.drive_id },
      include: [
        {
          model: Student,
          attributes: [
            "student_id",
            "full_name",
            "email",
            "tnp_id",
            "prn",
          ],
        },
      ],
      order: [["updated_at", "DESC"]],
    }),
  ]);

  return {
    drive: {
      ...drive.get({ plain: true }),
      company_name: drive.Company?.company_name || "Unknown Company",
    },
    rounds: rounds.map((round) => {
      const plainRound = round.get({ plain: true });
      const results = plainRound.DriveRoundResults || [];
      const qualifiedCount = results.filter(
        (result) => result.result_status === "Qualified"
      ).length;
      const rejectedCount = results.filter(
        (result) => result.result_status === "Rejected"
      ).length;

      return {
        ...plainRound,
        qualifiedCount,
        rejectedCount,
        resultsUploaded: results.length > 0,
      };
    }),
    applications: applications.map((application) => application.get({ plain: true })),
  };
};

const createDriveRound = async (userId, driveId, data) => {
  const staffUser = await getCoordinatorContext(userId);
  const drive = await getScopedDrive(driveId, staffUser.dept_id);

  if (drive.drive_status === "Completed") {
    throw { status: 400, message: "This drive has already been completed" };
  }

  if (drive.approval_status !== "Approved" || drive.drive_status !== "Active") {
    throw {
      status: 400,
      message: "Drive rounds can only be created after the TPO approves and publishes the drive",
    };
  }

  const roundName = String(data.round_name || "").trim();
  const roundType = String(data.round_type || "").trim();
  const venue = String(data.venue || "").trim();
  const instructions = String(data.instructions || "").trim();
  const scheduledAt = data.scheduled_at ? new Date(data.scheduled_at) : null;
  const isFinalRound = data.is_final_round === true || data.is_final_round === "true";

  if (!roundName || !roundType || !scheduledAt || Number.isNaN(scheduledAt.getTime())) {
    throw {
      status: 400,
      message: "Round name, round type, and valid schedule are required",
    };
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  if (scheduledAt < startOfToday) {
    throw {
      status: 400,
      message: "Round schedule cannot be set in the past",
    };
  }

  const existingFinalRound = await DriveRound.findOne({
    where: { drive_id: drive.drive_id, is_final_round: true },
  });

  if (existingFinalRound && isFinalRound) {
    throw {
      status: 400,
      message: "A final round is already defined for this drive",
    };
  }

  const latestRound = await DriveRound.findOne({
    where: { drive_id: drive.drive_id },
    order: [["round_number", "DESC"]],
  });

  const roundNumber = latestRound ? latestRound.round_number + 1 : 1;
  const activeApplications = await getActiveApplicationsForDrive(drive.drive_id);

  const transaction = await sequelize.transaction();

  try {
    const round = await DriveRound.create(
      {
        drive_id: drive.drive_id,
        round_number: roundNumber,
        round_name: roundName,
        round_type: roundType,
        scheduled_at: scheduledAt,
        venue: venue || null,
        instructions: instructions || null,
        is_final_round: isFinalRound,
        broadcasted_at: new Date(),
        created_by_staff: staffUser.staff_id,
      },
      { transaction }
    );

    const notifications = activeApplications.map((application) => ({
      student_id: application.student_id,
      drive_id: drive.drive_id,
      application_id: application.application_id,
      round_id: round.round_id,
      title: `${drive.Company?.company_name || "Drive"} - Round ${roundNumber} Scheduled`,
      message: [
        `${roundName} (${roundType}) has been scheduled for ${drive.Company?.company_name || "this drive"}.`,
        `When: ${formatSchedule(scheduledAt)}`,
        venue ? `Venue: ${venue}` : null,
        instructions ? `Instructions: ${instructions}` : null,
      ]
        .filter(Boolean)
        .join(" "),
      notification_type: "ROUND_SCHEDULE",
      is_read: false,
      created_by_staff: staffUser.staff_id,
      created_at: new Date(),
    }));

    await createNotifications(notifications, transaction);

    await transaction.commit();

    return {
      round: round.get({ plain: true }),
      notifiedCount: notifications.length,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const processRoundResults = async (userId, driveId, roundId, file) => {
  if (!file?.buffer) {
    throw { status: 400, message: "An Excel result sheet is required" };
  }

  const staffUser = await getCoordinatorContext(userId);
  const drive = await getScopedDrive(driveId, staffUser.dept_id);
  const round = await DriveRound.findOne({
    where: { round_id: roundId, drive_id: drive.drive_id },
  });

  if (!round) {
    throw { status: 404, message: "Round not found for this drive" };
  }

  const existingResultsCount = await DriveRoundResult.count({
    where: { round_id: round.round_id },
  });

  if (existingResultsCount > 0) {
    throw {
      status: 400,
      message: "Results have already been uploaded for this round",
    };
  }

  const qualifiedTnpIds = parseQualifiedTnpIds(file.buffer);
  const activeApplications = await getActiveApplicationsForDrive(drive.drive_id);

  if (!activeApplications.length) {
    throw {
      status: 400,
      message: "There are no active applicants left for this drive",
    };
  }

  const activeByTnpId = new Map(
    activeApplications
      .filter((application) => application.Student?.tnp_id)
      .map((application) => [application.Student.tnp_id, application])
  );

  const qualifiedApplications = [];
  const unmatchedTnpIds = [];

  for (const tnpId of qualifiedTnpIds) {
    const application = activeByTnpId.get(tnpId);
    if (application) {
      qualifiedApplications.push(application);
    } else {
      unmatchedTnpIds.push(tnpId);
    }
  }

  const qualifiedIds = new Set(
    qualifiedApplications.map((application) => application.application_id)
  );
  const rejectedApplications = activeApplications.filter(
    (application) => !qualifiedIds.has(application.application_id)
  );

  if (!qualifiedApplications.length) {
    throw {
      status: 400,
      message: "None of the uploaded TNP IDs matched active applicants for this drive",
    };
  }

  const qualifiedStatus = getQualifiedApplicationStatus(round);
  const transaction = await sequelize.transaction();

  try {
    await DriveRoundResult.bulkCreate(
      activeApplications.map((application) => ({
        round_id: round.round_id,
        application_id: application.application_id,
        result_status: qualifiedIds.has(application.application_id)
          ? "Qualified"
          : "Rejected",
        updated_by_staff: staffUser.staff_id,
        created_at: new Date(),
        updated_at: new Date(),
      })),
      { transaction }
    );

    await StudentApplication.update(
      {
        application_status: qualifiedStatus,
        updated_at: new Date(),
      },
      {
        where: {
          application_id: qualifiedApplications.map(
            (application) => application.application_id
          ),
        },
        transaction,
      }
    );

    if (rejectedApplications.length > 0) {
      await StudentApplication.update(
        {
          application_status: "REJECTED",
          updated_at: new Date(),
        },
        {
          where: {
            application_id: rejectedApplications.map(
              (application) => application.application_id
            ),
          },
          transaction,
        }
      );
    }

    if (round.is_final_round) {
      const offersPayload = qualifiedApplications.map((application) => ({
        application_id: application.application_id,
        offer_category: drive.offer_type,
        offered_package: drive.package_lpa || null,
        acceptance_status: "Accepted",
        created_at: new Date(),
        updated_at: new Date(),
      }));

      await Offer.bulkCreate(offersPayload, { transaction, ignoreDuplicates: true });
      await drive.update(
        { drive_status: "Completed", updated_at: new Date() },
        { transaction }
      );
    }

    const qualifiedNotifications = qualifiedApplications.map((application) => ({
      student_id: application.student_id,
      drive_id: drive.drive_id,
      application_id: application.application_id,
      round_id: round.round_id,
      title: round.is_final_round
        ? `Congratulations! Selected at ${drive.Company?.company_name || "the company"}`
        : `Qualified for the next round at ${drive.Company?.company_name || "the company"}`,
      message: round.is_final_round
        ? `You have been selected for ${drive.Company?.company_name || "this drive"} after ${round.round_name}. Your application status is now SELECTED.`
        : `You cleared ${round.round_name} for ${drive.Company?.company_name || "this drive"}. Your application status is now ${qualifiedStatus}.`,
      notification_type: round.is_final_round ? "FINAL_SELECTION" : "ROUND_RESULT",
      is_read: false,
      created_by_staff: staffUser.staff_id,
      created_at: new Date(),
    }));

    const rejectedNotifications = rejectedApplications.map((application) => ({
      student_id: application.student_id,
      drive_id: drive.drive_id,
      application_id: application.application_id,
      round_id: round.round_id,
      title: round.is_final_round
        ? `Final result available for ${drive.Company?.company_name || "the drive"}`
        : `Round result available for ${drive.Company?.company_name || "the drive"}`,
      message: round.is_final_round
        ? `You were not selected in the final round for ${drive.Company?.company_name || "this drive"}. Your application status is now REJECTED.`
        : `You did not clear ${round.round_name} for ${drive.Company?.company_name || "this drive"}. Your application status is now REJECTED.`,
      notification_type: round.is_final_round ? "FINAL_REJECTION" : "ROUND_RESULT",
      is_read: false,
      created_by_staff: staffUser.staff_id,
      created_at: new Date(),
    }));

    await createNotifications(
      [...qualifiedNotifications, ...rejectedNotifications],
      transaction
    );

    await transaction.commit();

    return {
      qualifiedCount: qualifiedApplications.length,
      rejectedCount: rejectedApplications.length,
      unmatchedTnpIds,
      qualifiedStatus,
      finalRound: round.is_final_round,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export default {
  listCoordinatorDrives,
  getDriveProcess,
  createDriveRound,
  processRoundResults,
};
