import { Router } from 'express';
import multer from 'multer';
import { ImportController } from '../controllers/import.controller.js';

const router = Router();
const importController = new ImportController();

// Configure Multer for in-memory uploads, limiting to 5MB files
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only accept CSV files
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only CSV files are accepted.'));
    }
  },
});

// Import endpoint
router.post('/', upload.single('file'), importController.importCsv);

export default router;
