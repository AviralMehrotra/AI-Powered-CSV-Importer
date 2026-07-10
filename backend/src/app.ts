import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config/index';
import importRouter from './routes/import.routes';

const app = express();

// Middleware
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
  });
});

// Import route
app.use('/api/import', importRouter);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err);
  
  // Handle Multer upload errors
  if (err instanceof Error && (err.message.includes('file format') || err.message.includes('too large') || err.name === 'MulterError')) {
    res.status(400).json({
      error: {
        message: err.message,
      },
    });
    return;
  }

  res.status(err.status || 500).json({
    error: {
      message: config.nodeEnv === 'development' ? err.message : 'Internal server error',
    },
  });
});

// Start listening
const server = app.listen(config.port, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
});

export { app, server };
