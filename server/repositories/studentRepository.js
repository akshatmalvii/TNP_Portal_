import Student from "../models/student.js";

const findByUserId = async (user_id) => {
  return Student.findOne({ where: { user_id } });
};

const findById = async (student_id) => {
  return Student.findByPk(student_id);
};

const create = async (studentData) => {
  return Student.create(studentData);
};

const update = async (student, data) => {
  return student.update(data);
};

export default {
  findByUserId,
  findById,
  create,
  update
};
