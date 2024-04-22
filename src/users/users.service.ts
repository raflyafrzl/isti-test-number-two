import { Injectable } from '@nestjs/common';
import { LoginDTO, RegisterDTO } from 'src/dto/user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entities';
import { CustomClientException } from 'src/exception/custom.client.exception';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private JwtService: JwtService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async validateLogin(payload: LoginDTO): Promise<string> {
    const result: UserEntity = await this.prisma.user.findUnique({
      where: {
        username: payload.username,
      },
    });

    if (result === null) {
      throw new CustomClientException('no data found', 404, 'NOT_FOUND');
    }

    const isValidPassword: boolean = await bcrypt.compare(
      payload.password,
      result.password,
    );

    if (!isValidPassword) {
      throw new CustomClientException('no data found', 404, 'NOT_FOUND');
    }

    const dataToken = {
      id: result.id,
      username: result.username,
      email: result.email,
    };

    const token: string = await this.JwtService.signAsync(dataToken);

    return token;
  }

  async create(payload: RegisterDTO): Promise<UserEntity> {
    const hash = await bcrypt.hash(payload.password, 10);
    return this.prisma.user.create({
      data: {
        password: hash,
        email: payload.email,
        username: payload.username,
      },
    });
  }
}
