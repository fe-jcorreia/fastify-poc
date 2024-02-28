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

      const meals = await knex("meals")
        .where("user_id", user.id)
        .orderBy("date");

      const totalMeals = meals.length;
      const inDietMeals = meals.filter((meal) => meal.is_diet).length;
      const offDietMeals = totalMeals - inDietMeals;

      const getMaxStreak = (meals: { is_diet: boolean }[]) => {
        let maxStreak = 0;

        let currentStreak = 0;
        meals.forEach((meal) => {
          if (meal.is_diet) {
            currentStreak += 1;
          } else {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = 0;
          }
        });

        maxStreak = Math.max(maxStreak, currentStreak);

        return maxStreak;
      };
      const dietRecord = getMaxStreak(meals);

      return {
        user: {
          id: user.id,
          name: user.name,
          bio: user.bio,
          sessionId: user.session_id,
          metrics: {
            total: totalMeals,
            inDiet: inDietMeals,
            offDiet: offDietMeals,
            dietStreak: dietRecord,
          },
        },
      };
    }
  );

  app.get("/", async () => {
    const users = await knex("users").select();

    return { users };
  });
}
