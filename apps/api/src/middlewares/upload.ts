import multer, { type FileFilterCallback } from 'multer';
import { Request, RequestHandler } from 'express';
import { AppError } from './errorHandler';
import {
  MAX_FILE_SIZE_BYTES,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
} from '../utils/constants';

/**
 * Memory storage — files are kept in buffer before being uploaded to Cloudinary.
 * Never written to disk, so no temp file cleanup is needed.
 */
const memoryStorage = multer.memoryStorage();

function imageFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`Invalid image type: ${file.mimetype}. Allowed: JPEG, PNG, WebP`, 400));
  }
}

function documentFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
  if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`Invalid file type: ${file.mimetype}. Allowed: PDF, JPEG, PNG, WebP`, 400));
  }
}

/** Single image upload (profile photos, logos). */
export const uploadSingleImage: RequestHandler = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: imageFilter,
}).single('image');

/** Multiple image upload (up to 5 — radiology scans, wound photos). */
export const uploadMultipleImages: RequestHandler = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: imageFilter,
}).array('images', 5);

/** Single document upload (reports, prescriptions, insurance cards). */
export const uploadDocument: RequestHandler = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: documentFilter,
}).single('document');

/** Multiple document upload (up to 10 — patient record attachments). */
export const uploadMultipleDocuments: RequestHandler = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: documentFilter,
}).array('documents', 10);

/** Mixed fields — for forms that have both an image and a document. */
export const uploadMixed: RequestHandler = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: documentFilter,
}).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'documents', maxCount: 5 },
]);

