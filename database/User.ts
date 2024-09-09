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
      if (!error) return true;
      return false;
    } catch (error) {
      console.log("createUser | Error - ", error);
      return false;
    }
  }

  async getUser(userId: number) {
    try {
      const { data, error } = await this.client
        .from(TABLE_NAME.USER)
        .select("*")
        .eq("telegramId", userId);
      if (data && Array(data)) return data[0];
      return null;
    } catch (error) {
      console.log("getUser | Error - ", error);
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
      console.log("getAllUser | Error - ", error);
      return [];
    }
  }
}

const userDb = new UserDB();
export default userDb;
