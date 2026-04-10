import User from "../models/users.js";

export const requireStaffFullName = async (req, res, next) => {
  try {
    if (!req.user || req.user.role === "Student") {
      return next();
    }

    const user = await User.findByPk(req.user.user_id, {
      attributes: ["user_id", "full_name"],
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (!String(user.full_name || "").trim()) {
      return res.status(403).json({
        error: "Please complete your name in Settings before performing this action.",
        code: "NAME_REQUIRED",
      });
    }

    return next();
  } catch (err) {
    return res.status(500).json({ error: "Failed to validate staff profile" });
  }
};
