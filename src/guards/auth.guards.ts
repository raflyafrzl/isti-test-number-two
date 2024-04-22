import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomClientException } from '../exception/custom.client.exception';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (!token) {
      throw new UnauthorizedException('Unauthorized, please try again');
    }

    if (type !== 'Bearer') {
      throw new UnauthorizedException('Invalid type of token');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_KEY,
      });
      request['user'] = payload;
    } catch (err) {
      throw new CustomClientException(
        'Invalid credential provided',
        401,
        'JWT',
      );
    }

    return true;
  }
}
