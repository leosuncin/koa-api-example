/* eslint-disable @typescript-eslint/await-thenable, sonarjs/no-duplicate-string */
import faker from 'faker';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import process from 'node:process';
import { e2e, request, response, spec } from 'pactum';

describe('Auth E2E', () => {
  const testCase = e2e('Task CRUD');
  const url = {
    register: '/auth/register',
    login: '/auth/login',
    user: '/auth/me',
  };
  const password = 'Th€Pa$$w0rd!';

  beforeAll(() => {
    request.setBaseUrl(process.env.BASE_URL ?? 'http://localhost:3000');
    response.setDefaultExpectResponseTime(300);
  });

  afterAll(async () => {
    await testCase.cleanup();
  });

  it('should register a new user', async () => {
    const registerStep = testCase.step('register user');
    const payload = {
      name: faker.name.findName(),
      email: faker.internet.email().toLowerCase(),
      password,
    };

    await registerStep
      .spec()
      .post(url.register)
      .withJson(payload)
      .expectStatus(StatusCodes.CREATED)
      .expectJsonLike({
        token: /.+\..+\..+/,
        user: {
          id: 'typeof $V === "number"',
          name: payload.name,
          email: payload.email,
        },
      })
      .stores('authToken', '.token')
      .stores('authUser', '.user');

    registerStep
      .clean()
      .delete(url.user)
      .withHeaders('Authorization', 'Bearer $S{authToken}')
      .expectStatus(StatusCodes.NO_CONTENT);
  });

  it('should login with existing user', async () => {
    const loginStep = testCase.step('login user');

    await loginStep
      .spec()
      .post(url.login)
      .withJson({
        email: '$S{authUser.email}',
        password,
      })
      .expectStatus(StatusCodes.OK)
      .expectJsonLike({
        token: /.+\..+\..+/,
        user: {
          id: '$S{authUser.id}',
          name: '$S{authUser.name}',
          email: '$S{authUser.email}',
        },
      })
      .stores('authToken', '.token');
  });

  it('should get user from token', async () => {
    const getUser = testCase.step('get user');

    await getUser
      .spec()
      .get(url.user)
      .withHeaders('Authorization', 'Bearer $S{authToken}')
      .expectStatus(StatusCodes.OK)
      .expectJsonLike({
        id: '$S{authUser.id}',
        name: '$S{authUser.name}',
        email: '$S{authUser.email}',
      });
  });

  it('should update current user', async () => {
    const updateUser = testCase.step('update user');
    const payload = {
      name: faker.name.findName(),
      password,
      newPassword: faker.internet.password(),
    };

    await updateUser
      .spec()
      .put(url.user)
      .withHeaders('Authorization', 'Bearer $S{authToken}')
      .withJson(payload)
      .expectStatus(StatusCodes.OK)
      .expectJsonLike({
        id: '$S{authUser.id}',
        name: payload.name,
        email: '$S{authUser.email}',
      })
      .stores('authUser', '.');
  });

  it('should fail to register a duplicate user', async () => {
    await spec()
      .post(url.register)
      .withJson({
        name: faker.name.findName(),
        email: '$S{authUser.email}',
        password: faker.internet.password(),
      })
      .expectStatus(StatusCodes.CONFLICT)
      .expectJson({
        message: 'The email $S{authUser.email} is already register',
        reason: ReasonPhrases.CONFLICT,
        statusCode: StatusCodes.CONFLICT,
      });
  });

  it('should fail to login with wrong email', async () => {
    await spec()
      .post(url.login)
      .withJson({
        email: faker.internet.exampleEmail().toLowerCase(),
        password: faker.internet.password(12),
      })
      .expectStatus(StatusCodes.UNAUTHORIZED)
      .expectJson({
        message: 'Wrong email address for the user',
        reason: ReasonPhrases.UNAUTHORIZED,
        statusCode: StatusCodes.UNAUTHORIZED,
      });
  });

  it('should fail to login with wrong password', async () => {
    await spec()
      .post(url.login)
      .withJson({
        email: '$S{authUser.email}',
        password: faker.internet.password(12),
      })
      .expectStatus(StatusCodes.UNAUTHORIZED)
      .expectJson({
        message: 'Wrong password for the user',
        reason: ReasonPhrases.UNAUTHORIZED,
        statusCode: StatusCodes.UNAUTHORIZED,
      });
  });

  it('should fail to update my password when the current password is wrong', async () => {
    await spec()
      .put(url.user)
      .withHeaders('Authorization', 'Bearer $S{authToken}')
      .withJson({
        password: faker.internet.password(12, true),
        newPassword: faker.internet.password(12),
      })
      .expectStatus(StatusCodes.BAD_REQUEST)
      .expectJson({
        details: {
          password: '"password" is wrong',
        },
        message: '"password" is wrong',
        reason: ReasonPhrases.BAD_REQUEST,
        statusCode: StatusCodes.BAD_REQUEST,
      });
  });

  it.each(['GET', 'PUT', 'DELETE'])(
    `should fail to authenticate with an invalid JWT with %s ${url.user}`,
    async (method) => {
      // Generated at https://jwt.io
      const token =
        // eslint-disable-next-line no-secrets/no-secrets
        'eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.SlHXzK2C1NhfGofbjyeqRhgh7RJg9t_0tIaUWLIye1mm_sZ6vvjqUAC4lkzqi84P';

      await spec()
        .withMethod(method)
        .withPath(url.user)
        .withHeaders('Authorization', `Bearer ${token}`)
        .withJson({ name: faker.name.findName() })
        .expectStatus(StatusCodes.UNAUTHORIZED)
        .expectJson({
          message: 'invalid signature',
          reason: 'Authentication Error',
          statusCode: StatusCodes.UNAUTHORIZED,
        });
    },
  );

  it.each(['GET', 'PUT', 'DELETE'])(
    `should require the JWT in the headers with %s ${url.user}`,
    async (method) => {
      await spec()
        .withMethod(method)
        .withPath(url.user)
        .withJson({ name: faker.name.findName() })
        .expectStatus(
          method === 'PUT' ? StatusCodes.BAD_REQUEST : StatusCodes.UNAUTHORIZED,
        )
        .expectJson({
          details: {
            authorization: '"Bearer Token" is required',
          },
          message: '"Bearer Token" is required',
          reason:
            method === 'PUT'
              ? ReasonPhrases.BAD_REQUEST
              : ReasonPhrases.UNAUTHORIZED,
          statusCode:
            method === 'PUT'
              ? StatusCodes.BAD_REQUEST
              : StatusCodes.UNAUTHORIZED,
        });
    },
  );
});
/* eslint-enable @typescript-eslint/await-thenable, sonarjs/no-duplicate-string */
