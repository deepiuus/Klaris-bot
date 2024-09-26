const { Client, IntentsBitField, Collection } = require('discord.js');
const client = new Client({intents: new IntentsBitField(53608447)});
const channelLogs = require('./loaders/channelLogs');
const loadCommands = require('./loaders/loadCommands');
const loadEvents = require('./loaders/loadEvents');
const dotenv = require('dotenv');
dotenv.config();

client.commands = new Collection();
client.timers = new Collection();

loadCommands(client);
loadEvents(client);

const originLogs = console.log;
console.log = function(message) {
    originLogs(message);
    channelLogs(client, message);
};

client.on("messageCreate", async message => {

    const prefix = "!";
    if (!message.content.startsWith(prefix))
        return;

    const array = message.content.split(" ");
    const name = array[0].slice(prefix.length, array[0].length);
    const command = client.commands.get(name);

    if (command) {
        try {
            await command.run(client, message);
            const fetchedMessage = await message.channel.messages.fetch(message.id);
            if (fetchedMessage)
                await message.delete().catch(error => {
                    console.error('Failed to delete the message:', error);
                });
        } catch (error) {
            console.error('Error executing command:', error);
        }
    }
});

client.login(process.env.TOKEN);
