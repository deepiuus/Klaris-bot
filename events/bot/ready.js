const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    run(client) {
        client.user.setActivity("Deepwoken", {type: ActivityType.PLAYING});
        console.log(`${client.user.username} is online`);
    }
};