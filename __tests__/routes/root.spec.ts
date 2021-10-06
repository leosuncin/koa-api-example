import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import server from '@/server';

describe('Root routes', () => {
  it('should return "Hello world"', async () => {
    await request(server.callback())
      .get('/')
      .expect(StatusCodes.OK)
      .expect('Hello world');
  });
});
