import { SupabaseClient } from "@supabase/supabase-js";
import { TABLE_NAME } from "./table_name";
import getSupabaseClient from "./client";
import { User } from "../utils/types";

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

  async getUser(userId: number): Promise<User | null> {
    try {
      const { data, error } = await this.client
        .from(TABLE_NAME.USER)
        .select("*")
        .eq("telegramId", userId);
      if (error) return null;
      if (data && Array(data)) return data[0];
      return null;
    } catch (error) {
      console.log("getUser | Error - ", error);
      return null;
    }
  }

  async getAllUser(): Promise<User[]> {
    try {
      const { data, error } = await this.client
        .from(TABLE_NAME.USER)
        .select("*");
      if (error) return [];
      if (data && data.length > 0) return data;
      return [];
    } catch (error) {
      console.log("getAllUser | Error - ", error);
      return [];
    }
  }

  async toggleUserNotification(user: User) {
    try {
      const { error } = await this.client
        .from(TABLE_NAME.USER)
        .update({ is_on: !user.is_on })
        .eq("telegramId", user.telegramId);
      if (error) return false;
      return true;
    } catch (error) {
      console.log("toggleUserNotification | Error - ", error);
      return false;
    }
  }
}

const userDb = new UserDB();
export default userDb;
