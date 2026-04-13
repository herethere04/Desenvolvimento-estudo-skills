export interface IUserRepository {
  create(data: {
    email: string;
    name: string;
    password: string;
  }): Promise<{ id: string; email: string; name: string }>;

  findByEmail(email: string): Promise<{
    id: string;
    email: string;
    name: string;
    password: string | null;
  } | null>;

  findById(id: string): Promise<{
    id: string;
    email: string;
    name: string;
  } | null>;

  updatePassword(userId: string, hashedPassword: string): Promise<void>;
}
