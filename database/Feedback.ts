import { SupabaseClient } from "@supabase/supabase-js";
import { TABLE_NAME } from "./table_name";
import getSupabaseClient from "./client";

class FeedbackDB {
  client: SupabaseClient;

  constructor() {
    this.client = getSupabaseClient;
  }

  async addFeedback(userId: number, content: string) {
    try {
      const { error } = await this.client.from(TABLE_NAME.FEEDBACK).insert({
        telegramId: userId,
        content,
        resolved: false,
      });
      console.log("addFeedback | Supabase | Error - ", error);
      if (!error) return true;
      return false;
    } catch (error) {
      console.log("addFeedback | Error - ", error);
      return false;
    }
  }
}

const feedbackDb = new FeedbackDB();
export default feedbackDb;
