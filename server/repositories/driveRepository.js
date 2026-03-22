import Drive from "../models/drive.js";
import DriveAllowedDepartment from "../models/drive_allowed_department.js";

const findAll = async () => {
  return Drive.findAll({ include: [{ model: DriveAllowedDepartment }] });
};

const findOpenForDept = async (dept_id) => {
  return Drive.findAll({
    where: { drive_status: "OPEN" },
    include: [
      {
        model: DriveAllowedDepartment,
        where: { dept_id },
        required: true
      }
    ]
  });
};

const findById = async (id) => {
  return Drive.findByPk(id);
};

const create = async (data) => {
  return Drive.create(data);
};

export default {
  findAll,
  findOpenForDept,
  findById,
  create
};