import { HttpError } from 'http-errors';
import { getReasonPhrase, ReasonPhrases, StatusCodes } from 'http-status-codes';
import type { Middleware } from 'koa';

const errorHandler: Middleware = async (context, next) => {
  try {
    await next();
  } catch (error) {
    context.status = StatusCodes.INTERNAL_SERVER_ERROR;

    if (error instanceof HttpError) {
      context.status = error.status;
      context.body = {
        error: getReasonPhrase(error.status),
        message: error.message,
        statusCode: error.status,
      };
    } else if (error instanceof Error) {
      context.body = {
        error: ReasonPhrases.INTERNAL_SERVER_ERROR,
        message: error.message,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    } else {
      context.body = {
        error: ReasonPhrases.INTERNAL_SERVER_ERROR,
        message: String(error),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }
};

export default errorHandler;
