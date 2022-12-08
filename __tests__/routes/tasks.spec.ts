import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import request from 'supertest';

import app from '@/app';
import { dataSource } from '@/config/ormconfig';
import { Task } from '@/entities/task';
import type { ErrorResponse } from '@/middleware/error';

const isoDateRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/;
const contentTypeHeader = 'Content-Type';

describe('Tasks routes', () => {
  let task: Task;

  beforeAll(async () => {
    await dataSource.initialize();
  });

  beforeEach(async () => {
    const repo = dataSource.getRepository(Task);
    task = await repo.save({ text: 'Do something' });
  });

  afterEach(async () => {
    const repo = dataSource.getRepository(Task);
    await repo.delete(task.id);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should create one task', async () => {
    const text = 'Make a sandwich';

    await request(app.callback())
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
    await request(app.callback())
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
    await request(app.callback())
      .get('/tasks')
      .expect(StatusCodes.OK)
      .expect(contentTypeHeader, /json/)
      .expect(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
      });
  });

  it('should get one task', async () => {
    await request(app.callback())
      .get(`/tasks/${task.id}`)
      .expect(StatusCodes.OK)
      .expect(contentTypeHeader, /json/)
      .expect(({ body }) => {
        expect(body).toEqual(JSON.parse(JSON.stringify(task)));
      });
  });

  it('should update one task', async () => {
    await request(app.callback())
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
    await request(app.callback())
      .del(`/tasks/${task.id}`)
      .expect(StatusCodes.NO_CONTENT);
  });

  it('should fail for nonexisting task', async () => {
    const id = Date.now();
    const url = `/tasks/${id}`;
    const expectedStatus = StatusCodes.NOT_FOUND;
    const expectedBody: ErrorResponse = {
      reason: ReasonPhrases.NOT_FOUND,
      message: `Not found any task with id: ${id}`,
      statusCode: expectedStatus,
    };

    await request(app.callback())
      .get(url)
      .expect(contentTypeHeader, /json/)
      .expect(expectedStatus, expectedBody);

    await request(app.callback())
      .put(url)
      .send({})
      .expect(contentTypeHeader, /json/)
      .expect(expectedStatus, expectedBody);

    await request(app.callback())
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

    await request(app.callback())
      .get(url)
      .expect(expectedStatus)
      .expect(contentTypeHeader, /json/)
      .expect(({ body }) => {
        expect(body).toMatchObject(expectedBody);
      });

    await request(app.callback())
      .put(url)
      .send({})
      .expect(expectedStatus)
      .expect(contentTypeHeader, /json/)
      .expect(({ body }) => {
        expect(body).toMatchObject(expectedBody);
      });

    await request(app.callback())
      .del(url)
      .expect(expectedStatus)
      .expect(contentTypeHeader, /json/)
      .expect(({ body }) => {
        expect(body).toMatchObject(expectedBody);
      });
  });
});
