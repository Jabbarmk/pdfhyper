import { Router, Request, Response } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import type { Archiver, ArchiverOptions } from 'archiver';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const createArchive = require('archiver') as (format: string, options?: ArchiverOptions) => Archiver;

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

async function compressImage(buffer: Buffer, mimetype: string): Promise<Buffer> {
  switch (mimetype) {
    case 'image/jpeg':
    case 'image/jpg':
      return sharp(buffer)
        .jpeg({ quality: 80, progressive: true, mozjpeg: true })
        .toBuffer();
    case 'image/png':
      return sharp(buffer)
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toBuffer();
    case 'image/webp':
      return sharp(buffer)
        .webp({ quality: 80, effort: 6 })
        .toBuffer();
    case 'image/avif':
      return sharp(buffer)
        .avif({ quality: 60, effort: 9 })
        .toBuffer();
    case 'image/tiff':
      return sharp(buffer)
        .tiff({ compression: 'deflate' })
        .toBuffer();
    case 'image/gif':
      return sharp(buffer, { animated: true })
        .gif()
        .toBuffer();
    default:
      return buffer;
  }
}

router.post('/', upload.array('images', 50), async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    res.status(400).json({ error: 'No images uploaded' });
    return;
  }

  const originalTotal = files.reduce((sum, f) => sum + f.buffer.length, 0);
  const compressed: { name: string; buffer: Buffer }[] = [];

  for (const file of files) {
    let buf: Buffer;
    try {
      buf = await compressImage(file.buffer, file.mimetype);
    } catch {
      buf = file.buffer;
    }
    compressed.push({ name: file.originalname, buffer: buf });
  }

  const compressedTotal = compressed.reduce((sum, item) => sum + item.buffer.length, 0);

  res.setHeader('X-Original-Size', String(originalTotal));
  res.setHeader('X-Compressed-Size', String(compressedTotal));
  res.setHeader('Access-Control-Expose-Headers', 'X-Original-Size, X-Compressed-Size');
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="compressed-images.zip"');

  const archive = createArchive('zip', { zlib: { level: 1 } });
  archive.on('error', (err: Error) => console.error('Archiver error:', err));
  archive.pipe(res);

  for (const item of compressed) {
    archive.append(item.buffer, { name: item.name });
  }

  await archive.finalize();
});

export default router;
