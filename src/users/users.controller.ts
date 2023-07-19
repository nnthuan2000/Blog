import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  Get,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserResponse } from './dto/response.dto';
import { CurrentUser } from './decorators/user.decorator';
import { User } from './entities/user.entity';
import { AuthGuard } from './guards/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<UserResponse> {
    const user = await this.usersService.create(createUserDto);
    return this.usersService.buildUserResponse(user);
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body('user') loginUserDto: LoginUserDto): Promise<UserResponse> {
    const user = await this.usersService.login(loginUserDto);
    return this.usersService.buildUserResponse(user);
  }

  @Get('current')
  @UseGuards(AuthGuard)
  currentUser(@CurrentUser() user: User): UserResponse {
    return this.usersService.buildUserResponse(user);
  }

  @Patch('current')
  @UseGuards(AuthGuard)
  async updateCurrentUser(
    @CurrentUser() user: User,
    @Body('user') updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    const updatedUser = await this.usersService.updateUser(user, updateUserDto);
    return this.usersService.buildUserResponse(updatedUser);
  }
}
