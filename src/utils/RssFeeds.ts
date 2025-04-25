import "jsr:@std/dotenv/load";
import { XMLParser } from "fast-xml-parser";
import { err, ok, type Result } from "neverthrow";
import type { Article } from "../types/Article.ts";

type RssContent = {
  rss: {
    channel: {
      title: string;
      description: string;
      link?: string;
      item?: {
        title?: string;
        description?: string;
        link?: string;
        pubDate?: string;
      }[];
    };
  };
};

export const fetchRssFeeds = async (
  url: string,
): Promise<Result<readonly Article[], { message: string }>> => {
  const res = await fetch(url);
  if (!res.ok) {
    return err({ message: "取得に失敗" });
  }
  const content = await res.text();
  const parser = new XMLParser();
  const data = parser.parse(content) as RssContent;

  if (!data.rss) {
    return err({ message: "不正なデータ" });
  }

  return ok(
    data.rss.channel?.item?.map((i) => ({
      title: i.title ?? "",
      link: i.link ?? "",
      postedAt: i.pubDate ? new Date(i.pubDate) : undefined,
    } satisfies Article)) ?? [],
  );
};
