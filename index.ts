import {loadCommands, handelCommand} from "../DjsCommandHandler/src/Api_Config/cmdHandler";
import {Client} from "discord.js"
import * as Discord from "discord.js"
import * as dotenv from "dotenv"
dotenv.config();

const clinet: Discord.Client = new Client()

loadCommands(`${__dirname}/commands/Moderation`)




clinet.on("message", (msg) => {
    if (msg.author.bot) { return; }

    if (msg.channel.type == "dm") { return; }

    if (!msg.content.startsWith("!" || "?")) { return; }
    handelCommand(msg)
})

clinet.login(process.env.TOKEN)