import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { Task } from '@/entities/task';
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
    const url = `/tasks/0`;
    const expectedStatus = StatusCodes.NOT_FOUND;
    const expectedBody = {
      error: 'Not Found',
      message: 'Not found any todo with id: 0',
      statusCode: expectedStatus,
    };

    await request(server.callback())
      .get(url)
      .expect(expectedStatus)
      .expect(contentTypeHeader, /json/)
      .expect(expectedBody);

    await request(server.callback())
      .put(url)
      .send({})
      .expect(expectedStatus)
      .expect(contentTypeHeader, /json/)
      .expect(expectedBody);

    await request(server.callback())
      .del(url)
      .expect(expectedStatus)
      .expect(contentTypeHeader, /json/)
      .expect(expectedBody);
  });
});
