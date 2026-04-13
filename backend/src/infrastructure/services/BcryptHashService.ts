import bcrypt from 'bcrypt';
import { IHashService } from '../../application/ports/IHashService';

const SALT_ROUNDS = 12;

export class BcryptHashService implements IHashService {
  async hash(value: string): Promise<string> {
    return bcrypt.hash(value, SALT_ROUNDS);
  }

  async compare(value: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(value, hashed);
  }
}
