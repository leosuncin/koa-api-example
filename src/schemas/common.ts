import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { Joi } from 'koa-joi-router';

import { ErrorResponse } from '@/middleware/error';

export const errorResponse = Joi.object<ErrorResponse>({
  reason: Joi.string()
    .required()
    .example(ReasonPhrases.BAD_REQUEST)
    .description('The generic reason why the request failed'),
  statusCode: Joi.number()
    .min(400)
    .max(599)
    .required()
    .example(StatusCodes.BAD_REQUEST)
    .description('The HTTP status code of the error'),
  message: Joi.string()
    .required()
    .description('The error message that explains the cause of the fail'),
  details: Joi.object()
    .optional()
    .description(
      'In case of a validation error, this object will show the error by field',
    ),
})
  .strict()
  .description('Error response');
