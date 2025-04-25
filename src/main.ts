import "jsr:@std/dotenv/load";
import type { Article } from "./types/Article.ts";
import { format } from "@std/datetime";
import { SendMessageImpl } from "./utils/SendMessage.ts";
import { fetchRssFeeds } from "./utils/RssFeeds.ts";

const createMessage = (a: Article): string => {
  return `----------------
タイトル: ${a.title}\n
URL: ${a.link}\n
作成日: ${a.postedAt ? format(a.postedAt, "yyyy-MM-dd") : "-"}`;
};

type RetrieveTarget = {
  title: string;
  url: string;
};

const retrieveTargets: readonly RetrieveTarget[] = [
  { title: "Zenn `Ai` feed", url: "https://zenn.dev/topics/ai/feed" },
];

const scheduledAt = Deno.env.get("SCHEDULED_AT") ?? "0 22 * * *";

Deno.cron("rss feed notification", scheduledAt, async () => {
  const res = await fetchRssFeeds("https://zenn.dev/topics/ai/feed");
  console.log(res);

  const slackWebhookUrl = Deno.env.get("SLACK_WEB_HOOK_URL");

  if (slackWebhookUrl) {
    res.match(async (v) => {
      const sendMessage = new SendMessageImpl(slackWebhookUrl);
      const message = v.map(createMessage).join("\n");

      await sendMessage.run(message);
      console.log("Completed!");
    }, ({ message }) => {
      console.error(message);
    });
  } else {
    console.log("failed: SLACK_WEB_HOOK_URL is not configured in .env file");
  }
});
