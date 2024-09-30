import { SupabaseClient } from "@supabase/supabase-js";
import { TABLE_NAME } from "./table_name";
import getSupabaseClient from "./client";

class CompletedDB {
  client: SupabaseClient;

  constructor() {
    this.client = getSupabaseClient;
  }

  async getCompleted(userId: number, bookmarkId: number) {
    try {
      const { data, error } = await this.client
        .from(TABLE_NAME.COMPELTED)
        .select("*")
        .eq("telegramId", userId)
        .eq("id", bookmarkId);
      if (data && data.length > 0) return data[0];
      return null;
    } catch (error) {
      console.log("getCompleted | Error - ", error);
      return null;
    }
  }

  async addCompleted(userId: number, name: string) {
    try {
      const { error } = await this.client.from(TABLE_NAME.COMPELTED).insert({
        telegramId: userId,
        name,
      });
      if (!error) return true;
      return false;
    } catch (error) {
      console.log("addCompleted | Error - ", error);
      return false;
    }
  }

  async getCompletedList(userId: number) {
    try {
      const { data, error } = await this.client
        .from(TABLE_NAME.COMPELTED)
        .select("*")
        .eq("telegramId", userId);
      if (data && data.length > 0) return data;
      return [];
    } catch (error) {
      console.log("getCompletedList | Error - ", error);
      return [];
    }
  }

  async removeCompleted(userId: number, bookmarkId: number) {
    try {
      const { error } = await this.client
        .from(TABLE_NAME.COMPELTED)
        .delete()
        .eq("telegramId", userId)
        .eq("id", bookmarkId);
      return true;
    } catch (error) {
      console.log("removeCompleted | Error - ", error);
      return false;
    }
  }
}

const completedDb = new CompletedDB();
export default completedDb;
