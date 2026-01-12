import { app } from './index.mts';

const start = async () => {
  try {
    await app.listen({
      port: Number(process.env.PORT) || 3333,
      host: '0.0.0.0'
    });
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();