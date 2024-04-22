import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { CustomClientException } from './custom.client.exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: CustomClientException, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse();
    response.status(exception.getStatus()).send({
      status: 'failed',
      message: exception.message,
      statusCode: exception.getStatus(),
    });
  }
}
