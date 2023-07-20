import { User } from '@app/users/entities/user.entity';

export class Profile extends User {
  following: boolean;

  constructor(partial?: Partial<Profile>) {
    super(partial);
  }
}
