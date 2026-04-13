import { IBoardRepository } from '../ports/IBoardRepository';

interface CreateTagInput {
  boardId: string;
  name: string;
  color: string;
}

export class CreateTag {
  constructor(private boardRepo: IBoardRepository) {}

  async execute(input: CreateTagInput) {
    if (!input.name || input.name.trim() === '') {
      throw new Error('O nome da etiqueta é obrigatório.');
    }
    if (!input.color || !/^#([0-9A-F]{3}){1,2}$/i.test(input.color) && !input.color.startsWith('bg-')) {
      throw new Error('Cor inválida.');
    }

    const tag = await this.boardRepo.createTag(input.boardId, {
      name: input.name,
      color: input.color,
    });

    return tag;
  }
}
