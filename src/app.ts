import fastify, { FastifyInstance } from "fastify";
import { knex } from "./database";

export const app: FastifyInstance = fastify({ logger: true });

app.get("/", async () => {
  const test = await knex("sqlite_schema").select("*");

  return { data: "Hello World", tables: test };
});

// app.register(somethingRoutes, {
//   prefix: 'transactions',
// });
