import { IUserRepository } from '../ports/IUserRepository';
import { IHashService } from '../ports/IHashService';
import { ITokenService } from '../ports/ITokenService';
import { UnauthorizedError } from '../../domain/errors/AppError';

interface LoginInput {
  email: string;
  password: string;
}

export class LoginUser {
  constructor(
    private userRepo: IUserRepository,
    private hashService: IHashService,
    private tokenService: ITokenService,
  ) {}

  async execute(input: LoginInput) {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user || !user.password) {
      throw new UnauthorizedError('E-mail ou senha inválidos.');
    }

    const passwordMatch = await this.hashService.compare(input.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedError('E-mail ou senha inválidos.');
    }

    const token = this.tokenService.generate({
      userId: user.id,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
