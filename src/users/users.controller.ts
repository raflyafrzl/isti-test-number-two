import { Body, Controller, HttpCode, Post, UseFilters } from '@nestjs/common';
import {
  LoginDTO,
  RegisterDTO,
  validationLoginUser,
  validationRegisterUser,
} from 'src/dto/user.dto';
import { HttpExceptionFilter } from 'src/exception/http.exception';
import { JoiValidation } from 'src/pipes/validation.body.pipe';
import { UsersService } from './users.service';
import { PrismaExceptionFilter } from 'src/exception/prismaclient.exception';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @ApiOperation({ summary: 'to register user' })
  @ApiResponse({ status: 201, description: 'success registered data' })
  @ApiResponse({ status: 400, description: 'invalid payload provided' })
  @Post('/register')
  @UseFilters(PrismaExceptionFilter)
  @HttpCode(201)
  @UseFilters(HttpExceptionFilter)
  async register(
    @Body(new JoiValidation(validationRegisterUser)) payload: RegisterDTO,
  ) {
    const result = await this.userService.create(payload);
    return result;
  }

  @ApiOperation({ summary: 'to get token user' })
  @ApiResponse({
    status: 200,
    description: 'token has been successfully created',
  })
  @ApiResponse({ status: 400, description: 'invalid username or password' })
  @ApiResponse({ status: 500, description: 'There is an error on server' })
  @Post('/login')
  @HttpCode(200)
  @UseFilters(PrismaExceptionFilter)
  @UseFilters(HttpExceptionFilter)
  async login(@Body(new JoiValidation(validationLoginUser)) payload: LoginDTO) {
    const token: string = await this.userService.validateLogin(payload);
    return {
      token,
    };
  }
}
