import fastify, { FastifyInstance } from "fastify";

const app: FastifyInstance = fastify({ logger: true });

app.get("/", async (request, response) => {
  return { data: "Hello World" };
});

const start = async () => {
  try {
    await app.listen({ port: 3333 });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
