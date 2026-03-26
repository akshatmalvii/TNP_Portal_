import StudentApplication from "../models/student_application.js";
import Drive from "../models/drive.js";

const findByStudent = async (student_id) => {
  return StudentApplication.findAll({
    where: { student_id },
    include: [{ model: Drive, attributes: ['company_name', 'position'] }]
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