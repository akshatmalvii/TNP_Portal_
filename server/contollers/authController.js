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
    
    // Set refreshToken as an HttpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Remove it from JSON response
    delete result.refreshToken;
    
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || "Login failed" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    // Read the token from cookies instead of body
    const tokenStr = req.cookies?.refreshToken;
    if (!tokenStr) {
      return res.status(401).json({ error: "No refresh token provided in cookies" });
    }

    const result = await authService.refreshToken({ refreshToken: tokenStr });
    
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    delete result.refreshToken;
    
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || "Failed to refresh token" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  return res.json({ message: "Logged out successfully" });
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
