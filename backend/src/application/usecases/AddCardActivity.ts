import { ICardRepository } from '../ports/ICardRepository';

interface AddCardActivityInput {
  cardId: string;
  userId: string;
  text: string;
}

export class AddCardActivity {
  constructor(private cardRepo: ICardRepository) {}

  async execute(input: AddCardActivityInput) {
    if (!input.text || input.text.trim() === '') {
      throw new Error('O comentário não pode ficar vazio.');
    }
    const activity = await this.cardRepo.addActivity(input.cardId, input.userId, input.text);
    return activity;
  }
}
