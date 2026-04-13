import { Request, Response, NextFunction } from 'express';
import { JwtTokenService } from '../../infrastructure/services/JwtTokenService';
import { UnauthorizedError } from '../../domain/errors/AppError';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

const tokenService = new JwtTokenService();

export function authMiddleware(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token de autenticação não fornecido.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = tokenService.verify(token);
    req.userId = payload.userId;
    req.userEmail = payload.email;
    next();
  } catch {
    throw new UnauthorizedError('Token inválido ou expirado.');
  }
}
