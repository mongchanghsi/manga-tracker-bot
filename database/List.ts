import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { TABLE_NAME } from "./table_name";
import getSupabaseClient from "./client";

const CHAPTER_PLACEHOLDER = `{chapter-placeholder}`;

class ListDB {
  client: SupabaseClient;

  constructor() {
    this.client = getSupabaseClient;
  }

  async addBookmark(
    userId: number,
    name: string,
    url: string,
    latestChapter: string
  ) {
    try {
      const processedUrl = url.replace(latestChapter, CHAPTER_PLACEHOLDER);
      const { error } = await this.client.from(TABLE_NAME.LIST).insert({
        telegramId: userId,
        name,
        url: processedUrl,
        latestChapter: +latestChapter,
      });
      console.log(error);
      if (!error) return true;
    } catch (error) {
      console.log(error);
    }
  }

  async getBookmarks(userId: number) {
    console.log(userId);
    try {
      const { data, error } = await this.client
        .from(TABLE_NAME.LIST)
        .select("*")
        .eq("telegramId", userId);
      console.log("Get Bookmarks", {
        data,
        error,
      });
      return data;
    } catch (error) {
      console.log("Error", error);
      return [];
    }
  }

  async removeBookmark(userId: number, bookmarkId: number) {}
}

const listDb = new ListDB();
export default listDb;
