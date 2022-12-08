import { faker } from '@faker-js/faker';
import * as fc from 'fast-check';

import { loginUser, registerUser, updateUser } from '@/schemas/auth';
import { fakerToArb } from '@/utils/tests';

describe('Auth validation schemas', () => {
  const name = 'John Doe';
  const email = 'john@doe.me';
  const password = 'Th€Pa$$w0rd!';

  it('should validate the register data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1 }),
          // eslint-disable-next-line @typescript-eslint/unbound-method
          email: fakerToArb(faker.internet.email).map((value) =>
            value.toLowerCase(),
          ),
          password: fc.string({ minLength: 12, maxLength: 32 }),
        }),
        async (data) => {
          fc.pre(data.email.includes('@'));

          await expect(registerUser.validateAsync(data)).resolves.toEqual(data);
        },
      ),
    );
  });

  it('should throw an error when the register data is invalid', async () => {
    await fc.assert(
      fc.asyncProperty(fc.object(), async (data) => {
        await expect(registerUser.validateAsync(data)).rejects.toThrow();
      }),
    );
  });

  it('should validate the login data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // eslint-disable-next-line @typescript-eslint/unbound-method
          email: fakerToArb(faker.internet.email).map((value) =>
            value.toLowerCase(),
          ),
          password: fc.string({ minLength: 12, maxLength: 32 }),
        }),
        async (data) => {
          fc.pre(data.email.includes('@'));

          await expect(loginUser.validateAsync(data)).resolves.toEqual(data);
        },
      ),
    );
  });

  it('should throw an error when the login data is invalid', async () => {
    await fc.assert(
      fc.asyncProperty(fc.object(), async (data) => {
        await expect(loginUser.validateAsync(data)).rejects.toThrow();
      }),
    );
  });

  it.each([
    [{ email, password }, '"name" is required'],
    [{ name: '', email, password }, '"name" is not allowed to be empty'],
    [{ name, password }, '"email" is required'],
    [{ email: '', name, password }, '"email" is not allowed to be empty'],
    [
      { email: 'not-a-valid-address', name, password },
      '"email" must be a valid email',
    ],
    [{ name, email }, '"password" is required'],
    [{ name, email, password: '' }, '"password" is not allowed to be empty'],
    [
      { name, email, password: 'short' },
      '"password" length must be at least 12 characters long',
    ],
    [
      {
        name,
        email,
        password:
          'This password is so long that it will take too long to encrypt.',
      },
      '"password" length must be less than or equal to 32 characters long',
    ],
    [{}, '"name" is required. "email" is required. "password" is required'],
  ])(
    'should fail with invalid register data %o and throw the error %s',
    async (data, expectedError) => {
      await expect(
        registerUser.options({ abortEarly: false }).validateAsync(data),
      ).rejects.toThrow(expectedError);
    },
  );

  it.each([
    [{ password }, '"email" is required'],
    [{ email: '', password }, '"email" is not allowed to be empty'],
    [
      { email: 'not-a-valid-address', password },
      '"email" must be a valid email',
    ],
    [{ email }, '"password" is required'],
    [{ email, password: '' }, '"password" is not allowed to be empty'],
    [
      { email, password: 'short' },
      '"password" length must be at least 12 characters long',
    ],
    [
      {
        email,
        password:
          'This password is so long that it will take too long to encrypt.',
      },
      '"password" length must be less than or equal to 32 characters long',
    ],
    [{}, '"email" is required. "password" is required'],
  ])(
    'should fail with invalid register data %o and throw the error %s',
    async (data, expectedError) => {
      await expect(
        loginUser.options({ abortEarly: false }).validateAsync(data),
      ).rejects.toThrow(expectedError);
    },
  );

  it('should validate the update data', async () => {
    const name = fc.string({ minLength: 1 });
    const newPassword = fc.string({ minLength: 12, maxLength: 32 });

    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.record({ name }),
          fc.record({
            password: fc.constant(password),
            newPassword,
          }),
          fc.record({
            name,
            password: fc.constant(password),
            newPassword,
          }),
        ),
        async (data) => {
          fc.pre(
            'newPassword' in data ? data.password !== data.newPassword : true,
          );

          await expect(updateUser.validateAsync(data)).resolves.toEqual(data);
        },
      ),
    );
  });

  it.each([
    [{}, '"name" is required'],
    [{ password }, '"password" is not allowed'],
    [
      { newPassword: 'myc0NTR4s3ñ@' },
      '"password" is required. "new password" missing required peer "password"',
    ],
    [
      { password, newPassword: password },
      '"new password" contains an invalid value',
    ],
  ])(
    'should fail with invalid update data %o and throw the error %s',
    async (data, expectedError) => {
      await expect(
        updateUser.options({ abortEarly: false }).validateAsync(data),
      ).rejects.toThrow(expectedError);
    },
  );
});
