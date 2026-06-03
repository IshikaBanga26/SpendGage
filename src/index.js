import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from './db/index.js';

import authRoutes from './routes/auth.js';
import ingredientRoutes from './routes/ingredients.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ingredients', ingredientRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SpendGage API is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;

// Test DB connection then start server
testConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`SpendGage backend running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database. Server not started.');
    process.exit(1);
  });