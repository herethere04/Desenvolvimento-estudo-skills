import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { CardController } from '../controllers/CardController';

const router = Router();
const controller = new CardController();

router.use(authMiddleware);

router.post('/:boardId/cards', (req, res, next) => controller.create(req, res, next));
router.patch('/:boardId/cards/:cardId/move', (req, res, next) => controller.move(req, res, next));
router.patch('/:boardId/cards/:cardId', (req, res, next) => controller.update(req, res, next));
router.post('/:boardId/cards/:cardId/comments', (req, res, next) => controller.addComment(req, res, next));

export default router;
