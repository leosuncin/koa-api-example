import process from 'node:process';

import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { e2e, request, response, spec } from 'pactum';

const isNumber = 'typeof $V === "number"';
const isoDateRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/;

describe('Task E2E', () => {
  const testCase = e2e('Task CRUD');

  beforeAll(() => {
    request.setBaseUrl(process.env.BASE_URL ?? 'http://localhost:3000');
    response.setDefaultExpectResponseTime(100);
  });

  afterAll(async () => {
    await testCase.cleanup();
  });

  it('should create a new task', async () => {
    const text = 'Make a sandwich';

    await testCase
      .step('Add task')
      .spec()
      .post('/tasks')
      .withJson({ text })
      .expectStatus(201)
      .expectJsonLike({
        id: isNumber,
        text,
        done: false,
        createdAt: isoDateRegex,
        updatedAt: isoDateRegex,
      })
      .stores('taskId', '.id')
      .clean()
      .delete('/tasks/$S{taskId}')
      .expectStatus(StatusCodes.NO_CONTENT)
      .toss();
  });

  it('find all task', async () => {
    await testCase
      .step('Find all')
      .spec()
      .get('/tasks')
      .expectStatus(StatusCodes.OK)
      .expectJsonLike('.', '$V.length >= 1')
      .toss();
  });

  it('get one task', async () => {
    await testCase
      .step('Get task')
      .spec()
      .get(`/tasks/{id}`)
      .withPathParams('id', '$S{taskId}')
      .expectStatus(StatusCodes.OK)
      .toss();
  });

  it('toggle one task', async () => {
    const done = true;

    await testCase
      .step('Update task')
      .spec()
      .put(`/tasks/{id}`)
      .withPathParams('id', '$S{taskId}')
      .withJson({ done })
      .expectStatus(StatusCodes.OK)
      .expectJsonLike({ done })
      .toss();
  });

  it('fail to create with invalid data', async () => {
    await spec()
      .name('empty object')
      .post('/tasks')
      .withJson({})
      .expectStatus(StatusCodes.BAD_REQUEST)
      .expectJson({
        statusCode: StatusCodes.BAD_REQUEST,
        reason: ReasonPhrases.BAD_REQUEST,
        message: '"text" is required',
        details: {
          text: '"text" is required',
        },
      })
      .toss();

    await spec()
      .name('short text')
      .post('/tasks')
      .withJson({ text: 'ab' })
      .expectStatus(StatusCodes.BAD_REQUEST)
      .expectJson({
        statusCode: StatusCodes.BAD_REQUEST,
        reason: ReasonPhrases.BAD_REQUEST,
        message: '"text" length must be at least 3 characters long',
        details: {
          text: '"text" length must be at least 3 characters long',
        },
      })
      .toss();
  });

  it('fail with inexistent task', async () => {
    const id = Date.now();
    const url = `/tasks/${id}`;
    const error = {
      statusCode: StatusCodes.NOT_FOUND,
      reason: ReasonPhrases.NOT_FOUND,
      message: `Not found any task with id: ${id}`,
    };

    await spec()
      .name('fail to get an inexistent task')
      .get(url)
      .expectStatus(StatusCodes.NOT_FOUND)
      .expectJson(error)
      .toss();
    await spec()
      .name('fail to update an inexistent task')
      .put(url)
      .withJson({})
      .expectStatus(StatusCodes.NOT_FOUND)
      .expectJson(error)
      .toss();
    await spec()
      .name('fail to remove inexistent task')
      .delete(url)
      .expectStatus(StatusCodes.NOT_FOUND)
      .expectJson(error)
      .toss();
  });
});
