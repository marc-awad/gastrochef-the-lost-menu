import express from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

import healthRoutes from './routes/healthRoutes';
import { initSockets } from './sockets';
import { testConnection } from './config/db';

const app = express();
const server = http.createServer(app);
const io = initSockets(server);

app.use(cors());
app.use(express.json());

// Test DB connection
testConnection();

// Routes
app.use('/api', healthRoutes);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
