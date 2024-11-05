import path from 'node:path';
import fs from 'node:fs/promises';
import { TEMP_UPLOAD_DIR, UPLOAD_DIR } from '../constants/index.js';

export const saveFileToUploadDir = async (file) => {
  const oldPath = path.join(TEMP_UPLOAD_DIR, file.filename);
  const newPath = path.join(UPLOAD_DIR, file.filename);
  await fs.rename(oldPath, newPath);

  return `/uploads/${file.filename}`;
};

export default saveFileToUploadDir;
