import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import sequelize from './config/db';
import './models/index';
import authRoutes from './routes/auth';
import recipeRoutes from './routes/recipes';
import ingredientRoutes from './routes/ingredients';
import laboratoryRoutes from './routes/laboratory';
import { initSockets } from './sockets/index';

dotenv.config();

const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

// ── DB ────────────────────────────────────────────────────────
sequelize.sync().then(() => console.log('✅ Database synced'));

// ── Routes HTTP ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api', recipeRoutes);
app.use('/api', ingredientRoutes);
app.use('/api/laboratory', laboratoryRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', message: 'Backend is running' })
);

// ── Serveur HTTP + Socket.io ──────────────────────────────────
// IMPORTANT : on crée un http.Server à partir d'express
// pour que Socket.io puisse s'y attacher sur le même port
const server = http.createServer(app);
export const io = initSockets(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT} (HTTP + WebSocket)`)
);
