import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import * as Joi from 'joi';

export class QueryDocument {
  @ApiProperty({
    type: String,
    description:
      'mencari query berdasarkan tanggal pembuatan value hanya boleh asc or desc',
    default: 'asc or desc',
  })
  created_at: Prisma.SortOrder;
  @ApiProperty({
    type: String,
    description: 'parameter untuk mencari document berdasarkan resource',
    default: 'image/png',
  })
  resource_type: string;
  @ApiProperty({
    type: String,
    description:
      'parameter untuk melihat dokumen sudah diupdate oleh user siapa',
    default: 'not_null or null',
  })
  updated_by: string;
}

export const validationQueryDocument: Joi.ObjectSchema<QueryDocument> =
  Joi.object({
    created_at: Joi.string().valid('asc', 'desc'),
    resource_type: Joi.string(),
    updated_by: Joi.string().valid('not_null', 'null'),
  });
