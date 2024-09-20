const { Client, IntentsBitField, Collection, MessageEmbed } = require('discord.js');
const client = new Client({intents: new IntentsBitField(53608447)});
const loadCommands = require('./loaders/loadCommands');
const loadEvents = require('./loaders/loadEvents');
const dotenv = require('dotenv');
dotenv.config();

client.commands = new Collection();
client.timers = new Collection();

loadCommands(client);
loadEvents(client);

client.on("messageCreate", message => {

    const prefix = "!";
    if (!message.content.startsWith(prefix)) return;

    const array = message.content.split(" ");
    const name = array[0].slice(prefix.length, array[0].length);
    const command = client.commands.get(name);

    command.run(client, message);
})

client.login(process.env.TOKEN);