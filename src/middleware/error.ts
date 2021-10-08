import { isHttpError } from 'http-errors';
import { getReasonPhrase, ReasonPhrases, StatusCodes } from 'http-status-codes';
import type { Middleware } from 'koa';
import { Joi } from 'koa-joi-router';

export interface ErrorResponse {
  reason: ReasonPhrases;
  message: string;
  statusCode: StatusCodes;
  details?: Record<string, string>;
}

const errorHandler: Middleware = async (context, next) => {
  try {
    await next();
  } catch (error) {
    context.status = isHttpError(error)
      ? error.status
      : StatusCodes.INTERNAL_SERVER_ERROR;
    const response: ErrorResponse = {
      reason: getReasonPhrase(context.status) as ReasonPhrases,
      message: error instanceof Error ? error.message : String(error),
      statusCode: context.status,
    };

    if (Joi.isError(error)) {
      const details: ErrorResponse['details'] = {};

      for (const { path, message } of error.details) {
        details[path.join('.')] = message;
      }

      response.details = details;
    }

    context.body = response;
  }
};

export default errorHandler;
