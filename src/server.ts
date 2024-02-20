import { env } from "./env";
import { app } from "./app";

const start = async () => {
  try {
    await app.listen({ port: env.PORT, host: env.HOST });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
