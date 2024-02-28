import { FastifyInstance } from "fastify";
import { z } from "zod";
import { sessionIdMiddleware } from "../middlewares/session-id-middleware";
import { knex } from "../database";

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    "/",
    { preHandler: [sessionIdMiddleware] },
    async (request, response) => {
      const sessionId = request.cookies.sessionId;

      const meals = await knex("users")
        .innerJoin("meals", "users.id", "meals.user_id")
        .where("session_id", sessionId)
        .select(
          "users.id as user_id",
          "users.name as user_name",
          "users.bio",
          "users.session_id",
          "meals.id as meal_id",
          "meals.name as meal_name",
          "meals.description",
          "meals.date",
          "meals.is_diet"
        );

      if (!meals) {
        response.status(404).send({ message: "User not found" });
      }

      return response.status(200).send({
        meals: meals.map((meal) => {
          return {
            id: meal.meal_id,
            userId: meal.user_id,
            name: meal.meal_name,
            description: meal.description,
            date: meal.date,
            isDiet: Boolean(meal.is_diet),
          };
        }),
      });
    }
  );

  app.get(
    "/:id",
    { preHandler: [sessionIdMiddleware] },
    async (request, response) => {
      const mealParamsValidator = z.object({
        id: z.string().uuid(),
      });

      const params = mealParamsValidator.parse(request.params);
      const sessionId = request.cookies.sessionId;

      const user = await knex("users").where("session_id", sessionId).first();
      if (!user) {
        return response.status(404).send({ message: "User not found" });
      }

      const meal = await knex("meals").where("id", params.id).first();

      return response
        .status(200)
        .send({
          meal: {
            id: meal.id,
            userId: meal.user_id,
            name: meal.name,
            description: meal.description,
            date: meal.date,
            isDiet: Boolean(meal.is_diet),
          },
        });
    }
  );

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

  app.put(
    "/:id",
    { preHandler: [sessionIdMiddleware] },
    async (request, response) => {
      const mealBodyValidator = z.object({
        name: z.string(),
        description: z.string(),
        date: z.string(),
        isDiet: z.boolean(),
      });
      const mealParamsValidator = z.object({
        id: z.string().uuid(),
      });

      const body = mealBodyValidator.parse(request.body);
      const params = mealParamsValidator.parse(request.params);
      const sessionId = request.cookies.sessionId;

      const user = await knex("users").where("session_id", sessionId).first();
      if (!user) {
        return response.status(404).send({ message: "User not found" });
      }

      await knex("meals").where("id", params.id).update({
        name: body.name,
        description: body.description,
        date: body.date,
        is_diet: body.isDiet,
      });
    }
  );

  app.delete(
    "/:id",
    { preHandler: [sessionIdMiddleware] },
    async (request, response) => {
      const mealParamsValidator = z.object({
        id: z.string().uuid(),
      });

      const params = mealParamsValidator.parse(request.params);
      const sessionId = request.cookies.sessionId;

      const user = await knex("users").where("session_id", sessionId).first();
      if (!user) {
        return response.status(404).send({ message: "User not found" });
      }

      await knex("meals").where("id", params.id).delete();
    }
  );
}
