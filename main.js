const { Client, IntentsBitField, Collection } = require('discord.js');
const client = new Client({intents: new IntentsBitField(53608447)});
const loadCommands = require('./loaders/loadCommands');
const loadEvents = require('./loaders/loadEvents');
const manageTimers = require('./events/layers/voiceManager');
const dotenv = require('dotenv');
dotenv.config();

client.commands = new Collection();

loadCommands(client);
loadEvents(client);
manageTimers(client);

client.on("messageCreate", message => {

    const prefix = "!";
    if (!message.content.startsWith(prefix)) return;

    const array = message.content.split(" ");
    const name = array[0].slice(prefix.length, array[0].length);
    const command = client.commands.get(name);

    command.run(client, message);
})

client.login(process.env.TOKEN);