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
