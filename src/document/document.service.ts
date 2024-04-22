import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CloudinaryResponse } from 'src/dto/cloudinary.response';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  DocumentAccessEntity,
  DocumentEntity,
} from './entities/document.entities';
import { QueryDocument } from 'src/dto/query.document';
import { CustomClientException } from 'src/exception/custom.client.exception';
import { AccessDocumentDTO } from 'src/dto/access.document.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DocumentService {
  constructor(
    private cloudinary: CloudinaryService,
    private prisma: PrismaService,
  ) {}

  async deleteOne(id: string, userId: string) {
    const result = await this.prisma.document.findUnique({
      where: {
        id: id,
        owner_id: userId,
      },
    });

    if (result === null) {
      throw new CustomClientException('no document found', 400, 'NOT_FOUND');
    }

    await this.prisma.document.delete({
      where: {
        owner_id: userId,
        id: id,
      },
    });

    await this.cloudinary.deleteFile(result.filename);
  }

  async findAll(query: QueryDocument) {
    const result: DocumentEntity[] = await this.prisma.document.findMany({
      where: {
        resource_type: {
          endsWith: query.resource_type || undefined,
        },
        updated_by: query.updated_by
          ? query.updated_by === 'not_null'
            ? {
                not: null,
              }
            : null
          : undefined,
      },
      orderBy: [
        {
          created_at: query.created_at || undefined,
        },
      ],
    });

    result.forEach((val) => {
      val.url = `https://res.cloudinary.com/duwo3y0jv/image/upload/v1713713710/${val.filename}.jpg`;
    });

    return result;
  }

  async upload(
    file: Express.Multer.File,
    userId: string,
  ): Promise<DocumentEntity> {
    const result: CloudinaryResponse = await this.cloudinary.uploadFile(file);
    return this.prisma.document.create({
      data: {
        owner_id: userId,
        original_filename: file.originalname,
        filename: result.public_id,
        resource_type: file.mimetype,
      },
    });
  }

  async share(
    access: AccessDocumentDTO,
    ownerId: string,
  ): Promise<DocumentAccessEntity> {
    const result = await this.prisma.document.findUnique({
      where: {
        id: access.document_id,
      },
    });

    if (!(result.owner_id === ownerId)) {
      throw new CustomClientException(
        'this is not your document, please check it again',
        400,
        'BAD_REQUEST',
      );
    }

    return this.prisma.docAccess.create({
      data: {
        document_id: access.document_id,
        target_id: access.target_id,
        permission: access.permission,
      },
    });
  }

  async getSharedDocument(id: string) {
    return this.prisma.document.findMany({
      where: {
        access: {
          some: {
            target_id: id,
          },
        },
      },
      include: {
        access: true,
      },
    });
  }

  async deleteDocumentShared(docId: string, userId: string) {
    const result = await this.prisma.docAccess.findFirst({
      where: {
        document_id: docId,
        target_id: userId,
      },
    });

    if (!result.permission.includes('delete')) {
      throw new CustomClientException(
        `You don't have permission to delete this document`,
        400,
        'BAD_REQUEST',
      );
    }
    await this.prisma.document.delete({
      where: {
        id: docId,
      },
    });
    const where: Prisma.DocAccessWhereUniqueInput = {
      target_id_document_id: {
        target_id: userId,
        document_id: docId,
      },
    };
    return this.prisma.docAccess.delete({ where });
  }

  async updateShareDocument(
    docId: string,
    userId: string,
    file: Express.Multer.File,
  ) {
    const result = await this.prisma.docAccess.findFirst({
      where: {
        document_id: docId,
        target_id: userId,
      },
    });

    if (result === null) {
      throw new CustomClientException(
        'no document access found with that ID',
        404,
        'NOT_FOUND',
      );
    }

    if (!result.permission.includes('write')) {
      throw new CustomClientException(
        `You don't have permission to update this document`,
        400,
        'BAD_REQUEST',
      );
    }

    const document: DocumentEntity = await this.prisma.document.findFirst({
      where: {
        id: docId,
      },
    });

    await this.cloudinary.deleteFile(document.filename);

    const result_cloudinary = await this.cloudinary.uploadFile(file);

    await this.prisma.document.update({
      where: {
        id: docId,
      },
      data: {
        updated_by: result.target_id,
        original_filename: file.originalname,
        filename: result_cloudinary.public_id,
        resource_type: file.mimetype,
      },
    });
  }

  async findOneSpecificSharedDocument(
    docId: string,
    userId: string,
  ): Promise<DocumentEntity> {
    return this.prisma.document.findFirst({
      where: {
        access: {
          every: {
            AND: [{ document_id: docId, target_id: userId }],
          },
        },
      },
      include: {
        access: true,
      },
    });
  }
}
