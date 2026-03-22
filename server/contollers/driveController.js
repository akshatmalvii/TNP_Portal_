import driveService from "../services/driveService.js";

export const listOpenDrives = async (req, res) => {
  try {
    const student_id = req.user.user_id;
    const drives = await driveService.listOpenDrivesForStudent(student_id);
    res.json(drives);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const student_id = req.user.user_id;
    const applications = await driveService.getStudentApplications(student_id);
    res.json(applications);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const applyDrive = async (req, res) => {
  try {
    const student_id = req.user.user_id;
    const drive_id = req.params.drive_id;
    const application_data = req.body.application_data || null;
    const application = await driveService.applyToDrive(student_id, drive_id, application_data);
    res.status(201).json(application);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};