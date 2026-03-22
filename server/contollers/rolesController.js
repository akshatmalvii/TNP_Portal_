import rolesService from "../services/rolesService.js";

export const getAllRoles = async (req, res) => {
  try {
    const roles = await rolesService.getAllRoles();
    res.json(roles);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const getRoleById = async (req, res) => {
  try {
    const role = await rolesService.getRoleById(req.params.id);
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }
    res.json(role);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const createRole = async (req, res) => {
  try {
    const role = await rolesService.createRole(req.body);
    res.status(201).json(role);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    const role = await rolesService.updateRole(req.params.id, req.body);
    res.json(role);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const result = await rolesService.deleteRole(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};