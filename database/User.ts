import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { TABLE_NAME } from "./table_name";
import getSupabaseClient from "./client";

class UserDB {
  client: SupabaseClient;

  constructor() {
    this.client = getSupabaseClient;
  }

  async createUser(userId: number) {
    try {
      const { error } = await this.client
        .from(TABLE_NAME.USER)
        .insert({ telegramId: userId });
      console.log(error);
      if (!error) return true;
    } catch (error) {
      console.log(error);
    }
  }

  async getUser(userId: number) {
    try {
      const { data, error } = await this.client
        .from(TABLE_NAME.USER)
        .select("*")
        .eq("telegramId", userId);
      console.log("Get User", {
        data,
        error,
      });

      if (data && Array(data)) return data[0];
      return null;
    } catch (error) {
      console.log("Error", error);
      return null;
    }
  }

  async getAllUser() {
    try {
      const { data, error } = await this.client
        .from(TABLE_NAME.USER)
        .select("*");
      if (data && data.length > 0) return data;
      return [];
    } catch (error) {
      console.log("Error", error);
      return [];
    }
  }
}

const userDb = new UserDB();
export default userDb;
