import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../domain/errors/AppError';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Zod validation errors → 400
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Dados inválidos.',
      details: (err.issues as any[]).map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Known operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  // Unknown errors → 500 (never leak stack trace)
  console.error('[INTERNAL ERROR]', err);
  res.status(500).json({
    error: 'Erro interno do servidor.',
  });
}
