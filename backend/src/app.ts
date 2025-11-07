import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import candidateRoutes from './routes/candidate.routes';
import { errorMiddleware } from './middlewares/error.middleware';

dotenv.config();

export const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos de uploads
app.use('/uploads', express.static('uploads'));

// Rutas
app.get('/', (req: Request, res: Response) => {
  res.send('Hola LTI!');
});

app.use('/api/candidates', candidateRoutes);

// Middleware de errores (debe ir al final)
app.use(errorMiddleware);

