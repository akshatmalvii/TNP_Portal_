import Department from "../models/department.js";

const getAll = async () => {
  return Department.findAll({ order: [["dept_name", "ASC"]] });
};

const getById = async (dept_id) => {
  const dept = await Department.findByPk(dept_id);
  if (!dept) throw { status: 404, message: "Department not found" };
  return dept;
};

const create = async ({ dept_code, dept_name }) => {
  if (!dept_code || !dept_name) {
    throw { status: 400, message: "dept_code and dept_name are required" };
  }

  const existing = await Department.findOne({
    where: { dept_code }
  });
  if (existing) {
    throw { status: 409, message: "Department with this code already exists" };
  }

  return Department.create({ dept_code: dept_code.toUpperCase(), dept_name });
};

const update = async (dept_id, { dept_code, dept_name }) => {
  const dept = await Department.findByPk(dept_id);
  if (!dept) throw { status: 404, message: "Department not found" };

  if (dept_code) dept.dept_code = dept_code.toUpperCase();
  if (dept_name) dept.dept_name = dept_name;

  await dept.save();
  return dept;
};

const remove = async (dept_id) => {
  const dept = await Department.findByPk(dept_id);
  if (!dept) throw { status: 404, message: "Department not found" };

  await dept.destroy();
  return { message: "Department deleted successfully" };
};

export default { getAll, getById, create, update, remove };
