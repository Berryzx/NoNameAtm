import { CommandHandler, ListenerHandler, AkairoClient, InhibitorHandler } from "discord-akairo";
import { Message, User } from "discord.js"
import { join } from "path";
import { owners, defaultPrefix, databaseName } from "../Config";
import { Connection } from "typeorm";
import Database from "../structures/Database";
import SettingsProvider from "../structures/SettingsProvider";
import { Setting } from "../models/Settings";



declare module "discord-akairo" {
    interface AkairoClient {
        inhibitorHandler: InhibitorHandler;
        commandHandler: CommandHandler;
        listenerHandler: ListenerHandler;
        config: BotOptions;
        settings: SettingsProvider;
        db: Connection;
    }
}

interface BotOptions {
    token?: string;
    owners?: string | string[];
}




export default class NoNameClient extends AkairoClient {
    public db!: Connection;
    public settings!:  SettingsProvider;
    public commandHandler: CommandHandler = new CommandHandler(this, {
        directory: join(__dirname, "..", "commands"),
        prefix: (msg: Message) => msg.guild ? this.settings.get(msg.guild.id, "config.prefix", defaultPrefix) : defaultPrefix, // For now till we add a SetPrefix Command...
        ignorePermissions: owners, // Ignores the Owners so we can do anything in any server...
        handleEdits: true, // Handle Edits
        commandUtil: true,
        commandUtilLifetime: 3e5,
        defaultCooldown: 1e4,
        argumentDefaults: {
            prompt: {
                modifyStart: (_, str): string => `${str}\n\nType \`cancel\` to cancel the command...`, // In most commands..
                modifyRetry: (_, str): string => `${str}\n\nType \`cancel\` to cannel the command...`, // The Retry part
                timeout: "You took to long, the command has been cancelled...",
                ended: "You exceeded the maxium amount of tries, this command has now been cancelled...",
                retries: 3,
                time: 3e4
            },
            otherwise: ""
        }
    });
    
    public inhibitorHandler: InhibitorHandler = new InhibitorHandler(this, {
        directory: join(__dirname, "..", "inhibitors")
    })

    public listenerHandler: ListenerHandler = new ListenerHandler(this, {
        directory: join(__dirname, "..", "listeners")
    });
    public constructor(config: BotOptions) {
        super({
            ownerID: owners,
            disabledEvents: ["TYPING_START"],
            shardCount: 1,
            disableEveryone: true
        });
        this.config = config;
    }
    private async __init(): Promise<void> {
        this.commandHandler.useListenerHandler(this.listenerHandler);
        this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler,
            listenerHandler: this.listenerHandler,
            process: process
        });


        this.commandHandler.loadAll(); // Loads the commands
        this.listenerHandler.loadAll(); // Loads the listeners
        this.inhibitorHandler.loadAll(); // Loads the inhibitors
        this.db = Database.get(databaseName);
        await this.db.connect();
        await this.db.synchronize();
        this.settings = new SettingsProvider(this.db.getRepository(Setting));
        await this.settings.init();
    }
    public async start(): Promise<string> {
        await this.__init();
        return this.login(this.config.token);
    }
}
