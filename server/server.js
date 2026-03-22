import express from "express";
import cors from "cors";
import sequelize from "./config/db.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

// Models & Associations
import "./utils/associations.js";
import User from "./models/users.js";
import Department from "./models/department.js";
import Company from "./models/company.js";
import Student from "./models/student.js";
import Offer from "./models/offer.js";
import StaffAdmin from "./models/staff_admin.js";
import Role from "./models/role.js";
import StudentCoordinatorAccount from "./models/student_coordinator_account.js";
import StudentApplication from "./models/student_application.js";
import StudentVerificationRequest from "./models/student_verification_request.js";
import AuditLog from "./models/audit_log.js";
import DepartmentDefaultLock from "./models/department_default_lock.js";
import DriveAllowedDepartment from "./models/drive_allowed_department.js";
import DriveLockOverride from "./models/drive_lock_override.js";
import DriveSelection from "./models/drive_selection.js";
import Drive from "./models/drive.js";
import LockRule from "./models/lock_rule.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import rolesRoutes from "./routes/rolesRoutes.js";
import driveRoutes from "./routes/driveRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "topn-secret-key";

// Middleware
app.use(cors());
app.use(express.json());

// JWT Middleware (if needed later)
export const authenticateStudent = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/verification", verificationRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/roles", rolesRoutes);
app.use("/api/v1/drives", driveRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("TNP Portal API Running");
});

// Start server + DB sync
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected successfully");

    // Sync all tables one by one (DEV MODE)
    await User.sync({ alter: true });
    await Department.sync({ alter: true });
    await Role.sync({ alter: true });
    await StaffAdmin.sync({ alter: true });
    await Company.sync({ alter: true });
    await Student.sync({ alter: true });
    await StudentCoordinatorAccount.sync({ alter: true });
    await Drive.sync({ alter: true });
    await StudentApplication.sync({ alter: true });
    await DriveSelection.sync({ alter: true });
    await Offer.sync({ alter: true });
    await DriveAllowedDepartment.sync({ alter: true });
    await LockRule.sync({ alter: true });
    await DepartmentDefaultLock.sync({ alter: true });
    await DriveLockOverride.sync({ alter: true });
    await StudentVerificationRequest.sync({ alter: true });
    await AuditLog.sync({ alter: true });

    console.log("All tables synced with database");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Unable to connect to DB:", err);
  }
};

startServer();

export default app;

