import { ICardRepository } from '../ports/ICardRepository';

interface ToggleCardRelationInput {
  cardId: string;
  relationId: string; // userId or tagId
  type: 'member' | 'tag';
  action: 'add' | 'remove';
}

export class ToggleCardRelation {
  constructor(private cardRepo: ICardRepository) {}

  async execute(input: ToggleCardRelationInput) {
    if (input.type === 'member') {
      if (input.action === 'add') {
        await this.cardRepo.assignMember(input.cardId, input.relationId);
      } else {
        await this.cardRepo.removeMember(input.cardId, input.relationId);
      }
    } else if (input.type === 'tag') {
      if (input.action === 'add') {
        await this.cardRepo.addTag(input.cardId, input.relationId);
      } else {
        await this.cardRepo.removeTag(input.cardId, input.relationId);
      }
    }
  }
}
