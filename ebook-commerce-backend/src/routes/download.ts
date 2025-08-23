// src/routes/download.ts
import { Router } from 'express';
import { downloadFile, getDownloadInfo } from '../controllers/downloadController';

const router = Router();

// GET /api/download/:token - Download file by token
router.get('/:token', downloadFile);

// GET /api/download/info/:token - Get download information
router.get('/info/:token', getDownloadInfo);

export default router; 