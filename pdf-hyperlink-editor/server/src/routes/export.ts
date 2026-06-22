import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { addLinksToPdf } from '../services/pdfLinkService';

const router = Router();

interface LinkData {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  url: string;
  type: string;
}

interface ExportBody {
  fileId: string;
  links: LinkData[];
}

router.post('/', async (req: Request, res: Response) => {
  const { fileId, links } = req.body as ExportBody;

  if (!fileId || !Array.isArray(links)) {
    res.status(400).json({ success: false, error: 'Invalid request body' });
    return;
  }

  const uploadPath = path.join(__dirname, '..', '..', 'uploads', `${fileId}.pdf`);

  if (!fs.existsSync(uploadPath)) {
    res.status(404).json({ success: false, error: 'File not found' });
    return;
  }

  try {
    const pdfBytes = await addLinksToPdf(uploadPath, links);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="hyperlinked-${fileId}.pdf"`
    );
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ success: false, error: 'Failed to process PDF' });
  }
});

export default router;
