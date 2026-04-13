import { ICardRepository } from '../ports/ICardRepository';

interface UpdateCardDetailsInput {
  cardId: string;
  title?: string;
  description?: string;
  dueDate?: Date | null;
  columnId?: string;
  position?: number;
}

export class UpdateCardDetails {
  constructor(private cardRepo: ICardRepository) {}

  async execute(input: UpdateCardDetailsInput) {
    const card = await this.cardRepo.findById(input.cardId);
    if (!card) {
      throw new Error('Cartão não encontrado.');
    }

    await this.cardRepo.update(input.cardId, {
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
      columnId: input.columnId,
      position: input.position,
    });
  }
}
