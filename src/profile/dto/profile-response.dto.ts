import { Profile } from '../entities/profile.entity';

export class ProfileResponse {
  profile: Profile;

  constructor(partial?: Partial<ProfileResponse>) {
    Object.assign(this, partial);
  }
}
