import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import uploadRouter from './routes/upload';
import exportRouter from './routes/export';
import compressRouter from './routes/compress';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/upload', uploadRouter);
app.use('/api/export', exportRouter);
app.use('/api/compress', compressRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default app;
