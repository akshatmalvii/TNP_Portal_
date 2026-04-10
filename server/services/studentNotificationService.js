import Student from "../models/student.js";
import StudentNotification from "../models/student_notification.js";
import Drive from "../models/drive.js";
import Company from "../models/company.js";
import DriveRound from "../models/drive_round.js";

const getStudentContext = async (userId) => {
  const student = await Student.findOne({ where: { user_id: userId } });

  if (!student) {
    throw { status: 404, message: "Student profile not found" };
  }

  return student;
};

const listStudentNotifications = async (userId, limit = 15) => {
  const student = await getStudentContext(userId);
  const notifications = await StudentNotification.findAll({
    where: { student_id: student.student_id },
    include: [
      {
        model: Drive,
        attributes: ["drive_id", "role_title"],
        include: [{ model: Company, attributes: ["company_name"] }],
      },
      {
        model: DriveRound,
        attributes: ["round_id", "round_name", "round_number", "is_final_round"],
      },
    ],
    order: [["created_at", "DESC"]],
    limit,
  });

  const unreadCount = await StudentNotification.count({
    where: { student_id: student.student_id, is_read: false },
  });

  return {
    unreadCount,
    notifications: notifications.map((notification) => notification.get({ plain: true })),
  };
};

const markAllNotificationsRead = async (userId) => {
  const student = await getStudentContext(userId);
  await StudentNotification.update(
    { is_read: true },
    { where: { student_id: student.student_id, is_read: false } }
  );

  return { message: "Notifications marked as read" };
};

export default {
  listStudentNotifications,
  markAllNotificationsRead,
};
