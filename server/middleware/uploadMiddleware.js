import multer from "multer";
import cloudinary from "../config/cloudinaryConfig.js";

// Multer memory storage (files kept in buffer, uploaded to cloudinary)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and PDF files are allowed"), false);
  }
};

const pdfOnlyFileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadPdfOnly = multer({
  storage,
  fileFilter: pdfOnlyFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per PDF
});

// Upload buffer to cloudinary
export const uploadToCloudinary = (fileBuffer, folder = "tnp_portal") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};
