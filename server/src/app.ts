import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/db';
import authRoutes from './routes/auth';
import recipeRoutes from './routes/recipes';
import ingredientRoutes from './routes/ingredients';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Test DB
sequelize.sync().then(() => console.log('Database synced'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', recipeRoutes);
app.use('/api', ingredientRoutes); // ← AJOUTE CETTE LIGNE

// Health check
app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', message: 'Backend is running' })
);

app.listen(5000, () => console.log('Server running on port 5000'));
