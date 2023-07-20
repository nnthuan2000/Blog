import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { UsersModule } from '@app/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Follow]), UsersModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [TypeOrmModule],
})
export class ProfileModule {}
