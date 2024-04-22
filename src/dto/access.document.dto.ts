import * as Joi from 'joi';

export class AccessDocumentDTO {
  target_id: string;
  document_id: string;
  permission: string[];
}
export const validationAccessDocument: Joi.ObjectSchema<AccessDocumentDTO> =
  Joi.object({
    target_id: Joi.string().required(),
    document_id: Joi.string().required(),
    permission: Joi.array().items(
      Joi.string().valid('write', 'delete', 'read'),
    ),
  });
