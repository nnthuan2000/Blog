import { User } from '../entities/user.entity';

export class UserResponse {
  user: User;

  constructor(partial?: Partial<UserResponse>) {
    Object.assign(this, partial);
  }
}
