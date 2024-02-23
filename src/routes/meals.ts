import { FastifyInstance } from "fastify";
import { z } from "zod";
import { sessionIdMiddleware } from "../middlewares/session-id-middleware";
import { knex } from "../database";

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    "/",
    { preHandler: [sessionIdMiddleware] },
    async (request, response) => {
      const mealBodyValidator = z.object({
        name: z.string(),
        description: z.string(),
        date: z.string(),
        isDiet: z.boolean(),
      });

      const body = mealBodyValidator.parse(request.body);
      const sessionId = request.cookies.sessionId;

      const user = await knex("users").where("session_id", sessionId).first();
      if (!user) {
        return response.status(404).send({ message: "User not found" });
      }

      await knex("meals").insert({
        user_id: user.id,
        name: body.name,
        description: body.description,
        date: body.date,
        is_diet: body.isDiet,
      });

      return response.status(201).send();
    }
  );

}
