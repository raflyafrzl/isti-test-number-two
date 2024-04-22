import { Injectable } from '@nestjs/common';
import { CloudinaryResponse } from 'src/dto/cloudinary.response';
import * as streamifier from 'streamifier';
import { UploadStream, v2 as cloudinary } from 'cloudinary';
import { CustomClientException } from 'src/exception/custom.client.exception';

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream: UploadStream = cloudinary.uploader.upload_stream(
        //cloudinary dengan plan free account hanya bisa mengakses image. tidak bisa yang lain
        {
          resource_type: 'auto',
          folder: 'isti_document',
        },
        (error, result) => {
          if (error)
            return reject(
              new CustomClientException(
                error.message,
                error.http_code,
                error.name,
              ),
            );
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  deleteFile(publicId: string): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
}
