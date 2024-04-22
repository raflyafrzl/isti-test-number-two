import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({ global: true, secret: process.env.JWT_KEY }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
