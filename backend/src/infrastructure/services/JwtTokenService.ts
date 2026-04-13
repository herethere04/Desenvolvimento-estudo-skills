import jwt from 'jsonwebtoken';
import { ITokenService, TokenPayload } from '../../application/ports/ITokenService';
import { UnauthorizedError } from '../../domain/errors/AppError';

export class JwtTokenService implements ITokenService {
  private secret: string;
  private expiresIn: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'fallback-secret';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  generate(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
    } as jwt.SignOptions);
  }

  verify(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as TokenPayload;
      return decoded;
    } catch {
      throw new UnauthorizedError('Token inválido ou expirado.');
    }
  }
}
