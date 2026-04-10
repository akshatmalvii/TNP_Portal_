import studentNotificationService from "../services/studentNotificationService.js";

const getMyNotifications = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 15);
    const data = await studentNotificationService.listStudentNotifications(
      req.user.user_id,
      limit
    );
    return res.json(data);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Failed to fetch notifications" });
  }
};

const markAllRead = async (req, res) => {
  try {
    const result = await studentNotificationService.markAllNotificationsRead(
      req.user.user_id
    );
    return res.json(result);
  } catch (err) {
    console.error("Error marking notifications as read:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Failed to mark notifications as read" });
  }
};

export default {
  getMyNotifications,
  markAllRead,
};
