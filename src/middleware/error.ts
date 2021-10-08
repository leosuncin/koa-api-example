import { isHttpError } from 'http-errors';
import { getReasonPhrase, ReasonPhrases, StatusCodes } from 'http-status-codes';
import type { Middleware } from 'koa';

const errorHandler: Middleware = async (context, next) => {
  try {
    await next();
  } catch (error) {
    context.status = StatusCodes.INTERNAL_SERVER_ERROR;

    if (isHttpError(error)) {
      context.status = error.status;
      context.body = {
        error: getReasonPhrase(error.status),
        message: error.message,
        statusCode: error.status,
      };
    } else {
      context.body = {
        error: ReasonPhrases.INTERNAL_SERVER_ERROR,
        message: error instanceof Error ? error.message : String(error),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }
};

export default errorHandler;
