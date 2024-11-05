import multer from 'multer';
import { TEMP_UPLOAD_DIR } from '../constants/index.js';

const storage = multer.diskStorage({
  destination: TEMP_UPLOAD_DIR,
  filename: (req, file, cb) => {
    const uniquePreffix = Date.now();
    cb(null, `${uniquePreffix}_${file.originalname}`);
  },
});

const upload = multer({ storage });

export default upload;
