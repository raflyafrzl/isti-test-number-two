import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class RegisterDTO {
  @ApiProperty({
    type: String,
    description: 'username user',
    default: 'rafly',
  })
  username: string;
  @ApiProperty({
    type: String,
    description: 'password user',
    default: 'rafly123',
  })
  password: string;
  @ApiProperty({
    type: String,
    description: 'email user',
    default: 'raflyafrzlll@gmail.com',
  })
  email: string;
}

export class LoginDTO {
  @ApiProperty({
    type: String,
    description: 'username user',
    default: 'rafly',
  })
  username: string;
  @ApiProperty({
    type: String,
    description: 'password user',
    default: 'rafly123',
  })
  password: string;
}

export const validationRegisterUser: Joi.ObjectSchema<RegisterDTO> = Joi.object(
  {
    username: Joi.string().min(5, 'utf-8').required(),
    password: Joi.string().min(5, 'utf-8').required(),
    email: Joi.string().email().required(),
  },
);

export const validationLoginUser: Joi.ObjectSchema<LoginDTO> = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});
