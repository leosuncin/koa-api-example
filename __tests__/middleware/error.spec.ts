import createError from 'http-errors';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { mock } from 'jest-mock-extended';
import type { Context } from 'koa';

import errorHandler, { ErrorResponse } from '@/middleware/error';
import { createTask } from '@/schemas/task';

describe('Error middleware', () => {
  it('should handle http error', async () => {
    const context = mock<Context>();
    const message = 'Found anything';
    const throwHttpError = async () => {
      throw createError(StatusCodes.NOT_FOUND, message);
    };

    await errorHandler(context, throwHttpError);

    expect(context.status).toBe(StatusCodes.NOT_FOUND);
    expect(context.body).toMatchObject<ErrorResponse>({
      reason: ReasonPhrases.NOT_FOUND,
      message,
      statusCode: StatusCodes.NOT_FOUND,
    });
  });

  it('should handle validation error', async () => {
    const context = mock<Context>();
    const throwValidationError = async () => {
      try {
        await createTask.validateAsync({});
      } catch (error) {
        throw createError(
          StatusCodes.UNPROCESSABLE_ENTITY,
          error as createError.UnknownError,
        );
      }
    };

    await errorHandler(context, throwValidationError);

    expect(context.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
    expect(context.body).toMatchObject<ErrorResponse>({
      reason: ReasonPhrases.UNPROCESSABLE_ENTITY,
      details: {
        text: expect.any(String),
      },
      message: expect.any(String),
      statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
    });
  });

  it('should handle a native error', async () => {
    const context = mock<Context>();
    const message = '💥 Ups, an error happened';

    async function throwError() {
      throw new Error(message);
    }

    await errorHandler(context, throwError);

    expect(context.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(context.body).toMatchObject<ErrorResponse>({
      reason: ReasonPhrases.INTERNAL_SERVER_ERROR,
      message,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  });

  it('should handle any throw', async () => {
    const context = mock<Context>();

    async function throwSomething() {
      throw 666;
    }

    await errorHandler(context, throwSomething);

    expect(context.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(context.body).toMatchObject<ErrorResponse>({
      reason: ReasonPhrases.INTERNAL_SERVER_ERROR,
      message: '666',
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  });
});
