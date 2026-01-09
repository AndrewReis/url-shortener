import 'dotenv/config';
import "reflect-metadata";

import fastify from "fastify";
import Hashids from 'hashids';

import { redisClient }     from './services/redis.mts';
import { cassandraClient } from './services/cassandra.mts';

const app = fastify({ logger: process.env.LOGGER === "true" });

const basePath = "api/v1";

app.post(`/${basePath}/shorten`, async (request, reply) => {
  const { url } = request.body as { url: string };

  const cacheResponse = await redisClient.get(`shortURL:${url}`);

  if (cacheResponse) {
    return reply.status(201).send({ shortUrl: cacheResponse });
  }

  const hashids = new Hashids(process.env.HASH_SECRET, 7, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');

  const id = await redisClient.incr(process.env.REDIS_INCR_KEY);
  const encode = hashids.encode(Number(id));

  const query = 'INSERT INTO urls (short, original, created_at) VALUES (?, ?, ?)';

  await cassandraClient.execute(query, [encode, url, new Date().toISOString()], { prepare: true });

  await redisClient.set(`originalURL:${url}`, `http://localhost:3000/${basePath}/shorten/${encode}`);

  return reply.status(201).send({ shortUrl: `http://localhost:3000/${basePath}/shorten/${encode}` });
});

app.get(`/${basePath}/shorten/:shortUrl`, async (request, reply) => {
  const { shortUrl } = request.params as { shortUrl: string };
  
  const query = 'SELECT original FROM urls WHERE short = ? LIMIT 1';
  const response = await cassandraClient.execute(query, [shortUrl], { prepare: true });

  return reply.status(302).redirect(response.rows[0]?.original);
});

export { app };