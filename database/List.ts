import { SupabaseClient } from "@supabase/supabase-js";
import { TABLE_NAME } from "./table_name";
import getSupabaseClient from "./client";
import { Bookmark, SOURCE } from "../utils/types";
import { generateTimestamp } from "../utils/date";

const CHAPTER_PLACEHOLDER = `{chapter-placeholder}`;
export const PAGE_SIZE = 20;

class ListDB {
  client: SupabaseClient;

  constructor() {
    this.client = getSupabaseClient;
  }

  async getTotalBookmarkCount(userId: number) {
    const { count, error } = await this.client
      .from(TABLE_NAME.LIST)
      .select("*", { count: "exact", head: true })
      .eq("telegramId", userId);
    if (error) return 0;
    return count;
  }

  async getBookmark(userId: number, bookmarkId: number) {
    try {
      const { data, error } = await this.client
        .from(TABLE_NAME.LIST)
        .select("*")
        .eq("telegramId", userId)
        .eq("id", bookmarkId);
      if (error) return null;
      if (data.length > 0) return data[0];
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
    latestChapter: string,
    source: string
  ) {
    try {
      const processedUrl = url.replace(latestChapter, CHAPTER_PLACEHOLDER);
      const { error } = await this.client.from(TABLE_NAME.LIST).insert({
        telegramId: userId,
        name,
        url: [SOURCE.OTHERS, SOURCE.MANHUAUS].includes(source as SOURCE)
          ? processedUrl
          : url,
        latestChapter: +latestChapter,
        source,
      });
      if (!error) return true;
      return false;
    } catch (error) {
      console.log("addBookmark | Error - ", error);
      return false;
    }
  }

  async getAllBookmarks(userId: number): Promise<Bookmark[]> {
    try {
      const { data, error } = await this.client
        .from(TABLE_NAME.LIST)
        .select("*")
        .eq("telegramId", userId)
        .order("id", { ascending: true });

      if (error) return [];
      if (data.length > 0) {
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

  async getBookmarks(userId: number, page: number = 0): Promise<Bookmark[]> {
    try {
      const { data, error } = await this.client
        .from(TABLE_NAME.LIST)
        .select("*")
        .eq("telegramId", userId)
        .order("id", { ascending: true })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

      if (error) return [];
      if (data.length > 0) {
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
      if (error) return false;
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
        .update({ latestChapter: chapter, updated_at: generateTimestamp() })
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
