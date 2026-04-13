import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { RegisterUser } from '../../application/usecases/RegisterUser';
import { LoginUser } from '../../application/usecases/LoginUser';
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository';
import { BcryptHashService } from '../../infrastructure/services/BcryptHashService';
import { JwtTokenService } from '../../infrastructure/services/JwtTokenService';
import prisma from '../../infrastructure/database/prismaClient';

const userRepo = new PrismaUserRepository(prisma);
const hashService = new BcryptHashService();
const tokenService = new JwtTokenService();

const registerSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres.'),
});

const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(1, 'Senha é obrigatória.'),
});

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const useCase = new RegisterUser(userRepo, hashService);
      const result = await useCase.execute(data);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const useCase = new LoginUser(userRepo, hashService, tokenService);
      const result = await useCase.execute(data);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
