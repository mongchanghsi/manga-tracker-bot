import { createClient } from "@supabase/supabase-js";
import ENVIRONMENT from "../configuration/environment";

class Database {
  client: any;

  constructor() {
    this.client = createClient(
      ENVIRONMENT.DATABASE_URL,
      ENVIRONMENT.DATABASE_KEY
    );
  }

  async createUser() {
    const { error } = await this.client
      .from("user")
      .insert({ id: 1, name: "Denmark" });
  }
}

const database = new Database();
export default database;
