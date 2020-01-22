import { Command } from "discord-akairo";
import { Message } from "discord.js";

export default class PingCommand extends Command {
    public constructor() {
        super("ping", {
            aliases: ["ping"],
            description: {
                content: "check the ping of the latency to the API...",
                examples: ["ping"],
                usages: "ping"
            },
            ratelimit: 3
        });
    }
    public exec(message: Message) {
        return message.util.reply(`The ping of the latency to the API is: \`${this.client.ws.ping}ms\`!`);
    }
}
