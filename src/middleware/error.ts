import { isHttpError } from 'http-errors';
import { getReasonPhrase, ReasonPhrases, StatusCodes } from 'http-status-codes';
import type { Middleware } from 'koa';
import { Joi } from 'koa-joi-router';

/**
 * The response when something bad happens
 */
export interface ErrorResponse {
  /**
   * The generic reason why the request failed
   *
   * @type {String}
   * @example "Bad Request"
   */
  reason: ReasonPhrases;
  /**
   * The error message that explains the cause of the fail
   *
   * @type {string}
   */
  message: string;
  /**
   * The HTTP status code of the error
   *
   * @type {number}
   * @example 400
   */
  statusCode: StatusCodes;
  /**
   * In case of a validation error, this object will show the error by field
   *
   * @type {Record<string, string>}
   * @example <caption>Validation error when task's text is too short</caption>
   * ```json
   * {
   *   "text": "\"text\" length must be at least 3 characters long"
   * }
   * ```
   * @example <caption>Validation error when task's text is missing</caption>
   * ```json
   * {
   *   "text": "\"text\" is required"
   * }
   * ```
   */
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
