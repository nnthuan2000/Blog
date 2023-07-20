import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Profile } from './entities/profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@app/users/entities/user.entity';
import { Repository } from 'typeorm';
import { ProfileResponse } from './dto/profile-response.dto';
import { Follow } from './entities/follow.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
  ) {}

  async getProfile(
    currentUserId: number,
    profileUsername: string,
  ): Promise<Profile> {
    const user = await this.userRepository.findOne({
      where: {
        username: profileUsername,
      },
    });
    if (!user) {
      throw new NotFoundException('Profile does not exist');
    }

    const follow = await this.followRepository.findOne({
      where: {
        followerId: currentUserId,
        followingId: user.id,
      },
    });

    return new Profile({ ...user, following: Boolean(follow) });
  }

  async followProfile(
    currentUserId: number,
    profileUsername: string,
  ): Promise<Profile> {
    const user = await this.userRepository.findOne({
      where: {
        username: profileUsername,
      },
    });
    if (!user) {
      throw new NotFoundException('Profile does not exist');
    }

    if (currentUserId === user.id) {
      throw new BadRequestException('Follower and Following cant be equal');
    }

    const follow = await this.followRepository.findOne({
      where: {
        followerId: currentUserId,
        followingId: user.id,
      },
    });

    if (!follow) {
      const followToCreate = new Follow();
      followToCreate.followerId = currentUserId;
      followToCreate.followingId = user.id;
      await this.followRepository.save(followToCreate);
    }

    return new Profile({ ...user, following: true });
  }

  async unfollowProfile(
    currentUserId: number,
    profileUsername: string,
  ): Promise<Profile> {
    const user = await this.userRepository.findOne({
      where: {
        username: profileUsername,
      },
    });
    if (!user) {
      throw new NotFoundException('Profile does not exist');
    }

    await this.followRepository.delete({
      followerId: currentUserId,
      followingId: user.id,
    });

    return new Profile({ ...user, following: false });
  }

  buildProfileResponse(profile: Profile): ProfileResponse {
    return new ProfileResponse({ profile });
  }
}
