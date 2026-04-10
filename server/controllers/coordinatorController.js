import coordinatorDriveService from "../services/coordinatorDriveService.js";

const listDrives = async (req, res) => {
  try {
    const drives = await coordinatorDriveService.listCoordinatorDrives(
      req.user.user_id
    );
    return res.json(drives);
  } catch (err) {
    console.error("Error fetching coordinator drives:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Failed to fetch drives" });
  }
};

const getDriveProcess = async (req, res) => {
  try {
    const process = await coordinatorDriveService.getDriveProcess(
      req.user.user_id,
      req.params.drive_id
    );
    return res.json(process);
  } catch (err) {
    console.error("Error fetching drive process:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Failed to fetch drive process" });
  }
};

const createRound = async (req, res) => {
  try {
    const result = await coordinatorDriveService.createDriveRound(
      req.user.user_id,
      req.params.drive_id,
      req.body
    );
    return res.status(201).json({
      message: "Round created and notifications sent successfully",
      ...result,
    });
  } catch (err) {
    console.error("Error creating drive round:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Failed to create round" });
  }
};

const uploadRoundResults = async (req, res) => {
  try {
    const result = await coordinatorDriveService.processRoundResults(
      req.user.user_id,
      req.params.drive_id,
      req.params.round_id,
      req.file
    );
    return res.json({
      message: "Round results processed successfully",
      ...result,
    });
  } catch (err) {
    console.error("Error processing round results:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Failed to process round results" });
  }
};

export default {
  listDrives,
  getDriveProcess,
  createRound,
  uploadRoundResults,
};
