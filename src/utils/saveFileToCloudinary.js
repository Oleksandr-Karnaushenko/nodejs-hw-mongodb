import cloudinary from 'cloudinary';
import * as fs from 'node:fs/promises';

import env from './env.js';
import { CLOUDINARY } from '../constants/index.js';

cloudinary.v2.config({
  secure: true,
  cloud_name: env(CLOUDINARY.CLOUD_NAME),
  api_key: env(CLOUDINARY.API_KEY),
  api_secret: env(CLOUDINARY.API_SECRET),
});

const saveFileToCloudinary = async (file, folder) => {
  const response = await cloudinary.v2.uploader.upload(file.path, { folder });
  await fs.unlink(file.path);
  return response.secure_url;
};

export default saveFileToCloudinary;