import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Middleware global de manejo de errores
 */
export const errorMiddleware = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Error de validación (Zod)
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation error',
      message: err.message,
      details: (err as any).issues,
    });
  }

  // Error de Prisma (duplicado)
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Duplicate entry',
      message: 'A record with this email already exists',
    });
  }

  // Error de Prisma (not found)
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Not found',
      message: err.message,
    });
  }

  // Error personalizado con statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.name || 'Error',
      message: err.message,
    });
  }

  // Error genérico del servidor
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
};

