import studentService from "../services/studentService.js";

export const getMe = async (req, res) => {
  try {
    const student = await studentService.getMyProfile(req.user.user_id);
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }
    return res.json(student);
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || "Failed to fetch profile" });
  }
};

export const getVerificationStatus = async (req, res) => {
  try {
    const status = await studentService.getVerificationStatus(req.user.user_id);
    return res.json(status);
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || "Failed to get verification status" });
  }
};
export const getAcceptedOffers = async (req, res) => {
  try {
    await studentService.ensureMissingAcceptedOffersForSelectedApplications(req.user.user_id);
    const offers = await studentService.getAcceptedOffers(req.user.user_id);
    return res.json(offers);
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || "Failed to fetch accepted offers" });
  }
};

export const uploadOfferLetter = async (req, res) => {
  try {
    const { offer_id, application_id, offer_letter_url } = req.body;
    if ((!offer_id && !application_id) || !offer_letter_url) {
      return res.status(400).json({ error: "offer_letter_url and either offer_id or application_id are required" });
    }
    const offer = await studentService.uploadOfferLetter(
      req.user.user_id,
      offer_id,
      offer_letter_url,
      application_id
    );
    return res.json({ message: "Offer letter uploaded successfully", offer });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || "Failed to upload offer letter" });
  }
};
