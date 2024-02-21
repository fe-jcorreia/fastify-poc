import fastify, { FastifyInstance } from "fastify";
import { userRoutes } from "./routes/user";
import cookie from "@fastify/cookie";

export const app: FastifyInstance = fastify({ logger: true });

app.register(cookie);

app.register(userRoutes, { prefix: "user" });
