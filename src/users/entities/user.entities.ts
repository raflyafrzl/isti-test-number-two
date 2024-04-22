import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  id: string;
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
  created_at: Date;
  updated_at: Date;
}
