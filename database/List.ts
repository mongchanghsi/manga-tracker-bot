import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { TABLE_NAME } from "./table_name";
import getSupabaseClient from "./client";

const CHAPTER_PLACEHOLDER = `{chapter-placeholder}`;

class ListDB {
  client: SupabaseClient;

  constructor() {
    this.client = getSupabaseClient;
  }

  async getBookmark(userId: number, bookmarkId: number) {
    try {
      const { data, error } = await this.client
        .from(TABLE_NAME.LIST)
        .select("*")
        .eq("telegramId", userId)
        .eq("id", bookmarkId);
      if (data && data.length > 0) return data[0];
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
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
    try {
      const { data, error } = await this.client
        .from(TABLE_NAME.LIST)
        .select("*")
        .eq("telegramId", userId);
      console.log("Get Bookmarks", {
        data,
        error,
      });
      if (data && data.length > 0) {
        return data.map((_data) => {
          return {
            ..._data,
            url: _data.url.replace(CHAPTER_PLACEHOLDER, _data.latestChapter),
          };
        });
      }
      return [];
    } catch (error) {
      console.log("Error", error);
      return [];
    }
  }

  async removeBookmark(userId: number, bookmarkId: number) {
    try {
      const { error } = await this.client
        .from(TABLE_NAME.LIST)
        .delete()
        .eq("telegramId", userId)
        .eq("id", bookmarkId);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

const listDb = new ListDB();
export default listDb;
