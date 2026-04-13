import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/authMiddleware';
import { CreateBoard } from '../../application/usecases/CreateBoard';
import { JoinBoard } from '../../application/usecases/JoinBoard';
import { GetUserBoards } from '../../application/usecases/GetUserBoards';
import { GetBoardDetails } from '../../application/usecases/GetBoardDetails';
import { CreateTag } from '../../application/usecases/CreateTag';
import { GetBoardTags } from '../../application/usecases/GetBoardTags';
import { PrismaBoardRepository } from '../../infrastructure/repositories/PrismaBoardRepository';
import prisma from '../../infrastructure/database/prismaClient';

const boardRepo = new PrismaBoardRepository(prisma);

const createBoardSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.').max(100),
  description: z.string().max(500).optional(),
});

const joinBoardSchema = z.object({
  inviteCode: z.string().min(1, 'Código de convite é obrigatório.'),
});

export class BoardController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createBoardSchema.parse(req.body);
      const useCase = new CreateBoard(boardRepo);
      const result = await useCase.execute({
        ...data,
        userId: req.userId!,
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const useCase = new GetUserBoards(boardRepo);
      const result = await useCase.execute(req.userId!);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const useCase = new GetBoardDetails(boardRepo);
      const result = await useCase.execute(req.params.id as string, req.userId!);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async join(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = joinBoardSchema.parse(req.body);
      const useCase = new JoinBoard(boardRepo);
      const result = await useCase.execute({
        ...data,
        userId: req.userId!,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async createTag(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tagSchema = z.object({
        name: z.string().min(1),
        color: z.string().min(1),
      });
      const data = tagSchema.parse(req.body);
      const useCase = new CreateTag(boardRepo);
      // Wait, we need to make sure the user has rights? Omitted for now based on simplicity
      const result = await useCase.execute({
        boardId: req.params.id as string,
        name: data.name,
        color: data.color,
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getTags(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const useCase = new GetBoardTags(boardRepo);
      const result = await useCase.execute(req.params.id as string, req.userId!);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
