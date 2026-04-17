import bcrypt from "bcrypt";

export const PASSWORD_POLICY_RULES = [
  "Password must be 8 to 12 characters long.",
  "Password must contain at least one uppercase letter.",
  "Password must contain at least one lowercase letter.",
  "Password must contain at least one number.",
  "Password must contain at least one special character.",
  "Password must not contain spaces.",
  "Password must not be the same as your email or email username.",
  "Password must not be a common password.",
  "Password must not repeat the same character 4 or more times in a row.",
];

const COMMON_PASSWORDS = new Set([
  "123456",
  "12345678",
  "password",
  "password123",
  "admin123",
  "qwerty123",
]);

export const getPasswordPolicyMessage = () =>
  PASSWORD_POLICY_RULES.join(" ");

export const validatePasswordStrength = async ({
  password,
  email,
  currentPasswordHash = null,
}) => {
  const normalizedPassword = String(password || "");
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const emailUsername = normalizedEmail.includes("@")
    ? normalizedEmail.split("@")[0]
    : normalizedEmail;
  const loweredPassword = normalizedPassword.toLowerCase();

  if (normalizedPassword.length < 8 || normalizedPassword.length > 12) {
    throw { status: 400, message: "Password must be 8 to 12 characters long." };
  }

  if (/\s/.test(normalizedPassword)) {
    throw { status: 400, message: "Password must not contain spaces." };
  }

  if (!/[A-Z]/.test(normalizedPassword)) {
    throw { status: 400, message: "Password must contain at least one uppercase letter." };
  }

  if (!/[a-z]/.test(normalizedPassword)) {
    throw { status: 400, message: "Password must contain at least one lowercase letter." };
  }

  if (!/[0-9]/.test(normalizedPassword)) {
    throw { status: 400, message: "Password must contain at least one number." };
  }

  if (!/[^A-Za-z0-9]/.test(normalizedPassword)) {
    throw { status: 400, message: "Password must contain at least one special character." };
  }

  if (normalizedEmail && (loweredPassword === normalizedEmail || loweredPassword === emailUsername)) {
    throw { status: 400, message: "Password must not be the same as your email or email username." };
  }

  if (COMMON_PASSWORDS.has(loweredPassword)) {
    throw { status: 400, message: "Password must not be a common password." };
  }

  if (/(.)\1{3,}/.test(normalizedPassword)) {
    throw { status: 400, message: "Password must not repeat the same character 4 or more times in a row." };
  }

  if (currentPasswordHash) {
    const sameAsOldPassword = await bcrypt.compare(normalizedPassword, currentPasswordHash);
    if (sameAsOldPassword) {
      throw { status: 400, message: "New password must not be the same as the old password." };
    }
  }
};

