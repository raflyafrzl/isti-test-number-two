import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const context: HttpArgumentsHost = host.switchToHttp();
    const response = context.getResponse();
    let message = 'error prisma client';

    if (exception.code.toLowerCase() === 'p2003') {
      message = 'mismatch data found, please check again';
    }
    console.log(exception);
    if (exception.code.toLowerCase() === 'p2002') {
      message = `there is a data with same ${exception.meta.target}. ${exception.meta.target} should be unique`;
    }

    response.status(400).json({
      statusCode: 400,
      message,
    });
  }
}
