// src/controllers/downloadController.ts
import { Request, Response } from 'express';
import fs from 'fs';
import Download from '../models/Download';
import { ebookPath, findProduct } from '../config/catalog';

export const downloadFile = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ 
        error: 'Download token is required' 
      });
    }

    // Find download record
    const download = await Download.findOne({ token });
    if (!download) {
      return res.status(404).json({ 
        error: 'Download link not found or invalid' 
      });
    }

    // Check if expired
    if (new Date() > download.expiresAt) {
      return res.status(410).json({ 
        error: 'Download link has expired' 
      });
    }

    // Count the download atomically, so parallel requests can't go over the limit.
    const counted = await Download.findOneAndUpdate(
      { _id: download._id, downloadCount: { $lt: download.maxDownloads } },
      { $inc: { downloadCount: 1 } },
      { new: true },
    );
    if (!counted) {
      return res.status(403).json({
        error: 'Download limit exceeded. Maximum downloads allowed: ' + download.maxDownloads
      });
    }

    // The file comes from the catalog, never from a path stored with the token or sent by the client.
    const product = findProduct(download.productId);
    const filePath = product ? ebookPath(product) : null;
    if (!filePath || !fs.existsSync(filePath)) {
      console.error(`E-book file missing for product ${download.productId}`);
      return res.status(404).json({
        error: 'File not found on server'
      });
    }

    // Set headers for download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${download.fileName}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Send file
    res.download(filePath, download.fileName, (err) => {
      if (err) {
        console.error('File download error:', err);
        if (!res.headersSent) {
          res.status(500).json({ 
            error: 'Failed to download file' 
          });
        }
      }
    });

  } catch (error) {
    console.error('Download controller error:', error);
    res.status(500).json({ 
      error: 'Internal server error during download' 
    });
  }
};

export const getDownloadInfo = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const download = await Download.findOne({ token });
    if (!download) {
      return res.status(404).json({ 
        error: 'Download link not found' 
      });
    }

    // Check if expired
    const isExpired = new Date() > download.expiresAt;
    const downloadsRemaining = download.maxDownloads - download.downloadCount;

    res.json({
      fileName: download.fileName,
      downloadCount: download.downloadCount,
      maxDownloads: download.maxDownloads,
      downloadsRemaining: Math.max(0, downloadsRemaining),
      expiresAt: download.expiresAt,
      isExpired,
      canDownload: !isExpired && downloadsRemaining > 0
    });

  } catch (error) {
    console.error('Download info error:', error);
    res.status(500).json({ 
      error: 'Failed to get download information' 
    });
  }
};