import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

import { app } from '../../src/index.mts';

describe('Create short URL', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a shorten URL', async () => {
    const response = await request(app.server)
      .post('/api/v1/shorten')
      .send({
        url: 'https://github.com/AndrewReis'
      });

    console.log(response.body);
    expect(response.status).toBe(201);
  });
});