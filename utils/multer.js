import multer from "multer";

// Use memory storage for Cloudinary streaming
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

export default upload;
