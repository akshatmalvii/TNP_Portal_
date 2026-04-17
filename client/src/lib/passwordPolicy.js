export const PASSWORD_POLICY_RULES = [
  "8 to 12 characters",
  "At least one uppercase letter",
  "At least one lowercase letter",
  "At least one number",
  "At least one special character",
  "No spaces",
  "Must not match the email or email username",
  "Must not be a common password",
  "Must not repeat the same character 4 or more times in a row",
];

const COMMON_PASSWORDS = new Set([
  "123456",
  "12345678",
  "password",
  "password123",
  "admin123",
  "qwerty123",
]);

export const validatePasswordStrength = ({ password, email }) => {
  const normalizedPassword = String(password || "");
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const emailUsername = normalizedEmail.includes("@")
    ? normalizedEmail.split("@")[0]
    : normalizedEmail;
  const loweredPassword = normalizedPassword.toLowerCase();

  if (normalizedPassword.length < 8 || normalizedPassword.length > 12) {
    return "Password must be 8 to 12 characters long.";
  }

  if (/\s/.test(normalizedPassword)) {
    return "Password must not contain spaces.";
  }

  if (!/[A-Z]/.test(normalizedPassword)) {
    return "Password must contain at least one uppercase letter.";
  }

  if (!/[a-z]/.test(normalizedPassword)) {
    return "Password must contain at least one lowercase letter.";
  }

  if (!/[0-9]/.test(normalizedPassword)) {
    return "Password must contain at least one number.";
  }

  if (!/[^A-Za-z0-9]/.test(normalizedPassword)) {
    return "Password must contain at least one special character.";
  }

  if (normalizedEmail && (loweredPassword === normalizedEmail || loweredPassword === emailUsername)) {
    return "Password must not be the same as your email or email username.";
  }

  if (COMMON_PASSWORDS.has(loweredPassword)) {
    return "Password must not be a common password.";
  }

  if (/(.)\1{3,}/.test(normalizedPassword)) {
    return "Password must not repeat the same character 4 or more times in a row.";
  }

  return "";
};

