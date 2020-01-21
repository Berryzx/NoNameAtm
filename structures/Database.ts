import { ConnectionManager } from "typeorm";
import { Setting } from "../models/Settings";
import { databaseName } from "../Config";


const connectionManager = new ConnectionManager();
connectionManager.create({
    name: databaseName,
    type: "sqlite",
    database: './db.sqlite',
    logging: ["error"],
    
    entities: [
        Setting,
    ]
});

export default connectionManager;
