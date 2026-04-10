import authService from "../services/authService.js";

export const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json({ message: "User registered successfully", user: result.user });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || "Failed to register user" });
  }
};

export const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || "Login failed" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const result = await authService.forgotPassword(req.body);
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || "Failed to send reset link" });
  }
};

export const validateResetToken = async (req, res) => {
  try {
    const result = await authService.validateResetToken(req.query.token);
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || "Invalid reset link" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const result = await authService.resetPassword(req.body);
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || "Failed to reset password" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const result = await authService.getCurrentUser(req.user.user_id);
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || "Failed to fetch current user" });
  }
};

export const updateCurrentUser = async (req, res) => {
  try {
    const result = await authService.updateCurrentUser(req.user.user_id, req.body);
    return res.json({ message: "Profile updated successfully", user: result });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || "Failed to update profile" });
  }
};
