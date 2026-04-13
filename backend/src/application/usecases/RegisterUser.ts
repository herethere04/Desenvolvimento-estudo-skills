import { IUserRepository } from '../ports/IUserRepository';
import { IHashService } from '../ports/IHashService';
import { ValidationError } from '../../domain/errors/AppError';

interface RegisterInput {
  email: string;
  name: string;
  password: string;
}

export class RegisterUser {
  constructor(
    private userRepo: IUserRepository,
    private hashService: IHashService,
  ) {}

  async execute(input: RegisterInput) {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw new ValidationError('Este e-mail já está cadastrado.');
    }

    const hashedPassword = await this.hashService.hash(input.password);

    const user = await this.userRepo.create({
      email: input.email,
      name: input.name,
      password: hashedPassword,
    });

    return { id: user.id, email: user.email, name: user.name };
  }
}
