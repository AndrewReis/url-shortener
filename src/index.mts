import 'dotenv/config';
import fastify from "fastify";

import Hashids from 'hashids';
import { createClient } from 'redis';
import cassandra from 'cassandra-driver';

const app = fastify({ logger: process.env.LOGGER === "true" });

const redisClient = createClient({ url: 'redis://redis:6379' });
const cassandraClient = new cassandra.Client({
  contactPoints: ['cassandra'],
  localDataCenter: 'datacenter1',
  keyspace: 'url_shortener'
});

const basePath = "/api/v1";


app.post(`${basePath}/shorten`, async (request, reply) => {
  const { url } = request.body as { url: string };

  const globalId = await redisClient.incr('global:url_id');
  const hashids = new Hashids('teste', 7, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');

  const encode = hashids.encode(Number(globalId));

  const query = 'INSERT INTO urls (short_url, long_url, created_at) VALUES (?, ?, ?)';
  const response = await cassandraClient.execute(query, [encode, url, new Date()]);

  return { response };
});

app.get(`${basePath}/shorten`, async (request, reply) => {
  return { shortUrl: '' };
});

const start = async () => {
  try {
    await redisClient.connect();
    await app.listen({
      port: Number(process.env.PORT) || 3000,
      host: '0.0.0.0'
    });
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();