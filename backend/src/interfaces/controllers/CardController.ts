import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/authMiddleware';
import { CreateCard } from '../../application/usecases/CreateCard';
import { MoveCard } from '../../application/usecases/MoveCard';
import { UpdateCardDetails } from '../../application/usecases/UpdateCardDetails';
import { ToggleCardRelation } from '../../application/usecases/ToggleCardRelation';
import { AddCardActivity } from '../../application/usecases/AddCardActivity';
import { PrismaCardRepository } from '../../infrastructure/repositories/PrismaCardRepository';
import { PrismaBoardRepository } from '../../infrastructure/repositories/PrismaBoardRepository';
import prisma from '../../infrastructure/database/prismaClient';

const cardRepo = new PrismaCardRepository(prisma);
const boardRepo = new PrismaBoardRepository(prisma);

const createCardSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório.').max(200),
  description: z.string().max(1000).optional(),
  columnId: z.string().optional(),
});

const moveCardSchema = z.object({
  targetColumnId: z.string().min(1, 'Coluna de destino é obrigatória.'),
});

export class CardController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createCardSchema.parse(req.body);
      const useCase = new CreateCard(cardRepo, boardRepo);
      const result = await useCase.execute({
        ...data,
        boardId: req.params.boardId as string,
        userId: req.userId!,
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async move(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = moveCardSchema.parse(req.body);
      const useCase = new MoveCard(cardRepo, boardRepo);
      const result = await useCase.execute({
        cardId: req.params.cardId as string,
        targetColumnId: data.targetColumnId,
        userId: req.userId!,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const updateSchema = z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        dueDate: z.string().nullable().optional(),
        addMemberId: z.string().optional(),
        removeMemberId: z.string().optional(),
        addTagId: z.string().optional(),
        removeTagId: z.string().optional(),
      });
      const data = updateSchema.parse(req.body);
      const cardId = req.params.cardId as string;

      // Update base fields
      if (data.title !== undefined || data.description !== undefined || data.dueDate !== undefined) {
        const updateUc = new UpdateCardDetails(cardRepo);
        await updateUc.execute({
          cardId,
          title: data.title,
          description: data.description,
          dueDate: data.dueDate ? new Date(data.dueDate) : data.dueDate === null ? null : undefined,
        });
      }

      // Handle relations
      const toggleUc = new ToggleCardRelation(cardRepo);
      if (data.addMemberId) await toggleUc.execute({ cardId, relationId: data.addMemberId, type: 'member', action: 'add' });
      if (data.removeMemberId) await toggleUc.execute({ cardId, relationId: data.removeMemberId, type: 'member', action: 'remove' });
      if (data.addTagId) await toggleUc.execute({ cardId, relationId: data.addTagId, type: 'tag', action: 'add' });
      if (data.removeTagId) await toggleUc.execute({ cardId, relationId: data.removeTagId, type: 'tag', action: 'remove' });

      res.json({ message: 'Cartão atualizado com sucesso.' });
    } catch (err) {
      next(err);
    }
  }

  async addComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const commentSchema = z.object({ text: z.string().min(1) });
      const data = commentSchema.parse(req.body);

      const uc = new AddCardActivity(cardRepo);
      const result = await uc.execute({
        cardId: req.params.cardId as string,
        userId: req.userId!,
        text: data.text,
      });

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
}
