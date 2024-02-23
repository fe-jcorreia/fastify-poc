// eslint-disable-next-line
import { knex } from "knex";

declare module "knex/types/tables" {
  export interface Tables {
    meals: {
      id: string;
      user_id: string;
      name: string;
      description: string;
      date: string;
      is_diet: boolean;
    };
  }
}
