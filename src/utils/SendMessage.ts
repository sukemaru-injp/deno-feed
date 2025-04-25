import { IncomingWebhook } from "@slack/webhook";

interface SendMessage {
  run(text: string): Promise<void>;
}

export class SendMessageImpl implements SendMessage {
  private webhook: IncomingWebhook;
  constructor(url: string) {
    this.webhook = new IncomingWebhook(url);
  }

  async run(text: string): Promise<void> {
    try {
      await this.webhook.send({ text });
    } catch (e) {
      console.error(e);
    }
  }
}
