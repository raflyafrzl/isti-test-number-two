import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { PrismaExceptionFilter } from 'src/exception/prismaclient.exception';
import { HttpExceptionFilter } from 'src/exception/http.exception';
import { DocumentEntity } from './entities/document.entities';
import { QueryDocument, validationQueryDocument } from 'src/dto/query.document';
import { JoiValidation } from 'src/pipes/validation.body.pipe';
import { AuthGuard } from 'src/guards/auth.guards';
import { Request } from 'express';
import { Auth } from 'src/dto/auth.dto';
import {
  AccessDocumentDTO,
  validationAccessDocument,
} from 'src/dto/access.document.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('document')
@Controller('document')
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @ApiOperation({ summary: 'get document that you uploaded' })
  @ApiResponse({
    status: 200,
    description: 'success get all document that you uploaded',
  })
  @ApiResponse({
    status: 401,
    description: 'unauthorized, token needed',
  })
  @ApiBearerAuth('authorization-token')
  @ApiResponse({ status: 500, description: 'internal server error' })
  @Get('/me')
  @UseFilters(PrismaExceptionFilter)
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @UseFilters(HttpExceptionFilter)
  async findAllDocuments(
    @Query(new JoiValidation(validationQueryDocument)) query: QueryDocument,
  ) {
    const result = await this.documentService.findAll(query);

    return {
      data: result,
      message: 'successfully retrieved documents',
    };
  }

  @Post('/upload')
  @UseFilters(PrismaExceptionFilter)
  @HttpCode(201)
  @ApiOperation({ summary: 'upload a document ' })
  @ApiResponse({
    status: 201,
    description: 'success upload document',
  })
  @ApiResponse({
    status: 401,
    description: 'unauthorized, token needed',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        document: {
          required: ['true'],
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiBearerAuth('authorization-token')
  @UseGuards(AuthGuard)
  @UseFilters(HttpExceptionFilter)
  @UseInterceptors(FileInterceptor('document'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request,
  ) {
    const auth: Auth = request['user'] as Auth;

    const result: DocumentEntity = await this.documentService.upload(
      file,
      auth.id,
    );
    return {
      data: result,
      message: 'succcessfully upload document',
    };
  }

  @Delete(':id')
  @UseFilters(PrismaExceptionFilter)
  @HttpCode(201)
  @ApiBearerAuth('authorization-token')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'delete a document ' })
  @ApiResponse({ status: 500, description: 'internal server error' })
  @ApiResponse({ status: 401, description: 'unauthorized' })
  @ApiResponse({ status: 200, description: 'success delete document' })
  @UseFilters(HttpExceptionFilter)
  async deleteDocument(@Param('id') id: string, @Req() request: Request) {
    const auth: Auth = request['user'] as Auth;
    await this.documentService.deleteOne(id, auth.id);
    return {
      data: '-',
      message: 'successfully delete a file ',
    };
  }

  @Post('/share')
  @HttpCode(201)
  @UseGuards(AuthGuard)
  @ApiBearerAuth('authorization-token')
  @ApiOperation({ summary: 'share a document ' })
  @ApiResponse({ status: 500, description: 'internal server error' })
  @ApiResponse({ status: 401, description: 'unauthorized' })
  @ApiResponse({
    status: 400,
    description: 'bad request, please check it again',
  })
  @ApiResponse({ status: 200, description: 'success share document' })
  @UseFilters(HttpExceptionFilter)
  @UseFilters(PrismaExceptionFilter)
  async shareAccess(
    @Body(new JoiValidation(validationAccessDocument)) body: AccessDocumentDTO,
    @Req() request: Request,
  ) {
    const auth: Auth = request['user'] as Auth;
    const result = await this.documentService.share(body, auth.id);

    return {
      message: 'success update permission',
      data: result,
    };
  }

  @Get('/share/specific/:docId')
  @HttpCode(200)
  @ApiBearerAuth('authorization-token')
  @ApiOperation({ summary: 'retrieved  a document that has been shared' })
  @ApiResponse({ status: 500, description: 'internal server error' })
  @ApiResponse({ status: 401, description: 'unauthorized' })
  @ApiResponse({
    status: 400,
    description: 'bad request, please check it again',
  })
  @ApiResponse({ status: 200, description: 'success share document' })
  @UseFilters(HttpExceptionFilter)
  @UseFilters(PrismaExceptionFilter)
  @UseGuards(AuthGuard)
  async getSpecificSharedDocument(
    @Param(':docId') docId: string,
    @Req() request: Request,
  ) {
    const auth: Auth = request['user'] as Auth;

    const result: DocumentEntity =
      await this.documentService.findOneSpecificSharedDocument(docId, auth.id);

    return {
      data: result,
      message: 'successfully retrieved a specific shared document',
    };
  }

  @Get('/share/tome')
  @HttpCode(200)
  @ApiBearerAuth('authorization-token')
  @UseFilters(HttpExceptionFilter)
  @UseFilters(PrismaExceptionFilter)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'retrieved  list of document that has been shared' })
  @ApiResponse({ status: 500, description: 'internal server error' })
  @ApiResponse({ status: 401, description: 'unauthorized' })
  @ApiResponse({
    status: 200,
    description: 'success get list of document that has been shared to you',
  })
  async docShareToMe(@Req() request: Request) {
    const auth: Auth = request['user'] as Auth;
    const result: DocumentEntity[] =
      await this.documentService.getSharedDocument(auth.id);
    return {
      data: result,
      message: 'successfully retrieved shared document',
    };
  }

  @Delete('/share/:docId')
  @HttpCode(200)
  @ApiBearerAuth('authorization-token')
  @ApiOperation({ summary: 'delete a document that has been shared' })
  @ApiResponse({ status: 500, description: 'internal server error' })
  @ApiResponse({
    status: 401,
    description: 'unauthorized, authorization needed',
  })
  @ApiResponse({ status: 400, description: 'bad request' })
  @ApiResponse({ status: 404, description: 'no data found' })
  @ApiResponse({
    status: 200,
    description: 'success delete a document that has been shared to you',
  })
  @UseFilters(HttpExceptionFilter)
  @UseFilters(PrismaExceptionFilter)
  @UseGuards(AuthGuard)
  async deleteDocumentShare(
    @Param('docId') docId: string,
    @Req() request: Request,
  ) {
    const auth: Auth = request['user'] as Auth;
    await this.documentService.deleteDocumentShared(docId, auth.id);

    return {
      data: '-',
      message: 'success deleted a document',
    };
  }

  @Patch('/share/:docId')
  @HttpCode(200)
  @ApiBearerAuth('authorization-token')
  @ApiOperation({ summary: 'delete a document that has been shared' })
  @ApiResponse({ status: 500, description: 'internal server error' })
  @ApiResponse({
    status: 401,
    description: 'unauthorized, authorization needed',
  })
  @ApiResponse({ status: 400, description: 'bad request' })
  @ApiResponse({ status: 404, description: 'no data found' })
  @ApiResponse({
    status: 200,
    description: 'success delete a document that has been shared to you',
  })
  @UseFilters(HttpExceptionFilter)
  @UseFilters(PrismaExceptionFilter)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'update a document that has been shared' })
  @ApiResponse({ status: 500, description: 'internal server error' })
  @ApiResponse({
    status: 401,
    description: 'unauthorized, authorization needed',
  })
  @ApiResponse({ status: 400, description: 'bad request' })
  @ApiResponse({ status: 404, description: 'no data found' })
  @ApiResponse({
    status: 200,
    description: 'success update a document that has been shared to you',
  })
  @UseInterceptors(FileInterceptor('document'))
  async updateShareDocument(
    @Req() request: Request,
    @Param('docId') docId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const auth: Auth = request['user'] as Auth;
    await this.documentService.updateShareDocument(docId, auth.id, file);

    return {
      message: 'successfully updated document',
      data: docId,
    };
  }
}
