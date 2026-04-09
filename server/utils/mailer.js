import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = String(process.env.SMTP_SECURE || "true") === "true";
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

let transporter = null;

export const isMailerConfigured = () => Boolean(SMTP_USER && SMTP_PASS);

export const getMailer = () => {
  if (!isMailerConfigured()) {
    throw new Error("SMTP is not configured");
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  return transporter;
};

export const sendPasswordResetEmail = async ({ to, resetLink }) => {
  const mailer = getMailer();

  await mailer.sendMail({
    from: SMTP_FROM,
    to,
    subject: "Reset your TNP Portal password",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="margin-bottom: 12px;">Reset your password</h2>
        <p>We received a request to reset your TNP Portal password.</p>
        <p>
          <a
            href="${resetLink}"
            style="display:inline-block;padding:10px 16px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;"
          >
            Reset Password
          </a>
        </p>
        <p>If the button does not work, use this link:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>This link will expire in 30 minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
};
