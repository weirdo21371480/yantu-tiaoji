import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initDB } from './db.js';
import authRoutes from './routes/auth.js';
import listingsRoutes from './routes/listings.js';
import schoolsRoutes from './routes/schools.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());
app.use(cors());
app.use(express.json());

initDB();

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/schools', schoolsRoutes);

const distPath = join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('/{*splat}', (_req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
