import StudentApplication from "../models/student_application.js";
import Drive from "../models/drive.js";
import Company from "../models/company.js";

const findByStudent = async (student_id) => {
  return StudentApplication.findAll({
    where: { student_id },
    include: [{
      model: Drive,
      attributes: ['drive_id', 'role_title', 'drive_status', 'package_lpa', 'deadline'],
      include: [{ model: Company, attributes: ['company_name'] }]
    }]
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