import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { BoardController } from '../controllers/BoardController';

const router = Router();
const controller = new BoardController();

router.use(authMiddleware);

router.post('/', (req, res, next) => controller.create(req, res, next));
router.get('/', (req, res, next) => controller.list(req, res, next));
router.get('/:id', (req, res, next) => controller.getById(req, res, next));
router.post('/join', (req, res, next) => controller.join(req, res, next));

router.get('/:id/tags', (req, res, next) => controller.getTags(req, res, next));
router.post('/:id/tags', (req, res, next) => controller.createTag(req, res, next));

export default router;
