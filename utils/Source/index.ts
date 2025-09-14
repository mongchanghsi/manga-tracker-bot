abstract class BaseSource {
  abstract isValidUrl(url: string): boolean;
  abstract getLatestChapter(
    url: string,
    chapter?: number
  ): Promise<{ chapter: number; viewer: string; errors: string[] }>;

  // Optional shared method
  log(action: string) {
    console.log(`[${this.constructor.name}] Handling: ${action}`);
  }
}
export default BaseSource;
