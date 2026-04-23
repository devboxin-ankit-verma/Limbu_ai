/**
 * Multer upload middleware for provider profile photos.
 */

import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { config } from '../config';

const photosRoot = path.join(process.cwd(), config.uploadDir, 'providers');
const docsRoot = path.join(process.cwd(), config.uploadDir, 'documents');

for (const dir of [photosRoot, docsRoot]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function makeStorage(dest: string) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dest),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
      cb(null, `upload-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  });
}

function imageFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
}

function documentFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only image or PDF files are allowed'));
  }
}

export const providerPhotoUpload = multer({
  storage: makeStorage(photosRoot),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
});

export const providerDocumentUpload = multer({
  storage: makeStorage(docsRoot),
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 2 },
});
