import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ObjectSchema, StringSchema } from 'joi';

@Injectable()
export class JoiValidation implements PipeTransform {
  constructor(private schema: ObjectSchema | StringSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    const { error } = this.schema.validate(value);

    if (error) throw new BadRequestException(error.message);

    return value;
  }
}
