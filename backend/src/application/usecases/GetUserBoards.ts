import { IBoardRepository } from '../ports/IBoardRepository';

export class GetUserBoards {
  constructor(private boardRepo: IBoardRepository) {}

  async execute(userId: string) {
    return this.boardRepo.findByUserId(userId);
  }
}
