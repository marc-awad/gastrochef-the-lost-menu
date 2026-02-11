import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/db'; // <-- import par défaut
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Test DB
sequelize.sync().then(() => console.log('Database synced'));

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', message: 'Backend is running' })
);

app.listen(5000, () => console.log('Server running on port 5000'));
