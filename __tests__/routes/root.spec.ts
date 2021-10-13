import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import app from '@/app';

describe('Root routes', () => {
  it('should return "Hello world"', async () => {
    await request(app.callback())
      .get('/')
      .expect(StatusCodes.OK)
      .expect('Hello world');
  });
});
