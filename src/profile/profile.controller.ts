import {
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CurrentUser } from '@app/users/decorators/user.decorator';
import { ProfileResponse } from './dto/profile-response.dto';
import { AuthGuard } from '@app/users/guards/auth.guard';

@Controller('profiles')
@UseInterceptors(ClassSerializerInterceptor)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  @UseGuards(AuthGuard)
  async getProfile(
    @CurrentUser('id') currentUserId: number,
    @Param('username') profileUsername: string,
  ): Promise<ProfileResponse> {
    const profile = await this.profileService.getProfile(
      currentUserId,
      profileUsername,
    );
    return this.profileService.buildProfileResponse(profile);
  }

  @Post(':username/follow')
  @UseGuards(AuthGuard)
  async followProfile(
    @CurrentUser('id') currentUserId: number,
    @Param('username') username: string,
  ): Promise<ProfileResponse> {
    const profile = await this.profileService.followProfile(
      currentUserId,
      username,
    );
    return this.profileService.buildProfileResponse(profile);
  }

  @Delete(':username/follow')
  @UseGuards(AuthGuard)
  async unfollowProfile(
    @CurrentUser('id') currentUserId: number,
    @Param('username') username: string,
  ): Promise<ProfileResponse> {
    const profile = await this.profileService.unfollowProfile(
      currentUserId,
      username,
    );
    return this.profileService.buildProfileResponse(profile);
  }
}
