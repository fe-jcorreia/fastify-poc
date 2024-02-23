import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("meals", (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.uuid("user_id");
    table.foreign("user_id").references("id").inTable("users");
    table.text("name").notNullable();
    table.text("description").notNullable();
    table.timestamp("date").notNullable();
    table.boolean("is_diet").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("meals");
}
