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
  { title: "Zenn Ai feed", url: "https://zenn.dev/topics/ai/feed" },
];

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const res = await fetchRssFeeds("https://zenn.dev/topics/ai/feed");
  console.log(res);

  const slackWebhookUrl = Deno.env.get("SLACK_WEB_HOOK_URL");

  if (slackWebhookUrl) {
    res.match(async (v) => {
      const sendMessage = new SendMessageImpl(slackWebhookUrl);
      const message = v.map(createMessage).join("");

      await sendMessage.run(message);
    }, ({ message }) => {
      console.error(message);
    });

    console.log("SLACK_WEB_HOOK_URL is configured");
  } else {
    console.log("failed: SLACK_WEB_HOOK_URL is not configured in .env file");
  }
}
