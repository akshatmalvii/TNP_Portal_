import StudentApplication from "../models/student_application.js";
import Drive from "../models/drive.js";
import Company from "../models/company.js";
import Offer from "../models/offer.js";
import DriveRoundResult from "../models/drive_round_result.js";
import DriveRound from "../models/drive_round.js";

const findByStudent = async (student_id) => {
  return StudentApplication.findAll({
    where: { student_id },
    include: [
      {
        model: Drive,
        attributes: ['drive_id', 'role_title', 'drive_status', 'package_lpa', 'deadline', 'offer_type'],
        include: [{ model: Company, attributes: ['company_name'] }]
      },
      {
        model: Offer,
        required: false,
      },
      {
        model: DriveRoundResult,
        required: false,
        include: [
          {
            model: DriveRound,
            attributes: ['round_id', 'round_name', 'round_number', 'is_final_round'],
          },
        ],
      },
    ],
    order: [['updated_at', 'DESC']]
  });
};

const findByStudentAndDrive = async (student_id, drive_id) => {
  return StudentApplication.findOne({ where: { student_id, drive_id } });
};

const create = async (data) => {
  return StudentApplication.create(data);
};

export default {
  findByStudent,
  findByStudentAndDrive,
  create
};
