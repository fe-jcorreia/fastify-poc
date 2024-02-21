import fastify, { FastifyInstance } from "fastify";
import { usersRoutes } from "./routes/users";
import cookie from "@fastify/cookie";

export const app: FastifyInstance = fastify({ logger: true });

app.register(cookie);

app.register(usersRoutes, { prefix: "users" });
