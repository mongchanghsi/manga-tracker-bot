import { SupabaseClient } from "@supabase/supabase-js";
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
      console.log("getBookmark | Error - ", error);
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
      if (!error) return true;
      return false;
    } catch (error) {
      console.log("addBookmark | Error - ", error);
      return false;
    }
  }

  async getBookmarks(userId: number) {
    try {
      const { data, error } = await this.client
        .from(TABLE_NAME.LIST)
        .select("*")
        .eq("telegramId", userId);
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
      console.log("getBookmarks | Error - ", error);
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
      console.log("removeBookmark | Error - ", error);
      return false;
    }
  }

  async updateBookmark(bookmarkId: number, chapter: number) {
    try {
      const { error } = await this.client
        .from(TABLE_NAME.LIST)
        .update({ latestChapter: chapter })
        .eq("id", bookmarkId);
      if (error) return false;
      return true;
    } catch (error) {
      console.log("updateBookmark | Error - ", error);
      return false;
    }
  }
}

const listDb = new ListDB();
export default listDb;
