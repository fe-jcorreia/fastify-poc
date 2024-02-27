import { randomUUID } from "node:crypto";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { sessionIdMiddleware } from "../middlewares/session-id-middleware";

export async function usersRoutes(app: FastifyInstance) {
  app.post("/", async (request, response) => {
    const userBodyValidator = z.object({
      name: z.string(),
      bio: z.string().nullable(),
    });

    const body = userBodyValidator.parse(request.body);

    const sessionId = randomUUID();
    response.setCookie("sessionId", sessionId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    await knex("users").insert({
      name: body.name,
      bio: body?.bio,
      session_id: sessionId,
    });

    return response.status(201).send();
  });

  app.get(
    "/:id/metrics",
    { preHandler: [sessionIdMiddleware] },
    async (request) => {
      const sessionId = request.cookies.sessionId;
      const userParamsValidator = z.object({
        id: z.string().uuid(),
      });

      const params = userParamsValidator.parse(request.params);

      const user = await knex("users")
        .where({
          id: params.id,
          session_id: sessionId,
        })
        .first();

      return { user };
    }
  );

  app.get("/", async () => {
    const users = await knex("users").select();

    return { users };
  });
}
