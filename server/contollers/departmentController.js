import departmentService from "../services/departmentService.js";

export const getAllDepartments = async (req, res) => {
  try {
    const departments = await departmentService.getAll();
    res.json(departments);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const dept = await departmentService.getById(req.params.id);
    res.json(dept);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const dept = await departmentService.create(req.body);
    res.status(201).json(dept);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const dept = await departmentService.update(req.params.id, req.body);
    res.json(dept);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const result = await departmentService.remove(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
