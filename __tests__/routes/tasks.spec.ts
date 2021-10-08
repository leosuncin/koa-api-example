import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { Task } from '@/entities/task';
import type { ErrorResponse } from '@/middleware/error';
import server from '@/server';

const isoDateRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/;
const contentTypeHeader = 'Content-Type';

describe('Tasks routes', () => {
  let connection: Connection;
  let task: Task;

  beforeAll(async () => {
    connection = await createConnection();
  });

  beforeEach(async () => {
    const repo = connection.getRepository(Task);
    task = await repo.save({ text: 'Do something' });
  });

  afterEach(async () => {
    const repo = connection.getRepository(Task);
    await repo.delete(task.id);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should create one task', async () => {
    const text = 'Make a sandwich';

    await request(server.callback())
      .post('/tasks')
      .send({ text })
      .expect(StatusCodes.CREATED)
      .expect(contentTypeHeader, /json/)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: expect.any(Number),
          text,
          done: false,
          createdAt: expect.stringMatching(isoDateRegex),
          updatedAt: expect.stringMatching(isoDateRegex),
        });
      });
  });

  it('should require the `text` when create a new task', async () => {
    await request(server.callback())
      .post('/tasks')
      .send({})
      .expect(StatusCodes.BAD_REQUEST)
      .expect(contentTypeHeader, /json/)
      .expect(({ body }) => {
        expect(body).toMatchObject<ErrorResponse>({
          reason: ReasonPhrases.BAD_REQUEST,
          details: {
            text: expect.any(String),
          },
          message: expect.any(String),
          statusCode: StatusCodes.BAD_REQUEST,
        });
      });
  });

  it('should find all tasks', async () => {
    await request(server.callback())
      .get('/tasks')
      .expect(StatusCodes.OK)
      .expect(contentTypeHeader, /json/)
      .expect(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
      });
  });

  it('should get one task', async () => {
    await request(server.callback())
      .get(`/tasks/${task.id}`)
      .expect(StatusCodes.OK)
      .expect(contentTypeHeader, /json/)
      .expect(({ body }) => {
        expect(body).toEqual(JSON.parse(JSON.stringify(task)));
      });
  });

  it('should update one task', async () => {
    await request(server.callback())
      .put(`/tasks/${task.id}`)
      .send({ done: true })
      .expect(StatusCodes.OK)
      .expect(contentTypeHeader, /json/)
      .expect(({ body }) => {
        expect(body).not.toEqual(JSON.parse(JSON.stringify(task)));
        expect(body).toHaveProperty('done', true);
      });
  });

  it('should remove one task', async () => {
    await request(server.callback())
      .del(`/tasks/${task.id}`)
      .expect(StatusCodes.NO_CONTENT);
  });

  it('should fail for nonexisting task', async () => {
    const id = Date.now();
    const url = `/tasks/${id}`;
    const expectedStatus = StatusCodes.NOT_FOUND;
    const expectedBody: ErrorResponse = {
      reason: ReasonPhrases.NOT_FOUND,
      message: `Not found any todo with id: ${id}`,
      statusCode: expectedStatus,
    };

    await request(server.callback())
      .get(url)
      .expect(contentTypeHeader, /json/)
      .expect(expectedStatus, expectedBody);

    await request(server.callback())
      .put(url)
      .send({})
      .expect(contentTypeHeader, /json/)
      .expect(expectedStatus, expectedBody);

    await request(server.callback())
      .del(url)
      .expect(contentTypeHeader, /json/)
      .expect(expectedStatus, expectedBody);
  });

  it.each(['a', 0, -1])('should fail with invalid id: %s', async (id) => {
    const url = `/tasks/${id}`;
    const expectedStatus = StatusCodes.BAD_REQUEST;
    const expectedBody: ErrorResponse = {
      reason: ReasonPhrases.BAD_REQUEST,
      details: {
        id: expect.any(String),
      },
      message: expect.any(String),
      statusCode: expectedStatus,
    };

    await request(server.callback())
      .get(url)
      .expect(expectedStatus)
      .expect(contentTypeHeader, /json/)
      .expect(({ body }) => {
        expect(body).toMatchObject(expectedBody);
      });

    await request(server.callback())
      .put(url)
      .send({})
      .expect(expectedStatus)
      .expect(contentTypeHeader, /json/)
      .expect(({ body }) => {
        expect(body).toMatchObject(expectedBody);
      });

    await request(server.callback())
      .del(url)
      .expect(expectedStatus)
      .expect(contentTypeHeader, /json/)
      .expect(({ body }) => {
        expect(body).toMatchObject(expectedBody);
      });
  });
});
