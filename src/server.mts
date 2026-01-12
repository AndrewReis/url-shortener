import { app } from './index.mts';

const start = async () => {
  try {
    await app.listen({
      port: Number(process.env.PORT) || 3333,
      host: '0.0.0.0'
    });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();